var Vector = require('../../src/math/vector.js');
var assert = require("assert");

var origin = new Vector(0, 0, 0);
var vector1 = new Vector(1, 1, 1);
var vector2 = new Vector(1, 1, 1);
var vector3 = new Vector(10, 10, 10);
var vector4 = new Vector(11, 11, 11);

describe('Vector', function(){
    describe('add', function(){
        it('should return the resultant of two vectors', function(){
            assert.ok(vector1.add(vector3).equal(vector4));
            assert.ok(vector1.add(vector2.negate()).equal(origin));
        })
    });
    describe('subtract', function(){
        it('should return the difference of two vectors', function(){
            assert.ok(vector4.subtract(vector1).equal(vector3));
            assert.ok(vector1.subtract(vector2).equal(origin));
        })
    });
    describe('equal', function(){
        it('should be equal to another vector with the same coordinates', function(){
            assert.equal(vector1.equal(vector2), true);
            assert.equal(vector1.equal(vector3), false);
        })
    });
    describe('angle', function(){
        
    });
    describe('cosAngle', function(){

    });
    describe('magnitude', function(){

    });
    describe('magnitudeSquared', function(){

    });
    describe('dot', function(){

    });
    describe('cross', function(){

    });
    describe('normalize', function(){

    });
    describe('scale', function(){

    });
    describe('negate', function(){

    });
    describe('vectorProjection', function(){

    });
    describe('scalarProjection', function(){

    });
    describe('component', function(){

    });
    describe('rotate', function(){

    });
    describe('transform', function(){

    });
    describe('rotateX', function(){

    });
    describe('rotateY', function(){

    });
    describe('rotateZ', function(){

    });
    describe('rotatePitchYawRoll', function(){

    });
    
});