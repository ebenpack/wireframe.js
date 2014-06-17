var Scene = require('./scene.js');
var Camera = require('./camera.js');

var engine = Object.create(null);

engine.Scene = Scene;
engine.Camera = Camera;

module.exports = engine;