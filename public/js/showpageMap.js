mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: geocache.geometry.coordinates,
    zoom: 10,
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(geocache.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${geocache.title}</h3><p>${geocache.location}</p>`
        )
    )
    .addTo(map)