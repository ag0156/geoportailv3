# -*- coding: utf-8 -*-

# Copyright (c) 2011-2015, Camptocamp SA
# All rights reserved.

# Redistribution and use in source and
# binary forms, with or without
# modification, are permitted provided
# that the following conditions are met:

# 1.    Redistributions of source code must
#       retain the above copyright notice, this
#       list of conditions and the following disclaimer.
# 2.    Redistributions in binary form mustg
#       reproduce the above copyright notice,
#       this list of conditions and theg
#       following disclaimer in the documentation
#       and/or other materials provided
#       with the distribution.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT
# HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES,
# INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND
# FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE
# COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
# EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
# OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.

# The views and conclusions contained in the
# software and documentation are those
# of the authors and should not be interpreted
# as representing official policies,
# either expressed or implied, of the FreeBSD Project.

import json
import logging
import re
from cStringIO import StringIO
from datetime import datetime

from pyramid.i18n import get_localizer, TranslationStringFactory
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPUnauthorized, HTTPInternalServerError
from pyramid.httpexceptions import HTTPNotFound

from PyPDF2 import PdfFileMerger
import weasyprint

from c2cgeoportal.models import RestrictionArea, Role, Layer
from c2cgeoportal.views.printproxy import PrintProxy
from c2cgeoportal.lib.caching import NO_CACHE, get_region

from geoportailv3.models import DBSession, LuxPrintJob, LuxLayerInternalWMS

_ = TranslationStringFactory("geoportailv3-server")
log = logging.getLogger(__name__)
cache_region = get_region()


class LuxPrintProxy(PrintProxy):

    @view_config(route_name="lux_printproxy_report_create")
    def lux_report_create(self):
        resp, content = self._proxy("%s/report.%s" % (
            self.config["print_url"],
            self.request.matchdict.get("format")
        ))
        spec = json.loads(self.request.body)
        for map_layer in spec["attributes"]["map"]["layers"]:
            if "baseURL" in map_layer and\
               "ogcproxywms" in map_layer["baseURL"]:
                for layer in map_layer["layers"]:
                    internal_wms = DBSession.query(LuxLayerInternalWMS).filter(
                        LuxLayerInternalWMS.layer == layer).first()
                    if internal_wms is not None and\
                       not self._is_authorized(internal_wms):
                            return HTTPUnauthorized()
        job = LuxPrintJob()
        job.id = json.loads(content)["ref"]
        job.spec = self.request.body
        job.creation = datetime.now()
        DBSession.add(job)
        return self._build_response(
            resp, content, False, "print"
        )

    @view_config(route_name="lux_printproxy_status")
    def lux_status(self):
        try:
            return self.status()
        except Exception as e:
            log.exception(e)
            ref = self.request.matchdict.get("ref")
            job = DBSession.query(LuxPrintJob).get(ref)
            job.is_error = True
            return HTTPInternalServerError()

    def _is_authorized(self, internal_wms):
        if internal_wms.public:
            return True
        if self.request.user is None:
            return False
        else:
            restriction = DBSession.query(RestrictionArea).filter(
                RestrictionArea.roles.any(
                    Role.id == self.request.user.role.id)).filter(
                        RestrictionArea.layers.any(
                            Layer.id == internal_wms.id
                        )
                    ).first()
            # If not restriction is set then return unauthorized
            if restriction is None or not restriction.readwrite:
                return False
        return True

    @view_config(route_name="lux_printproxy_report_cancel")
    def lux_cancel(self):
        DBSession.query(LuxPrintJob).filter(
            LuxPrintJob.id == self.request.matchdict.get("ref")
        ).delete()
        return self.cancel()

    def _create_legend_from_image(self, url, title, access_constraints):
        css = weasyprint.CSS(
            string="img {max-height: 800px}"
        )

        log.info("Get legend from URL:\n%s." % url)

        legend_buffer = StringIO()
        html_access_constraints = ""
        if access_constraints is not None and\
           len(access_constraints) > 0:
            h2_title = _("Access constraints")
            localizer = get_localizer(self.request)
            trans_h2_title = localizer.translate(h2_title)
            html_access_constraints = """<h2>%(h2_title)s</h2>
            <i>%(access_constraints)s</i>""" % {
                'access_constraints': access_constraints,
                'h2_title': trans_h2_title}

        html = """<html><head><title>%(title)s</title></head>
        <body><h1>%(title)s</h1>
        <img src='%(url)s'/><br>
        %(html_access_constraints)s
        </body></html>""" % {
            'url': url,
            'title': title,
            'html_access_constraints': html_access_constraints}

        weasyprint.HTML(string=html).write_pdf(
            legend_buffer,
            stylesheets=[css]
        )
        return legend_buffer

    @cache_region.cache_on_arguments()
    def _get_legend(self, name, lang):
        css = weasyprint.CSS(
            string="img {max-height: 800px}"
        )

        url = \
            "http://wiki.geoportail.lu/doku.php?" \
            "id=%s:legend:%s&do=export_html" % \
            (lang, name)
        log.info("Get legend from URL:\n%s." % url)

        legend_buffer = StringIO()
        weasyprint.HTML(url).write_pdf(
            legend_buffer,
            stylesheets=[css]
        )
        return legend_buffer

    @view_config(route_name="lux_printproxy_report_get")
    def lux_report_get(self):
        ref = self.request.matchdict.get("ref")
        job = DBSession.query(LuxPrintJob).get(ref)
        if job is None:
            return HTTPNotFound()
        try:
            resp, content = self._proxy("%s/report/%s" % (
                self.config["print_url"], ref
            ))

            attributes = json.loads(job.spec)["attributes"]
            is_pdf = json.loads(job.spec)["format"] == "pdf"
            print_title = attributes.get("name")
            if print_title is None or len(print_title) == 0:
                print_title = "map_geoportal_lu"
            print_title = re.sub(r" ", "_", print_title)
            print_title = re.sub(r"[^a-zA-Z0-9\-\_]", "", print_title)

            if is_pdf and "legend" in attributes and\
                    attributes["legend"] is not None:
                merger = PdfFileMerger(strict=False)
                merger.append(StringIO(content))

                lang = attributes.get("lang")

                for item in attributes["legend"]:
                    if "legendUrl" in item and item["legendUrl"] is not None:
                        legend_title = ""
                        if "legendTitle" in item and\
                           item["legendTitle"] is not None:
                            legend_title = item["legendTitle"]
                        access_constraints = ""
                        if "accessConstraints" in item and\
                           item["accessConstraints"] is not None:
                            access_constraints = item["accessConstraints"]
                        merger.append(
                            self._create_legend_from_image(
                                item["legendUrl"],
                                legend_title,
                                access_constraints))
                    elif "name" in item and item["name"] is not None:
                        merger.append(self._get_legend(item["name"], lang))

                content = StringIO()
                merger.write(content)
                content = content.getvalue()

            DBSession.delete(job)
            if is_pdf:
                resp["content-disposition"] =\
                    "attachment; filename=%s.pdf" % (str(print_title))
            else:
                resp["content-disposition"] =\
                    "attachment; filename=%s.png" % (str(print_title))

            return self._build_response(
                resp, content, NO_CACHE, "print"
            )
        except Exception as e:
            log.exception(e)
            log.error("reference is : " + ref)
            if job is not None:
                job.is_error = True
            return HTTPInternalServerError()
