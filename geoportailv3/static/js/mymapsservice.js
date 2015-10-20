/**
 * @fileoverview this file defines the mymaps webservice. this service
 * interacts with the Geoportail MyMaps webservice and exposes functions that
 * return objects representing maps and features.
 */

goog.provide('app.Mymaps');

goog.require('app');
goog.require('app.UserManager');


/**
 * @typedef {Array.<Object>}
 */
app.MapsResponse;



/**
 * @constructor
 * @param {angular.$http} $http
 * @param {string} mymapsMapsUrl URL to "mymaps" Maps service.
 * @param {string} mymapsUrl URL to "mymaps" Features service.
 * @param {app.DrawnFeatures} appDrawnFeatures Drawn features service.
 * @param {app.StateManager} appStateManager
 * @param {app.UserManager} appUserManager
 * @ngInject
 */
app.Mymaps = function($http, mymapsMapsUrl, mymapsUrl, appDrawnFeatures,
    appStateManager, appUserManager) {

  /**
   * @type {app.UserManager}
   * @private
   */
  this.appUserManager_ = appUserManager;

  /**
   * @type {ol.Collection.<ol.Feature>}
   * @private
   */
  this.drawnFeatures_ = appDrawnFeatures;

  /**
   * @type {app.StateManager}
   * @private
   */
  this.stateManager_ = appStateManager;

  /**
   * @type {angular.$http}
   * @private
   */
  this.$http_ = $http;

  /**
   * @type {string}
   * @private
   */
  this.mymapsMapsUrl_ = mymapsMapsUrl;

  /**
   * @type {string}
   * @private
   */
  this.mymapsFeaturesUrl_ = mymapsUrl + '/features/';

  /**
   * @type {string}
   * @private
   */
  this.mymapsMapInfoUrl_ = mymapsUrl + '/map/';

  /**
   * @type {string}
   * @private
   */
  this.mymapsDeleteFeatureUrl_ = mymapsUrl + '/delete_feature/';

  /**
   * @type {string}
   * @private
   */
  this.mymapsDeleteMapUrl_ = mymapsUrl + '/delete/';

  /**
   * @type {string}
   * @private
   */
  this.mymapsCreateMapUrl_ = mymapsUrl + '/create';

  /**
   * @type {string}
   * @private
   */
  this.mymapsUpdateMapUrl_ = mymapsUrl + '/update/';

  /**
   * @type {string}
   * @private
   */
  this.mymapsSaveFeatureUrl_ = mymapsUrl + '/save_feature/';

  /**
   * @type {string}
   * @private
   */
  this.mapId_ = '';

  /**
   * The currently displayed map title.
   * @type {string}
   */
  this.mapTitle = '';

  /**
   * The currently displayed map title.
   * @type {string}
   */
  this.mapOwner = '';

  /**
   * The currently displayed map description.
   * @type {string}
   */
  this.mapDescription = '';

  /**
   * @type {ol.FeatureStyleFunction}
   * @private
   */
  this.featureStyleFunction_ = this.createStyleFunction();

  /**
   * @type {ol.proj.Projection}
   */
  this.mapProjection;
};


/**
 * @param {string} mapId the map id.
 */
app.Mymaps.prototype.setCurrentMapId = function(mapId) {
  this.mapId_ = mapId;
  if (this.isMymapsSelected()) {
    this.stateManager_.updateState({
      'map_id': this.mapId_
    });
    this.loadMapInformation_().then(
        goog.bind(function(mapinformation) {
          this.mapDescription = mapinformation['description'];
          this.mapTitle = mapinformation['title'];
          this.mapOwner = mapinformation['user_login'];
        }, this));
    this.loadFeatures_().then(goog.bind(function(features) {
      var encOpt = /** @type {olx.format.ReadOptions} */ ({
        dataProjection: 'EPSG:2169',
        featureProjection: this.mapProjection
      });
      var jsonFeatures = (new ol.format.GeoJSON()).
          readFeatures(features, encOpt);
      goog.array.forEach(jsonFeatures, function(feature) {
        feature.set('__source__', 'mymaps');
        feature.set('__editable__', true);
        feature.setStyle(this.featureStyleFunction_);
      }, this);
      this.drawnFeatures_.extend(/** @type {!Array<(null|ol.Feature)>} */
          (jsonFeatures));
    }, this));
  }else {
    this.stateManager_.deleteParam('map_id');
    this.mapId_ = '';
    this.mapTitle = '';
    this.mapDescription = '';
    this.mapOwner = '';
    this.drawnFeatures_.clear();
  }
};


/**
 * @return {boolean} return true if is editable by the user
 */
app.Mymaps.prototype.isEditable = function() {
  if (this.isMymapsSelected() && this.appUserManager_.isAuthenticated() &&
      (this.appUserManager_.isAdmin == 'TRUE' ||
       this.appUserManager_.getUsername() == this.mapOwner)) {
    return true;
  }
  return false;
};


/**
 * Get an array of map objects.
 * @return {angular.$q.Promise} Promise.
 */
app.Mymaps.prototype.getMaps = function() {
  return this.$http_.get(this.mymapsMapsUrl_).then(goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        if (error.status == 401) {
          return null;
        }
        return [];
      }, this)
  );
};


/**
 * Load map features
 * @return {angular.$q.Promise} Promise.
 * @private
 */
app.Mymaps.prototype.loadFeatures_ = function() {
  return this.$http_.get(this.mymapsFeaturesUrl_ + this.mapId_).then(goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * Load map information
 * @return {angular.$q.Promise} Promise.
 * @private
 */
app.Mymaps.prototype.loadMapInformation_ = function() {
  return this.$http_.get(this.mymapsMapInfoUrl_ + this.mapId_).then(goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * Delete a map
 * @param {ol.Feature} feature the feature to delete.
 * @return {angular.$q.Promise} Promise.
 */
app.Mymaps.prototype.deleteFeature = function(feature) {
  return this.$http_.delete(this.mymapsDeleteFeatureUrl_ +
      feature.get('id')).then(goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * create a new map
 * @param {string} title the title of the map.
 * @param {string} description a description about the map.
 * @return {angular.$q.Promise} Promise.
 */
app.Mymaps.prototype.createMap = function(title, description) {
  var req = $.param({
    'title': title,
    'description': description
  });
  var config = {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  };
  return this.$http_.post(this.mymapsCreateMapUrl_, req, config).then(
      goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * delete a new map
 * @return {angular.$q.Promise} Promise.
 */
app.Mymaps.prototype.deleteMap = function() {
  return this.$http_.delete(this.mymapsDeleteMapUrl_ + this.mapId_).then(
      goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * Save the map
 * @param {string} title the title of the map.
 * @param {string} description a description about the map.
 * @return {angular.$q.Promise} Promise.
 */
app.Mymaps.prototype.updateMap = function(title, description) {

  this.mapTitle = title;
  this.mapDescription = description;

  var req = $.param({
    'title': title,
    'description': description
  });
  var config = {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  };
  return this.$http_.put(this.mymapsUpdateMapUrl_ + this.mapId_,
      req, config).then(goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * Save the map
 * @param {ol.Feature} feature the feature to save
 * @param {?ol.proj.Projection} featureProjection
 * @return {angular.$q.Promise} Promise.
 */
app.Mymaps.prototype.saveFeature = function(feature, featureProjection) {
  var encOpt = /** @type {olx.format.ReadOptions} */ ({
    dataProjection: 'EPSG:2169',
    featureProjection: featureProjection
  });
  var req = $.param({
    'feature': (new ol.format.GeoJSON()).writeFeature(feature, encOpt)
  });
  var config = {
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  };
  return this.$http_.post(this.mymapsSaveFeatureUrl_ + this.mapId_,
      req, config).then(goog.bind(
      /**
       * @param {angular.$http.Response} resp Ajax response.
       * @return {app.MapsResponse} The "mymaps" web service response.
       */
      function(resp) {
        return resp.data;
      }, this), goog.bind(
      function(error) {
        return [];
      }, this)
  );
};


/**
 * @return {boolean} return true if a map is selected
 */
app.Mymaps.prototype.isMymapsSelected = function() {
  return !goog.string.isEmpty(this.mapId_);
};


/**
 * @return {ol.FeatureStyleFunction}
 * @export
 */
app.Mymaps.prototype.createStyleFunction = function() {

  var styles = [];

  var vertexStyle = new ol.style.Style({
    image: new ol.style.RegularShape({
      radius: 6,
      points: 4,
      angle: Math.PI / 4,
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.5)'
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 1)'
      })
    }),
    geometry: function(feature) {
      var geom = feature.getGeometry();

      if (geom.getType() == ol.geom.GeometryType.POINT) {
        return;
      }

      var coordinates;
      if (geom instanceof ol.geom.LineString) {
        coordinates = feature.getGeometry().getCoordinates();
        return new ol.geom.MultiPoint(coordinates);
      } else if (geom instanceof ol.geom.Polygon) {
        coordinates = feature.getGeometry().getCoordinates()[0];
        return new ol.geom.MultiPoint(coordinates);
      } else {
        return feature.getGeometry();
      }
    }
  });

  var fillStyle = new ol.style.Fill();

  return function(resolution) {

    // clear the styles
    styles.length = 0;

    if (this.get('__editable__') && this.get('__selected__')) {
      styles.push(vertexStyle);
    }

    // goog.asserts.assert(goog.isDef(this.get('__style__'));
    var color = this.get('color') || '#FF0000';
    var rgb = goog.color.hexToRgb(color);
    var opacity = this.get('opacity');
    if (!goog.isDef(opacity)) {
      opacity = 1;
    }
    var fillColor = goog.color.alpha.rgbaToRgbaStyle(rgb[0], rgb[1], rgb[2],
        opacity);
    fillStyle.setColor(fillColor);

    var lineDash;
    if (this.get('linestyle')) {
      switch (this.get('linestyle')) {
        case 'dashed':
          lineDash = [10, 10];
          break;
        case 'dotted':
          lineDash = [1, 6];
          break;
      }
    }

    var stroke;

    if (this.get('stroke') > 0) {
      stroke = new ol.style.Stroke({
        color: color,
        width: this.get('stroke'),
        lineDash: lineDash
      });
    }
    var imageOptions = {
      fill: fillStyle,
      stroke: new ol.style.Stroke({
        color: color,
        width: this.get('size') / 7
      }),
      radius: this.get('size')
    };
    var image = new ol.style.Circle(imageOptions);
    if (this.get('symbol_id') && this.get('symbol_id') != 'circle') {
      goog.object.extend(imageOptions, ({
        points: 4,
        angle: Math.PI / 4,
        rotation: this.get('angle')
      }));
      image = new ol.style.RegularShape(
          /** @type {olx.style.RegularShapeOptions} */ (imageOptions));
    }

    if (this.get('text')) {
      return [new ol.style.Style({
        text: new ol.style.Text(/** @type {olx.style.TextOptions} */ ({
          text: this.get('name'),
          font: this.get('size') + 'px Sans-serif',
          rotation: this.get('angle'),
          fill: new ol.style.Fill({
            color: color
          }),
          stroke: new ol.style.Stroke({
            color: 'white',
            width: 2
          })
        }))
      })];
    } else {
      styles.push(new ol.style.Style({
        image: image,
        fill: fillStyle,
        stroke: stroke
      }));
    }

    return styles;
  };
};

app.module.service('appMymaps', app.Mymaps);
