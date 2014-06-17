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
},{"../math/math.js":6}],2:[function(_dereq_,module,exports){
var Scene = _dereq_('./scene.js');
var Camera = _dereq_('./camera.js');

var engine = Object.create(null);

engine.Scene = Scene;
engine.Camera = Camera;

module.exports = engine;
},{"./camera.js":1,"./scene.js":3}],3:[function(_dereq_,module,exports){
var math = _dereq_('../math/math.js');
var Camera = _dereq_('./camera.js')
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
    this.camera = new Camera();
    /** @type {Array.<Mesh>} */
    this.meshes = [];
    /** @type {Object.<number, boolean>} */
    this.keys = {}; // Keys currently pressed
    /** @type {?number} */
    this._anim_id = null;
    /** @type {boolean} */
    this._needs_update = true;
    this._draw_mode = 'wireframe';
    this.init();
}
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
    this.update();
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
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        var index = x + (y * this.width);
        if (z < this._depth_buffer[index]) {
            var image_data = this._back_buffer_image.data;
            var i = (y * this._back_buffer_image.width + x) * 4;
            image_data[i] = color.r;
            image_data[i+1] = color.g;
            image_data[i+2] = color.b;
            image_data[i+3] = 255;
            this._depth_buffer[index] = z;
        }
    }
};
/** @method */
// Based on Bresenham's line algorithm
Scene.prototype.drawEdge = function(vector1, vector2, color){
    // TODO: SIMPLIFY!!
    var x1 = vector1.x + this._x_offset;
    var y1 = vector1.y + this._y_offset;
    var z1 = vector1.z;
    var x2 = vector2.x + this._x_offset;
    var y2 = vector2.y + this._y_offset;
    var z2 = vector2.z;
    var i, dx, dy, dz, l, m, n, x_inc, y_inc, z_inc, err_1, err_2, dx2, dy2, dz2;
    var pixel = [];

    pixel[0] = x1;
    pixel[1] = y1;
    pixel[2] = z1;
    dx = x2 - x1;
    dy = y2 - y1;
    dz = z2 - z1;
    x_inc = (dx < 0) ? -1 : 1;
    l = Math.abs(dx);
    y_inc = (dy < 0) ? -1 : 1;
    m = Math.abs(dy);
    z_inc = (dz < 0) ? -1 : 1;
    n = Math.abs(dz);
    dx2 = l << 1;
    dy2 = m << 1;
    dz2 = n << 1;

    if ((l >= m) && (l >= n)) {
        err_1 = dy2 - l;
        err_2 = dz2 - l;
        for (i = 0; i < l; i++) {
            this.drawPixel(pixel[0], pixel[1], pixel[2], color);
            if (err_1 > 0) {
                pixel[1] += y_inc;
                err_1 -= dx2;
            }
            if (err_2 > 0) {
                pixel[2] += z_inc;
                err_2 -= dx2;
            }
            err_1 += dy2;
            err_2 += dz2;
            pixel[0] += x_inc;
        }
    } else if ((m >= l) && (m >= n)) {
        err_1 = dx2 - m;
        err_2 = dz2 - m;
        for (i = 0; i < m; i++) {
            this.drawPixel(pixel[0], pixel[1], pixel[2], color);
            if (err_1 > 0) {
                pixel[0] += x_inc;
                err_1 -= dy2;
            }
            if (err_2 > 0) {
                pixel[2] += z_inc;
                err_2 -= dy2;
            }
            err_1 += dx2;
            err_2 += dz2;
            pixel[1] += y_inc;
        }
    } else {
        err_1 = dy2 - n;
        err_2 = dx2 - n;
        for (i = 0; i < n; i++) {
            this.drawPixel(pixel[0], pixel[1], pixel[2], color);
            if (err_1 > 0) {
                pixel[1] += y_inc;
                err_1 -= dz2;
            }
            if (err_2 > 0) {
                pixel[0] += x_inc;
                err_2 -= dz2;
            }
            err_1 += dy2;
            err_2 += dx2;
            pixel[2] += z_inc;
        }
    }
    this.drawPixel(pixel[0], pixel[1], pixel[2], color);
};
/** @method */
Scene.prototype.drawFace = function(vector1, vector2, vector3, color){
    this.ctx.beginPath();
    this.ctx.moveTo(vector1.x + this._x_offset, vector1.y + this._y_offset);
    this.ctx.lineTo(vector2.x + this._x_offset, vector2.y + this._y_offset);
    this.ctx.lineTo(vector3.x + this._x_offset, vector3.y + this._y_offset);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();
};
/** @method */
Scene.prototype.renderScene = function(){
    // TODO: DRAW FROM BACK TO FRONT (IE CLOSER EDGES OVERLAP/OBSCURE FARTHER)
    // TODO: ONLY DRAW EDGES IN CAMERA'S FRUSTRUM
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.initializeDepthBuffer();
    var cam_pos = this.camera.position;
    var cam_rot = this.camera.rotation;
    var camera_transform = this.camera.view_matrix;
    var projection_transform = this.perspectiveFov();
    for (var i = 0, len = this.meshes.length; i < len; i++){
        var mesh = this.meshes[i];
        var scale = mesh.scale;
        var rotation = mesh.rotation;
        var position = mesh.position;
        var world_transform = Matrix.scale(scale.x, scale.y, scale.z).multiply(
            Matrix.rotation(rotation.pitch, rotation.yaw, rotation.roll).multiply(
                Matrix.translation(position.x, position.y, position.z)));
        var final_transform = world_transform.multiply(camera_transform).multiply(projection_transform);
        for (var k = 0; k < mesh.faces.length; k++){
            var face = mesh.faces[k].face;
            var color = mesh.faces[k].color;
            var v1 = mesh.vertices[face[0]].vector;
            var v2 = mesh.vertices[face[1]].vector;
            var v3 = mesh.vertices[face[2]].vector;
            var wv1 = v1.transform(final_transform);
            var wv2 = v2.transform(final_transform);
            var wv3 = v3.transform(final_transform);
            this.drawEdge(wv1, wv2, color);
            this.drawEdge(wv2, wv3, color);
            this.drawEdge(wv3, wv1, color);
            //this.drawFace(wv1, wv2, wv3, color);
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
    // How to do this? Maybe give shapes IDs, in which case users will need to keep track of these
};
/** @method */
Scene.prototype.update = function(){
    //this.fireEvents()
    this.onUpdate();
    if (this._needs_update) {
        this.renderScene();
        this._needs_update = false;
    }
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};



module.exports = Scene;
},{"../math/math.js":6,"../utility/keycodes.js":12,"./camera.js":1}],4:[function(_dereq_,module,exports){
var math = _dereq_('./math/math.js');
var engine = _dereq_('./engine/engine.js');

var wireframe = Object.create(null);

wireframe.math = math;
wireframe.engine = engine;

module.exports = wireframe;
},{"./engine/engine.js":2,"./math/math.js":6}],5:[function(_dereq_,module,exports){
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
/**
 * [normalVector description]
 * @return {Vector} [description]
 */
Face.prototype.normalVector = function(){
    //return Vector(0,0,0);
};

module.exports = Face;
},{"../utility/color.js":11,"./vector.js":9}],6:[function(_dereq_,module,exports){
var Vector = _dereq_('./vector.js');
var Vertex = _dereq_('./vertex.js');
var Mesh = _dereq_('./mesh.js');
var Matrix = _dereq_('./matrix.js');
var Face = _dereq_('./face.js');

var math = Object.create(null);

math.Vector = Vector;
math.Vertex = Vertex;
math.Mesh = Mesh;
math.Matrix = Matrix;
math.Face = Face;

module.exports = math;
},{"./face.js":5,"./matrix.js":7,"./mesh.js":8,"./vector.js":9,"./vertex.js":10}],7:[function(_dereq_,module,exports){
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
 * Constructs a scaling matrix from x, y, and z scalars
 * @method
 * @static
 * @param {number} xscale
 * @param {number} yscale
 * @param {number} zscale
 * @return {Matrix}
 */
Matrix.translation = function(xscale, yscale, zscale){
    var translation_matrix = Matrix.identity();
    translation_matrix.m[0] = xscale;
    translation_matrix.m[5] = yscale;
    translation_matrix.m[1] = zscale;
    return translation_matrix;
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
},{}],8:[function(_dereq_,module,exports){
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

module.exports = Mesh;
},{"./vector.js":9}],9:[function(_dereq_,module,exports){
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

module.exports = Vector;
},{}],10:[function(_dereq_,module,exports){
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

module.exports = Vertex;
},{}],11:[function(_dereq_,module,exports){
/**
 * Return a standardized color object given any legal CSS color value.
 * @constructor
 * @param {string} color Any legal CSS color value (hex, color keyword, rgb(a), hsl(a))
 */
function Color(color){
    var parsed_color = parseColor(color);
    this.r = parsed_color.r;
    this.g = parsed_color.g;
    this.b = parsed_color.b;
    var alpha = parsed_color.a || 1;
    this.a = Math.floor(alpha * 255);
}

function parseColor(color){
    // Make a temporary HTML element with the given color string
    // then extract and parse the computed rgb(a) value.
    if (color in named_colors) {
        color = named_colors[color];
    }
    var div = document.createElement('div');
    div.style.backgroundColor = color;
    var rgba = div.style.backgroundColor;
    rgba = rgba.slice(rgba.indexOf('(')+1).slice(0,-1).replace(/\s/g, '').split(',');
    var return_color = {};
    var color_values = ['r', 'g', 'b', 'a'];
    var value;
    for (var i = 0; i < rgba.length; i++){
        value = parseFloat(rgba[i]);
        if (isNaN(value)){
            throw "Color error: " + color + " is not a legal CSS color value";
        }
        else {
            return_color[color_values[i]] = value;
        }
    }
    return return_color;
}

var named_colors = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
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
},{}]},{},[4])
(4)
});