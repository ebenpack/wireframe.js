var Camera = require('../../src/engine/camera.js');
var assert = require("assert");

var camera = new Camera(600, 400);

describe('Camera', function(){
    describe('height', function(){
        it('should have a height', function(){
            assert.ok(camera.height);
            assert.equal(camera.height, 400);
        })
    })
});