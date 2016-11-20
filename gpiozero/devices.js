

var ReadWriteLock = require('rwlock'),
    exc = require('./exc.js'),
    wiringpi = require('./pins/wiringpi.js').WiringPiPin;

_PINS = new Set();
_PINS_LOCK =  new ReadWriteLock();//Yes, this needs to be re-entrant


function inherit(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

function _default_pin_factory(name) {
    /*if(name == undefined) {
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

}


pin_factory = _default_pin_factory();

function Device () {
    /*
    Represents a single device of any type; GPIO-based, SPI-based, I2C-based,
    etc. This is the base class of the device hierarchy. It defines the
    basic services applicable to all devices (specifically thhe :attr:`is_active`
    property, the :attr:`value` property, and the :meth:`close` method).
    */ 
}

Device.prototype.value = function () {
    /*Returns a value representing the device's state. Frequently, this is a
    boolean value, or a number between 0 and 1 but some devices use larger
    ranges (e.g. -1 to +1) and composite devices usually use tuples to
    return the states of all their subordinate components.
    */
    throw NotImplementedError();
};

Device.prototype.is_active = function() {
    /*
    Returns ``True`` if the device is currently active and ``False``
    otherwise. This property is usually derived from :attr:`value`. Unlike
    :attr:`value`, this is *always* a boolean.
    */
    return (this.value!=nothing);
};

Device.prototype._check_open = function () {
    if (this.closed()) {          
        throw new exc.DeviceClosed('is closed or uninitialized') ;
    }  
};      


exports.Device = Device;


function GPIODevice (pin) {
    /*  self._pin must be set before any possible exceptions can be raised
    because it's accessed in __del__. However, it mustn't be given the
    value of pin until we've verified that it isn't already allocated*/
    Device.call(this);
    this._pin = undefined;
    if (pin === undefined){
        throw new exc.GPIOPinMissing('No pin given');
    }
    if (Number.isInteger(pin)) {
        pin = new wiringpi(pin);
    }

    _PINS_LOCK.readLock(function (release) {
        if(_PINS.has(pin)) {            
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

GPIODevice.prototype.close =  function () { 
    var that = this;
    _PINS_LOCK.readLock(function (release) {        
        pin = that._pin;
        if(_PINS.has(pin)) {         
            _PINS.delete(pin);
            that._pin.close();
        }        
        that._pin = undefined;           
        release();
    });
};

GPIODevice.prototype.closed = function () {    
    return (this._pin === undefined);
};

GPIODevice.prototype.pin = function () { 
    /*
    The :class:`Pin` that the device is connected to. This will be ``None``
    if the device has been closed (see the :meth:`close` method). When
    dealing with GPIO pins, query ``pin.number`` to discover the GPIO
    pin (in BCM numbering) that the device is connected to.
    */
    return this._pin;
};

GPIODevice.prototype.value = function () { 
    return this._read();
};

GPIODevice.prototype._read = function () {
    this._check_open();
    return this._state_to_value(this.pin().state());
};

GPIODevice.prototype._state_to_value = function (state) {
        return Boolean(state == this._active_state);
};

GPIODevice.prototype.is_active = function () { 
    /*
    The :class:`Pin` that the device is connected to. This will be ``None``
    if the device has been closed (see the :meth:`close` method). When
    dealing with GPIO pins, query ``pin.number`` to discover the GPIO
    pin (in BCM numbering) that the device is connected to.
    */
    return Boolean(this.value());
};



GPIODevice.prototype.toString = function () { 
    /*
    The :class:`Pin` that the device is connected to. This will be ``None``
    if the device has been closed (see the :meth:`close` method). When
    dealing with GPIO pins, query ``pin.number`` to discover the GPIO
    pin (in BCM numbering) that the device is connected to.
    */    
    return "<gpiozero.GPIODevice object on pin "+ this._pin._number.toString() +", is_active="+ this.is_active()+">";
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
