var math = require('../math/math.js');
var Camera = require('./camera.js');
var EventTarget = require('./events.js');
var KEYCODES = require('../utility/keycodes.js');

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
            var normal = mesh.normal(k).transform(world_matrix).transform(face_translation);
            var illumination_angle = Math.abs(normal.cosAngle(this.illumination));
            // TODO: Backface culling, if not in wireframe mode
            color = color.lighten(illumination_angle*0.25);
            this.drawTriangle(wv1, wv2, wv3, color.rgb);
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