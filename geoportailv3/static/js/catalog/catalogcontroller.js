/**
 * @fileoverview This file provides the "catalog" directive. That directive is
 * used to create the catalog tree in the page. It is based on the
 * "ngeo-layertree" directive. And it relies on c2cgeoportal's "themes" web
 * service.
 *
 * Example:
 *
 * <app-catalog app-catalog-map="::mainCtrl.map">
 * </app-catalog>
 *
 * Note the use of the one-time binding operator (::) in the map expression.
 * One-time binding is used because we know the map is not going to change
 * during the lifetime of the application.
 */
goog.provide('app.catalog.CatalogController');

goog.require('app.module');
goog.require('app.events.ThemesEventType');
goog.require('ol.events');
goog.require('ol.proj');
goog.require('ol.View');


/**
 * @constructor
 * @param {angular.Scope} $scope Scope.
 * @param {app.Themes} appThemes Themes service.
 * @param {app.Theme} appTheme the current theme service.
 * @param {app.GetLayerForCatalogNode} appGetLayerForCatalogNode Function to
 *     create layers from catalog nodes.
 * @param {app.ScalesService} appScalesService Service returning scales.
 * @param {Array.<number>} maxExtent Constraining extent.
 * @param {app.StateManager} appStateManager The state service.
 * @export
 * @ngInject
 */
app.catalog.CatalogController = function($scope, appThemes, appTheme,
    appGetLayerForCatalogNode, appScalesService, maxExtent, appStateManager) {
  /**
   * @type {app.StateManager}
   * @private
   */
  this.appStateManager_ = appStateManager;

  /**
   * @type {ol.Extent}
   * @private
   */
  this.maxExtent_ =
      ol.proj.transformExtent(maxExtent, 'EPSG:4326', 'EPSG:3857');

  /**
   * @type {app.ScalesService}
   * @private
   */
  this.scales_ = appScalesService;

  /**
   * @type {app.Theme}
   * @private
   */
  this.appTheme_ = appTheme;

  /**
   * @type {app.Themes}
   * @private
   */
  this.appThemes_ = appThemes;

  /**
   * @type {app.GetLayerForCatalogNode}
   * @private
   */
  this.getLayerFunc_ = appGetLayerForCatalogNode;

  ol.events.listen(appThemes, app.events.ThemesEventType.LOAD,
      /**
       * @param {ol.events.Event} evt Event.
       */
      (function(evt) {
        this.setTree_();
      }), this);

  $scope.$watch(function() {
    return this.appTheme_.getCurrentTheme();
  }.bind(this), function(newVal, oldVal) {
    if (newVal !== oldVal) {
      this.setTree_();
    }
  }.bind(this));

};


/**
 * Return the OpenLayers layer for this node. `null` is returned if the node
 * is not a leaf.
 * @param {Object} node Tree node.
 * @return {ol.layer.Layer} The OpenLayers layer.
 * @export
 */
app.catalog.CatalogController.prototype.getLayer = function(node) {
  var layer = this.getLayerFunc_(node);
  return layer;
};


/**
 * @private
 */
app.catalog.CatalogController.prototype.setTree_ = function() {
  this.appThemes_.getThemeObject(
      this.appTheme_.getCurrentTheme()).then(
      /**
       * @param {Object} tree Tree object for the theme.
       */
      (function(tree) {
        this['tree'] = tree;
        this.setThemeZooms(this['tree']);
      }).bind(this));
};


/**
 * @param {Object} tree Tree object for the theme.
 * Set the maximum scale regarding the loaded theme.
 */
app.catalog.CatalogController.prototype.setThemeZooms = function(tree) {
  var maxZoom = 19;
  if (!goog.isNull(tree)) {
    console.assert('metadata' in tree);
    if (tree['metadata']['resolutions']) {
      var resolutions = tree['metadata']['resolutions'].split(',');
      maxZoom = resolutions.length + 7;
    }
    var map = this['map'];
    var currentView = map.getView();
    map.setView(new ol.View({
      maxZoom: maxZoom,
      minZoom: 8,
      extent: this.maxExtent_,
      center: currentView.getCenter(),
      enableRotation: false,
      zoom: currentView.getZoom()
    }));
  }
  this.scales_.setMaxZoomLevel(maxZoom);
  var viewZoom = this['map'].getView().getZoom();
  this.appStateManager_.updateState({
    'zoom': viewZoom
  });
};

/**
 * Add or remove layer from map.
 * @param {Object} node Tree node.
 * @export
 */
app.catalog.CatalogController.prototype.toggle = function(node) {
  var layer = this.getLayerFunc_(node);
  var map = this['map'];
  if (map.getLayers().getArray().indexOf(layer) >= 0) {
    map.removeLayer(layer);
  } else {
    var layerMetadata = layer.get('metadata');
    if (layerMetadata.hasOwnProperty('start_opacity') &&
        layerMetadata.hasOwnProperty('original_start_opacity')) {
      layerMetadata['start_opacity'] = layerMetadata['original_start_opacity'];
    }
    map.addLayer(layer);
  }
};


app.module.controller('AppCatalogController', app.catalog.CatalogController);
