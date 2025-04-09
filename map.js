const BOCARIJA = {longitude: 14.3066, latitude: 45.3366};
const SYDNEY = {longitude: 150.644, latitude: -34.397};
const VERONA = {longitude: 10.9917, latitude: 45.438355};

console.debug('$arcgis.import(...)');
const [Collection, Graphic, route, RouteParameters, Stop] = await $arcgis.import([
  '@arcgis/core/core/Collection.js',
  '@arcgis/core/Graphic.js',
  '@arcgis/core/rest/route.js',
  '@arcgis/core/rest/support/RouteParameters.js',
  '@arcgis/core/rest/support/Stop.js',
]);

function handleCoords(coords=VERONA) {
  console.debug('handleCoords(%O)', coords);

  console.debug('document.querySelector("arcgis-map")');
  const arcgisMap = document.querySelector('arcgis-map');

  console.debug('document.querySelector("arcgis-basemap-toggle")');
  const arcgisBasemapToggle = document.querySelector('arcgis-basemap-toggle');
  arcgisBasemapToggle.nextBasemap = 'arcgis/navigation'

  const routeParams = new RouteParameters({
    stops: new Collection([
      new Stop({name: 'Start', geometry: coords}),
      new Stop({name: 'Bocarija', geometry: BOCARIJA}),
    ]),
  });
  const simpleLineSymbol = {
    type: 'simple-line',
    color: [0, 0, 255],
    width: 3
  };

  const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';

  console.debug('route.solve("%s", %O)', routeUrl, routeParams);
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
            console.log(message);
        }
      });
      data.routeResults.forEach(result => {
        result.route.symbol = simpleLineSymbol;
        arcgisMap.componentOnReady().then(() => {
          console.log('arcgisMap.graphics.add(%O)', result.route);
          arcgisMap.graphics.add(result.route);      
          console.log('arcgisMap.goTo(%O)', result.route);
          arcgisMap.goTo(result.route);
        });
      });
    },
    error => {
      console.warn(error);
      const polylineGraphic = new Graphic({
          geometry: {
            type: 'polyline',
            paths: [
              [coords.longitude, coords.latitude],
              [BOCARIJA.longitude, BOCARIJA.latitude],
            ],
          },
          symbol: simpleLineSymbol,
        });
        arcgisMap.componentOnReady().then(() => {
          console.log('arcgisMap.graphics.add(%O)', polylineGraphic);
          arcgisMap.graphics.add(polylineGraphic);
          console.log('arcgisMap.goTo(%O)', polylineGraphic);
          arcgisMap.goTo(polylineGraphic);
        });
    });
};

if (navigator.geolocation) {
  console.debug('navigator.geolocation.getCurrentPosition()');
  navigator.geolocation.getCurrentPosition(
    position => handleCoords(position.coords),
    positionError => {
      console.warn(positionError);
      handleCoords();
    });
} else {
  console.warn('Geolocation not available');
  handleCoords();
}
