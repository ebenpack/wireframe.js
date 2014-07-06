var Face = require('../../src/math/face.js');
var Color = require('../../src/utility/color.js');
var assert = require("assert");

var face = new Face(0, 1, 2, "red");

describe('Face', function(){
  describe('color', function(){
    it('should have a color', function(){
        assert.ok(face.color);
        assert.equal(face.color.rgb.r, 255);
    })
  })
});