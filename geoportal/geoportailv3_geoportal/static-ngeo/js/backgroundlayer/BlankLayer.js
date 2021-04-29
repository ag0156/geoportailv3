/**
 * @module app.backgroundlayer.BlankLayer
 */
/**
 * @fileoverview This file defines the Blank Layer service. This service
 * creates an empty layer and the corresponding spec.
 */

import appModule from '../module.js';
import olVectorLayer from 'ol/layer/Vector';
import olVectorSource from 'ol/source/Vector';

/**
 * @constructor
 * @param {angularGettext.Catalog} gettextCatalog Gettext service.
 * @ngInject
 */
const exports = function(gettextCatalog) {

  /**
   * @typedef {ol.layer.Tile}
   * @private
   */
  this.blankLayer_ = new olVectorLayer({
    source: new olVectorSource({features: []})
  });
  var blankLabel = gettextCatalog.getString('blank');
  this.blankLayer_.set('label', blankLabel);
};


/**
 * Get the blank layer.
 * @return {ol.layer.Tile} The blank tile.
 */
exports.prototype.getLayer = function() {
  return this.blankLayer_;
};

appModule.service('appBlankLayer', exports);


export default exports;
