const BOCARIJA = {x: 14.3066, y: 45.3366};
const SYDNEY = {x: 150.644, y: -34.397};
const VERONA = {x: 10.9917, y: 45.438355};

const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';

const arcgisMap = document.querySelector('arcgis-map');
arcgisMap.center = [BOCARIJA.x, BOCARIJA.y];

const arcgisBasemapToggle = document.querySelector('arcgis-basemap-toggle');
arcgisBasemapToggle.nextBasemap = 'arcgis/navigation'

const [Collection, route, RouteParameters, Stop, Graphic] = await $arcgis.import([
  '@arcgis/core/core/Collection.js',
  '@arcgis/core/rest/route.js',
  '@arcgis/core/rest/support/RouteParameters.js',
  '@arcgis/core/rest/support/Stop.js',
  '@arcgis/core/Graphic.js',
]);

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
        arcgisMap.graphics.add(result.route);      
        arcgisMap.goTo(result.route);
      });
    },
    error => {
      console.warn(error);
      const polylineGraphic = new Graphic({
          geometry: {
            type: 'polyline',
            paths: [
              [start.x, start.y],
              [BOCARIJA.x, BOCARIJA.y],
            ],
          },
          symbol: simpleLineSymbol,
       });
       arcgisMap.graphics.add(polylineGraphic);
       arcgisMap.goTo(polylineGraphic);
    });
};

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    position => handleLocation({x: position.coords.longitude, y: position.coords.latitude}),
    positionError => {
      console.warn(positionError);
      handleLocation(VERONA);
    });
} else {
  handleLocation(VERONA);
}
