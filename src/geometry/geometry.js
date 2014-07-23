var Mesh = require('./mesh.js');
var Face = require('./face.js');

var geometry = Object.create(null);

geometry.Mesh = Mesh;
geometry.Face = Face;

module.exports = geometry;
