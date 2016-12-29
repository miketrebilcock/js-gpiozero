const inherit = require ('../tools.js').inherit;
const extend = require ('../tools.js').extend;
const CompositeOutputDevice = require ('../output_devices/CompositeOutputDevice.js').CompositeOutputDevice;
const PWMLED = require('../output_devices/PWMLED.js').PWMLED;
const LED = require('../output_devices/LED.js').LED;

exports.LEDCollection = LEDCollection;

/**
 * Abstract base class for @link{LEDBoard} and @link{LEDBarGraph}.
 *
 * @param {Array} [_pins] - Array of pins that LEDs are connect to.
 * @param {Array} [_kwpins] - Array of tuples listing names for each pin eg [['red',17], ['amber',22]].
 * @param {Object} [_options] - Set options for the Collection:
 * *     pwm: Default: false, If true, creates PWMLED instances for each pin, else LED.
 * *     active_high: Default: true, If true, the on method will set all the associated pins to HIGH.
 *                                  If false, the on method will set all pins to LOW
 *                                  (the `off` method always does the opposite).
 * *    initial_value: If false, all LEDs will be off initially, if true the device will be Switched on initialled.
 * @augments CompositeOutputDevice
 * @class
 */
function LEDCollection(_pins, _kwpins, _options) {
    "use strict";
    const defaults = {
        pwm: false,
        active_high: true,
        initial_value: false,
    };
    this.options = extend(defaults, _options);
    this._leds = [];
    this._kwleds = [];
    let i;
    if (_pins !== undefined) {
        for (i = 0; i < _pins.length; i++) {
            this._leds.push(this.options.pwm ? new PWMLED(_pins[i]) : new LED(_pins[i]));
        }
    }

    if (_kwpins !== undefined) {
        for (i = 0; i < _kwpins.length; i++) {
            this._kwleds.push([
                _kwpins[i][0],
                this.options.pwm ? new PWMLED(_kwpins[i][1]) : new LED(_kwpins[i][1])
            ]);
        }
    }
    CompositeOutputDevice.call(this, this._leds, this._kwleds);
}

LEDCollection.prototype = inherit(CompositeOutputDevice.prototype);
LEDCollection.prototype.constructor = LEDCollection;

/**
 * @returns {Array} - A flat array of tuples of all LEDs contained in this collection (and all sub-collections).
 */
LEDCollection.prototype.leds = function (){
    return this._leds;
};

/**
 *
 * @returns {boolean} Indicates whether the device is active high (true) or low (false).
 */
LEDCollection.prototype.active_high = function (){
    return this[0].active_high;
};