const LEDBoard = require ('./LEDBoard.js').LEDBoard;
const inherit = require ('../tools.js').inherit;
const extend = require ('../tools.js').extend;
const exc = require('../exc.js');

exports.TrafficLights = TrafficLights;

/**
 * Represents a traffic light device containing red, amber, and green LEDs.
 *
 * @param {number} red - The GPIO pin that the red LED is attached to.
 * @param {number} amber - The GPIO pin that the amber LED is attached to.
 * @param {number} green - The GPIO pin that the green LED is attached to.
 * @param {Object} [_options] - Options for device:
 * * pwm: default: false. If true, creates PWMLED instances, else LED.
 * * initial_value: default: false. If false, all LEDs will be off initially, if true the device will be switched on initialled.
 * @augments LEDBoards
 * @class
 */
function TrafficLights(red, amber, green, _options) {
    "use strict";
    const defaults = {
        pwm: false,
        initial_value: false
    };
    this.options = extend(defaults, _options);

    if (red === undefined ||
        amber === undefined ||
        green === undefined) {
        throw new exc.GPIOPinMissing('Pins must be provided for all LEDs');
    }
    this.devices = [['red', red],['amber',amber],['green',green]];
    LEDBoard.call(this,undefined, this.devices, this.options);
}

TrafficLights.prototype = inherit(LEDBoard.prototype);
TrafficLights.prototype.constructor = TrafficLights;