const InputDevice = require('./InputDevice.js').InputDevice;
const inherit = require('../tools.js').inherit;
const _extend_object = require('../tools.js')._extend_object;
const EventsMixin = require ('../Mixins/EventsMixin.js').EventsMixin;

exports.DigitalInputDevice = DigitalInputDevice;

/**
 * Represents a generic input device with typical on/off behaviour.
 *
 * This class extends {@link InputDevice|InputDevice} with machinery to fire the active
 * and inactive events for devices that operate in a typical digital manner
 * straight forward on / off states with (reasonably) clean transitions between the two.
 *
 * @param {int} pin - The GPIO pin (in Broadcom numbering) that the device is connected to.
 * @param {boolean} [pull_up] - If `true`, the pin will be pulled high with an internal resistor. If
 * `false` (the default), the pin will be pulled low.
 * @param {float} [bounce_time] - Specifies the length of time (in seconds) that the component will
 * ignore changes in state after an initial change. This defaults to
 * `undefined` which indicates that no bounce compensation will be performed.
 * @class
 * @augments InputDevice
 */
function DigitalInputDevice(pin, pull_up, bounce_time) {
    InputDevice.call(this, pin, pull_up);
    _extend_object(this, EventsMixin.prototype);
    EventsMixin.call(this);
    this._pin.bounce = bounce_time;
    this._pin.edges = 'both';
    const that = this;
    this._pin.when_changed( ()=>{ that._fire_events();});
    //Call _fire_events once to set initial state of events
    this._fire_events();

}

DigitalInputDevice.prototype = inherit(InputDevice.prototype);
DigitalInputDevice.prototype.constructor = DigitalInputDevice;