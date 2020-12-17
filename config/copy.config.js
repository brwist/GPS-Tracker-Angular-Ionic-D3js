const defaultConfig = require('@ionic/app-scripts/config/copy.config');

defaultConfig['copy[leaflet]'] = {
    src: ['{{ROOT}}/node_modules/leaflet/dist/**/*'],
    dest: '{{WWW}}/assets/leaflet'
};

defaultConfig['copy[leaflet-fullscreen]'] = {
    src: ['{{ROOT}}/node_modules/leaflet-fullscreen/dist/**/*'],
    dest: '{{WWW}}/assets/leaflet-fullscreen'
};

defaultConfig['copy[leaflet.markercluster]'] = {
    src: ['{{ROOT}}/node_modules/leaflet.markercluster/dist/**/*'],
    dest: '{{WWW}}/assets/leaflet.markercluster'
};

module.exports = defaultConfig;
