const Device = require ('./Device.js').Device;
const inherit = require('../tools.js').inherit;
const wiringpi = require('../pins/wiringpi.js').WiringPiPin;
const ReadWriteLock = require('rwlock');
const exc = require('../exc.js');

const _PINS = new Set();
const _PINS_LOCK = new ReadWriteLock(); //Yes, this needs to be re-entrant

/*    /*if(name == undefined) {
 name=process.env.GPIOZERO_PIN_FACTORY;
 }
 var group = 'gpiozero_pin_factories'
 if (name == undefined) {
 /*# If no factory is explicitly specified, try various names in
 # "preferred" order. Note that in this case we only select from
 # gpiozero distribution so without explicitly specifying a name (via
 # the environment) it's impossible to auto-select a factory from
 # outside the base distribution
 #
 # We prefer RPi.GPIO here as it supports PWM, and all Pi revisions.  If
 # no third-party libraries are available, however, we fall back to a
 # pure Python implementation which supports platforms like PyPy
 dist = pkg_resources.get_distribution('gpiozero')
 for name in ('RPiGPIOPin', 'RPIOPin', 'PiGPIOPin', 'NativePin'):
 try:
 return pkg_resources.load_entry_point(dist, group, name)
 except ImportError:
 pass
 raise BadPinFactory('Unable to locate any default pin factory!')
 } else {
 for factory in pkg_resources.iter_entry_points(group, name):
 return factory.load()
 raise BadPinFactory('Unable to locate pin factory "%s"' % name)
 }*/

//}


//var pin_factory = _default_pin_factory();

/**
 * Represents a generic GPIO device and provides the services common to all single-pin GPIO devices
 * (like ensuring two GPIO devices do no share a {@link Pin}).
 *
 * @param {(int | Pin)} pin - The GPIO pin (in BCM numbering) or a instance of {@link Pin} that the device is connected to.
 *
 * @throws {GPIOPinMissing} - If pin is 'undefined'
 * @throws {GPIOPinInUse} - If the pin is already in use by another device
 * @class
 * @augments Device
 */
function GPIODevice(pin) {
    Device.call(this);
    this._pin = undefined;
    if (pin === undefined) {
        throw new exc.GPIOPinMissing('No pin given');
    }
    if (Number.isInteger(pin)) {
        pin = new wiringpi(pin);
    }

    _PINS_LOCK.readLock((release) => {
        if (_PINS.has(pin)) {
            throw new exc.GPIOPinInUse('pin ' + pin.toString() + ' is already in use by another gpiozero object');
        }
        _PINS.add(pin);
        release();
    });

    this._pin = pin;
    this._active_state = true;
    this._inactive_state = false;
}

GPIODevice.prototype = inherit(Device.prototype);
GPIODevice.prototype.constructor = GPIODevice;

/**
 * Close the device and remove the pin allocation allowing it to be reused.
 */
GPIODevice.prototype.close = function() {
    const that = this;
    _PINS_LOCK.readLock((release) => {
        const pin = that._pin;
        if (_PINS.has(pin)) {
            _PINS.delete(pin);
            that._pin.close();
        }
        that._pin = undefined;
        release();
    });
};

/**
 *
 * @returns {boolean} - Is ``true`` is no pin is allocated.
 */
GPIODevice.prototype.closed = function() {
    return (this._pin === undefined);
};

/**
 *
 * @returns {undefined|*|int|Pin} - The {@link Pin} that the device is connected to. This will be ``undefined``
 * if the device has been closed (see the :meth:`close` method). When dealing with GPIO pins, query ``pin.number``
 * to discover the GPIO pin (in BCM numbering) that the device is connected to.
 */
GPIODevice.prototype.pin = function() {
    return this._pin;
};

/**
 * @returns {int|Boolean} - Current value of the pin.
 */
GPIODevice.prototype.value = function() {
    return this._read();
};

/**
 * Internal method to read the pin value.
 *
 * @private
 */
GPIODevice.prototype._read = function() {
    this._check_open();
    return this._state_to_value(this.pin().state());
};

/**
 * Internal method to apply active state high and convert the actual value to a logical value.
 *
 * @param {boolean|float} state - The value to be converted.
 * @returns {boolean} - The logical value of the pin.
 * @private
 */
GPIODevice.prototype._state_to_value = function(state) {
    return Boolean(state === this._active_state);
};
/**
 *
 * @returns {boolean} - Is true is the device value is currently set.
 */
GPIODevice.prototype.is_active = function() {
    return Boolean(this.value());
};

/**
 *
 * @returns {string} - Description of the device.
 */
GPIODevice.prototype.toString = function() {
    return "<gpiozero.GPIODevice object on pin " + this._pin._number.toString() + ", is_active=" + this.is_active() + ">";
};

exports.GPIODevice = GPIODevice;