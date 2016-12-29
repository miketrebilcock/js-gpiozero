const inherit = require('../tools.js').inherit;
const OutputDevice = require('./OutputDevice.js').OutputDevice;
const exc = require('../exc.js');

exports.PWMOutputDevice = PWMOutputDevice;

/**
 * Generic output device configured for pulse-width modulation (PWM).
 *
 * @param {int | Pin} pin - The GPIO pin which the device is attached to.
 * @param {boolean} active_high - If ``true`` (the default), the {@link PWMOutputDevice#on|on} method will set the GPIO to HIGH.
 * If ``false``, the {@link PWMOutputDevice#on|on} method will set the GPIO to LOW (the {@link PWMOutputDevice#off|off} method always does the opposite).
 * @param {int} initial_value - If ``0`` (the default), the device's duty cycle will be 0 initially.
 * Other values between 0 and 1 can be specified as an initial duty cycle.
 * Note that ``undefined`` cannot be specified (unlike the parent class) as there is no way to tell PWM not to alter the state of the pin.
 * @param {int} frequency - The frequency (in Hz) of pulses emitted to drive the device. Defaults to 100Hz.
 * @class
 *
 * @throws OutputDeviceBadValue - When intial_value is ``undefined``.
 */
function PWMOutputDevice(pin, active_high, initial_value, frequency) {
    if (initial_value !== undefined) {
        if (initial_value < 0 || initial_value > 1) {
            throw new exc.OutputDeviceBadValue("initial_value must be between 0 and 1, actual=:" + initial_value);
        }
    }

    OutputDevice.call(this, pin, active_high, initial_value);

    try {
        this._pin.frequency(frequency === undefined ? 100 : frequency);
        this.value(initial_value === undefined ? 0 : initial_value);
    } catch (e) {
        this.close();
        throw e;
    }
}

PWMOutputDevice.prototype = inherit(OutputDevice.prototype);
PWMOutputDevice.prototype.constructor = PWMOutputDevice;
/**
 * The duty cycle of the PWM device. 0.0 is off, 1.0 is fully on.
 * Values in between may be specified for varying levels of power in the device.
 *
 * @param {float} [value] - When defined then sets the device duty cycle.
 * @returns {float} - When value is undefined then the current duty cycle is returned.
 */
PWMOutputDevice.prototype.value = function(value) {
    if (value === undefined) {
        return this._read();
    }
    this._pin._stop_blink();
    this._write(value);
};
/**
 * Internal method that converts the actual pin value to it's logical value.
 *
 * @returns {number} - Logical pin value.
 * @private
 */
PWMOutputDevice.prototype._read = function() {
    this._check_open();
    if (this.active_high()) {
        return this._pin.state();
    }
    return 1 - this._pin.state();
};

/**
 * Internal method used to convert a logical value to the state the pin needs to change to.
 *
 * @param {float} value - Logical value to set the device to.
 * @private
 * @throws OutputDeviceBadValue - Occurs if the value specified is not between 0 and 1.
 */
PWMOutputDevice.prototype._write = function(value) {
    if (!this.active_high()) {
        value = 1 - value;
    }
    if (value < 0 || value > 1) {
        throw new exc.OutputDeviceBadValue("PWM value must be between 0 and 1");
    }
    this._check_open();
    this._pin.state(value);
};

/**
 * Sets or Gets the device frequency.
 *
 * @param {int} [value] - The new frequency for the device.
 * @returns {int} - If value is undefined then the current device frequency is returned.
 */
PWMOutputDevice.prototype.frequency = function(value) {
    if (value === undefined) {
        return this._pin.frequency();
    }
    this._pin.frequency(value);
};

/**
 *
 * @returns {boolean} - If the device has a value other than 0 then true.
 */
PWMOutputDevice.prototype.is_active = function() {
    return this.value() !== 0;
};

/**
 * Turn the device fully on.
 */
PWMOutputDevice.prototype.on = function() {
    this._pin._stop_blink();
    this._write(1);
};

/**
 * Turn the device off.
 */
PWMOutputDevice.prototype.off = function() {
    this._pin._stop_blink();
    this._write(0);
};

/**
 * Toggle the state of the device. If the device is currently off (value` is 0.0),
 * this changes it to "fully" on (`value` is 1.0).
 * If the device has a duty cycle (`value`) of 0.1, this will toggle it to 0.9, and so on.
 */
PWMOutputDevice.prototype.toggle = function() {
    this._pin._stop_blink();
    const newValue = 1 - this.value();
    this.value(newValue);
};

/**
 * Stop any actions such as blink and unlink from pin.
 */
PWMOutputDevice.prototype.close = function() {
    this._pin._stop_blink();
    this._pin.frequency(-1);
    OutputDevice.prototype.close.call(this);
};

/**
 * Make the device turn on and off repeatedly.
 *
 * @param {float} [on_time] - Number of seconds on. Defaults to 1 second.
 * @param {float} [off_time] - Number of seconds off. Defaults to 1 second.
 * @param {float} [fade_in_time] - Number of seconds to spend fading in. Defaults to 0.
 * @param {float} [fade_out_time] - Number of seconds to spend fading out. Defaults to 0.
 * @param {int} [n] - Number of times to blink; ``undefined`` (the default) means forever.
 * @param {@callback} [callback] - Function to be called after n loops.
 */
PWMOutputDevice.prototype.blink = function(on_time, off_time, fade_in_time, fade_out_time, n, callback) {
    this._pin.blink(on_time, off_time, fade_in_time, fade_out_time, n, undefined, callback);
};

/**
 * Make the device fade in and out repeatedly.
 *
 * @param {float} [fade_in_time] - Number of seconds to spend fading in. Defaults to 0.
 * @param {float} [fade_out_time] - Number of seconds to spend fading out. Defaults to 0.
 * @param {int} [n] - Number of times to blink; ``undefined`` (the default) means forever.
 * @param {@callback} [callback] - Function to be called after n loops.
 */
PWMOutputDevice.prototype.pulse = function(fade_in_time, fade_out_time, n, callback) {
    const on_time = 0,
        off_time = 0;

    this._pin.blink(on_time, off_time, fade_in_time, fade_out_time, n, undefined, callback);
};
