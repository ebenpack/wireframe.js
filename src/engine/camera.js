var math = require('../math/math.js');
var Vector = math.Vector;
var Matrix = math.Matrix;

/** 
 * @constructor
 * @this {Camera}
 * @param {Vector} position Camera position.
 * @param {Vector} target   Camera
 */
function Camera(width, height, position, target){
    this.position = position || new Vector(1,1,20);
    this.target = target || new Vector(0,0,1);
    this.up = new Vector(0, 1, 0);
    this.rotation = {'yaw': 0, 'pitch': 0, 'roll': 0};
    this.view_matrix = this.lookAt();
    this.width = width;
    this.height = height;
    this.near = 0.1;
    this.far = 1000;
    this.fov = 90;
    this.perspectiveFov = this.calculatePerspectiveFov();
}
/** @method */
Camera.prototype.direction = function() {
    return this.target.subtract(this.position);
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
Camera.prototype.lookAt = function(){
    var eye = this.position;
    var target = this.direction();
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
    // TODO: FIX, WRONG
    var right = this.up.cross(this.direction().normalize().scale(amount));
    this.position = this.position.add(right);
    //this.direction().x += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveLeft = function(amount){
    // TODO: FIX, WRONG
    var left = this.up.cross(this.direction().normalize().scale(amount));
    this.position = this.position.subtract(left);
    //this.direction().x -= amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveUp = function(amount){
    // TODO: WRONG!!!
    this.position = this.position.add(this.up.normalize().scale(amount));
    //this.direction().y -= amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveDown = function(amount){
    // TODO: WRONG!!!
    this.position = this.position.subtract(this.up.normalize().scale(amount));
    //this.direction().y += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveForward = function(amount){
    // TODO: WRONG!!!
    this.position = this.position.add(this.direction().normalize().scale(amount));
    //this.direction().y += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.moveBackward = function(amount){
    // TODO: WRONG!!!
    this.position = this.position.subtract(this.direction().normalize().scale(amount));
    //this.direction().y += amount;
    this.view_matrix = this.lookAt();
};
Camera.prototype.rollLeft = function(amount){
    this.rotation.roll += amount;
    this.up.x = Math.sin(this.rotation.roll);
    this.up.y = -Math.cos(this.rotation.roll);
    this.up.z = 0;
    this.view_matrix = this.lookAt();
};
Camera.prototype.rollRight = function(amount){
    this.rotation.roll -= amount;
    this.up.x = Math.sin(this.rotation.roll);
    this.up.y = -Math.cos(this.rotation.roll);
    this.up.z = 0;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.orbitTo = function(){

};
/** @method */
Camera.prototype.zoomIn = function(amount){
    // TODO: WRONG!!!
    this.position.z += amount;
    //this.direction().z += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.zoomOut = function(amount){
    // TODO: WRONG!!!
    this.position.z -= amount;
    //this.direction().z += amount;
    this.view_matrix = this.lookAt();
};
/** @method */
Camera.prototype.orbitLeft = function(){

};
/** @method */
Camera.prototype.orbitRight = function(){

};

module.exports = Camera;