var Mesh = require('../../src/math/mesh.js');
var Face = require('../../src/math/face.js');
var Vector = require('../../src/math/vector.js');
var assert = require("assert");

var mesh = new Mesh('triangle',
        [
            new Vector(1,0,0),
            new Vector(0,1,0),
            new Vector(0,0,1)
        ],
        [
            new Face(0, 1, 2, 'red')
        ]
    );

describe('Mesh', function(){
    describe('name', function(){
        it('should have a name', function(){
            assert.ok(mesh.name);
            assert.equal(mesh.name, 'triangle');
        })
    });
    describe('vertices', function(){
        
    });
    describe('faces', function(){
        
    });
    describe('position', function(){
        
    });
    describe('rotation', function(){
        
    });
    describe('scale', function(){
        
    });
    describe('fromJSON', function(){

    });
});