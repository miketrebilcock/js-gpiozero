const OutputDevice = require ('./OutputDevice.js').OutputDevice;
const inherit = require('../tools.js').inherit;

exports.DigitalOutputDevice = DigitalOutputDevice;

/**
 * Represents a generic output device with typical on/off behaviour. This class extends {@link OutputDevice}
 * with a {@link DigitalOutputDevice#blink|blink} method which toggles the device state without further interaction.
 *
 * @param {(int | Pin)} pin - The GPIO pin (in BCM numbering) or an instance of Pin that the device is connected to.
 * @param {boolean} [active_high] - If `true` (the default), the {@link OutputDevice#on|on} method will set the GPIO to HIGH.
 * If `false`, the {@link OutputDevice#on|on} method will set the GPIO to LOW (the {@link OutputDevice#off|off} method always does the opposite).
 * @param {boolean} [initial_value] - If `false` (the default), the device will be off initially.
 * If `undefined`, the device will be left in whatever state the pin is found in when configured for output (warning: this can be on).  If `true`, the device will be switched on initially.
 *
 * @throws GPIOPinMissing - When pin is undefined.
 * @class
 * @augments OutputDevice
 */
function DigitalOutputDevice(pin, active_high, initial_value) {
    OutputDevice.call(this, pin, active_high, initial_value);
}

DigitalOutputDevice.prototype = inherit(OutputDevice.prototype);
DigitalOutputDevice.prototype.constructor = DigitalOutputDevice;

/**
 * Make the device turn on and off repeatedly.
 *
 * @param {float} on_time - Number of seconds on. Defaults to 1 second.
 * @param {float} off_time - Number of seconds off. Defaults to 1 second.
 * @param {int} n - Number of times to blink; ``None`` (the default) means forever.
 * @param {callback} callback - Function to be called upon completion in the form (error, data).
 */
DigitalOutputDevice.prototype.blink = function(on_time, off_time, n, callback) {
    this._pin.blink(on_time, off_time, n, callback);
};
