const BOCARIJA = {longitude: 14.3066, latitude: 45.3366};
const SYDNEY = {longitude: 150.644, latitude: -34.397};
const VERONA = {longitude: 10.9917, latitude: 45.438355};

const arcgisMap = document.querySelector('arcgis-map');
arcgisMap.center = BOCARIJA;

const arcgisBasemapToggle = document.querySelector('arcgis-basemap-toggle');
arcgisBasemapToggle.nextBasemap = 'arcgis/navigation'

const [Collection, Graphic, route, RouteParameters, Stop] = await $arcgis.import([
  '@arcgis/core/core/Collection.js',
  '@arcgis/core/Graphic.js',
  '@arcgis/core/rest/route.js',
  '@arcgis/core/rest/support/RouteParameters.js',
  '@arcgis/core/rest/support/Stop.js',
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

  const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';
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
              [start.longitude, start.latitude],
              [BOCARIJA.longitude, BOCARIJA.latitude],
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
    position => handleLocation(position.coords),
    positionError => {
      console.warn(positionError);
      handleLocation(VERONA);
    });
} else {
  handleLocation(VERONA);
}
