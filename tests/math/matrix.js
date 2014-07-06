var Matrix = require('../../src/math/matrix.js');
var assert = require("assert");

suite('Matrix', function(){
    var zero, identity;
    setup(function(){
        zero = new Matrix();
        identity = Matrix.identity();
    });
    suite('length', function(){
        test('should have a length of 16', function(){
            assert.equal(16, zero.length);
            assert.equal(16, identity.length);
        });
    });
    suite('methods', function(){
        test('equal', function(){
            
        });
        test('add', function(){
            
        });
        test('subtract', function(){
            
        });
        test('multiplyScalar', function(){
            
        });
        test('multiply', function(){
            
        });
        test('negate', function(){
            
        });
        test('transpose', function(){
            
        });
        test('rotationX', function(){
            
        });
        test('rotationY', function(){
            
        });
        test('rotationZ', function(){
            
        });
        test('rotationAxis', function(){
            
        });
        test('rotation', function(){
            
        });
        test('translation', function(){
            
        });
        test('scale', function(){
            
        });
        test('identity', function(){
            
        });
        test('zero', function(){
            
        });
        test('fromArray', function(){
            
        });
    });
});