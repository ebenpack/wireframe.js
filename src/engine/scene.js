var math = require('../math/math.js');
var Camera = require('./camera.js')
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