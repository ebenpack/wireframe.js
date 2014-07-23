/**
 * @license
 * Copyright (c) 2014 Eben Packwood. All rights reserved.
 * MIT License
 *
 */

var geometry = require('./geometry/geometry.js');
var engine = require('./engine/engine.js');

var wireframe = Object.create(null);

wireframe.geometry = geometry;
wireframe.engine = engine;

module.exports = wireframe;
