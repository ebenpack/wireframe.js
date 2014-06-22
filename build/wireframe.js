!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.wireframe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var math = _dereq_('../math/math.js');
var Vector = math.Vector;
var Matrix = math.Matrix;

/** 
 * @constructor
 * @this {Camera}
 * @param {Vector} position Camera position.
 * @param {Vector} target   Camera
 */
// TODO: Camera should store view matrix. Instead of computing every render, it will be
// re-computed only when position, orientation, etc. changes
function Camera(position, target){
    this.position = position || new Vector(1,1,20);
    this.target = target || new Vector(0,0,0);
    this.up = new Vector(0, 1, 0);
    this.view_matrix = this.lookAt();
    this.near = 0.1;
    this.far = 1000;
    this.fov = 90;
}
/** @method */
Camera.prototype.lookAt = function(){
    var eye = this.position;
    var target = this.target;
    var up = this.up;
    var zaxis = eye.subtract(target).normalize();
    var xaxis = up.cross(zaxis).normalize();
    var yaxis = zaxis.cross(xaxis);
    var view_matrix = Matrix.fromArray([
        xaxis.x, yaxis.x, zaxis.x, 0,
        xaxis.y, yaxis.y, zaxis.y, 0,
        xaxis.z, yaxis.z, zaxis.z, 0,
        -(xaxis.dot(eye)), -(yaxis.dot(eye)), -(zaxis.dot(eye)), 1
        ]);
    return view_matrix;
};
// Vector3 dirVector = Vector3(0.0, 0.0, -1.0);
// dirVector = scene->getDefaultCamera()->getConcatenatedMatrix().rotateVector(dirVector);
// Vector3 newPosition = scene->getDefaultCamera()->getPosition() + (dirVector * moveSpeed * elapsed);
/** @method */
Camera.prototype.moveTo = function(x, y, z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveRight = function(amount){
    // TODO: WRONG!!!
    this.position.x += amount;
    //this.target.x += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveLeft = function(amount){
    // TODO: WRONG!!!
    this.position.x -= amount;
    //this.target.x -= amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveUp = function(amount){
    // TODO: WRONG!!!
    this.position.y -= amount;
    //this.target.y -= amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveDown = function(amount){
    // TODO: WRONG!!!
    this.position.y += amount;
    //this.target.y += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.orbitTo = function(){

};
/** @method */
Camera.prototype.zoomIn = function(amount){
    // TODO: WRONG!!!
    this.position.z += amount;
    //this.target.z += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.zoomOut = function(amount){
    // TODO: WRONG!!!
    this.position.z -= amount;
    //this.target.z += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.orbitLeft = function(){

};
/** @method */
Camera.prototype.orbitRight = function(){

};

module.exports = Camera;
},{"../math/math.js":7}],2:[function(_dereq_,module,exports){
var Scene = _dereq_('./scene.js');
var Camera = _dereq_('./camera.js');

var engine = Object.create(null);

engine.Scene = Scene;
engine.Camera = Camera;

module.exports = engine;
},{"./camera.js":1,"./scene.js":4}],3:[function(_dereq_,module,exports){
/**
 * @license
 * Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
 * MIT License
 */

function EventTarget(){
    this._listeners = {};
}

EventTarget.prototype = {

    constructor: EventTarget,

    addListener: function(type, listener){
        if (typeof this._listeners[type] == "undefined"){
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    },

    fire: function(event){
        if (typeof event == "string"){
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }

        if (!event.type){  //falsy
            throw new Error("Event object missing 'type' property.");
        }

        if (this._listeners[event.type] instanceof Array){
            var listeners = this._listeners[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
                listeners[i].call(this, event);
            }
        }
    },

    removeListener: function(type, listener){
        if (this._listeners[type] instanceof Array){
            var listeners = this._listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    }
};

module.exports = EventTarget;
},{}],4:[function(_dereq_,module,exports){
var math = _dereq_('../math/math.js');
var Camera = _dereq_('./camera.js');
var EventTarget = _dereq_('./events.js');
var KEYCODES = _dereq_('../utility/keycodes.js');

var Vector = math.Vector;
var Matrix = math.Matrix;
var Mesh = math.Mesh;

/**
 * @constructor
 * @this {Scene}
 * @param {{canvas_id: string, width: number, height: number}} options
 */
function Scene(options){
    /** @type {number} */
    this.width = options.width;
    /** @type {number} */
    this.height = options.height;
    this.canvas = document.getElementById(options.canvas_id);
    this.ctx = this.canvas.getContext('2d');
    this._back_buffer = document.createElement('canvas');
    this._back_buffer.width = this.width;
    this._back_buffer.height = this.height;
    this._back_buffer_ctx = this._back_buffer.getContext('2d');
    this._back_buffer_image = null;
    this._depth_buffer = [];
    this.drawing_mode = 1;
    this.camera = new Camera();
    this.illumination = new Vector(100,100,100);
    /** @type {Array.<Mesh>} */
    this.meshes = [];
    /** @type {Object.<number, boolean>} */
    this._keys = {}; // Keys currently pressed
    this._key_count = 0; // Number of keys being pressed... this feels kludgy
    /** @type {?number} */
    this._anim_id = null;
    /** @type {boolean} */
    this._needs_update = true;
    this._draw_mode = 'wireframe';
    this.init();
}
Scene.prototype = new EventTarget();
/** @method */
Scene.prototype.init = function(){
    this.canvas.tabIndex = 1; // Set tab index to allow canvas to have focus to receive key events
    this._x_offset = Math.round(this.width / 2);
    this._y_offset = Math.round(this.height / 2);
    this.initializeDepthBuffer();
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.canvas.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.canvas.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.canvas.addEventListener('blur', this.emptyKeys.bind(this), false);
    EventTarget.call(this);
    this.update();
};
/**
 * Dump all pressed keys on blur.
 * @method
 */
Scene.prototype.emptyKeys = function(){
    this._key_count = 0;
    this._keys = {};
};
/** @method */
Scene.prototype.isKeyDown = function(key){
    return (KEYCODES[key] in this._keys);
};
/** @method */
Scene.prototype.onKeyDown = function(e){
    var pressed = e.keyCode || e.which;
    if (!this.isKeyDown(pressed)){
        this._key_count += 1;
        this._keys[pressed] = true;
    }
};
/** @method */
Scene.prototype.onKeyUp = function(e){
    var pressed = e.keyCode || e.which;
    if (pressed in this._keys){
        this._key_count -= 1;
        delete this._keys[pressed];
    }
};
Scene.prototype.initializeDepthBuffer = function(){
    for (var x = 0, len = this.width * this.height; x < len; x++){
        this._depth_buffer[x] = 9999999;
    }
};
/**
 * Builds a perspective projection matrix based on a field of view.
 * @method
 * @return {Matrix}
 */
Scene.prototype.perspectiveFov = function() {
    var fov = this.camera.fov * (Math.PI / 180); // convert to radians
    var aspect = this.canvas.width / this.canvas.height;
    var near = this.camera.near;
    var far = this.camera.far;
    var matrix = Matrix.zero();
    var height = (1/Math.tan(fov/2)) * this.canvas.height;
    var width = height * aspect;

    matrix.m[0] = width;
    matrix.m[5] = height;
    matrix.m[10] = far/(near-far) ;
    matrix.m[11] = -1;
    matrix.m[14] = near*far/(near-far);

    return matrix;
};
/** @method */
Scene.prototype.drawPixel = function(x, y, z, color){
    x = Math.round(x + this._x_offset);
    y = Math.round(y + this._y_offset);
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        var index = x + (y * this.width);
        if (z < this._depth_buffer[index]) {
            var image_data = this._back_buffer_image.data;
            var i = index * 4;
            image_data[i] = color.r;
            image_data[i+1] = color.g;
            image_data[i+2] = color.b;
            image_data[i+3] = 255;
            this._depth_buffer[index] = z;
        }
    }
};
/** @method  */
Scene.prototype.drawEdge = function(vector1, vector2, color){
    var abs = Math.abs;
    var current_x = vector1.x;
    var current_y = vector1.y;
    var current_z = vector1.z;
    var longest_dist = Math.max(abs(vector2.x - vector1.x), abs(vector2.y - vector1.y), abs(vector2.z - vector1.z));
    var step_x = (vector2.x - vector1.x) / longest_dist;
    var step_y = (vector2.y - vector1.y) / longest_dist;
    var step_z = (vector2.z - vector1.z) / longest_dist;
    for (var i = 0; i < longest_dist; i++){
        current_x += step_x;
        current_y += step_y;
        current_z += step_z;
        this.drawPixel(current_x, current_y, current_z, color);
    }
};
/** @method */
Scene.prototype.drawTriangle = function(vector1, vector2, vector3, color){
    this.drawEdge(vector1, vector2, color);
    this.drawEdge(vector2, vector3, color);
    this.drawEdge(vector3, vector1, color);
};
/** @method */
Scene.prototype.fillFlattopTriangle = function(v1, v2, v3, color){
    // TODO: Write this
    return;
};
/** @method */
Scene.prototype.fillFlatbottomTriangle = function(v1, v2, v3, color){
    // TODO: Write this
    return;
};
/** @method */
Scene.prototype.fillTriangle = function(v1, v2, v3, color){
    // TODO: Finish this
    // Sort vertices by y value
    var temp;
    if(v1.y > v2.y) {
        temp = v2;
        v2 = v1;
        v1 = temp;
    }
    if(v2.y > v3.y) {
        temp = v2;
        v2 = v3;
        v3 = temp;
    }
    if(v1.y > v2.y) {
        temp3 = v2;
        v2 = v1;
        v1 = temp;
    }
    // Do we have a flattop triangle
    if (v1.y === v2.y){
        this.fillFlattopTriangle(v1, v2, v3, color);
    }
    // Do we have a flatbottom triangle
    else if (v2.y === v3.y){
        this.fillFlatbottomTriangle(v1, v2, v3, color);
    }
    // Decompose into flattop and flatbottom triangles
    else {
        // TODO: Find x and z slopes, find point v4
        this.fillFlattopTriangle(v1, v2, v4, color);
        this.fillFlatbottomTriangle(v4, v2, v3, color);
    }
};
/** @method */
Scene.prototype.renderScene = function(){
    // TODO: Clarify this function.
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.initializeDepthBuffer();
    var camera_matrix = this.camera.view_matrix;
    var projection_matrix = this.perspectiveFov();
    for (var i = 0, len = this.meshes.length; i < len; i++){
        var mesh = this.meshes[i];
        var scale = mesh.scale;
        var rotation = mesh.rotation;
        var position = mesh.position;
        var world_matrix = Matrix.scale(scale.x, scale.y, scale.z).multiply(
            Matrix.rotation(rotation.pitch, rotation.yaw, rotation.roll).multiply(
                Matrix.translation(position.x, position.y, position.z)));
        var wvp_matrix = world_matrix.multiply(camera_matrix).multiply(projection_matrix);
        for (var k = 0; k < mesh.faces.length; k++){
            var face = mesh.faces[k].face;
            var color = mesh.faces[k].color;
            var v1 = mesh.vertices[face[0]];
            var v2 = mesh.vertices[face[1]];
            var v3 = mesh.vertices[face[2]];
            var wv1 = v1.transform(wvp_matrix);
            var wv2 = v2.transform(wvp_matrix);
            var wv3 = v3.transform(wvp_matrix);
            var face_translation = Matrix.translation(wv1.x, wv1.y, wv1.z);
            var normal = mesh.normal(k).transform(world_matrix).scale(20).transform(face_translation);
            // var illumination_angle = normal.angle(this.illumination);
            // TODO: Backface culling, if not in wireframe mode
            // color = color.darken(illumination_angle);
            this.drawTriangle(wv1, wv2, wv3, color);
        }
    }
    this._back_buffer_ctx.putImageData(this._back_buffer_image, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this._back_buffer, 0, 0, this.canvas.width, this.canvas.height);
};
/** @method */
Scene.prototype.addMesh = function(mesh){
    this.meshes.push(mesh);
};
/** @method */
Scene.prototype.removeMesh = function(mesh){
    // TODO: Write this
};
/** @method */
Scene.prototype.update = function(){
    if (this._key_count > 0){
        this.fire('keydown');
    }
    if (this._needs_update) {
        this.renderScene();
        this._needs_update = false;
    }
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};



module.exports = Scene;
},{"../math/math.js":7,"../utility/keycodes.js":12,"./camera.js":1,"./events.js":3}],5:[function(_dereq_,module,exports){
var math = _dereq_('./math/math.js');
var engine = _dereq_('./engine/engine.js');

var wireframe = Object.create(null);

wireframe.math = math;
wireframe.engine = engine;

module.exports = wireframe;
},{"./engine/engine.js":2,"./math/math.js":7}],6:[function(_dereq_,module,exports){
var Color = _dereq_('../utility/color.js');
var Vector = _dereq_('./vector.js');

/**
 * A 3D triangle
 * @param {number} a     [description]
 * @param {number} b     [description]
 * @param {number} c     [description]
 * @param {string} color [description]
 */
function Face(a, b, c, color){
    this.face = [a, b, c];
    this.color = new Color(color);
}

module.exports = Face;
},{"../utility/color.js":11,"./vector.js":10}],7:[function(_dereq_,module,exports){
var Vector = _dereq_('./vector.js');
var Mesh = _dereq_('./mesh.js');
var Matrix = _dereq_('./matrix.js');
var Face = _dereq_('./face.js');

var math = Object.create(null);

math.Vector = Vector;
math.Mesh = Mesh;
math.Matrix = Matrix;
math.Face = Face;

module.exports = math;
},{"./face.js":6,"./matrix.js":8,"./mesh.js":9,"./vector.js":10}],8:[function(_dereq_,module,exports){
/** 
 * 4x4 matrix.
 * @constructor
 * @this {Matrix}
 */
function Matrix(){
    /** @type {Array.<number>} */
    this.m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}
/**
 * Compare matrix with self for equality.
 * @method
 * @param {Matrix} matrix
 * @return {boolean}
 */
Matrix.prototype.equals = function(matrix){
    for (var i = 0, len = this.m.length; i < len; i++){
        if (this.m[i] !== matrix.m[i]){
            return false;
        }
    }
    return true;
};
/**
 * Add matrix to self.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.add = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.m.length; i < len; i++){
        new_matrix.m[i] = this.m[i] + matrix.m[i];
    }
    return new_matrix;
};
/**
 * Subtract matrix from self.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.subtract = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.m.length; i < len; i++){
        this.m[i] = this.m[i] - matrix.m[i];
    }
    return new_matrix;
};
/**
 * Multiply self by scalar.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.multiplyScalar = function(scalar){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.m.length; i < len; i++){
        this.m[i] = this.m[i] * scalar;
    }
    return new_matrix;
};
/**
 * Multiply self by matrix.
 * @method
 * @param {Matrix} matrix
 * @return {Matrix}
 */
Matrix.prototype.multiply = function(matrix){
    var new_matrix = new Matrix();
    new_matrix.m[0] = (this.m[0] * matrix.m[0]) + (this.m[1] * matrix.m[4]) + (this.m[2] * matrix.m[8]) + (this.m[3] * matrix.m[12]);
    new_matrix.m[1] = (this.m[0] * matrix.m[1]) + (this.m[1] * matrix.m[5]) + (this.m[2] * matrix.m[9]) + (this.m[3] * matrix.m[13]);
    new_matrix.m[2] = (this.m[0] * matrix.m[2]) + (this.m[1] * matrix.m[6]) + (this.m[2] * matrix.m[10]) + (this.m[3] * matrix.m[14]);
    new_matrix.m[3] = (this.m[0] * matrix.m[3]) + (this.m[1] * matrix.m[7]) + (this.m[2] * matrix.m[11]) + (this.m[3] * matrix.m[15]);
    new_matrix.m[4] = (this.m[4] * matrix.m[0]) + (this.m[5] * matrix.m[4]) + (this.m[6] * matrix.m[8]) + (this.m[7] * matrix.m[12]);
    new_matrix.m[5] = (this.m[4] * matrix.m[1]) + (this.m[5] * matrix.m[5]) + (this.m[6] * matrix.m[9]) + (this.m[7] * matrix.m[13]);
    new_matrix.m[6] = (this.m[4] * matrix.m[2]) + (this.m[5] * matrix.m[6]) + (this.m[6] * matrix.m[10]) + (this.m[7] * matrix.m[14]);
    new_matrix.m[7] = (this.m[4] * matrix.m[3]) + (this.m[5] * matrix.m[7]) + (this.m[6] * matrix.m[11]) + (this.m[7] * matrix.m[15]);
    new_matrix.m[8] = (this.m[8] * matrix.m[0]) + (this.m[9] * matrix.m[4]) + (this.m[10] * matrix.m[8]) + (this.m[11] * matrix.m[12]);
    new_matrix.m[9] = (this.m[8] * matrix.m[1]) + (this.m[9] * matrix.m[5]) + (this.m[10] * matrix.m[9]) + (this.m[11] * matrix.m[13]);
    new_matrix.m[10] = (this.m[8] * matrix.m[2]) + (this.m[9] * matrix.m[6]) + (this.m[10] * matrix.m[10]) + (this.m[11] * matrix.m[14]);
    new_matrix.m[11] = (this.m[8] * matrix.m[3]) + (this.m[9] * matrix.m[7]) + (this.m[10] * matrix.m[11]) + (this.m[11] * matrix.m[15]);
    new_matrix.m[12] = (this.m[12] * matrix.m[0]) + (this.m[13] * matrix.m[4]) + (this.m[14] * matrix.m[8]) + (this.m[15] * matrix.m[12]);
    new_matrix.m[13] = (this.m[12] * matrix.m[1]) + (this.m[13] * matrix.m[5]) + (this.m[14] * matrix.m[9]) + (this.m[15] * matrix.m[13]);
    new_matrix.m[14] = (this.m[12] * matrix.m[2]) + (this.m[13] * matrix.m[6]) + (this.m[14] * matrix.m[10]) + (this.m[15] * matrix.m[14]);
    new_matrix.m[15] = (this.m[12] * matrix.m[3]) + (this.m[13] * matrix.m[7]) + (this.m[14] * matrix.m[11]) + (this.m[15] * matrix.m[15]);
    return new_matrix;
};
/**
 * Negate self.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.negate = function(matrix){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.matrix.length; i < len; i++){
        this.matrix.m[i] = -this.matrix.m[i];
    }
    return new_matrix;
};
/**
 * Transpose self.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.transpose = function(){
    var new_matrix = new Matrix();
    new_matrix.m[0] = this.m[0];
    new_matrix.m[1] = this.m[4];
    new_matrix.m[2] = this.m[8];
    new_matrix.m[3] = this.m[12];
    new_matrix.m[4] = this.m[1];
    new_matrix.m[5] = this.m[5];
    new_matrix.m[6] = this.m[9];
    new_matrix.m[7] = this.m[13];
    new_matrix.m[8] = this.m[2];
    new_matrix.m[9] = this.m[6];
    new_matrix.m[10] = this.m[10];
    new_matrix.m[11] = this.m[14];
    new_matrix.m[12] = this.m[3];
    new_matrix.m[13] = this.m[7];
    new_matrix.m[14] = this.m[11];
    new_matrix.m[15] = this.m[15];
    return new_matrix;
};

/**
 * Constructs a rotation matrix, rotating by theta around the x-axis
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationX = function(theta){
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix.m[0] = 1;
    rotation_matrix.m[5] = cos;
    rotation_matrix.m[6] = -sin;
    rotation_matrix.m[9] = sin;
    rotation_matrix.m[10] = cos;
    rotation_matrix.m[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the y-axis
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationY = function(theta){
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix.m[0] = cos;
    rotation_matrix.m[2] = sin;
    rotation_matrix.m[5] = 1;
    rotation_matrix.m[8] = -sin;
    rotation_matrix.m[10] = cos;
    rotation_matrix.m[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the z-axis
 * @method
 * @static
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationZ = function(theta){
    var rotation_matrix = new Matrix();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    rotation_matrix.m[0] = cos;
    rotation_matrix.m[1] = -sin;
    rotation_matrix.m[4] = sin;
    rotation_matrix.m[5] = cos;
    rotation_matrix.m[10] = 1;
    rotation_matrix.m[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix, rotating by theta around the axis
 * @method
 * @static
 * @param {Vector} axis
 * @param {number} theta
 * @return {Matrix}
 */
Matrix.rotationAxis = function(axis, theta){
    var rotation_matrix = new Matrix();
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = ux * uy;
    var xz = ux * uz;
    var yz = uy * uz;
    rotation_matrix.m[0] = cos + ((ux*ux)*cos1);
    rotation_matrix.m[1] = (xy*cos1) - (uz*sin);
    rotation_matrix.m[2] = (xz*cos1)+(uy*sin);
    rotation_matrix.m[4] = (xy*cos1)+(uz*sin);
    rotation_matrix.m[5] = cos+((uy*uy)*cos1);
    rotation_matrix.m[6] = (yz*cos1)-(ux*sin);
    rotation_matrix.m[8] = (xz*cos1)-(uy*sin);
    rotation_matrix.m[9] = (yz*cos1)+(ux*sin);
    rotation_matrix.m[10] = cos + ((uz*uz)*cos1);
    rotation_matrix.m[15] = 1;
    return rotation_matrix;
};
/**
 * Constructs a rotation matrix from pitch, yaw, and roll
 * @method
 * @static
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @return {Matrix}
 */
Matrix.rotation = function(pitch, yaw, roll){
    return Matrix.rotationX(roll).multiply(Matrix.rotationZ(yaw)).multiply(Matrix.rotationY(pitch));
};
/**
 * Constructs a translation matrix from x, y, and z distances
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @return {Matrix}
 */
Matrix.translation = function(xtrans, ytrans, ztrans){
    var translation_matrix = Matrix.identity();
    translation_matrix.m[12] = xtrans;
    translation_matrix.m[13] = ytrans;
    translation_matrix.m[14] = ztrans;
    return translation_matrix;
};
/**
 * Constructs a scaling matrix from x, y, and z scale
 * @method
 * @static
 * @param {number} xtrans
 * @param {number} ytrans
 * @param {number} ztrans
 * @return {Matrix}
 */
Matrix.scale = function(xscale, yscale, zscale){
    var scaling_matrix = new Matrix();
    scaling_matrix.m[0] = xscale;
    scaling_matrix.m[5] = yscale;
    scaling_matrix.m[10] = zscale;
    scaling_matrix.m[15] = 1;
    return scaling_matrix;
};
/**
 * Constructs an identity matrix
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.identity = function(){
    var identity = new Matrix();
    identity.m[0] = 1;
    identity.m[5] = 1;
    identity.m[10] = 1;
    identity.m[15] = 1;
    return identity;
};
/**
 * Constructs a zero matrix
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.zero = function(){
    return new Matrix();
};
/**
 * Constructs a new matrix from an array
 * @method
 * @static
 * @return {Matrix}
 */
Matrix.fromArray = function(arr){
    var new_matrix = new Matrix();
    for (var i = 0; i < 16; i++){
        new_matrix.m[i] = arr[i];
    }
    return new_matrix;
};

module.exports = Matrix;
},{}],9:[function(_dereq_,module,exports){
var Vector = _dereq_('./vector.js');

/**
 * @constructor
 * @this {Mesh}
 * @param {string} name
 * @param {Array.<Vertex>} vertices
 * @param {Array.<{edge: Array.<number>, color: string}>} edges
 */
function Mesh(name, vertices, faces){
    this.name = name;
    this.vertices = vertices;
    this.faces = faces;
    this.position = new Vector(0, 0, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.scale = {'x': 1, 'y': 1, 'z': 1};
}
/**
 * Returns the normal vector for the given face.
 * @param  {number} index 
 * @return {Vector}
 */
Mesh.prototype.normal = function(index){
    var face = this.faces[index].face;
    var a = this.vertices[face[0]];
    var b = this.vertices[face[1]];
    var c = this.vertices[face[2]];
    var side1 = b.subtract(a);
    var side2 = c.subtract(a);
    var norm = side1.cross(side2);
    if (norm.magnitude() <= 0.00000001){
        return norm;
    } else {
        return norm.normalize();
    }
};
/**
 * Returns the centroid vector for the given face.
 * @param  {number} index 
 * @return {Vector}
 */
Mesh.prototype.centroid = function(index){
    var face = this.faces[index].face;
    var a = this.vertices[face[0]];
    var b = this.vertices[face[1]];
    var c = this.vertices[face[2]];
    return new Vector((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3);
};

module.exports = Mesh;
},{"./vector.js":10}],10:[function(_dereq_,module,exports){
/**
 * @constructor
 * @this {Vector}
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function Vector(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
}
/**
 * Add vector to self.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.add = function(vector){
    return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
};
/**
 * Subtract vector from self.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.subtract = function(vector){
    return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
};
/**
 * Compare vector with self for equality
 * @method
 * @param {Vector} vector
 * @return {boolean}
 */
Vector.prototype.equal = function(vector){
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
};
/**
 * Find angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.angle = function(vector){
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    return Math.acos( a.dot(b) / (amag * bmag ));
};
/**
 * Find magnitude of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitude = function(){
    return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
};
/**
 * Find magnitude squared of a vector.
 * @method
 * @return {number}
 */
Vector.prototype.magnitudeSquared = function(){
    return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
};
/**
 * Find dot product of self and vector.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.dot = function(vector){
    return (this.x * vector.x) + (this.y * vector.y) + (this.z * vector.z);
};
/**
 * Find cross product of self and vector.
 * @method
 * @param {Vector} vector
 * @return {Vector}
 */
Vector.prototype.cross = function(vector){
    return new Vector(
        (this.y * vector.z) - (this.z * vector.y),
        (this.z * vector.x) - (this.x * vector.z),
        (this.x * vector.y) - (this.y * vector.x)
    );
};
/**
 * Normalize self.
 * @method
 * @return {Vector}
 * @throws {ZeroDivisionError}
 */
Vector.prototype.normalize = function(){
    var magnitude = this.magnitude();
    if (magnitude === 0) {
        return this;
    }
    return new Vector(this.x / magnitude, this.y / magnitude, this.z / magnitude);
};
/**
 * Scale self by scale.
 * @method
 * @param {number} scale
 * @return {Vector}
 */
Vector.prototype.scale = function(scale){
    return new Vector(this.x * scale, this.y * scale, this.z * scale);
};
/**
 * Project self onto vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.vectorProjection = function(vector){
    return this.magnitude() * Math.cos(this.angle(vector));
};
/**
 * Project self onto vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.scalarProjection = function(vector){
    return this.dot(vector.normalize()) * vector.normalize;
};
/**
 * Comp self and vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.comp = function(vector){
    //A.comp(B) = dot(A,norm(B))
    return this.dot(vector) / this.magnitude();
};
/**
 * Rotate self by theta around axis
 * @method
 * @param {Vector} axis
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotate = function(axis, theta){
    var u = axis.normalize();
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var cos1 = 1-cos;
    var ux = u.x;
    var uy = u.y;
    var uz = u.z;
    var xy = u.x * u.y;
    var xz = u.x * u.z;
    var yz = u.y * u.z;
    var x = ((cos + ((ux*ux)*cos1)) * this.x) + (((xy*cos1) - (uz*sin)) * this.y) + (((xz*cos1)+(uy*sin)) * this.z);
    var y = (((xy*cos1)+(uz*sin)) * this.x) + ((cos+((uy*uy)*cos1)) * this.y) + (((yz*cos1)-(ux*sin)) * this.z);
    var z = (((xz*cos1)-(uy*sin)) * this.x) + (((yz*cos1)+(ux*sin)) * this.y) + ((cos + ((ux*ux)*cos1)) * this.z);
    return new Vector(x, y, x);
};
/**
 * Perform linear tranformation on self.
 * @method
 * @param {Matrix} transform_matrix
 * @return {Vector}
 */
Vector.prototype.transform = function(transform_matrix){
     var x = (this.x * transform_matrix.m[0]) + (this.y * transform_matrix.m[4]) + (this.z * transform_matrix.m[8]) + transform_matrix.m[12];
    var y = (this.x * transform_matrix.m[1]) + (this.y * transform_matrix.m[5]) + (this.z * transform_matrix.m[9]) + transform_matrix.m[13];
    var z = (this.x * transform_matrix.m[2]) + (this.y * transform_matrix.m[6]) + (this.z * transform_matrix.m[10]) + transform_matrix.m[14];
    var w = (this.x * transform_matrix.m[3]) + (this.y * transform_matrix.m[7]) + (this.z * transform_matrix.m[11]) + transform_matrix.m[15];
    return new Vector(x / w, y / w, z / w);
};
/**
 * Rotate self by theta around x-axis
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateX = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = this.x;
    var y = (cos * this.y) - (sin * this.z);
    var z = (sin * this.y) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate self by theta around y-axis
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateY = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos *this.x) + (sin * this.z);
    var y = this.y;
    var z = -(sin * this.x) + (cos * this.z);
    return new Vector(x, y, z);
};
/**
 * Rotate self by theta around z-axis
 * @method
 * @param {number} theta
 * @return {Vector}
 */
Vector.prototype.rotateZ = function(theta){
    var sin = Math.sin(theta);
    var cos = Math.cos(theta);
    var x = (cos * this.x) - (sin * this.y);
    var y = (sin * this.x) + (cos * this.y);
    var z = this.z;
    return new Vector(x, y, z);
};
/**
 * Rotate self by pitch, yaw, roll
 * @method
 * @param {number} pitch
 * @param {number} yaw
 * @param {number} roll
 * @return {Vector}
 */
Vector.prototype.rotatePitchYawRoll = function(pitch_amnt, yaw_amnt, roll_amnt) {
    return this.rotateX(roll_amnt).rotateY(pitch_amnt).rotateZ(yaw_amnt);
};

module.exports = Vector;
},{}],11:[function(_dereq_,module,exports){
/**
 * An rgba color.
 * @constructor
 * @param {string} color Any legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 */
function Color(color){
    var parsed_color = {};
    if (color in cache){
        parsed_color = cache[color];
    } else {
        parsed_color = parseColor(color);
        cache[color] = parsed_color;
    }
    this.r = parsed_color.r;
    this.g = parsed_color.g;
    this.b = parsed_color.b;
    var alpha = parsed_color.a || 1;
    this.a = Math.floor(alpha * 255);
}
Color.prototype.toHSLA = function(){
    // TODO: Write this
    return;
};
/**
 * Lighten a color by percent amount.
 * @method
 * @param  {number} percent
 * @return {Color}
 */
Color.prototype.lighten = function(percent){
    // TODO: This function is temporary and its behavior will change.
    // It will use the yet to be written toHSL function above to achieve better results.
    // The results that it returns will change.
    var correctionFactor = (1 - percent) * 0.00000010000;

    var red = Math.floor((255 - this.r) * correctionFactor + this.r);
    var green = Math.floor((255 - this.g) * correctionFactor + this.g);
    var blue = Math.floor((255 - this.b) * correctionFactor + this.b);
    return new Color("rgb(" + red + "," + green + "," + blue + ")");
};
/**
 * Darken a color by percent amount.
 * @method
 * @param  {number} percent
 * @return {Color}
 */
Color.prototype.darken = function(percent){
    // TODO: This function is temporary and its behavior will change.
    // It will use the yet to be written toHSL function above to achieve better results.
    // The results that it returns will change.
    var correctionFactor = percent / 7;
    var red = Math.floor((255 - this.r) * correctionFactor + this.r);
    var green = Math.floor((255 - this.g) * correctionFactor + this.g);
    var blue = Math.floor((255 - this.b) * correctionFactor + this.b);
    return new Color("rgb(" + red + "," + green + "," + blue + ")");
};

/**
 * Parse a CSS color value and return an rgba color object.
 * @param  {string} color A legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 * @return {{r: number, g: number, b: number, a: number}}   rgba color object.
 * @throws {ColorError} If illegal color value is passed.
 */
function parseColor(color){
    // TODO: How cross-browser compatible is this? How efficient?
    // Make a temporary HTML element styled with the given color string
    // then extract and parse the computed rgb(a) value.
    var div = document.createElement('div');
    div.style.backgroundColor = color;
    var rgba = div.style.backgroundColor;
    // Convert string in form 'rgb[a](num, num, num[, num])' to array ['num', 'num', 'num'[, 'num']]
    rgba = rgba.slice(rgba.indexOf('(')+1).slice(0,-1).replace(/\s/g, '').split(',');
    var return_color = {};
    var color_spaces = ['r', 'g', 'b', 'a'];
    for (var i = 0; i < rgba.length; i++){
        var value = parseFloat(rgba[i]); // Alpha value will be floating point.
        if (isNaN(value)){
            throw "ColorError: Something went wrong. Perhaps " + color + " is not a legal CSS color value";
        }
        else {
            return_color[color_spaces[i]] = value;
        }
    }
    return return_color;
}

// Pre-warm the cache with named colors, as these are not
// converted to rgb values by the parseColor function above.
var cache = {
    "black": {"r": 0, "g": 0, "b": 0},
    "silver": {"r": 192, "g": 192, "b": 192},
    "gray": {"r": 128, "g": 128, "b": 128},
    "white": {"r": 255, "g": 255, "b": 255},
    "maroon": {"r": 128, "g": 0, "b": 0},
    "red": {"r": 255, "g": 0, "b": 0},
    "purple": {"r": 128, "g": 0, "b": 128},
    "fuchsia": {"r": 255, "g": 0, "b": 255},
    "green": {"r": 0, "g": 128, "b": 0},
    "lime": {"r": 0, "g": 255, "b": 0},
    "olive": {"r": 128, "g": 128, "b": 0},
    "yellow": {"r": 255, "g": 255, "b": 0},
    "navy": {"r": 0, "g": 0, "b": 128},
    "blue": {"r": 0, "g": 0, "b": 255},
    "teal": {"r": 0, "g": 128, "b": 128},
    "aqua": {"r": 0, "g": 255, "b": 255},
    "orange": {"r": 255, "g": 165, "b": 0},
    "aliceblue": {"r": 240, "g": 248, "b": 255},
    "antiquewhite": {"r": 250, "g": 235, "b": 215},
    "aquamarine": {"r": 127, "g": 255, "b": 212},
    "azure": {"r": 240, "g": 255, "b": 255},
    "beige": {"r": 245, "g": 245, "b": 220},
    "bisque": {"r": 255, "g": 228, "b": 196},
    "blanchedalmond": {"r": 255, "g": 235, "b": 205},
    "blueviolet": {"r": 138, "g": 43, "b": 226},
    "brown": {"r": 165, "g": 42, "b": 42},
    "burlywood": {"r": 222, "g": 184, "b": 135},
    "cadetblue": {"r": 95, "g": 158, "b": 160},
    "chartreuse": {"r": 127, "g": 255, "b": 0},
    "chocolate": {"r": 210, "g": 105, "b": 30},
    "coral": {"r": 255, "g": 127, "b": 80},
    "cornflowerblue": {"r": 100, "g": 149, "b": 237},
    "cornsilk": {"r": 255, "g": 248, "b": 220},
    "crimson": {"r": 220, "g": 20, "b": 60},
    "darkblue": {"r": 0, "g": 0, "b": 139},
    "darkcyan": {"r": 0, "g": 139, "b": 139},
    "darkgoldenrod": {"r": 184, "g": 134, "b": 11},
    "darkgray": {"r": 169, "g": 169, "b": 169},
    "darkgreen": {"r": 0, "g": 100, "b": 0},
    "darkgrey": {"r": 169, "g": 169, "b": 169},
    "darkkhaki": {"r": 189, "g": 183, "b": 107},
    "darkmagenta": {"r": 139, "g": 0, "b": 139},
    "darkolivegreen": {"r": 85, "g": 107, "b": 47},
    "darkorange": {"r": 255, "g": 140, "b": 0},
    "darkorchid": {"r": 153, "g": 50, "b": 204},
    "darkred": {"r": 139, "g": 0, "b": 0},
    "darksalmon": {"r": 233, "g": 150, "b": 122},
    "darkseagreen": {"r": 143, "g": 188, "b": 143},
    "darkslateblue": {"r": 72, "g": 61, "b": 139},
    "darkslategray": {"r": 47, "g": 79, "b": 79},
    "darkslategrey": {"r": 47, "g": 79, "b": 79},
    "darkturquoise": {"r": 0, "g": 206, "b": 209},
    "darkviolet": {"r": 148, "g": 0, "b": 211},
    "deeppink": {"r": 255, "g": 20, "b": 147},
    "deepskyblue": {"r": 0, "g": 191, "b": 255},
    "dimgray": {"r": 105, "g": 105, "b": 105},
    "dimgrey": {"r": 105, "g": 105, "b": 105},
    "dodgerblue": {"r": 30, "g": 144, "b": 255},
    "firebrick": {"r": 178, "g": 34, "b": 34},
    "floralwhite": {"r": 255, "g": 250, "b": 240},
    "forestgreen": {"r": 34, "g": 139, "b": 34},
    "gainsboro": {"r": 220, "g": 220, "b": 220},
    "ghostwhite": {"r": 248, "g": 248, "b": 255},
    "gold": {"r": 255, "g": 215, "b": 0},
    "goldenrod": {"r": 218, "g": 165, "b": 32},
    "greenyellow": {"r": 173, "g": 255, "b": 47},
    "grey": {"r": 128, "g": 128, "b": 128},
    "honeydew": {"r": 240, "g": 255, "b": 240},
    "hotpink": {"r": 255, "g": 105, "b": 180},
    "indianred": {"r": 205, "g": 92, "b": 92},
    "indigo": {"r": 75, "g": 0, "b": 130},
    "ivory": {"r": 255, "g": 255, "b": 240},
    "khaki": {"r": 240, "g": 230, "b": 140},
    "lavender": {"r": 230, "g": 230, "b": 250},
    "lavenderblush": {"r": 255, "g": 240, "b": 245},
    "lawngreen": {"r": 124, "g": 252, "b": 0},
    "lemonchiffon": {"r": 255, "g": 250, "b": 205},
    "lightblue": {"r": 173, "g": 216, "b": 230},
    "lightcoral": {"r": 240, "g": 128, "b": 128},
    "lightcyan": {"r": 224, "g": 255, "b": 255},
    "lightgoldenrodyellow": {"r": 250, "g": 250, "b": 210},
    "lightgray": {"r": 211, "g": 211, "b": 211},
    "lightgreen": {"r": 144, "g": 238, "b": 144},
    "lightgrey": {"r": 211, "g": 211, "b": 211},
    "lightpink": {"r": 255, "g": 182, "b": 193},
    "lightsalmon": {"r": 255, "g": 160, "b": 122},
    "lightseagreen": {"r": 32, "g": 178, "b": 170},
    "lightskyblue": {"r": 135, "g": 206, "b": 250},
    "lightslategray": {"r": 119, "g": 136, "b": 153},
    "lightslategrey": {"r": 119, "g": 136, "b": 153},
    "lightsteelblue": {"r": 176, "g": 196, "b": 222},
    "lightyellow": {"r": 255, "g": 255, "b": 224},
    "limegreen": {"r": 50, "g": 205, "b": 50},
    "linen": {"r": 250, "g": 240, "b": 230},
    "mediumaquamarine": {"r": 102, "g": 205, "b": 170},
    "mediumblue": {"r": 0, "g": 0, "b": 205},
    "mediumorchid": {"r": 186, "g": 85, "b": 211},
    "mediumpurple": {"r": 147, "g": 112, "b": 219},
    "mediumseagreen": {"r": 60, "g": 179, "b": 113},
    "mediumslateblue": {"r": 123, "g": 104, "b": 238},
    "mediumspringgreen": {"r": 0, "g": 250, "b": 154},
    "mediumturquoise": {"r": 72, "g": 209, "b": 204},
    "mediumvioletred": {"r": 199, "g": 21, "b": 133},
    "midnightblue": {"r": 25, "g": 25, "b": 112},
    "mintcream": {"r": 245, "g": 255, "b": 250},
    "mistyrose": {"r": 255, "g": 228, "b": 225},
    "moccasin": {"r": 255, "g": 228, "b": 181},
    "navajowhite": {"r": 255, "g": 222, "b": 173},
    "oldlace": {"r": 253, "g": 245, "b": 230},
    "olivedrab": {"r": 107, "g": 142, "b": 35},
    "orangered": {"r": 255, "g": 69, "b": 0},
    "orchid": {"r": 218, "g": 112, "b": 214},
    "palegoldenrod": {"r": 238, "g": 232, "b": 170},
    "palegreen": {"r": 152, "g": 251, "b": 152},
    "paleturquoise": {"r": 175, "g": 238, "b": 238},
    "palevioletred": {"r": 219, "g": 112, "b": 147},
    "papayawhip": {"r": 255, "g": 239, "b": 213},
    "peachpuff": {"r": 255, "g": 218, "b": 185},
    "peru": {"r": 205, "g": 133, "b": 63},
    "pink": {"r": 255, "g": 192, "b": 203},
    "plum": {"r": 221, "g": 160, "b": 221},
    "powderblue": {"r": 176, "g": 224, "b": 230},
    "rosybrown": {"r": 188, "g": 143, "b": 143},
    "royalblue": {"r": 65, "g": 105, "b": 225},
    "saddlebrown": {"r": 139, "g": 69, "b": 19},
    "salmon": {"r": 250, "g": 128, "b": 114},
    "sandybrown": {"r": 244, "g": 164, "b": 96},
    "seagreen": {"r": 46, "g": 139, "b": 87},
    "seashell": {"r": 255, "g": 245, "b": 238},
    "sienna": {"r": 160, "g": 82, "b": 45},
    "skyblue": {"r": 135, "g": 206, "b": 235},
    "slateblue": {"r": 106, "g": 90, "b": 205},
    "slategray": {"r": 112, "g": 128, "b": 144},
    "slategrey": {"r": 112, "g": 128, "b": 144},
    "snow": {"r": 255, "g": 250, "b": 250},
    "springgreen": {"r": 0, "g": 255, "b": 127},
    "steelblue": {"r": 70, "g": 130, "b": 180},
    "tan": {"r": 210, "g": 180, "b": 140},
    "thistle": {"r": 216, "g": 191, "b": 216},
    "tomato": {"r": 255, "g": 99, "b": 71},
    "turquoise": {"r": 64, "g": 224, "b": 208},
    "violet": {"r": 238, "g": 130, "b": 238},
    "wheat": {"r": 245, "g": 222, "b": 179},
    "whitesmoke": {"r": 245, "g": 245, "b": 245},
    "yellowgreen": {"r": 154, "g": 205, "b": 50}
};

module.exports = Color;
},{}],12:[function(_dereq_,module,exports){
/** 
 * @constant
 * @type {Object.<string, number>} 
 */
var KEYCODES = {
    'backspace' : 8,
    'tab' : 9,
    'enter' : 13,
    'shift' : 16,
    'ctrl' : 17,
    'alt' : 18,
    'pause_break' : 19,
    'caps_lock' : 20,
    'escape' : 27,
    'page_up' : 33,
    'page down' : 34,
    'end' : 35,
    'home' : 36,
    'left_arrow' : 37,
    'up_arrow' : 38,
    'right_arrow' : 39,
    'down_arrow' : 40,
    'insert' : 45,
    'delete' : 46,
    '0' : 48,
    '1' : 49,
    '2' : 50,
    '3' : 51,
    '4' : 52,
    '5' : 53,
    '6' : 54,
    '7' : 55,
    '8' : 56,
    '9' : 57,
    'a' : 65,
    'b' : 66,
    'c' : 67,
    'd' : 68,
    'e' : 69,
    'f' : 70,
    'g' : 71,
    'h' : 72,
    'i' : 73,
    'j' : 74,
    'k' : 75,
    'l' : 76,
    'm' : 77,
    'n' : 78,
    'o' : 79,
    'p' : 80,
    'q' : 81,
    'r' : 82,
    's' : 83,
    't' : 84,
    'u' : 85,
    'v' : 86,
    'w' : 87,
    'x' : 88,
    'y' : 89,
    'z' : 90,
    'left_window key' : 91,
    'right_window key' : 92,
    'select_key' : 93,
    'numpad 0' : 96,
    'numpad 1' : 97,
    'numpad 2' : 98,
    'numpad 3' : 99,
    'numpad 4' : 100,
    'numpad 5' : 101,
    'numpad 6' : 102,
    'numpad 7' : 103,
    'numpad 8' : 104,
    'numpad 9' : 105,
    'multiply' : 106,
    'add' : 107,
    'subtract' : 109,
    'decimal point' : 110,
    'divide' : 111,
    'f1' : 112,
    'f2' : 113,
    'f3' : 114,
    'f4' : 115,
    'f5' : 116,
    'f6' : 117,
    'f7' : 118,
    'f8' : 119,
    'f9' : 120,
    'f10' : 121,
    'f11' : 122,
    'f12' : 123,
    'num_lock' : 144,
    'scroll_lock' : 145,
    'semi_colon' : 186,
    'equal_sign' : 187,
    'comma' : 188,
    'dash' : 189,
    'period' : 190,
    'forward_slash' : 191,
    'grave_accent' : 192,
    'open_bracket' : 219,
    'backslash' : 220,
    'closebracket' : 221,
    'single_quote' : 222
};

module.exports = KEYCODES;
},{}]},{},[5])
(5)
});