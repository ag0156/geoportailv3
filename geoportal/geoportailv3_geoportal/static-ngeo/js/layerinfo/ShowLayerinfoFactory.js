/**
 * @module app.layerinfo.ShowLayerinfoFactory
 */
let exports = {};

/**
 * @fileoverview Provides a layer info service. That service is a function used
 * to retrieve and display the info (metadata) for a layer.
 */

import appModule from '../module.js';


/**
 * @param {angular.$http} $http Angular $http service
 * @param {angular.$sce} $sce Angular $sce service
 * @param {angular.Scope} $rootScope The root Scope.
 * @param {angularGettext.Catalog} gettextCatalog Gettext catalog.
 * @param {ngeox.PopupFactory} ngeoCreatePopup Ngeo popup factory service
 * @param {app.WmsHelper} appWmsHelper The wms herlper service.
 * @param {app.WmtsHelper} appWmtsHelper The wmts herlper service.
 * @param {string} geonetworkBaseUrl catalog base server url.
 * @return {app.layerinfo.ShowLayerinfo} The show layer info function.
 * @param {string} getHtmlLegendUrl The url.
 * @ngInject
 */
function factory($http, $sce, $rootScope,
    gettextCatalog, ngeoCreatePopup, appWmsHelper, appWmtsHelper, geonetworkBaseUrl,
    getHtmlLegendUrl) {
    const isIpv6 = location.search.includes('ipv6=true');
    const domain = (isIpv6) ? "app.geoportail.lu" : "geoportail.lu";
  /**
   * @type {string}
   * @private
   */
  var getHtmlLegendUrl_ = getHtmlLegendUrl;

  /**
   * @type {ngeo.message.Popup}
   */
  var popup = ngeoCreatePopup();
  /**
   * @type {Object.<string, !angular.$q.Promise>}
   * @private
   */
  var promises_ = {};

  /**
   * @type {ol.layer.Layer}
   */
  var currentLayer = null;

  $rootScope.$on('gettextLanguageChanged', function() {
    if (currentLayer !== null && popup.getOpen()) {
      showLayerInfo(currentLayer);
    }
  });

  return showLayerInfo;

  /**
   * @param {ol.layer.Layer} layer The layer
   * @param {any} node The node
   * @this {Object}
   */
  function showLayerInfo(layer, node) {
    currentLayer = layer;
    var title;
    var localMetadata;
    if (layer == undefined || layer == null) {
      title = node['name'];
      localMetadata =  node['metadata'];
    } else {
      title = /** @type {string} */ (layer.get('label'));
      localMetadata = /** @type {Object.<string, string>} */
          (layer.get('metadata'));
    }
    var metadataUid = localMetadata['metadata_id'];
    var legend_name = ('legend_name' in localMetadata) ?
        localMetadata['legend_name'] : '';
    popup.setTitle(title);
    var currentLanguage = gettextCatalog.currentLanguage;
    var promiseKey = metadataUid + '##' + currentLanguage + '##' + legend_name;

    if (!(promiseKey in promises_)) {
      if (localMetadata['isExternalWmts']) {
        promises_[promiseKey] = appWmtsHelper.getMetadata(metadataUid);
      } else if (localMetadata['isExternalWms']) {
        promises_[promiseKey] = appWmsHelper.getMetadata(metadataUid);
      } else {
        // TODO: remove the quotes around jsonpCallbackParam when
        // https://github.com/google/closure-compiler/pull/2400 is merged
        promises_[promiseKey] = $http.jsonp(
            '/getMetadata',
          {params: {
            'uid': metadataUid,
            'lang': currentLanguage
          }, 'jsonpCallbackParam': 'cb'}).then(
                function(resp) {
                  var content = {
                    'uid': localMetadata['metadata_id'],
                    'legendUrl': null,
                    'hasLegend': false,
                    'isError': false,
                    'isShortDesc': true,
                    'layerMetadata': null,
                    'geonetworkBaseUrl': geonetworkBaseUrl
                  };

                  var remoteMetadata = resp.data['metadata'];
                  content['layerMetadata'] = remoteMetadata;
                  if ('abstract' in content['layerMetadata']) {
                    content['layerMetadata']['trusted_description'] =
                    $sce.trustAsHtml(content['layerMetadata']['abstract']);
                    content['layerMetadata']['short_trusted_description'] =
                    $sce.trustAsHtml(content['layerMetadata']['abstract'].
                    substring(0, 220));
                  }
                  var links = [];
                  if ('link' in content['layerMetadata']) {
                    var splitLink = function(link) {
                      var currentLink = link.split('|');
                      if (currentLink[3]=='WWW:LINK-1.0-http--link' && links.indexOf(currentLink[2]) == -1) {
                        links.push(currentLink[2]);
                      }
                    };
                    if (Array.isArray(content['layerMetadata']['link'])) {
                      content['layerMetadata']['link'].forEach (splitLink, this);
                    } else {
                      splitLink(content['layerMetadata']['link']);
                    }
                    content['layerMetadata']['link'] = links;
                  }
                  if ('responsibleParty' in content['layerMetadata']) {
                    if (!Array.isArray(content['layerMetadata']['responsibleParty'])) {
                      content['layerMetadata']['responsibleParty'] = [content['layerMetadata']['responsibleParty']];
                    }
                  }

                  content['legendUrl'] = buildLegendUrl(layer);
                  content['hasLegend'] = true;
                  return content;
                }.bind(this));
      }
    }

    promises_[promiseKey].then(
        function(content) {
          showPopup(content);
        },
        function(error) {
          showPopup({'isError': true});
        });

    /**
     * @param {Object} content Object with metadata information.
     */
    function showPopup(content) {
      popup.setContent(content);
      popup.setOpen(true);
    }
    /**
     * @param {ol.layer.Layer} layer Layer.
     * @return {boolean} True if the layer as a legend.
     * @export
     */
    function buildLegendUrl(layer) {
        var localMetadata = /** @type {Object.<string, string>} */
            (layer.get('metadata'));

        var currentLanguage = gettextCatalog.currentLanguage;
        var queryParams = {'lang': currentLanguage};

        if (localMetadata != undefined && 'legend_name' in localMetadata) {
          queryParams['name'] = localMetadata['legend_name']
        }
        var id = layer.get('queryable_id');
        if (id != undefined) {
          queryParams['id'] = id;
        }
        return getHtmlLegendUrl_ + '?' + (new URLSearchParams(queryParams)).toString();
    }
  }
}

appModule.factory('appShowLayerinfo', factory);


export default exports;
