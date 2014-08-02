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
 * @param  {string} type Type of event to be fired.
 * @param  {Object} [event] Optional event object.
 */
EventTarget.prototype.fire = function(type, event){
    var e = {};
    if (typeof event !== 'undefined'){
        e = event;
    }
    e.event = type;
    e.target = this;
    var listeners = this._listeners[type];
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
