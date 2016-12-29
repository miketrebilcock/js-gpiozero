const GPIODevice = require('../devices/GPIODevice.js').GPIODevice;
const inherit = require('../tools.js').inherit;

exports.InputDevice = InputDevice;

/**
 * Represents a generic GPIO input device.
 * This class extends {@link GPIODevice} to add facilities common to GPIO
 * input devices.  The constructor adds the optional *pull_up* parameter to
 * specify how the pin should be pulled by the internal resistors. The
 * {@link InputDevice#is_active|is_active} property is adjusted accordingly so that
 * ``true`` still means active regardless of the {@link InputDevice#pull_up|pullup} setting.
 *
 * @param {int | Pin} pin - The GPIO pin (in Broadcom numbering) that the device is connected to.
 * @param {boolean} [pullup] - If ``true``, the pin will be pulled high with an internal resistor. If
 * ``false`` (the default), the pin will be pulled low.
 * @class
 * @augments GPIODevice
 * @throws GPIODeviceError
 */
function InputDevice (pin, pullup) {
    GPIODevice.call(this, pin);

    if (typeof pullup === 'undefined') {
        pullup = false;
    }

    const pull = pullup ? 'up' : 'down';
    if (this._pin.pull() !== pull) {
        this._pin.pull(pull);
    }
    this._active_state = !pullup;
    this._inactive_state = pullup;
}

InputDevice.prototype = inherit(GPIODevice.prototype);
InputDevice.prototype.constructor = InputDevice;

/**
 * If ``true``, the device uses a pull-up resistor to set the GPIO pin "high" by default.
 */
InputDevice.prototype.pull_up = function () {
    return (this._pin.pull() === 'up');
};

InputDevice.prototype.toString = function () {
    return '<gpiozero.InputDevice object on pin ' + this._pin + ', pull_up=' + this.pull_up() + ', is_active=' + this.is_active() + '>';
}