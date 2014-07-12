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