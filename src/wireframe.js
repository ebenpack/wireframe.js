var math = require('./math/math.js');
var engine = require('./engine/engine.js');

var wireframe = Object.create(null);

wireframe.math = math;
wireframe.engine = engine;

module.exports = wireframe;