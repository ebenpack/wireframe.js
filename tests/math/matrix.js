var Matrix = require('../../src/math/matrix.js');
var assert = require("assert");

describe('Matrix', function(){
  describe('length', function(){
    it('should have a length of 16', function(){
      var matrix = new Matrix();
      assert.equal(16, matrix.length);
    })
  })
});