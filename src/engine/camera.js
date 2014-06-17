var math = require('../math/math.js');
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