var Vector = require('../../src/math/vector.js');
var assert = require("assert");

describe('Vector', function(){
  describe('equal', function(){
    it('should be equal to another vector with the same coordinates', function(){
      var vector1 = new Vector(1,1,1);
      var vector2 = new Vector(1,1,1);
      var vector3 = new Vector(1,1,2);
      assert.ok(vector1.equal(vector2));
      assert.ok(!vector1.equal(vector3));
    })
  })
});