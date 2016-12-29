const TrafficLights = require ('./TrafficLights.js').TrafficLights;
const inherit = require ('../tools.js').inherit;
const extend = require ('../tools.js').extend;

/**
 * Represents the {@link http://lowvoltagelabs.com/products/pi-traffic/|Low Voltage Labs PI-TRAFFIC} vertical traffic lights board when attached to GPIO pins 9, 10, and 11.
 * There's no need to specify the pins if the PI-TRAFFIC is connected to the default pins (9, 10, 11).
 *
 * @param {Object} [_options] - Device Options:
 * * pwm: default: false. If true, creates PWMLED instances, else LED.
 * * initial_value: default: false. If false, all LEDs will be off initially, if true the device will be switched on initialled.
 * @class
 * @augments TrafficLights
 */
function PiTraffic(_options){
    "use strict";
    const defaults = {
        pwm: false,
        initial_value: false
    };
    this.options = extend(defaults, _options);
    TrafficLights.call(this, 9,10,11, this.options);
}

exports.PiTraffic = PiTraffic;
PiTraffic.prototype = inherit(TrafficLights.prototype);
PiTraffic.prototype.constructor = PiTraffic;