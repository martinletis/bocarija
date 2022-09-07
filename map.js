const BOCARIJA = {x: 14.3066, y: 45.3366};
const SYDNEY = {x: 150.644, y: -34.397};
const VERONA = {x: 10.9917, y: 45.438355};

const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';

require([
  'esri/config',
  'esri/Map',
  'esri/views/MapView',
  'esri/widgets/BasemapToggle',
  'esri/widgets/Locate',
  'esri/core/Collection',
  'esri/geometry/Point',
  'esri/rest/route',
  'esri/rest/support/RouteParameters',
  'esri/rest/support/Stop',
  'esri/Graphic',
], function (esriConfig, Map, MapView, BasemapToggle, Locate, Collection, Point, route, RouteParameters, Stop, Graphic) {
  esriConfig.apiKey = 'AAPKf113e9ff665146a8ac310d02425079b5-VgHtA308WZA3u9LT_mOBj72gQqcg7dqM3f_YoREHOVcqEgSNb-clK-VjQuIJAjr';

  const map = new Map({
    basemap: 'arcgis-streets-relief'
  });

  const view = new MapView({
    map: map,
    center: [BOCARIJA.x, BOCARIJA.y],
    zoom: 5,
    container: 'viewDiv',
  });

  const basemapToggle = new BasemapToggle({
    view: view,
    nextBasemap: 'arcgis-navigation',
  });
  view.ui.add(basemapToggle, 'bottom-right');

  const handleLocation = function(start) {
    const routeParams = new RouteParameters({
      stops: new Collection([
        new Stop({name: 'Start', geometry: start}),
        new Stop({name: 'Bocarija', geometry: BOCARIJA}),
      ]),
    });
    const simpleLineSymbol = {
      type: 'simple-line',
      color: [0, 0, 255],
      width: 3
    };

    route.solve(routeUrl, routeParams).then(
      data => {
        data.messages.forEach(message => {
          switch(message.type) {
            case 'warning':
              console.warn(message.description);
              break;
            case 'error':
              console.error(message.description);
              break;
            default:
              console.log(message.type + ': ' + message.description);
          }
        });
        data.routeResults.forEach(result => {
          result.route.symbol = simpleLineSymbol;
          view.graphics.add(result.route);      
          view.goTo(result.route);
        });
      },
      error => {
        console.warn(error);
        const polylineGraphic = new Graphic({
            geometry: {
              type: "polyline",
              paths: [
                [start.x, start.y],
                [BOCARIJA.x, BOCARIJA.y],
              ],
            },
            symbol: simpleLineSymbol,
         });
         view.graphics.add(polylineGraphic);
         view.goTo(polylineGraphic);
      });
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => handleLocation({x: position.coords.longitude, y: position.coords.latitude}, view),
      positionError => {
        console.warn(positionError);
        handleLocation(VERONA, view);
      });
  } else {
    handleLocation(VERONA, view);
  }
});
