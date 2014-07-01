var math = require('../math/math.js');
var Vector = math.Vector;
var Matrix = math.Matrix;

/** 
 * @constructor
 * @this {Camera}
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
/**
 * Calculate the point the camera is looking at.
 * @return {[type]} [description]
 */
Camera.prototype.lookAt = function() {
    var rotation = Matrix.rotationZ(this.rotation.yaw);
    var transformed = this.position.transform(rotation);
    return this.position.add(transformed);
};
/** @method */
Camera.prototype.direction = function() {
    var look_at = this.lookAt().normalize();
    return this.position.subtract(look_at);
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
    var cosPitch = Math.cos(pitch);
    var sinPitch = Math.sin(pitch);
    var cosYaw = Math.cos(yaw);
    var sinYaw = Math.sin(yaw);

    var xaxis = new Vector(cosYaw, 0, -sinYaw );
    var yaxis = new Vector(sinYaw * sinPitch, cosPitch, cosYaw * sinPitch );
    var zaxis = new Vector(sinYaw * cosPitch, -sinPitch, cosPitch * cosYaw );

    // Create a 4x4 view matrix from the right, up, forward and eye position vectors
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
    this.position = this.position.add(right);
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveLeft = function(amount){
    var left = this.up.cross(this.direction()).normalize().scale(amount);
    this.position = this.position.subtract(left);
    this.view_matrix = this.createViewMatrix();
};
Camera.prototype.turnRight = function(amount){
    this.rotation.yaw += amount;
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.turnLeft = function(amount){
    this.rotation.yaw -= amount;
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
    //var forward = this.target.normalize().scale(amount);
    this.position = this.position.subtract(new Vector(0,0,amount));
    this.view_matrix = this.createViewMatrix();
};
/** @method */
Camera.prototype.moveBackward = function(amount){
    this.position = this.position.add(new Vector(0,0,amount));
    this.view_matrix = this.createViewMatrix();
};

module.exports = Camera;
