/**
 * @fileoverview Application entry point.
 *
 * This file defines the "app_main" Closure namespace, which is be used as the
 * Closure entry point (see "entry_point" in the "build.json" file).
 *
 * This file includes `goog.require`'s for all the components/directives used
 * by the HTML page.
 */
goog.module('app.main');

goog.module.declareLegacyNamespace();
const appAskredirectAskredirectDirective = goog.require('app.askredirect.askredirectDirective');
const appAskredirectAskredirectController = goog.require('app.askredirect.AskredirectController');
const appAuthenticationAuthenticationDirective = goog.require('app.authentication.authenticationDirective');
const appAuthenticationAuthenticationController = goog.require('app.authentication.AuthenticationController');
const appBackgroundlayerBackgroundlayerDirective = goog.require('app.backgroundlayer.backgroundlayerDirective');
const appBackgroundlayerBackgroundlayerController = goog.require('app.backgroundlayer.BackgroundlayerController');
const appBackgroundlayerBlankLayer = goog.require('app.backgroundlayer.BlankLayer');
const appCatalogCatalogController = goog.require('app.catalog.CatalogController');
const appCatalogCatalogDirective = goog.require('app.catalog.catalogDirective');
const appImageuploadImguploadController = goog.require('app.imageupload.ImguploadController');
const appImageuploadImguploadDirective = goog.require('app.imageupload.ImguploadDirective');
const appDrawDrawDirective = goog.require('app.draw.drawDirective');
const appDrawDrawController = goog.require('app.draw.DrawController');
const appDrawDrawnFeatures = goog.require('app.draw.DrawnFeatures');
const appDrawFeatureHash = goog.require('app.draw.FeatureHash');
const appDrawFeaturePopup = goog.require('app.draw.FeaturePopup');
const appDrawFeaturePopupController = goog.require('app.draw.FeaturePopupController');
const appDrawFeaturePopupDirective = goog.require('app.draw.featurePopupDirective');
const appDrawRouteControl = goog.require('app.draw.RouteControl');

//const appDrawRouteControlOptions = goog.require('app.draw.RouteControlOptions');
const appDrawSelectedFeaturesService = goog.require('app.draw.SelectedFeaturesService');

const appDrawStyleEditingController = goog.require('app.draw.StyleEditingController');
const appDrawStyleEditingDirective = goog.require('app.draw.styleEditingDirective');
const appDrawSymbolSelectorController = goog.require('app.draw.SymbolSelectorController');
const appDrawSymbolSelectorDirective = goog.require('app.draw.symbolSelectorDirective');
const appExclusionManager = goog.require('app.ExclusionManager');
const appExternaldataExternalDataDirective = goog.require('app.externaldata.externalDataDirective');
const appExternaldataExternalDataController = goog.require('app.externaldata.ExternalDataController');
const appFeedbackFeedbackDirective = goog.require('app.feedback.feedbackDirective');
const appFeedbackFeedbackController = goog.require('app.feedback.FeedbackController');
const appFeedbackanfFeedbackanfDirective = goog.require('app.feedbackanf.feedbackanfDirective');
const appFeedbackanfFeedbackanfController = goog.require('app.feedbackanf.FeedbackanfController');
const appInfobarElevationDirective = goog.require('app.infobar.elevationDirective');
const appInfobarElevationController = goog.require('app.infobar.ElevationController');
const appInfobarInfobarController = goog.require('app.infobar.InfobarController');
const appInfobarInfobarDirective = goog.require('app.infobar.infobarDirective');
const appInfobarProjectionselectorDirective = goog.require('app.infobar.projectionselectorDirective');
const appInfobarProjectionselectorController = goog.require('app.infobar.ProjectionselectorController');
const appInfobarScalelineDirective = goog.require('app.infobar.scalelineDirective');
const appInfobarScalelineController = goog.require('app.infobar.ScalelineController');
const appInfobarScaleselectorDirective = goog.require('app.infobar.scaleselectorDirective');
const appInfobarScaleselectorController = goog.require('app.infobar.ScaleselectorController');
const appLayerinfoLayerinfoDirective = goog.require('app.layerinfo.layerinfoDirective');
const appLayerinfoLayerinfoController = goog.require('app.layerinfo.LayerinfoController');
const appLocationinfoLocationInfoOverlay = goog.require('app.locationinfo.LocationInfoOverlay');
const appLayerinfoShowLayerinfoFactory = goog.require('app.layerinfo.ShowLayerinfoFactory');
const appLayermanagerLayermanagerDirective = goog.require('app.layermanager.layermanagerDirective');
const appLayermanagerLayermanagerController = goog.require('app.layermanager.LayermanagerController');
const appLayerlegendsLayerlegendsDirective = goog.require('app.layerlegends.layerlegendsDirective');
const appLayerlegendsLayerlegendsController = goog.require('app.layerlegends.LayerlegendsController');
const appLocationinfoLocationinfoDirective = goog.require('app.locationinfo.locationinfoDirective');
const appLocationinfoLocationinfoController = goog.require('app.locationinfo.LocationinfoController');
const appMapMapDirective = goog.require('app.map.mapDirective');
const appMapMapController = goog.require('app.map.MapController');
const appMainController = goog.require('app.MainController');
const appMymapsFilereaderDirective = goog.require('app.mymaps.filereaderDirective');
const appMeasureMeasureController = goog.require('app.measure.MeasureController');
const appMeasureMeasureDirective = goog.require('app.measure.MeasureDirective');
const appMymapsMymapsDirective = goog.require('app.mymaps.mymapsDirective');
const appMymapsMymapsController = goog.require('app.mymaps.MymapsController');
const appNotifyFactory = goog.require('app.NotifyFactory');
const appPrintPrintDirective = goog.require('app.print.printDirective');
const appPrintPrintController = goog.require('app.print.PrintController');
const appPrintPrintservice = goog.require('app.print.Printservice');
const appProfileProfileDirective = goog.require('app.profile.profileDirective');
const appProfileProfileController = goog.require('app.profile.ProfileController');
const appQueryPagreportDirective = goog.require('app.query.pagreportDirective');
const appQueryPagreportController = goog.require('app.query.PagreportController');
const appQueryCasiporeportDirective = goog.require('app.query.casiporeportDirective');
const appQueryCasiporeportController = goog.require('app.query.CasiporeportController');
const appQueryPdsreportDirective = goog.require('app.query.pdsreportDirective');
const appQueryPdsreportController = goog.require('app.query.PdsreportController');

//const appQueryQueryStyles = goog.require('app.query.QueryStyles');
const appQueryQueryDirective = goog.require('app.query.queryDirective');

const appQueryQueryController = goog.require('app.query.QueryController');
const appResizemapDirective = goog.require('app.resizemapDirective');
const appRoutingRoutingController = goog.require('app.routing.RoutingController');
const appRoutingRoutingDirective = goog.require('app.routing.routingDirective');
const appSearchSearchDirective = goog.require('app.search.searchDirective');
const appSearchSearchController = goog.require('app.search.SearchController');
const appShareShareDirective = goog.require('app.share.ShareDirective');
const appShareShareController = goog.require('app.share.ShareController');
const appShareShorturlDirective = goog.require('app.share.shorturlDirective');
const appShareShorturlController = goog.require('app.share.ShorturlController');
const appSliderSliderDirective = goog.require('app.slider.SliderDirective');
const appSliderSliderController = goog.require('app.slider.SliderController');
const appStreetviewStreetviewDirective = goog.require('app.streetview.streetviewDirective');
const appStreetviewStreetviewController = goog.require('app.streetview.StreetviewController');
const appThemeswitcherThemeswitcherDirective = goog.require('app.themeswitcher.themeswitcherDirective');
const appThemeswitcherThemeswitcherController = goog.require('app.themeswitcher.ThemeswitcherController');
const appActivetool = goog.require('app.Activetool');
const appCoordinateStringService = goog.require('app.CoordinateStringService');
const appExport = goog.require('app.Export');
const appGeocoding = goog.require('app.Geocoding');
const appGetDevice = goog.require('app.GetDevice');
const appGetElevationService = goog.require('app.GetElevationService');
const appGetLayerForCatalogNodeFactory = goog.require('app.GetLayerForCatalogNodeFactory');
const appGetProfileService = goog.require('app.GetProfileService');
const appGetShorturlService = goog.require('app.GetShorturlService');
const appGetWmsLayerFactory = goog.require('app.GetWmsLayerFactory');
const appGetWmtsLayerFactory = goog.require('app.GetWmtsLayerFactory');
const appLayerOpacityManager = goog.require('app.LayerOpacityManager');
const appLayerPermalinkManager = goog.require('app.LayerPermalinkManager');
const appLocationControl = goog.require('app.LocationControl');

// const appLocationControlOptions = goog.require('app.LocationControlOptions');
const appMap = goog.require('app.Map');

//const appMapsResponse = goog.require('app.MapsResponse');
const appMymaps = goog.require('app.Mymaps');

const appMymapsOffline = goog.require('app.MymapsOffline');
const appOlcsToggle3d = goog.require('app.olcs.toggle3d');
const appOlcsLux3DManager = goog.require('app.olcs.Lux3DManager');
const appOlcsExtent = goog.require('app.olcs.Extent');
const appOlcsZoomToExtent = goog.require('app.olcs.ZoomToExtent');
const appProjections = goog.require('app.projections');
const appRouting = goog.require('app.Routing');
const appScalesService = goog.require('app.ScalesService');
const appStateManager = goog.require('app.StateManager');
const appTheme = goog.require('app.Theme');
const appThemes = goog.require('app.Themes');

//const appThemesResponse = goog.require('app.ThemesResponse');
const appUserManager = goog.require('app.UserManager');

const appWmsHelper = goog.require('app.WmsHelper');
const appWmtsHelper = goog.require('app.WmtsHelper');
const appMiscFile = goog.require('app.misc.file');
const appLotChasse = goog.require('app.LotChasse');
