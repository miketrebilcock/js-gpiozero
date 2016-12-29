const inherit = require('../tools.js').inherit;
const PWMOutputDevice = require('./PWMOutputDevice.js').PWMOutputDevice;

exports.PWMLED = PWMLED;

/**
 * Represents a light emitting diode (LED) with variable brightness.
 *
 * A typical configuration of such a device is to connect a GPIO pin to the
 * anode (long leg) of the LED, and the cathode (short leg) to ground, with
 * an optional resistor to prevent the LED from burning out.
 *
 * @param {int} pin - The GPIO pin which the LED is attached to.
 * @param {boolean} [active_high] - If ``true`` (the default), the {@link PWMLED#on|on} method will set the GPIO to HIGH.
 * If ``false``, the {@link PWMLED#on|on} method will set the GPIO to LOW (the {@link PWMLED#off|off} method always does
 * the opposite).
 * @param {float} [initial_value] - If ``0`` (the default), the LED will be off initially. Other values
 * between 0 and 1 can be specified as an initial brightness for the LED. Note that ``undefined`` cannot be specified
 * (unlike the parent class) as there is no way to tell PWM not to alter the state of the pin.
 * @param {int} [frequency] - The frequency (in Hz) of pulses emitted to drive the LED. Defaults to 100Hz.
 * @class
 * @augments PWMOutputDevice
 */
function PWMLED(pin, active_high, initial_value, frequency) {
    PWMOutputDevice.call(this, pin, active_high, initial_value, frequency);
}

PWMLED.prototype = inherit(PWMOutputDevice.prototype);
PWMLED.prototype.constructor = PWMLED;

/**
 *
 * @returns {boolean} - Alias for {@link PWMOutputDevice#is_active|is_active}.
 */
PWMLED.prototype.is_lit = function() {
    return this.is_active();
};
