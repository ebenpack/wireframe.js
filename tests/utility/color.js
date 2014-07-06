var Color = require('../../src/utility/color.js');
var assert = require("assert");

var red = new Color("red");

describe('Color', function(){
  describe('rgb', function(){
    it('should have rgb representation', function(){
      assert.equal(red.rgb.r, 255);
      assert.equal(red.rgb.g, 0);
      assert.equal(red.rgb.b, 0);
    })
  })
});