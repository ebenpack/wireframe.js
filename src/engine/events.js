/**
 * Event handler.
 * @constructor
 */

function EventTarget(){
    this._listeners = {};
}
/**
 * @method
 * @param {string} type
 * @param {function} listener
 */
EventTarget.prototype.addListener = function(type, listener){
    if (!(type in this._listeners)) {
        this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
};
/**
 * @method
 * @param  {string} event
 */
EventTarget.prototype.fire = function(event){
    var e = {"event": event, "target": this};
    var listeners = this._listeners[event];
    for (var i = 0, len = listeners.length; i < len; i++) {
        listeners[i].call(this, e);
    }
};
/**
 * @method
 * @param  {string} type
 * @param  {function} listener
 */
EventTarget.prototype.removeListener = function(type, listener){
    var listeners = this._listeners[type];
    for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] === listener) {
            listeners.splice(i, 1);
        }
    }
};

module.exports = EventTarget;
