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
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('cosAngle', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('magnitude', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('magnitudeSquared', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('dot', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('cross', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('normalize', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('scale', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('negate', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('vectorProjection', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('scalarProjection', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('component', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('rotate', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('transform', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('rotateX', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('rotateY', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('rotateZ', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    describe('rotatePitchYawRoll', function(){
        // it('should be equal to another vector with the same coordinates', function(){
        //     assert.equal(vector1.equal(vector2), true);
        //     assert.equal(vector1.equal(vector3), false);
        // })
    });
    
});