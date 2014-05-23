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