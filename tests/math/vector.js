var Vector = require('../../src/math/vector.js');
var assert = require("assert");

var vector1 = new Vector(1,1,1);
var vector2 = new Vector(1,1,1);
var vector3 = new Vector(1,1,2);

describe('Vector', function(){
    describe('equal', function(){
        it('should be equal to another vector with the same coordinates', function(){
            assert.equal(vector1.equal(vector2), true);
            assert.equal(vector1.equal(vector3), false);
        })
    });
});