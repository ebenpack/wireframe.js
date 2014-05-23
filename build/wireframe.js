!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.wireframe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var math = _dereq_('./math.js');
var KEYCODES = _dereq_('./keycodes.js');

var Vector = math.Vector;
var Vertex = math.Vertex;
var Matrix = math.Matrix;
var Mesh = math.Mesh;

/**
 * @constructor
 * @this {Scene}
 * @param {{canvas_id: string}} options
 */
function Scene(options){
    this.canvas = document.getElementById(options.canvas_id);
    this.ctx = this.canvas.getContext('2d');
    this.camera = new Camera();
    /** @type {Array.<Mesh>} */
    this.meshes = [];
    /** @type {Object.<number, boolean>} */
    this.keys = {}; // Keys currently pressed
    /** @type {?number} */
    this._anim_id = null;
    this.init();
}
/** @method */
Scene.prototype.init = function(){
    this.canvas.tabIndex = 1; // Set tab index to allow canvas to have focus to receive key events
    this._x_offset = Math.round(this.canvas.width / 2);
    this._y_offset = Math.round(this.canvas.height / 2);
    this.update();
    this.canvas.addEventListener('keydown', this.onKeyDown.bind(this), false);
    this.canvas.addEventListener('keyup', this.onKeyUp.bind(this), false);
    this.canvas.addEventListener('blur', this.emptyKeys.bind(this), false);
};
/** @method */
Scene.prototype.onUpdate = function(){
    return;
};
/**
 * Dump all pressed keys on blur.
 * @method
 */
Scene.prototype.emptyKeys = function(){
    this.keys = {};
};
/** @method */
Scene.prototype.isKeyDown = function(key){
    return (KEYCODES[key] in this.keys);
};
/** @method */
Scene.prototype.onKeyDown = function(e){
    var pressed = e.keyCode || e.which;
    this.keys[pressed] = true;
};
/** @method */
Scene.prototype.onKeyUp = function(e){
    var pressed = e.keyCode || e.which;
    delete this.keys[pressed];
};
// Scene.prototype.fireEvents = function(){
//     for (var evt in this.events){
//         this.events[evt]();
//     }
// }
/** @method */
Scene.prototype.worldProjection = function(vector, rotation, position){
    // Translate mesh vector to world vector. Rotate, then translate
    var world_vector = vector.rotatePitchYawRoll(rotation.pitch, rotation.roll, rotation.yaw);
    return world_vector.add(position);
};
/** @method */
Scene.prototype.renderMesh = function(shape){
    var points = [];
    for (var i = 0, len = shape.vertices.length; i < len; i++) {
        // For now, render each vertex, and a line between them
        var vector = shape.vertices[i];
        points.push(this.worldProjection(vector));
    }
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x,points[0].y);
    for (var j = 1, leng = points.length; j < leng; j++){
        this.ctx.lineTo(points[j].x, points[j].y);
    }
    this.ctx.strokeStyle = 'red';
    this.ctx.stroke();
    this.ctx.closePath();
};
/** @method */
Scene.prototype.drawVector = function(vector, color){
    this.ctx.beginPath();
    this.ctx.arc(vector.x + this._x_offset, vector.y + this._y_offset, 2, 0, Math.PI*2, true);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();
};
/** @method */
Scene.prototype.drawEdge = function(vector1, vector2, color){
    this.ctx.beginPath();
    this.ctx.moveTo(vector1.x + this._x_offset, vector1.y + this._y_offset);
    this.ctx.lineTo(vector2.x + this._x_offset, vector2.y + this._y_offset);
    this.ctx.lineWidth = 2;
    // this.ctx.shadowBlur = 10;
    // this.ctx.shadowColor = color;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();

    this.ctx.closePath();
};
/** @method */
Scene.prototype.renderScene = function(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var view_matrix;
    var projection_matrix;

    for (var i = 0, len = this.meshes.length; i < len; i++){
        var mesh = this.meshes[i];
        var rotation = mesh.rotation;
        var position = mesh.position;
        //var world_transform = Matrix.rotation(rotation.pitch, rotation.yaw, rotation.roll).multiply(Matrix.translation(position.x, position.y, position.z));

        var step1 = Matrix.rotation(rotation.pitch, rotation.yaw, rotation.roll);
        var step2 = Matrix.translation(position.x, position.y, position.z);
        var world_transform = step1.multiply(step2);

        // TODO: Do this
        var view_tranform = 0;
        var projection_transform = 0;
        // TODO: Do this

        for (var k = 0; k < mesh.edges.length; k++){
            var edge = mesh.edges[k].edge;
            var color = mesh.edges[k].color;
            var v1 = mesh.vertices[edge[0]].vector;
            var v2 = mesh.vertices[edge[1]].vector;
            var wv1 = v1.transform(world_transform);
            var wv2 = v2.transform(world_transform);
            this.drawEdge(wv1, wv2, color);
        }
    }
};
/** @method */
Scene.prototype.addMesh = function(mesh){
    this.meshes.push(mesh);
};
/** @method */
Scene.prototype.removeMesh = function(mesh){
    // How to do this? Maybe give shapes IDs, in which case users will need to keep track of these
};
/** @method */
Scene.prototype.update = function(){
    //this.fireEvents()
    this.onUpdate();
    this.renderScene();
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};

/** 
 * @constructor
 * @this {Camera}
 * @param {Vector} position Camera position.
 * @param {Vector} target   Camera
 */
function Camera(position, target){
    this.position = position || new Vector(0,0,0);
    this.target = target || new Vector(0,0,0);
    this.up = new Vector(0, 1, 0);
}
/** @method */
Camera.prototype.eyeDistance = function(){
    
};
/** @method */
Camera.prototype.moveTo = function(args){

};
/** @method */
Camera.prototype.moveRight = function(){
    
};
/** @method */
Camera.prototype.moveLeft = function(){
    
};
/** @method */
Camera.prototype.moveUp = function(){
    
};
/** @method */
Camera.prototype.moveDown = function(){
    
};
/** @method */
Camera.prototype.orbitTo = function(){

};
/** @method */
Camera.prototype.zoomIn = function(){

};
/** @method */
Camera.prototype.zoomOut = function(){

};
/** @method */
Camera.prototype.orbitLeft = function(){

};
/** @method */
Camera.prototype.orbitRight = function(){

};

var engine = {
    Scene: Scene,
    Camera: Camera
};

module.exports = {engine: engine, math: math};
},{"./keycodes.js":2,"./math.js":3}],2:[function(_dereq_,module,exports){
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
},{}],3:[function(_dereq_,module,exports){
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
 * Add matric to self.
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
Matrix.scaling = function(xscale, yscale, zscale){
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
    return Math.acos( a.dot(b) / (a.magnitude() * b.magnitude()) );
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
        throw 'Zero Division Error';
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

/**
 * @constructor
 * @this {Vertex}
 * @param {Vector} vector
 * @param {string} color
 */
function Vertex(vector, color){
    this.vector = vector;
    this.color = color;
}

/**
 * @constructor
 * @this {Mesh}
 * @param {string} name
 * @param {Array.<Vertex>} vertices
 * @param {Array.<{edge: Array.<number>, color: string}>} edges
 */
function Mesh(name, vertices, edges){
    this.name = name;
    this.vertices = vertices;
    this.edges = edges;
    this.position = new Vector(0, 0, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
}

var math = {
    Vector: Vector,
    Vertex: Vertex,
    Mesh: Mesh,
    Matrix: Matrix
};

module.exports = math;
},{}]},{},[1])
(1)
});