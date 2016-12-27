const ReadWriteLock = require('rwlock');
const exc = require('./exc.js');
const wiringpi = require('./pins/wiringpi.js').WiringPiPin;
const inherit = require('./tools.js').inherit;

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
 *  Represents a single device of any type; GPIO-based, SPI-based, I2C-based,
 *  etc. This is the base class of the device hierarchy. It defines the
 *  basic services applicable to all devices (specifically the {@link Device#is_active|is_active}
 *  property, the {@link Device#value|value} property, and the {@link Device#close|close} method).
 * @constructor
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
 *  Returns ``True`` if the device is currently active and ``False``
 *  otherwise. This property is usually derived from :attr:`value`. Unlike
 *  :attr:`value`, this is *always* a boolean.
 */
Device.prototype.is_active = function() {

    return (this.value !== undefined);
};

Device.prototype._check_open = function() {
    if (this.closed()) {
        throw new exc.DeviceClosed('is closed or uninitialized');
    }
};

Device.prototype.close = function() {
    return;
};

exports.Device = Device;

/**
 *  Represents a device composed of multiple devices
    like simple HATs, H-bridge motor controllers, robots composed of multiple
    motors, etc.

    The constructor accepts subordinate devices as positional or keyword
    arguments.  Positional arguments form unnamed devices accessed via the
    (@link CompositeDevice#all|all) attribute, while keyword arguments are added to the device
    as named attributes.
 * @param {[array]} devices
 * @param {[array]} kwdevices
 * @extends Device
 */
function CompositeDevice(devices, kwdevices) {
    this._all = [];
    this._namedtuple = [];
    let i;
    if(devices !== undefined) {
        for (i = 0; i < devices.length; i++) {
            this[i] = devices[i];
            this._namedtuple.push('_' + i);
            this._all.push(devices[i]);
        }
    }

    if(kwdevices !== undefined) {
        for (i = 0; i < kwdevices.length; i++) {
            const device_name = kwdevices[i][0];
            this[device_name] = kwdevices[i][1];
            this._namedtuple.push(kwdevices[i][0]);
            this._all.push(kwdevices[i][1]);
        }
    }
    Device.call(this);
}

CompositeDevice.prototype = inherit(Device.prototype);
CompositeDevice.prototype.constructor = CompositeDevice;

CompositeDevice.prototype.length = function() {
    return this._all.length;
};

CompositeDevice.prototype.namedtuple = function() {
    return this._namedtuple;
};

CompositeDevice.prototype.value = function () {
    let i;
    const result = [];
    for (i = 0; i < this._all.length; i++) {
        result[i] = this._all[i].value();
    }
    return result;
};

CompositeDevice.prototype.is_active = function () {
    let i;
    for (i = 0; i < this._all.length; i++) {
        if (this._all[i].value()) {
            return true;
        }
    }
    return false;
};

CompositeDevice.prototype.close = function () {
    this._all.forEach((device) => {
        device.close();
    });
};

exports.CompositeDevice = CompositeDevice;
/*
class CompositeDevice(Device):

    :param list _order:
        If specified, this is the order of named items specified by keyword
        arguments (to ensure that the :attr:`value` tuple is constructed with a
        specific order). All keyword arguments *must* be included in the
        collection. If omitted, an alphabetically sorted order will be selected
        for keyword arguments.
    """
    def __init__(self, *args, **kwargs):
        self._all = ()
        self._named = frozendict({})
        self._namedtuple = None
        self._order = kwargs.pop('_order', None)
        if self._order is None:
            self._order = sorted(kwargs.keys())
        else:
            for missing_name in set(kwargs.keys()) - set(self._order):
                raise CompositeDeviceBadOrder('%s missing from _order' % missing_name)
        self._order = tuple(self._order)
        super(CompositeDevice, self).__init__()
        for name in set(self._order) & set(dir(self)):
            raise CompositeDeviceBadName('%s is a reserved name' % name)
        self._all = args + tuple(kwargs[v] for v in self._order)
        for dev in self._all:
            if not isinstance(dev, Device):
                raise CompositeDeviceBadDevice("%s doesn't inherit from Device" % dev)
        self._named = frozendict(kwargs)
        self._namedtuple = namedtuple('%sValue' % self.__class__.__name__, chain(
            (str(i) for i in range(len(args))), self._order),
            rename=True)

    def __getattr__(self, name):
        # if _named doesn't exist yet, pretend it's an empty dict
        if name == '_named':
            return frozendict({})
        try:
            return self._named[name]
        except KeyError:
            raise AttributeError("no such attribute %s" % name)

    def __setattr__(self, name, value):
        # make named components read-only properties
        if name in self._named:
            raise AttributeError("can't set attribute %s" % name)
        return super(CompositeDevice, self).__setattr__(name, value)

    def __repr__(self):
        try:
            self._check_open()
            return "<gpiozero.%s object containing %d devices: %s and %d unnamed>" % (
                    self.__class__.__name__,
                    len(self), ','.join(self._order),
                    len(self) - len(self._named)
                    )
        except DeviceClosed:
            return "<gpiozero.%s object closed>" % (self.__class__.__name__)

    def __getitem__(self, index):
        return self._all[index]

    def __iter__(self):
        return iter(self._all)

    @property
    def all(self):
        # XXX Deprecate this in favour of using the instance as a container
        return self._all

    def close(self):
        if self._all:
            for device in self._all:
                device.close()

    @property
    def closed(self):
        return all(device.closed for device in self)

    @property
    def namedtuple(self):
        return self._namedtuple

    @property
    def value(self):
        return self.namedtuple(*(device.value for device in self))

    @property
    def is_active(self):
        return any(self.value)

 */

/**
 * Represents a generic GPIO device and provides
 * the services common to all single-pin GPIO devices (like ensuring two
 * GPIO devices do no share a {@link Pin}).
 * @param {(int | Pin)} pin
 * The GPIO pin (in BCM numbering) or a instance of {@link Pin} that the device is connected to.
 *
 * @throws {GPIOPinMissing}
 * If pin is 'undefined'
 * @throws {GPIOPinInUse}
 * If the pin is already in use by another device
 * @constructor
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

GPIODevice.prototype.closed = function() {
    return (this._pin === undefined);
};

GPIODevice.prototype.pin = function() {
    /*
    The :class:`Pin` that the device is connected to. This will be ``None``
    if the device has been closed (see the :meth:`close` method). When
    dealing with GPIO pins, query ``pin.number`` to discover the GPIO
    pin (in BCM numbering) that the device is connected to.
    */
    return this._pin;
};

GPIODevice.prototype.value = function() {
    return this._read();
};

GPIODevice.prototype._read = function() {
    this._check_open();
    return this._state_to_value(this.pin().state());
};

GPIODevice.prototype._state_to_value = function(state) {
    return Boolean(state === this._active_state);
};

GPIODevice.prototype.is_active = function() {
    /*
    The :class:`Pin` that the device is connected to. This will be ``None``
    if the device has been closed (see the :meth:`close` method). When
    dealing with GPIO pins, query ``pin.number`` to discover the GPIO
    pin (in BCM numbering) that the device is connected to.
    */
    return Boolean(this.value());
};



GPIODevice.prototype.toString = function() {
    /*
    The :class:`Pin` that the device is connected to. This will be ``None``
    if the device has been closed (see the :meth:`close` method). When
    dealing with GPIO pins, query ``pin.number`` to discover the GPIO
    pin (in BCM numbering) that the device is connected to.
    */
    return "<gpiozero.GPIODevice object on pin " + this._pin._number.toString() + ", is_active=" + this.is_active() + ">";
};

exports.GPIODevice = GPIODevice;

/*
    def _state_to_value(self, state):
        return bool(state == self._active_state)

    def _read(self):
        try:
            return self._state_to_value(self.pin.state)
        except (AttributeError, TypeError):
            self._check_open()
            raise


    def _check_open(self):
        try:
            super(GPIODevice, self)._check_open()
        except DeviceClosed as e:
            # For backwards compatibility; GPIODeviceClosed is deprecated
            raise GPIODeviceClosed(str(e))

    @property
    def pin(self):
        """
        The :class:`Pin` that the device is connected to. This will be ``None``
        if the device has been closed (see the :meth:`close` method). When
        dealing with GPIO pins, query ``pin.number`` to discover the GPIO
        pin (in BCM numbering) that the device is connected to.
        """
        return self._pin

    @property
    def value(self):
        return self._read()

    def __repr__(self):
        try:
            return "<gpiozero.%s object on pin %r, is_active=%s>" % (
                self.__class__.__name__, self.pin, self.is_active)
        except DeviceClosed:
            return "<gpiozero.%s object closed>" % self.__class__.__name__
*/