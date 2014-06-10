var math = require('./math.js');
var KEYCODES = require('./keycodes.js');

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
    /** @type {boolean} */
    this._needs_update = true;
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
Scene.prototype.drawEdge = function(vector1, vector2, color){
    this.ctx.beginPath();
    this.ctx.moveTo(vector1.x + this._x_offset, vector1.y + this._y_offset);
    this.ctx.lineTo(vector2.x + this._x_offset, vector2.y + this._y_offset);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    this.ctx.closePath();
};
/** @method */
Scene.prototype.renderScene = function(){
    // TODO: DRAW FROM BACK TO FRONT (IE CLOSER EDGES OVERLAP/OBSCURE FARTHER)
    // TODO: ONLY DRAW EDGES IN CAMERA'S FRUSTRUM
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        for (var k = 0; k < mesh.edges.length; k++){
            var edge = mesh.edges[k].edge;
            var color = mesh.edges[k].color;
            var v1 = mesh.vertices[edge[0]].vector;
            var v2 = mesh.vertices[edge[1]].vector;
            var wv1 = v1.transform(final_transform);
            var wv2 = v2.transform(final_transform);
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
    if (this._needs_update) {
        this.renderScene();
        this._needs_update = false;
    }
    this._anim_id = window.requestAnimationFrame(this.update.bind(this));
};

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

var engine = {
    Scene: Scene,
    Camera: Camera
};

module.exports = {engine: engine, math: math};