!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.wireframe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var math = _dereq_('../math/math.js');
var Vector = math.Vector;
var Matrix = math.Matrix;

/** 
 * @constructor
 * @param {Vector} position Camera position.
 * @param {Vector} target   Camera
 */
function Camera(width, height, position){
    this.position = position || new Vector(1,1,20);
    this.up = new Vector(0, 1, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.view_matrix = this.createViewMatrix();
    this.width = width;
    this.height = height;
    this.near = 0.1;
    this.far = 1000;
    this.fov = 90;
    this.perspectiveFov = this.calculatePerspectiveFov();
}
/** @method */
Camera.prototype.direction = function() {
    var sin_pitch = Math.sin(this.rotation.pitch);
    var cos_pitch = Math.cos(this.rotation.pitch);
    var sin_yaw = Math.sin(this.rotation.yaw);
    var cos_yaw = Math.cos(this.rotation.yaw);

    return new Vector(-cos_pitch * sin_yaw, sin_pitch, -cos_pitch * cos_yaw);
};
/**
 * Builds a perspective projection matrix based on a field of view.
 * @method
 * @return {Matrix}
 */
Camera.prototype.calculatePerspectiveFov = function() {
    var fov = this.fov * (Math.PI / 180); // convert to radians
    var aspect = this.width / this.height;
    var near = this.near;
    var far = this.far;
    var matrix = Matrix.zero();
    var height = (1/Math.tan(fov/2)) * this.height;
    var width = height * aspect;

    matrix[0] = width;
    matrix[5] = height;
    matrix[10] = far/(near-far) ;
    matrix[11] = -1;
    matrix[14] = near*far/(near-far);

    return matrix;
};
/** @method */
Camera.prototype.createViewMatrix = function(){
    var eye = this.position;
    var pitch = this.rotation.pitch;
    var yaw = this.rotation.yaw;
    var cos_pitch = Math.cos(pitch);
    var sin_pitch = Math.sin(pitch);
    var cos_yaw = Math.cos(yaw);
    var sin_yaw = Math.sin(yaw);

    var xaxis = new Vector(cos_yaw, 0, -sin_yaw );
    var yaxis = new Vector(sin_yaw * sin_pitch, cos_pitch, cos_yaw * sin_pitch );
    var zaxis = new Vector(sin_yaw * cos_pitch, -sin_pitch, cos_pitch * cos_yaw );

    var view_matrix = Matrix.fromArray([
        xaxis.x, yaxis.x, zaxis.x, 0,
        xaxis.y, yaxis.y, zaxis.y, 0,
        xaxis.z, yaxis.z, zaxis.z, 0,
        -(xaxis.dot(eye) ), -( yaxis.dot(eye) ), -( zaxis.dot(eye) ), 1
    ]);
    return view_matrix;
};
/** @method */
Camera.prototype.moveTo = function(x, y, z){
    this.position = new Vector(x,y,z);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveRight = function(amount){
    var right = this.up.cross(this.direction()).normalize().scale(amount);
    this.position = this.position.subtract(right);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveLeft = function(amount){
    var left = this.up.cross(this.direction()).normalize().scale(amount);
    this.position = this.position.add(left);
    this.view_matrix = this.createViewMatrix();
};
Camera.prototype.turnRight = function(amount){
    this.rotation.yaw -= amount;
    if (this.rotation.yaw < 0){
        this.rotation.yaw = this.rotation.yaw + (Math.PI*2);
    }
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.turnLeft = function(amount){
    this.rotation.yaw += amount;
    if (this.rotation.yaw > (Math.PI*2)){
        this.rotation.yaw = this.rotation.yaw - (Math.PI*2);
    }
    this.view_matrix = this.createViewMatrix();
};
Camera.prototype.lookUp = function(amount){
    this.rotation.pitch -= amount;
    if (this.rotation.pitch > (Math.PI*2)){
        this.rotation.pitch = this.rotation.pitch - (Math.PI*2);
    }
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.lookDown = function(amount){
    this.rotation.pitch += amount;
    if (this.rotation.pitch < 0){
        this.rotation.pitch = this.rotation.pitch + (Math.PI*2);
    }
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveUp = function(amount){
    var up = this.up.normalize().scale(amount);
    this.position = this.position.add(up);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveDown = function(amount){
    var down = this.up.normalize().scale(amount);
    this.position = this.position.subtract(down);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveForward = function(amount){
    var forward = this.direction().scale(amount);
    this.position = this.position.add(forward);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveBackward = function(amount){
    var backward = this.direction().scale(amount);
    this.position = this.position.subtract(backward);
    this.view_matrix = this.createViewMatrix();
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
 * Event handler.
 * @constructor
 * @license
 * Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
 * MIT License
 */

function EventTarget(){
    this._listeners = {};
}

/**
 * @method
 * @param {string} type     [description]
 * @param {function} listener [description]
 */
EventTarget.prototype.addListener = function(type, listener){
    if (typeof this._listeners[type] === "undefined"){
        this._listeners[type] = [];
    }

    this._listeners[type].push(listener);
};
/**
 * @method
 * @param  {string} event
 * @throws {Error} If event type does not exist in EventTarget
 */
EventTarget.prototype.fire = function(event){
    if (typeof event === "string"){
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
};
/**
 * @method
 * @param  {string} type
 * @param  {function} listener
 */
EventTarget.prototype.removeListener = function(type, listener){
    if (this._listeners[type] instanceof Array){
        var listeners = this._listeners[type];
        for (var i=0, len=listeners.length; i < len; i++){
            if (listeners[i] === listener){
                listeners.splice(i, 1);
                break;
            }
        }
    }
};

module.exports = EventTarget;
},{}],4:[function(_dereq_,module,exports){
var math = _dereq_('../math/math.js');
var Camera = _dereq_('./camera.js');
var EventTarget = _dereq_('./events.js');
var KEYCODES = _dereq_('../utilities/keycodes.js');

var Vector = math.Vector;
var Matrix = math.Matrix;

/**
 * @constructor
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
    this._backface_culling = true;
    this.camera = new Camera(this.width, this.height);
    this.illumination = new Vector(90,0,0);
    /** @type {Array.<Mesh>} */
    this.meshes = {};
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
/** @method */
Scene.prototype.initializeDepthBuffer = function(){
    for (var x = 0, len = this.width * this.height; x < len; x++){
        this._depth_buffer[x] = 9999999;
    }
};
/** @method */
Scene.prototype.offscreen = function(vector){
    // TODO: Not totally certain that z>1 indicates vector is behind camera.
    var x = vector.x + this._x_offset;
    var y = vector.y + this._y_offset;
    var z = vector.z;
    return (z > 1 || x < 0 || x > this.width || y < 0 || y > this.height);
};
/** @method */
Scene.prototype.drawPixel = function(x, y, z, color){
    x = Math.floor(x + this._x_offset);
    y = Math.floor(y + this._y_offset);
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
    if (vector1.x > vector2.x){
        var temp = vector1;
        vector1 = vector2;
        vector2 = temp;
    }
    var current_x = vector1.x;
    var current_y = vector1.y;
    var current_z = vector1.z;
    var longest_dist = Math.max(abs(vector2.x - vector1.x), abs(vector2.y - vector1.y), abs(vector2.z - vector1.z));
    var step_x = (vector2.x - vector1.x) / longest_dist;
    var step_y = (vector2.y - vector1.y) / longest_dist;
    var step_z = (vector2.z - vector1.z) / longest_dist;

    for (var i = 0; i < longest_dist; i++){
        this.drawPixel(current_x, current_y, current_z, color);
        current_x += step_x;
        current_y += step_y;
        current_z += step_z;
    }
};
/** @method */
Scene.prototype.drawTriangle = function(vector1, vector2, vector3, color){
    this.drawEdge(vector1, vector2, color);
    this.drawEdge(vector2, vector3, color);
    this.drawEdge(vector3, vector1, color);
};
/** @method */
Scene.prototype.drawFlatBottomTriangle = function(v1, v2, v3, color){
    // Draw left to right
    if (v2.x >= v3.x){
        var temp = v3;
        v3 = v2;
        v2 = temp;
    }
    // compute deltas
    var dxy_left  = (v3.x-v1.x)/(v3.y-v1.y);
    var dxy_right = (v2.x-v1.x)/(v2.y-v1.y);
    var z_slope_left = (v3.z-v1.z)/(v3.y-v1.y);
    var z_slope_right = (v2.z-v1.z)/(v2.y-v1.y);

    // set starting and ending points for edge trace
    var xs = new Vector(v1.x, v1.y, v1.z);
    var xe = new Vector(v1.x, v1.y, v1.z);
    xs.z = v3.z + ((v1.y - v3.y) * z_slope_left);
    xe.z = v2.z + ((v1.y - v2.y) * z_slope_right);

    // draw each scanline
    for (var y=v1.y; y <= v2.y; y++){
        xs.y = y;
        xe.y = y;
        this.drawEdge(xs, xe, color);

        // move down one scanline
        xs.x+=dxy_left;
        xe.x+=dxy_right;
        xs.z+=z_slope_left;
        xe.z+=z_slope_right;
    }
};
Scene.prototype.drawFlatTopTriangle = function(v1, v2, v3, color){
    // Draw left to right
    if (v1.x >= v2.x){
        var temp = v1;
        v1 = v2;
        v2 = temp;
    }
    // compute deltas
    var dxy_left  = (v3.x-v1.x)/(v3.y-v1.y);
    var dxy_right = (v3.x-v2.x)/(v3.y-v2.y);
    var z_slope_left = (v3.z-v1.z)/(v3.y-v1.y);
    var z_slope_right = (v3.z-v2.z)/(v3.y-v2.y);

    // set starting and ending points for edge trace
    var xs = new Vector(v1.x, v1.y, v1.z);
    var xe = new Vector(v2.x, v1.y, v1.z);

    xs.z = v1.z + ((v1.y - v1.y) * z_slope_left);
    xe.z = v2.z + ((v1.y - v2.y) * z_slope_right);

    // draw each scanline
    for (var y=v1.y; y <= v3.y; y++){
        xs.y = y;
        xe.y = y;
        // draw a line from xs to xe at y in color c
        this.drawEdge(xs, xe, color);
        // move down one scanline
        xs.x+=dxy_left;
        xe.x+=dxy_right;
        xs.z+=z_slope_left;
        xe.z+=z_slope_right;
    }
};
/** @method */
Scene.prototype.fillTriangle = function(v1, v2, v3, color){
    // Draw edges first
    // TODO: Fix. This is a hack. 
    //this.drawTriangle(v1, v2, v3, color);
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
        temp = v2;
        v2 = v1;
        v1 = temp;
    }
    // Triangle with no height
    if ((v1.y - v3.y) === 0){
        return;
    }

    var short_slope, long_slope;
    if ((v2.y - v1.y) === 0) {
        short_slope = 0;
    } else {
        short_slope = (v2.x - v1.x) / (v2.y - v1.y);
    }
    if ((v3.y - v1.y) === 0) {
        long_slope = 0;
    } else {
        long_slope = (v3.x - v1.x) / (v3.y - v1.y);
    }

    if (v2.y === v3.y){
        // Flat top
        this.drawFlatBottomTriangle(v1, v2, v3, color);
    }
    else if (v1.y === v2.y ){
        // Flat bottom
        this.drawFlatTopTriangle(v1, v2, v3, color);
    } else {
        // Decompose into flat top and flat bottom triangles
        var z_slope = (v3.z - v1.z) / (v3.y - v1.y);
        var x = ((v2.y - v1.y)*long_slope) + v1.x;
        var z = ((v2.y - v1.y)*z_slope) + v1.z;
        var v4 = new Vector(x, v2.y, z);
        this.drawFlatBottomTriangle(v1, v2, v4, color);
        this.drawFlatTopTriangle(v2, v4, v3, color);
    }
};
/** @method */
Scene.prototype.renderScene = function(){
    // TODO: Simplify this function.
    this._back_buffer_image = this._back_buffer_ctx.createImageData(this.width, this.height);
    this.initializeDepthBuffer();
    var camera_matrix = this.camera.view_matrix;
    var projection_matrix = this.camera.perspectiveFov;
    var light = this.illumination;
    for (var key in this.meshes){
        if (this.meshes.hasOwnProperty(key)){
            var mesh = this.meshes[key];
            var scale = mesh.scale;
            var rotation = mesh.rotation;
            var position = mesh.position;
            var world_matrix = Matrix.scale(scale.x, scale.y, scale.z).multiply(
                Matrix.rotation(rotation.pitch, rotation.yaw, rotation.roll).multiply(
                    Matrix.translation(position.x, position.y, position.z)));
            for (var k = 0; k < mesh.faces.length; k++){
                var face = mesh.faces[k].face;
                var color = mesh.faces[k].color;
                var v1 = mesh.vertices[face[0]];
                var v2 = mesh.vertices[face[1]];
                var v3 = mesh.vertices[face[2]];

                // Calculate the normal
                // TODO: Can this be calculated just once, and then transformed into
                // camera space?
                var cam_to_vert = this.camera.position.subtract(v1.transform(world_matrix));
                var side1 = v2.transform(world_matrix).subtract(v1.transform(world_matrix));
                var side2 = v3.transform(world_matrix).subtract(v1.transform(world_matrix));
                var norm = side1.cross(side2);
                if (norm.magnitude() <= 0.00000001){
                    norm = norm;
                } else {
                    norm = norm.normalize();
                }
                // Backface culling.
                if (cam_to_vert.dot(norm) >= 0) {
                    var wvp_matrix = world_matrix.multiply(camera_matrix).multiply(projection_matrix);
                    var wv1 = v1.transform(wvp_matrix);
                    var wv2 = v2.transform(wvp_matrix);
                    var wv3 = v3.transform(wvp_matrix);
                    var draw = true;

                    // Draw surface normals
                    // var face_trans = Matrix.translation(wv1.x, wv1.y, v1.z);
                    // this.drawEdge(wv1, norm.scale(20).transform(face_trans), {'r':255,"g":255,"b":255})

                    // TODO: Fix frustum culling
                    // This is really stupid frustum culling... this can result in some faces not being
                    // drawn when they should, e.g. when a triangles vertices straddle the frustrum.
                    if (this.offscreen(wv1) && this.offscreen(wv2) && this.offscreen(wv3)){
                        draw = false;
                    }
                    if (draw){
                        var light_direction = light.subtract(v1.transform(world_matrix)).normalize();
                        var illumination_angle = norm.dot(light_direction);
                        color = color.lighten(illumination_angle/6);
                        this.fillTriangle(wv1, wv2, wv3, color.rgb);
                        //this.drawTriangle(wv1, wv2, wv3, color.rgb);
                    }
                }
            }
        }
    }
    this._back_buffer_ctx.putImageData(this._back_buffer_image, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this._back_buffer, 0, 0, this.canvas.width, this.canvas.height);
};
/** @method */
Scene.prototype.addMesh = function(mesh){
    this.meshes[mesh.name] = mesh;
};
/** @method */
Scene.prototype.removeMesh = function(mesh){
    delete this.meshes[mesh.name];
};
/** @method */
Scene.prototype.update = function(){
    if (this._key_count > 0){
        this.fire('keydown');
    }
    // TODO: Add keyup, mousedown, mousedrag, mouseup, etc.
    if (this._needs_update) {
        this.renderScene();
        this._needs_update = false;
    }
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};

module.exports = Scene;

},{"../math/math.js":7,"../utilities/keycodes.js":12,"./camera.js":1,"./events.js":3}],5:[function(_dereq_,module,exports){
var math = _dereq_('./math/math.js');
var engine = _dereq_('./engine/engine.js');

var wireframe = Object.create(null);

wireframe.math = math;
wireframe.engine = engine;

module.exports = wireframe;
},{"./engine/engine.js":2,"./math/math.js":7}],6:[function(_dereq_,module,exports){
var Color = _dereq_('../utilities/color.js');

/**
 * A 3D triangle
 * @constructor
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
},{"../utilities/color.js":11}],7:[function(_dereq_,module,exports){
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
 */
function Matrix(){
    for (var i=0; i<16; i++){
        this[i] = 0;
    }
    this.length = 16;
}
/**
 * Compare matrix with self for equality.
 * @method
 * @param {Matrix} matrix
 * @return {boolean}
 */
Matrix.prototype.equal = function(matrix){
    for (var i = 0, len = this.length; i < len; i++){
        if (this[i] !== matrix[i]){
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
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] + matrix[i];
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
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] - matrix[i];
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
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = this[i] * scalar;
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
    new_matrix[0] = (this[0] * matrix[0]) + (this[1] * matrix[4]) + (this[2] * matrix[8]) + (this[3] * matrix[12]);
    new_matrix[1] = (this[0] * matrix[1]) + (this[1] * matrix[5]) + (this[2] * matrix[9]) + (this[3] * matrix[13]);
    new_matrix[2] = (this[0] * matrix[2]) + (this[1] * matrix[6]) + (this[2] * matrix[10]) + (this[3] * matrix[14]);
    new_matrix[3] = (this[0] * matrix[3]) + (this[1] * matrix[7]) + (this[2] * matrix[11]) + (this[3] * matrix[15]);
    new_matrix[4] = (this[4] * matrix[0]) + (this[5] * matrix[4]) + (this[6] * matrix[8]) + (this[7] * matrix[12]);
    new_matrix[5] = (this[4] * matrix[1]) + (this[5] * matrix[5]) + (this[6] * matrix[9]) + (this[7] * matrix[13]);
    new_matrix[6] = (this[4] * matrix[2]) + (this[5] * matrix[6]) + (this[6] * matrix[10]) + (this[7] * matrix[14]);
    new_matrix[7] = (this[4] * matrix[3]) + (this[5] * matrix[7]) + (this[6] * matrix[11]) + (this[7] * matrix[15]);
    new_matrix[8] = (this[8] * matrix[0]) + (this[9] * matrix[4]) + (this[10] * matrix[8]) + (this[11] * matrix[12]);
    new_matrix[9] = (this[8] * matrix[1]) + (this[9] * matrix[5]) + (this[10] * matrix[9]) + (this[11] * matrix[13]);
    new_matrix[10] = (this[8] * matrix[2]) + (this[9] * matrix[6]) + (this[10] * matrix[10]) + (this[11] * matrix[14]);
    new_matrix[11] = (this[8] * matrix[3]) + (this[9] * matrix[7]) + (this[10] * matrix[11]) + (this[11] * matrix[15]);
    new_matrix[12] = (this[12] * matrix[0]) + (this[13] * matrix[4]) + (this[14] * matrix[8]) + (this[15] * matrix[12]);
    new_matrix[13] = (this[12] * matrix[1]) + (this[13] * matrix[5]) + (this[14] * matrix[9]) + (this[15] * matrix[13]);
    new_matrix[14] = (this[12] * matrix[2]) + (this[13] * matrix[6]) + (this[14] * matrix[10]) + (this[15] * matrix[14]);
    new_matrix[15] = (this[12] * matrix[3]) + (this[13] * matrix[7]) + (this[14] * matrix[11]) + (this[15] * matrix[15]);
    return new_matrix;
};
/**
 * Negate self.
 * @method
 * @param {number} scalar
 * @return {Matrix}
 */
Matrix.prototype.negate = function(){
    var new_matrix = new Matrix();
    for (var i = 0, len = this.length; i < len; i++){
        new_matrix[i] = -this[i];
    }
    return new_matrix;
};
/**
 * Transpose self.
 * @method
 * @return {Matrix}
 */
Matrix.prototype.transpose = function(){
    var new_matrix = new Matrix();
    new_matrix[0] = this[0];
    new_matrix[1] = this[4];
    new_matrix[2] = this[8];
    new_matrix[3] = this[12];
    new_matrix[4] = this[1];
    new_matrix[5] = this[5];
    new_matrix[6] = this[9];
    new_matrix[7] = this[13];
    new_matrix[8] = this[2];
    new_matrix[9] = this[6];
    new_matrix[10] = this[10];
    new_matrix[11] = this[14];
    new_matrix[12] = this[3];
    new_matrix[13] = this[7];
    new_matrix[14] = this[11];
    new_matrix[15] = this[15];
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
    rotation_matrix[0] = 1;
    rotation_matrix[5] = cos;
    rotation_matrix[6] = -sin;
    rotation_matrix[9] = sin;
    rotation_matrix[10] = cos;
    rotation_matrix[15] = 1;
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
    rotation_matrix[0] = cos;
    rotation_matrix[2] = sin;
    rotation_matrix[5] = 1;
    rotation_matrix[8] = -sin;
    rotation_matrix[10] = cos;
    rotation_matrix[15] = 1;
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
    rotation_matrix[0] = cos;
    rotation_matrix[1] = -sin;
    rotation_matrix[4] = sin;
    rotation_matrix[5] = cos;
    rotation_matrix[10] = 1;
    rotation_matrix[15] = 1;
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
    rotation_matrix[0] = cos + ((ux*ux)*cos1);
    rotation_matrix[1] = (xy*cos1) - (uz*sin);
    rotation_matrix[2] = (xz*cos1)+(uy*sin);
    rotation_matrix[4] = (xy*cos1)+(uz*sin);
    rotation_matrix[5] = cos+((uy*uy)*cos1);
    rotation_matrix[6] = (yz*cos1)-(ux*sin);
    rotation_matrix[8] = (xz*cos1)-(uy*sin);
    rotation_matrix[9] = (yz*cos1)+(ux*sin);
    rotation_matrix[10] = cos + ((uz*uz)*cos1);
    rotation_matrix[15] = 1;
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
    translation_matrix[12] = xtrans;
    translation_matrix[13] = ytrans;
    translation_matrix[14] = ztrans;
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
    scaling_matrix[0] = xscale;
    scaling_matrix[5] = yscale;
    scaling_matrix[10] = zscale;
    scaling_matrix[15] = 1;
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
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
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
        new_matrix[i] = arr[i];
    }
    return new_matrix;
};

module.exports = Matrix;
},{}],9:[function(_dereq_,module,exports){
var Vector = _dereq_('./vector.js');
var Face = _dereq_('./face.js');

/**
 * @constructor
 * @param {string} name
 * @param {Array.<Vector>} vertices
 * @param {Array.<Face>} edges
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
 * Construct a Mesh from a JSON object.
 * @method
 * @static
 * @param  {{name: string, verticies: Array.<Array.<number>>, faces: {{face: Array.<number>, color: string}}}} json
 * @return {Mesh}
 */
Mesh.fromJSON = function(json){
    var vertices = [];
    var faces = [];
    for (var i = 0, len = json.vertices.length; i < len; i++){
        var vertex = json.vertices[i];
        vertices.push(new Vector(vertex[0], vertex[1], vertex[2]));
    }
    for (var j = 0, ln = json.faces.length; j < ln; j++){
        var face = json.faces[j];
        faces.push(new Face(face.face[0], face.face[1], face.face[2], face.color));
    }
    return new Mesh(json.name, vertices, faces);
};

module.exports = Mesh;

},{"./face.js":6,"./vector.js":10}],10:[function(_dereq_,module,exports){
/**
 * 3D vector.
 * @constructor
 * @param {number} x x coordinate
 * @param {number} y y coordinate
 * @param {number} z z coordinate
 */
function Vector(x, y, z){
    if (typeof x === 'undefined' ||
        typeof y === 'undefined' ||
        typeof z === 'undefined'){
        throw new Error('Insufficient arguments.');
    } else {
        this.x = x;
        this.y = y;
        this.z = z;
    }
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
    var theta = a.dot(b) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return Math.acos(theta);
};
/**
 * Find the cos of the angle between two vectors.
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.cosAngle = function(vector){
    var a = this.normalize();
    var b = vector.normalize();
    var amag = a.magnitude();
    var bmag = b.magnitude();
    if (amag === 0 || bmag === 0){
        return 0;
    }
    var theta = a.dot(b) / (amag * bmag );
    if (theta < -1) {theta = -1;}
    if (theta > 1) {theta = 1;}
    return theta;
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
 * Negates self
 * @return {Vector} [description]
 */
Vector.prototype.negate = function(){
    return new Vector(-this.x, -this.y, -this.z);
};
/**
 * Project self onto vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.vectorProjection = function(vector){
    var mag = vector.magnitude();
    return vector.scale(this.dot(vector) / (mag * mag));
};
/**
 * Project self onto vector
 * @method
 * @param {Vector} vector
 * @return {number}
 */
Vector.prototype.scalarProjection = function(vector){
    return this.dot(vector) / vector.magnitude();
};
/**
 * Perform linear tranformation on self.
 * @method
 * @param {Matrix} transform_matrix
 * @return {Vector}
 */
Vector.prototype.transform = function(transform_matrix){
    var x = (this.x * transform_matrix[0]) + (this.y * transform_matrix[4]) + (this.z * transform_matrix[8]) + transform_matrix[12];
    var y = (this.x * transform_matrix[1]) + (this.y * transform_matrix[5]) + (this.z * transform_matrix[9]) + transform_matrix[13];
    var z = (this.x * transform_matrix[2]) + (this.y * transform_matrix[6]) + (this.z * transform_matrix[10]) + transform_matrix[14];
    var w = (this.x * transform_matrix[3]) + (this.y * transform_matrix[7]) + (this.z * transform_matrix[11]) + transform_matrix[15];
    return new Vector(x / w, y / w, z / w);
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
    return new Vector(x, y, z);
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
var hslToRgb, rgbToHsl, parseColor, cache;
/**
 * A color with both rgb and hsl representations.
 * @class Color
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
    var hsl = rgbToHsl(parsed_color.r, parsed_color.g, parsed_color.b);
    this.rgb = {'r': parsed_color.r, 'g': parsed_color.g, 'b': parsed_color.b};
    this.hsl = {'h': hsl.h, 's': hsl.s, 'l': hsl.l};
    this.alpha = parsed_color.a || 1;
}
/**
 * Lighten a color by the given percentage.

 * @method
 * @param  {number} percent
 * @return {Color}
 */
Color.prototype.lighten = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l + percent;
    if (lum > 1){
        lum = 1;
    }
    var lighter = hslToRgb(hsl.h, hsl.s, lum);
    return new Color("rgb(" + Math.floor(lighter.r) + "," + Math.floor(lighter.g) + "," + Math.floor(lighter.b) + ")");
};
/**
 * Darken a color by the given percentage.
 * @method
 * @param  {number} percent
 * @return {Color}
 */
Color.prototype.darken = function(percent){
    var hsl = this.hsl;
    var lum = hsl.l - percent;
    if (lum < 0){
        lum = 0;
    }
    var darker = hslToRgb(hsl.h, hsl.s, lum);
    return new Color("rgb(" + Math.floor(darker.r) + "," + Math.floor(darker.g) + "," + Math.floor(darker.b) + ")");
};
/**
 * @param  {number} h Hue
 * @param  {number} s Saturation
 * @param  {number} l Luminance
 * @return {{r: number, g: number, b: number}}
 */
hslToRgb = function(h, s, l){
    function _v(m1, m2, hue){
        hue = hue % 1;
        if (hue < 0){hue+=1;}
        if (hue < (1/6)){
            return m1 + (m2-m1)*hue*6;
        }
        if (hue < 0.5){
            return m2;
        }
        if (hue < (2/3)){
            return m1 + (m2-m1)*((2/3)-hue)*6;
        }
        return m1;
    }
    var m2;
    if (s === 0){
        return {'r': l, 'g': l, 'b': l};
    }
    if (l <= 0.5){
        m2 = l * (1+s);
    }
    else{
        m2 = l+s-(l*s);
    }
    var m1 = 2*l - m2;
    return {'r': _v(m1, m2, h+(1/3))*255, 'g': _v(m1, m2, h)*255, 'b': _v(m1, m2, h-(1/3))*255};
};
/**
 * @param  {number} r Red
 * @param  {number} g Green
 * @param  {number} b Blue
 * @return {{h: number, s: number, l: number}}
 */
rgbToHsl = function(r, g, b){
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var maxc = Math.max(r, g, b);
    var minc = Math.min(r, g, b);
    var l = (minc+maxc)/2;
    var h, s;
    if (minc === maxc){
        return {'h': 0, 's': 0, 'l': l};
    }
    if (l <= 0.5){
        s = (maxc-minc) / (maxc+minc);
    }
    else{
        s = (maxc-minc) / (2-maxc-minc);
    }
    var rc = (maxc-r) / (maxc-minc);
    var gc = (maxc-g) / (maxc-minc);
    var bc = (maxc-b) / (maxc-minc);
    if (r === maxc){
        h = bc-gc;
    }
    else if (g === maxc){
        h = 2+rc-bc;
    }
    else{
        h = 4+gc-rc;
    }
    h = (h/6) % 1;
    if (h < 0){h+=1;}
    return {'h': h, 's': s, 'l': l};
};

/**
 * Parse a CSS color value and return an rgba color object.
 * @param  {string} color A legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 * @return {{r: number, g: number, b: number, a: number}}   rgba color object.
 * @throws {ColorError} If illegal color value is passed.
 */
parseColor = function(color){
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
};
// Pre-warm the cache with named colors, as these are not
// converted to rgb values by the parseColor function above.
cache = {
    "black": { "r": 0, "g": 0, "b": 0, "h": 0, "s": 0, "l": 0, "a": 1},
    "silver": { "r": 192, "g": 192, "b": 192, "h": 0, "s": 0, "l": 0.7529411764705882, "a": 1},
    "gray": { "r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 0.5019607843137255, "a": 1},
    "white": { "r": 255, "g": 255, "b": 255, "h": 0, "s": 0, "l": 1, "a": 1},
    "maroon": {"r": 128, "g": 0, "b": 0, "h": 0, "s": 1, "l": 0.25098039215686274, "a": 1},
    "red": {"r": 255, "g": 0, "b": 0, "h": 0, "s": 1, "l": 0.5, "a": 1},
    "purple": {"r": 128, "g": 0, "b": 128, "h": 0.8333333333333334, "s": 1, "l": 0.25098039215686274, "a": 1},
    "fuchsia": {"r": 255, "g": 0, "b": 255, "h": 0.8333333333333334, "s": 1, "l": 0.5, "a": 1},
    "green": {"r": 0, "g": 128, "b": 0, "h": 0.3333333333333333, "s": 1, "l": 0.25098039215686274, "a": 1},
    "lime": {"r": 0, "g": 255, "b": 0, "h": 0.3333333333333333, "s": 1, "l": 0.5, "a": 1},
    "olive": {"r": 128, "g": 128, "b": 0, "h": 0.16666666666666666, "s": 1, "l": 0.25098039215686274, "a": 1},
    "yellow": {"r": 255, "g": 255, "b": 0, "h": 0.16666666666666666, "s": 1, "l": 0.5, "a": 1},
    "navy": {"r": 0, "g": 0, "b": 128, "h": 0.6666666666666666, "s": 1, "l": 0.25098039215686274, "a": 1},
    "blue": {"r": 0, "g": 0, "b": 255, "h": 0.6666666666666666, "s": 1, "l": 0.5, "a": 1},
    "teal": {"r": 0, "g": 128, "b": 128, "h": 0.5, "s": 1, "l": 0.25098039215686274, "a": 1},
    "aqua": {"r": 0, "g": 255, "b": 255, "h": 0.5, "s": 1, "l": 0.5, "a": 1},
    "orange": {"r": 255, "g": 165, "b": 0, "h": 0.10784313725490197, "s": 1, "l": 0.5, "a": 1},
    "aliceblue": {"r": 240, "g": 248, "b": 255, "h": 0.5777777777777778, "s": 1, "l": 0.9705882352941176, "a": 1},
    "antiquewhite": {"r": 250, "g": 235, "b": 215, "h": 0.09523809523809519, "s": 0.7777777777777779, "l": 0.9117647058823529, "a": 1},
    "aquamarine": {"r": 127, "g": 255, "b": 212, "h": 0.4440104166666667, "s": 1, "l": 0.7490196078431373, "a": 1},
    "azure": {"r": 240, "g": 255, "b": 255, "h": 0.5, "s": 1, "l": 0.9705882352941176, "a": 1},
    "beige": {"r": 245, "g": 245, "b": 220, "h": 0.16666666666666666, "s": 0.555555555555556, "l": 0.911764705882353, "a": 1},
    "bisque": {"r": 255, "g": 228, "b": 196, "h": 0.09039548022598871, "s": 1, "l": 0.884313725490196, "a": 1},
    "blanchedalmond": {"r": 255, "g": 235, "b": 205, "h": 0.09999999999999994, "s": 1, "l": 0.9019607843137255, "a": 1},
    "blueviolet": {"r": 138, "g": 43, "b": 226, "h": 0.7531876138433514, "s": 0.7593360995850621, "l": 0.5274509803921569, "a": 1},
    "brown": {"r": 165, "g": 42, "b": 42, "h": 0, "s": 0.5942028985507247, "l": 0.40588235294117647, "a": 1},
    "burlywood": {"r": 222, "g": 184, "b": 135, "h": 0.09386973180076626, "s": 0.5686274509803922, "l": 0.7, "a": 1},
    "cadetblue": {"r": 95, "g": 158, "b": 160, "h": 0.5051282051282051, "s": 0.2549019607843137, "l": 0.5, "a": 1},
    "chartreuse": {"r": 127, "g": 255, "b": 0, "h": 0.2503267973856209, "s": 1, "l": 0.5, "a": 1},
    "chocolate": {"r": 210, "g": 105, "b": 30, "h": 0.06944444444444443, "s": 0.7499999999999999, "l": 0.47058823529411764, "a": 1},
    "coral": {"r": 255, "g": 127, "b": 80, "h": 0.04476190476190476, "s": 1, "l": 0.6568627450980392, "a": 1},
    "cornflowerblue": {"r": 100, "g": 149, "b": 237, "h": 0.6070559610705596, "s": 0.7919075144508672, "l": 0.6607843137254902, "a": 1},
    "cornsilk": {"r": 255, "g": 248, "b": 220, "h": 0.1333333333333333, "s": 1, "l": 0.9313725490196079, "a": 1},
    "crimson": {"r": 220, "g": 20, "b": 60, "h": 0.9666666666666667, "s": 0.8333333333333335, "l": 0.47058823529411764, "a": 1},
    "darkblue": {"r": 0, "g": 0, "b": 139, "h": 0.6666666666666666, "s": 1, "l": 0.2725490196078431, "a": 1},
    "darkcyan": {"r": 0, "g": 139, "b": 139, "h": 0.5, "s": 1, "l": 0.2725490196078431, "a": 1},
    "darkgoldenrod": {"r": 184, "g": 134, "b": 11, "h": 0.1184971098265896, "s": 0.8871794871794872, "l": 0.38235294117647056, "a": 1},
    "darkgray": { "r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 0.6627450980392157, "a": 1},
    "darkgreen": {"r": 0, "g": 100, "b": 0, "h": 0.3333333333333333, "s": 1, "l": 0.19607843137254902, "a": 1},
    "darkgrey": { "r": 169, "g": 169, "b": 169, "h": 0, "s": 0, "l": 0.6627450980392157, "a": 1},
    "darkkhaki": {"r": 189, "g": 183, "b": 107, "h": 0.15447154471544713, "s": 0.38317757009345804, "l": 0.5803921568627451, "a": 1},
    "darkmagenta": {"r": 139, "g": 0, "b": 139, "h": 0.8333333333333334, "s": 1, "l": 0.2725490196078431, "a": 1},
    "darkolivegreen": {"r": 85, "g": 107, "b": 47, "h": 0.22777777777777777, "s": 0.3896103896103896, "l": 0.3019607843137255, "a": 1},
    "darkorange": {"r": 255, "g": 140, "b": 0, "h": 0.09150326797385622, "s": 1, "l": 0.5, "a": 1},
    "darkorchid": {"r": 153, "g": 50, "b": 204, "h": 0.7781385281385281, "s": 0.6062992125984252, "l": 0.4980392156862745, "a": 1},
    "darkred": {"r": 139, "g": 0, "b": 0, "h": 0, "s": 1, "l": 0.2725490196078431, "a": 1},
    "darksalmon": {"r": 233, "g": 150, "b": 122, "h": 0.04204204204204204, "s": 0.7161290322580643, "l": 0.696078431372549, "a": 1},
    "darkseagreen": {"r": 143, "g": 188, "b": 143, "h": 0.3333333333333333, "s": 0.2513966480446928, "l": 0.6490196078431373, "a": 1},
    "darkslateblue": {"r": 72, "g": 61, "b": 139, "h": 0.69017094017094, "s": 0.3899999999999999, "l": 0.39215686274509803, "a": 1},
    "darkslategray": {"r": 47, "g": 79, "b": 79, "h": 0.5, "s": 0.25396825396825395, "l": 0.24705882352941178, "a": 1},
    "darkslategrey": {"r": 47, "g": 79, "b": 79, "h": 0.5, "s": 0.25396825396825395, "l": 0.24705882352941178, "a": 1},
    "darkturquoise": {"r": 0, "g": 206, "b": 209, "h": 0.5023923444976076, "s": 1, "l": 0.40980392156862744, "a": 1},
    "darkviolet": {"r": 148, "g": 0, "b": 211, "h": 0.7835703001579778, "s": 1, "l": 0.4137254901960784, "a": 1},
    "deeppink": {"r": 255, "g": 20, "b": 147, "h": 0.9099290780141844, "s": 1, "l": 0.5392156862745098, "a": 1},
    "deepskyblue": {"r": 0, "g": 191, "b": 255, "h": 0.5418300653594771, "s": 1, "l": 0.5, "a": 1},
    "dimgray": { "r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 0.4117647058823529, "a": 1},
    "dimgrey": { "r": 105, "g": 105, "b": 105, "h": 0, "s": 0, "l": 0.4117647058823529, "a": 1},
    "dodgerblue": {"r": 30, "g": 144, "b": 255, "h": 0.5822222222222222, "s": 1, "l": 0.5588235294117647, "a": 1},
    "firebrick": {"r": 178, "g": 34, "b": 34, "h": 0, "s": 0.679245283018868, "l": 0.4156862745098039, "a": 1},
    "floralwhite": {"r": 255, "g": 250, "b": 240, "h": 0.11111111111111101, "s": 1, "l": 0.9705882352941176, "a": 1},
    "forestgreen": {"r": 34, "g": 139, "b": 34, "h": 0.3333333333333333, "s": 0.6069364161849712, "l": 0.33921568627450976, "a": 1},
    "gainsboro": { "r": 220, "g": 220, "b": 220, "h": 0, "s": 0, "l": 0.8627450980392157, "a": 1},
    "ghostwhite": {"r": 248, "g": 248, "b": 255, "h": 0.6666666666666666, "s": 1, "l": 0.9862745098039216, "a": 1},
    "gold": {"r": 255, "g": 215, "b": 0, "h": 0.14052287581699346, "s": 1, "l": 0.5, "a": 1},
    "goldenrod": {"r": 218, "g": 165, "b": 32, "h": 0.11917562724014337, "s": 0.744, "l": 0.49019607843137253, "a": 1},
    "greenyellow": {"r": 173, "g": 255, "b": 47, "h": 0.23237179487179485, "s": 1, "l": 0.592156862745098, "a": 1},
    "grey": { "r": 128, "g": 128, "b": 128, "h": 0, "s": 0, "l": 0.5019607843137255, "a": 1},
    "honeydew": {"r": 240, "g": 255, "b": 240, "h": 0.3333333333333333, "s": 1, "l": 0.9705882352941176, "a": 1},
    "hotpink": {"r": 255, "g": 105, "b": 180, "h": 0.9166666666666666, "s": 1, "l": 0.7058823529411764, "a": 1},
    "indianred": {"r": 205, "g": 92, "b": 92, "h": 0, "s": 0.5305164319248827, "l": 0.5823529411764706, "a": 1},
    "indigo": {"r": 75, "g": 0, "b": 130, "h": 0.7628205128205128, "s": 1, "l": 0.2549019607843137, "a": 1},
    "ivory": {"r": 255, "g": 255, "b": 240, "h": 0.16666666666666666, "s": 1, "l": 0.9705882352941176, "a": 1},
    "khaki": {"r": 240, "g": 230, "b": 140, "h": 0.15, "s": 0.7692307692307692, "l": 0.7450980392156863, "a": 1},
    "lavender": {"r": 230, "g": 230, "b": 250, "h": 0.6666666666666666, "s": 0.6666666666666666, "l": 0.9411764705882353, "a": 1},
    "lavenderblush": {"r": 255, "g": 240, "b": 245, "h": 0.9444444444444443, "s": 1, "l": 0.9705882352941176, "a": 1},
    "lawngreen": {"r": 124, "g": 252, "b": 0, "h": 0.25132275132275134, "s": 1, "l": 0.49411764705882355, "a": 1},
    "lemonchiffon": {"r": 255, "g": 250, "b": 205, "h": 0.14999999999999997, "s": 1, "l": 0.9019607843137255, "a": 1},
    "lightblue": {"r": 173, "g": 216, "b": 230, "h": 0.5409356725146198, "s": 0.5327102803738316, "l": 0.7901960784313726, "a": 1},
    "lightcoral": {"r": 240, "g": 128, "b": 128, "h": 0, "s": 0.7887323943661971, "l": 0.7215686274509804, "a": 1},
    "lightcyan": {"r": 224, "g": 255, "b": 255, "h": 0.5, "s": 1, "l": 0.9392156862745098, "a": 1},
    "lightgoldenrodyellow": {"r": 250, "g": 250, "b": 210, "h": 0.16666666666666666, "s": 0.8000000000000002, "l": 0.9019607843137254, "a": 1},
    "lightgray": { "r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 0.8274509803921568, "a": 1},
    "lightgreen": {"r": 144, "g": 238, "b": 144, "h": 0.3333333333333333, "s": 0.734375, "l": 0.7490196078431373, "a": 1},
    "lightgrey": { "r": 211, "g": 211, "b": 211, "h": 0, "s": 0, "l": 0.8274509803921568, "a": 1},
    "lightpink": {"r": 255, "g": 182, "b": 193, "h": 0.9748858447488584, "s": 1, "l": 0.8568627450980393, "a": 1},
    "lightsalmon": {"r": 255, "g": 160, "b": 122, "h": 0.047619047619047596, "s": 1, "l": 0.7392156862745098, "a": 1},
    "lightseagreen": {"r": 32, "g": 178, "b": 170, "h": 0.49086757990867574, "s": 0.6952380952380952, "l": 0.4117647058823529, "a": 1},
    "lightskyblue": {"r": 135, "g": 206, "b": 250, "h": 0.5637681159420289, "s": 0.92, "l": 0.7549019607843137, "a": 1},
    "lightslategray": {"r": 119, "g": 136, "b": 153, "h": 0.5833333333333334, "s": 0.14285714285714285, "l": 0.5333333333333333, "a": 1},
    "lightslategrey": {"r": 119, "g": 136, "b": 153, "h": 0.5833333333333334, "s": 0.14285714285714285, "l": 0.5333333333333333, "a": 1},
    "lightsteelblue": {"r": 176, "g": 196, "b": 222, "h": 0.5942028985507246, "s": 0.41071428571428575, "l": 0.7803921568627451, "a": 1},
    "lightyellow": {"r": 255, "g": 255, "b": 224, "h": 0.16666666666666666, "s": 1, "l": 0.9392156862745098, "a": 1},
    "limegreen": {"r": 50, "g": 205, "b": 50, "h": 0.3333333333333333, "s": 0.607843137254902, "l": 0.5, "a": 1},
    "linen": {"r": 250, "g": 240, "b": 230, "h": 0.08333333333333333, "s": 0.6666666666666666, "l": 0.9411764705882353, "a": 1},
    "mediumaquamarine": {"r": 102, "g": 205, "b": 170, "h": 0.4433656957928802, "s": 0.5073891625615764, "l": 0.6019607843137256, "a": 1},
    "mediumblue": {"r": 0, "g": 0, "b": 205, "h": 0.6666666666666666, "s": 1, "l": 0.4019607843137255, "a": 1},
    "mediumorchid": {"r": 186, "g": 85, "b": 211, "h": 0.8002645502645502, "s": 0.5887850467289718, "l": 0.580392156862745, "a": 1},
    "mediumpurple": {"r": 147, "g": 112, "b": 219, "h": 0.721183800623053, "s": 0.5977653631284916, "l": 0.6490196078431372, "a": 1},
    "mediumseagreen": {"r": 60, "g": 179, "b": 113, "h": 0.4075630252100841, "s": 0.49790794979079495, "l": 0.46862745098039216, "a": 1},
    "mediumslateblue": {"r": 123, "g": 104, "b": 238, "h": 0.6902985074626865, "s": 0.7976190476190477, "l": 0.6705882352941177, "a": 1},
    "mediumspringgreen": {"r": 0, "g": 250, "b": 154, "h": 0.436, "s": 1, "l": 0.49019607843137253, "a": 1},
    "mediumturquoise": {"r": 72, "g": 209, "b": 204, "h": 0.49391727493917276, "s": 0.5982532751091703, "l": 0.5509803921568628, "a": 1},
    "mediumvioletred": {"r": 199, "g": 21, "b": 133, "h": 0.8951310861423221, "s": 0.809090909090909, "l": 0.43137254901960786, "a": 1},
    "midnightblue": {"r": 25, "g": 25, "b": 112, "h": 0.6666666666666666, "s": 0.635036496350365, "l": 0.26862745098039215, "a": 1},
    "mintcream": {"r": 245, "g": 255, "b": 250, "h": 0.41666666666666646, "s": 1, "l": 0.9803921568627452, "a": 1},
    "mistyrose": {"r": 255, "g": 228, "b": 225, "h": 0.016666666666666757, "s": 1, "l": 0.9411764705882353, "a": 1},
    "moccasin": {"r": 255, "g": 228, "b": 181, "h": 0.10585585585585588, "s": 1, "l": 0.8549019607843138, "a": 1},
    "navajowhite": {"r": 255, "g": 222, "b": 173, "h": 0.09959349593495936, "s": 1, "l": 0.8392156862745098, "a": 1},
    "oldlace": {"r": 253, "g": 245, "b": 230, "h": 0.10869565217391304, "s": 0.8518518518518523, "l": 0.9470588235294117, "a": 1},
    "olivedrab": {"r": 107, "g": 142, "b": 35, "h": 0.22118380062305296, "s": 0.6045197740112994, "l": 0.34705882352941175, "a": 1},
    "orangered": {"r": 255, "g": 69, "b": 0, "h": 0.04509803921568626, "s": 1, "l": 0.5, "a": 1},
    "orchid": {"r": 218, "g": 112, "b": 214, "h": 0.8396226415094339, "s": 0.5888888888888889, "l": 0.6470588235294117, "a": 1},
    "palegoldenrod": {"r": 238, "g": 232, "b": 170, "h": 0.15196078431372548, "s": 0.6666666666666667, "l": 0.8, "a": 1},
    "palegreen": {"r": 152, "g": 251, "b": 152, "h": 0.3333333333333333, "s": 0.9252336448598131, "l": 0.7901960784313725, "a": 1},
    "paleturquoise": {"r": 175, "g": 238, "b": 238, "h": 0.5, "s": 0.6494845360824743, "l": 0.8098039215686275, "a": 1},
    "palevioletred": {"r": 219, "g": 112, "b": 147, "h": 0.9454828660436138, "s": 0.5977653631284916, "l": 0.6490196078431372, "a": 1},
    "papayawhip": {"r": 255, "g": 239, "b": 213, "h": 0.10317460317460315, "s": 1, "l": 0.9176470588235295, "a": 1},
    "peachpuff": {"r": 255, "g": 218, "b": 185, "h": 0.07857142857142856, "s": 1, "l": 0.8627450980392157, "a": 1},
    "peru": {"r": 205, "g": 133, "b": 63, "h": 0.08215962441314555, "s": 0.5867768595041323, "l": 0.5254901960784314, "a": 1},
    "pink": {"r": 255, "g": 192, "b": 203, "h": 0.9708994708994709, "s": 1, "l": 0.8764705882352941, "a": 1},
    "plum": {"r": 221, "g": 160, "b": 221, "h": 0.8333333333333334, "s": 0.4728682170542637, "l": 0.7470588235294118, "a": 1},
    "powderblue": {"r": 176, "g": 224, "b": 230, "h": 0.5185185185185186, "s": 0.5192307692307692, "l": 0.7960784313725491, "a": 1},
    "rosybrown": {"r": 188, "g": 143, "b": 143, "h": 0, "s": 0.2513966480446928, "l": 0.6490196078431373, "a": 1},
    "royalblue": {"r": 65, "g": 105, "b": 225, "h": 0.625, "s": 0.7272727272727272, "l": 0.5686274509803921, "a": 1},
    "saddlebrown": {"r": 139, "g": 69, "b": 19, "h": 0.06944444444444443, "s": 0.759493670886076, "l": 0.3098039215686274, "a": 1},
    "salmon": {"r": 250, "g": 128, "b": 114, "h": 0.017156862745098016, "s": 0.9315068493150683, "l": 0.7137254901960784, "a": 1},
    "sandybrown": {"r": 244, "g": 164, "b": 96, "h": 0.07657657657657659, "s": 0.8705882352941179, "l": 0.6666666666666667, "a": 1},
    "seagreen": {"r": 46, "g": 139, "b": 87, "h": 0.4068100358422939, "s": 0.5027027027027026, "l": 0.3627450980392157, "a": 1},
    "seashell": {"r": 255, "g": 245, "b": 238, "h": 0.0686274509803922, "s": 1, "l": 0.9666666666666667, "a": 1},
    "sienna": {"r": 160, "g": 82, "b": 45, "h": 0.053623188405797106, "s": 0.5609756097560975, "l": 0.4019607843137255, "a": 1},
    "skyblue": {"r": 135, "g": 206, "b": 235, "h": 0.5483333333333333, "s": 0.714285714285714, "l": 0.7254901960784313, "a": 1},
    "slateblue": {"r": 106, "g": 90, "b": 205, "h": 0.6898550724637681, "s": 0.5348837209302326, "l": 0.5784313725490197, "a": 1},
    "slategray": {"r": 112, "g": 128, "b": 144, "h": 0.5833333333333334, "s": 0.12598425196850394, "l": 0.5019607843137255, "a": 1},
    "slategrey": {"r": 112, "g": 128, "b": 144, "h": 0.5833333333333334, "s": 0.12598425196850394, "l": 0.5019607843137255, "a": 1},
    "snow": {"r": 255, "g": 250, "b": 250, "h": 0, "s": 1, "l": 0.9901960784313726, "a": 1},
    "springgreen": {"r": 0, "g": 255, "b": 127, "h": 0.41633986928104577, "s": 1, "l": 0.5, "a": 1},
    "steelblue": {"r": 70, "g": 130, "b": 180, "h": 0.5757575757575758, "s": 0.44, "l": 0.4901960784313726, "a": 1},
    "tan": {"r": 210, "g": 180, "b": 140, "h": 0.09523809523809527, "s": 0.4374999999999999, "l": 0.6862745098039216, "a": 1},
    "thistle": {"r": 216, "g": 191, "b": 216, "h": 0.8333333333333334, "s": 0.24271844660194178, "l": 0.7980392156862746, "a": 1},
    "tomato": {"r": 255, "g": 99, "b": 71, "h": 0.025362318840579694, "s": 1, "l": 0.6392156862745098, "a": 1},
    "turquoise": {"r": 64, "g": 224, "b": 208, "h": 0.48333333333333334, "s": 0.7207207207207207, "l": 0.5647058823529412, "a": 1},
    "violet": {"r": 238, "g": 130, "b": 238, "h": 0.8333333333333334, "s": 0.7605633802816902, "l": 0.7215686274509804, "a": 1},
    "wheat": {"r": 245, "g": 222, "b": 179, "h": 0.1085858585858586, "s": 0.7674418604651168, "l": 0.8313725490196078, "a": 1},
    "whitesmoke": { "r": 245, "g": 245, "b": 245, "h": 0, "s": 0, "l": 0.9607843137254902, "a": 1},
    "yellowgreen": {"r": 154, "g": 205, "b": 50, "h": 0.22150537634408604, "s": 0.607843137254902, "l": 0.5, "a": 1}
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