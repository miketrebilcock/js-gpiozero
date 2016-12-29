const GPIODevice = require('../devices/GPIODevice.js').GPIODevice;
const Lock = require('rwlock');
const inherit = require('../tools.js').inherit;

exports.OutputDevice = OutputDevice;
/**
 * Represents a generic GPIO output device.
 * Provides facilities common to GPIO output devices an {@link OutputDevice#on|on} method to switch the device on, a
 * corresponding {@link OutputDevice#off|off} method, and a {@link OutputDevice#toggle|toggle} method.
 *
 * @param {(int | Pin)} pin - The GPIO pin (in BCM numbering) or an instance of Pin that the device is connected to.
 * @param {boolean} [active_high] - If `true` (the default), the {@link OutputDevice#on|on} method will set the GPIO to HIGH.
 * If `false`, the :{@link OutputDevice#on|on} method will set the GPIO to LOW (the {@link OutputDevice#off|off} method always does the opposite).
 * @param {boolean} [initial_value] - If `false` (the default), the device will be off initially.
 * If `undefined`, the device will be left in whatever state the pin is found in when configured for output (warning: this can be on).  If `true`, the device will be switched on initially.
 *
 * @throws GPIOPinMissing - When pin is undefined.
 * @class
 * @augments GPIODevice
 */
function OutputDevice(pin, active_high, initial_value) {
    GPIODevice.call(this, pin);
    this._lock = new Lock();
    this.active_high((active_high === undefined) ? true : active_high);

    if (initial_value === undefined) {
        this._pin.pin_function('output');
    } else {
        this._pin.output_with_state(this._value_to_state(initial_value));
    }
}


OutputDevice.prototype = inherit(GPIODevice.prototype);
OutputDevice.prototype.constructor = OutputDevice;

/**
 * Internal method to apply active state high and convert the actual value to a logical value.
 *
 * @param {boolean|float} value - The value to be converted.
 * @returns {boolean} - The logical value of the pin.
 * @private
 */
OutputDevice.prototype._value_to_state = function(value) {
    return (value) ? this._active_state : this._inactive_state;
};

/**
 * Internal method used to write to the pin after mapping the request value.
 *
 * @param {float | boolean} value - The logical value that the pin should be changed to.
 * @private
 */
OutputDevice.prototype._write = function(value) {
    this._check_open(this);
    this._pin.state(this._value_to_state(value));
};

/**
 * Turns the device on.
 **/
OutputDevice.prototype.on = function() {
    this._pin._stop_blink();
    this._write(true);
};

/**
 * Turns the device off.
 */
OutputDevice.prototype.off = function() {
    this._pin._stop_blink();
    this._write(false);
};

/**
 *
 * This property can be set after construction; be warned that changing it
 * will invert {@link OutputDevice#value|value} (i.e. changing this property doesn't change
 * the device's pin state - it just changes how that state is interpreted).
 *
 * @param {boolean} [value] - When ``true``, the {@link OutputDevice#value|value} property is ``true`` when the device's
 * {@link OutputDevice#pin|pin} is high. When ``false`` the {@link OutputDevice#value|value} property is
 * ``true`` when the device's pin is low (i.e. the value is inverted).
 *
 */
OutputDevice.prototype.active_high = function(value) {
    if (value === undefined) {
        return this._active_state;
    }
    this._active_state = value;
    this._inactive_state = !value;
};

/**
 *
 * @param {boolean | float} [value] - When supplied the device output is changed to the value.
 * @returns {boolean | float} - When value is undefined, the function returns the current value of the device.
 */
OutputDevice.prototype.value = function(value) {
    if (value === undefined) {
        return this._read();
    }
    this._pin._stop_blink();
    this._write(value);
};

/**
 * Reverse the state of the device. If it's on, turn it off; if it's off, turn it on.
 */
OutputDevice.prototype.toggle = function() {
    const that = this;
    this._lock.readLock((release) => {
        if (that.is_active()) {
            that.off();
        } else {
            that.on();
        }
        release();
    });
};
