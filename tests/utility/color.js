var Color = require('../../src/utility/color.js');
var assert = require("assert");

suite('Color', function(){
    var red;
    setup(function(){
        red = new Color("red");
    });
    suite('rgb', function(){
        test('should have rgb representation', function(){
            assert.equal(red.rgb.r, 255);
            assert.equal(red.rgb.g, 0);
            assert.equal(red.rgb.b, 0);
        });
    });
});