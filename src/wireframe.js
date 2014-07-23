var geometry = require('./geometry/geometry.js');
var engine = require('./engine/engine.js');

var wireframe = Object.create(null);

wireframe.geometry = geometry;
wireframe.engine = engine;

module.exports = wireframe;
