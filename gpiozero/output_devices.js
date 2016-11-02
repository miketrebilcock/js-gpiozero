var Lock = require('rwlock'),
    GPIODevice = require('./devices.js').GPIODevice;

exports.OutputDevice = OutputDevice;

function OutputDevice (pin, active_high, initial_value){
    /*
    Represents a generic GPIO output device.

    This class extends :class:`GPIODevice` to add facilities common to GPIO
    output devices: an :meth:`on` method to switch the device on, a
    corresponding :meth:`off` method, and a :meth:`toggle` method.

    :param int pin:
        The GPIO pin (in BCM numbering) that the device is connected to. If
        this is ``None`` a :exc:`GPIOPinMissing` will be raised.

    :param bool active_high:
        If ``True`` (the default), the :meth:`on` method will set the GPIO to
        HIGH. If ``False``, the :meth:`on` method will set the GPIO to LOW (the
        :meth:`off` method always does the opposite).

    :param bool initial_value:
        If ``False`` (the default), the device will be off initially.  If
        ``None``, the device will be left in whatever state the pin is found in
        when configured for output (warning: this can be on).  If ``True``, the
        device will be switched on initially.*/

    GPIODevice.call(this, pin);
    this._lock = new Lock();
    this.active_high( (active_high == undefined) ? true : active_high );
    if (initial_value == undefined) {        
        this._pin.pin_function('output');
    } else {
        this._pin.output_with_state(this._value_to_state(initial_value));
    } 
}

function inherit(proto) {
  function F() {}
  F.prototype = proto;
  return new F;
}


OutputDevice.prototype = inherit(GPIODevice.prototype);
OutputDevice.prototype.constructor = OutputDevice;

OutputDevice.prototype._value_to_state = function (value) {
    return (value)?this._active_state : this._inactive_state;
}

OutputDevice.prototype._write = function (value) {    
    this._check_open(this);
    this._pin.state (this._value_to_state(value));
}

OutputDevice.prototype.on = function () {
    /*
    Turns the device on.
    */
    this._pin._stop_blink();
    this._write(true);
}

OutputDevice.prototype.off = function() {
    /*
    Turns the device off.
    */
    this._pin._stop_blink();
    this._write(false);
}

OutputDevice.prototype.active_high = function  active_high(value) {
    /*
    When ``True``, the :attr:`value` property is ``True`` when the device's
    :attr:`pin` is high. When ``False`` the :attr:`value` property is
    ``True`` when the device's pin is low (i.e. the value is inverted).

    This property can be set after construction; be warned that changing it
    will invert :attr:`value` (i.e. changing this property doesn't change
    the device's pin state - it just changes how that state is
    interpreted).
    */
    if(value == undefined)
    {
        return _active_state;
    }
    this._active_state = value ? true : false;
    this._inactive_state = value ? false : true;
}

OutputDevice.prototype.value = function (value) {
    if (value == undefined) {
        return this._read();
    }
    this._pin._stop_blink();
    this._write(value);
}

OutputDevice.prototype.toggle = function () {
    /*
    Reverse the state of the device. If it's on, turn it off; if it's off,
        turn it on.
    */
    var that = this;
    this._lock.readLock(function (release) {
        if (that.is_active()) {
            that.off();
        } else {
            that.on();
        }
        release();
    });
}

exports.DigitalOutputDevice = DigitalOutputDevice;

function DigitalOutputDevice (pin, active_high, initial_value) {
    OutputDevice.call(this, pin, active_high, initial_value);    
}

DigitalOutputDevice.prototype = inherit(OutputDevice.prototype);
DigitalOutputDevice.prototype.constructor = DigitalOutputDevice;

DigitalOutputDevice.prototype.blink = function (on_time, off_time, n) {
    /*
    Make the device turn on and off repeatedly.

    :param float on_time:
        Number of seconds on. Defaults to 1 second.

    :param float off_time:
        Number of seconds off. Defaults to 1 second.

    :param int n:
        Number of times to blink; ``None`` (the default) means forever.

    :param bool background:
        If ``True`` (the default), start a background thread to continue
        blinking and return immediately. If ``False``, only return when the
        blink is finished (warning: the default value of *n* will result in
        this method never returning).
    */
    this._pin.blink(on_time,off_time, n);
}

exports.LED = LED;

function LED(pin, active_high, initial_value){ 
/*
    Extends :class:`DigitalOutputDevice` and represents a light emitting diode
    (LED).

    Connect the cathode (short leg, flat side) of the LED to a ground pin;
    connect the anode (longer leg) to a limiting resistor; connect the other
    side of the limiting resistor to a GPIO pin (the limiting resistor can be
    placed either side of the LED).

    The following example will light the LED::

        from gpiozero import LED

        led = LED(17)
        led.on()

    :param int pin:
        The GPIO pin which the LED is attached to. See :ref:`pin_numbering` for
        valid pin numbers.

    :param bool active_high:
        If ``True`` (the default), the LED will operate normally with the
        circuit described above. If ``False`` you should wire the cathode to
        the GPIO pin, and the anode to a 3V3 pin (via a limiting resistor).

    :param bool initial_value:
        If ``False`` (the default), the LED will be off initially.  If
        ``None``, the LED will be left in whatever state the pin is found in
        when configured for output (warning: this can be on).  If ``True``, the
        LED will be switched on initially.
    """
    pass
*/
    DigitalOutputDevice.call(this, pin, active_high, initial_value);
}

LED.prototype = inherit(DigitalOutputDevice.prototype);
LED.prototype.constructor = LED;

LED.prototype.is_lit = function () {
    return this.is_active();
}


exports.Buzzer = Buzzer;

function Buzzer (pin, active_high, initial_value){ 
/*
Extends :class:`DigitalOutputDevice` and represents a digital buzzer
    component.

    Connect the cathode (negative pin) of the buzzer to a ground pin; connect
    the other side to any GPIO pin.

    The following example will sound the buzzer::

        from gpiozero import Buzzer

        bz = Buzzer(3)
        bz.on()

    :param int pin:
        The GPIO pin which the buzzer is attached to. See :ref:`pin_numbering`
        for valid pin numbers.

    :param bool active_high:
        If ``True`` (the default), the buzzer will operate normally with the
        circuit described above. If ``False`` you should wire the cathode to
        the GPIO pin, and the anode to a 3V3 pin.

    :param bool initial_value:
        If ``False`` (the default), the buzzer will be silent initially.  If
        ``None``, the buzzer will be left in whatever state the pin is found in
        when configured for output (warning: this can be on).  If ``True``, the
        buzzer will be switched on initially.
*/
    DigitalOutputDevice.call(this, pin, active_high, initial_value);
}

Buzzer.prototype = inherit (DigitalOutputDevice.prototype);
Buzzer.prototype.constructor = Buzzer;

Buzzer.prototype.beep = function(){
    return this.blink();
}