const exc = require('../exc.js');

/**
 *  Represents a single device of any type; GPIO-based, SPI-based, I2C-based,
 *  etc. This is the base class of the device hierarchy. It defines the
 *  basic services applicable to all devices (specifically the {@link Device#is_active|is_active}
 *  property, the {@link Device#value|value} property, and the {@link Device#close|close} method).
 *
 * @class
 */
function Device() {
// eslint-disable-next-line no-empty-function
}
/**
 * Returns a value representing the device's state. Frequently, this is a
 * boolean value, or a number between 0 and 1 but some devices use larger
 * ranges (e.g. -1 to +1) and composite devices usually use tuples to
 * return the states of all their subordinate components.
 */
Device.prototype.value = function() {

    throw new exc.NotImplementedError();
};

/**
 *  Returns `true` if the device is currently active and `false`
 *  otherwise. This property is usually derived from `value` attribute. Unlike
 *  `value` attribute, this is *always* a boolean.
 */
Device.prototype.is_active = function() {

    return (this.value !== undefined);
};
/**
 * Internal method to check if device is available.
 *
 * @private
 */
Device.prototype._check_open = function() {
    if (this.closed()) {
        throw new exc.DeviceClosed('is closed or uninitialized');
    }
};
/**
 * @abstract
 */
Device.prototype.close = function() {
    return;
};

exports.Device = Device;