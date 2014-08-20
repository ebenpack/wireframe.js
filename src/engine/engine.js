var Scene = require('./scene.js');
var Camera = require('./camera.js');

var engine = Object.create(null);

engine.Scene = Scene;
engine.Camera = Camera;

module.exports = engine;

/**
* @license
* Copyright (c) 2014 Eben Packwood. All rights reserved.
* MIT License
*
*/