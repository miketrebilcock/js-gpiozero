const inherit = require('../tools.js').inherit;
const DigitalOutputDevice = require('./DigitalOutputDevice.js').DigitalOutputDevice;

exports.Buzzer = Buzzer;
/**
 * Represents a digital buzzer component.
 *
 * @example const Buzzer = require ('gpiozero').Buzzer;
 *          bz = new Buzzer(3);
 *          bz.on();
 *
 * @param {int | Pin} pin -  The GPIO pin which the buzzer is attached to.
 * @param {boolean} active_high - If ``true`` (the default), the buzzer will operate normally with the circuit described above.
 * If ``false`` you should wire the cathode to the GPIO pin, and the anode to a 3V3 pin.
 * @param {boolean} initial_value - If ``false`` (the default), the buzzer will be silent initially.
 * If ``undefined``, the buzzer will be left in whatever state the pin is found in
 * when configured for output (warning: this can be on).  If ``true``, the buzzer will be switched on initially.
 * @class
 * @augments DigitalOutputDevice
 */
function Buzzer(pin, active_high, initial_value) {
    DigitalOutputDevice.call(this, pin, active_high, initial_value);
}

Buzzer.prototype = inherit(DigitalOutputDevice.prototype);
Buzzer.prototype.constructor = Buzzer;

/**
 * Make the buzzer switch on and off once a second.
 */
Buzzer.prototype.beep = function() {
    this.blink();
};

