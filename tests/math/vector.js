var Vector = require('../../src/math/vector.js');
var assert = require("assert");

suite('Vector', function(){
    var origin, vector1, vector2, vector3, vector4;
    setup(function(){
        origin = new Vector(0, 0, 0);
        vector1 = new Vector(1, 1, 1);
        vector2 = new Vector(1, 1, 1);
        vector3 = new Vector(10, 10, 10);
        vector4 = new Vector(11, 11, 11);
    });
    suite('properties', function(){

    });
    suite('methods', function(){
        test('add', function(){
            assert.ok(vector1.add(vector3).equal(vector4));
            assert.ok(vector1.add(vector2.negate()).equal(origin));
        });
        test('subtract', function(){
            assert.ok(vector4.subtract(vector1).equal(vector3));
            assert.ok(vector1.subtract(vector2).equal(origin));
        });
        test('equal', function(){
            assert.equal(vector1.equal(vector2), true);
            assert.equal(vector1.equal(vector3), false);
        });
        test('angle', function(){
            
        });
        test('cosAngle', function(){

        });
        test('magnitude', function(){

        });
        test('magnitudeSquared', function(){

        });
        test('dot', function(){

        });
        test('cross', function(){

        });
        test('normalize', function(){

        });
        test('scale', function(){

        });
        test('negate', function(){

        });
        test('vectorProjection', function(){

        });
        test('scalarProjection', function(){

        });
        test('component', function(){

        });
        test('rotate', function(){

        });
        test('transform', function(){

        });
        test('rotateX', function(){

        });
        test('rotateY', function(){

        });
        test('rotateZ', function(){

        });
        test('rotatePitchYawRoll', function(){

        });
    });
});