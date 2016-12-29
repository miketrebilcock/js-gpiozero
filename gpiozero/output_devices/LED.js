const inherit = require('../tools.js').inherit;
const DigitalOutputDevice = require('./DigitalOutputDevice.js').DigitalOutputDevice;

exports.LED = LED;

/**
 * Represents a light emitting diode (LED).
 *
 * Connect the cathode (short leg, flat side) of the LED to a ground pin; connect the anode (longer leg) to a limiting resistor; connect the other side of the limiting resistor to a GPIO pin (the limiting resistor can be placed either side of the LED).
 *
 * @example const LED = require('gpiozero').LED;
 *          var led = new LED(17);
 *          led.on();
 *
 * @param {(int | Pin)} pin - The GPIO pin (in BCM numbering) or an instance of Pin that the LED is connected to.
 * @param {boolean} [active_high] - If ``True`` (the default), the LED will operate normally with the circuit described above. If ``False`` you should wire the cathode to the GPIO pin, and the anode to a 3V3 pin (via a limiting resistor).
 * @param {boolean} [initial_value] - If `false` (the default), the device will be off initially.
 * If `undefined`, the device will be left in whatever state the pin is found in when configured for output (warning: this can be on).  If `true`, the device will be switched on initially.
 * @augments DigitalOutputDevice
 * @class
 *
 */
function LED(pin, active_high, initial_value) {
    DigitalOutputDevice.call(this, pin, active_high, initial_value);
}

LED.prototype = inherit(DigitalOutputDevice.prototype);
LED.prototype.constructor = LED;
/**
 * Friendly name for is_active.
 *
 * @returns {boolean} - Is true is LED is lit.
 */
LED.prototype.is_lit = function() {
    return this.is_active();
};

