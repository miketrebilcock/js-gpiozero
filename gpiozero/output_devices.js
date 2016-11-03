var Lock = require('rwlock'),
    GPIODevice = require('./devices.js').GPIODevice,
    exc = require('./exc.js');

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

exports.PWMOutputDevice = PWMOutputDevice;

function PWMOutputDevice (pin, active_high, initial_value, frequency) {
    /*
    Generic output device configured for pulse-width modulation (PWM).

    :param int pin:
        The GPIO pin which the device is attached to. See :doc:`notes` for
        valid pin numbers.

    :param bool active_high:
        If ``True`` (the default), the :meth:`on` method will set the GPIO to
        HIGH. If ``False``, the :meth:`on` method will set the GPIO to LOW (the
        :meth:`off` method always does the opposite).

    :param bool initial_value:
        If ``0`` (the default), the device's duty cycle will be 0 initially.
        Other values between 0 and 1 can be specified as an initial duty cycle.
        Note that ``None`` cannot be specified (unlike the parent class) as
        there is no way to tell PWM not to alter the state of the pin.

    :param int frequency:
        The frequency (in Hz) of pulses emitted to drive the device. Defaults
        to 100Hz.
    */

    if (initial_value != undefined) {
        if (initial_value<0 || initial_value>1) {
            throw new exc.OutputDeviceBadValue("initial_value must be between 0 and 1, actual=:"+initial_value);
        }
    }

    OutputDevice.call(this, pin, active_high, initial_value);
    
    try {
        this._pin.frequency (frequency == undefined ? 100: frequency);
        this.value (initial_value == undefined ? 0 : initial_value);
    }
    catch (e) {
        this.close();
        throw e;
    }
}

PWMOutputDevice.prototype = inherit(OutputDevice.prototype);
PWMOutputDevice.prototype.constructor = PWMOutputDevice;

PWMOutputDevice.prototype.value = function (value) {
    /*
        The duty cycle of the PWM device. 0.0 is off, 1.0 is fully on. Values
        in between may be specified for varying levels of power in the device.
    */
    if(value == undefined) {
        return this._read();
    }
    this._pin._stop_blink();
    this._write(value);
}

PWMOutputDevice.prototype._read = function () {
    this._check_open();
    if (this.active_high) {
        return this._pin.state();
    } else {
        return 1 - this._pin.state();
    }
}

PWMOutputDevice.prototype._write = function (value) {
    if (!this.active_high) {
        value = 1 - value;
    }
    if (value<0 || value >1) {
        throw new exc.OutputDeviceBadValue("PWM value must be between 0 and 1");
    }
    this._check_open();
    this._pin.state(value);
}

PWMOutputDevice.prototype.frequency = function (value) {
    if (value == undefined) {
        return this._pin.frequency();
    }
    this._pin.frequency(value);
}

PWMOutputDevice.prototype.is_active = function() {
    return this.value() != 0;
}

PWMOutputDevice.prototype.on  = function () {
    this._pin._stop_blink();
    this._write(1);
}

PWMOutputDevice.prototype.off  = function () {
    this._pin._stop_blink();
    this._write(0);
}

PWMOutputDevice.prototype.toggle = function () {
    /*
    Toggle the state of the device. If the device is currently off
    (:attr:`value` is 0.0), this changes it to "fully" on (:attr:`value` is
    1.0).  If the device has a duty cycle (:attr:`value`) of 0.1, this will
    toggle it to 0.9, and so on.
    */
    this._pin._stop_blink();
    var newValue = 1 - this.value();
    this.value(newValue);
}

/*
    
 
/*
class PWMOutputDevice(OutputDevice):
    def __init__(self, pin=None, active_high=True, initial_value=0, frequency=100):
        self._blink_thread = None
        if not 0 <= initial_value <= 1:
            raise OutputDeviceBadValue("initial_value must be between 0 and 1")
        super(PWMOutputDevice, self).__init__(pin, active_high)
        try:
            # XXX need a way of setting these together
            self.pin.frequency = frequency
            self.value = initial_value
        except:
            self.close()
            raise

    def close(self):
        self._stop_blink()
        try:
            self.pin.frequency = None
        except AttributeError:
            # If the pin's already None, ignore the exception
            pass
        super(PWMOutputDevice, self).close()

    def _read(self):
        self._check_open()
        if self.active_high:
            return self.pin.state
        else:
            return 1 - self.pin.state

    def _write(self, value):
        if not self.active_high:
            value = 1 - value
        if not 0 <= value <= 1:
            raise OutputDeviceBadValue("PWM value must be between 0 and 1")
        try:
            self.pin.state = value
        except AttributeError:
            self._check_open()
            raise

    @property
    def value(self):
        """
        The duty cycle of the PWM device. 0.0 is off, 1.0 is fully on. Values
        in between may be specified for varying levels of power in the device.
        """
        return self._read()

    @value.setter
    def value(self, value):
        self._stop_blink()
        self._write(value)

    def on(self):
        self._stop_blink()
        self._write(1)

    def off(self):
        self._stop_blink()
        self._write(0)

    def toggle(self):
        """
        Toggle the state of the device. If the device is currently off
        (:attr:`value` is 0.0), this changes it to "fully" on (:attr:`value` is
        1.0).  If the device has a duty cycle (:attr:`value`) of 0.1, this will
        toggle it to 0.9, and so on.
        """
        self._stop_blink()
        self.value = 1 - self.value

    @property
    def is_active(self):
        """
        Returns ``True`` if the device is currently active (:attr:`value` is
        non-zero) and ``False`` otherwise.
        """
        return self.value != 0

    @property
    def frequency(self):
        """
        The frequency of the pulses used with the PWM device, in Hz. The
        default is 100Hz.
        """
        return self.pin.frequency

    @frequency.setter
    def frequency(self, value):
        self.pin.frequency = value

    def blink(
            self, on_time=1, off_time=1, fade_in_time=0, fade_out_time=0,
            n=None, background=True):
        """
        Make the device turn on and off repeatedly.

        :param float on_time:
            Number of seconds on. Defaults to 1 second.

        :param float off_time:
            Number of seconds off. Defaults to 1 second.

        :param float fade_in_time:
            Number of seconds to spend fading in. Defaults to 0.

        :param float fade_out_time:
            Number of seconds to spend fading out. Defaults to 0.

        :param int n:
            Number of times to blink; ``None`` (the default) means forever.

        :param bool background:
            If ``True`` (the default), start a background thread to continue
            blinking and return immediately. If ``False``, only return when the
            blink is finished (warning: the default value of *n* will result in
            this method never returning).
        """
        self._stop_blink()
        self._blink_thread = GPIOThread(
            target=self._blink_device,
            args=(on_time, off_time, fade_in_time, fade_out_time, n)
        )
        self._blink_thread.start()
        if not background:
            self._blink_thread.join()
            self._blink_thread = None

    def pulse(self, fade_in_time=1, fade_out_time=1, n=None, background=True):
        """
        Make the device fade in and out repeatedly.

        :param float fade_in_time:
            Number of seconds to spend fading in. Defaults to 1.

        :param float fade_out_time:
            Number of seconds to spend fading out. Defaults to 1.

        :param int n:
            Number of times to blink; ``None`` (the default) means forever.

        :param bool background:
            If ``True`` (the default), start a background thread to continue
            blinking and return immediately. If ``False``, only return when the
            blink is finished (warning: the default value of *n* will result in
            this method never returning).
        """
        on_time = off_time = 0
        self.blink(
            on_time, off_time, fade_in_time, fade_out_time, n, background
        )

    def _stop_blink(self):
        if self._blink_thread:
            self._blink_thread.stop()
            self._blink_thread = None

    def _blink_device(
            self, on_time, off_time, fade_in_time, fade_out_time, n, fps=50):
        sequence = []
        if fade_in_time > 0:
            sequence += [
                (i * (1 / fps) / fade_in_time, 1 / fps)
                for i in range(int(fps * fade_in_time))
                ]
        sequence.append((1, on_time))
        if fade_out_time > 0:
            sequence += [
                (1 - (i * (1 / fps) / fade_out_time), 1 / fps)
                for i in range(int(fps * fade_out_time))
                ]
        sequence.append((0, off_time))
        sequence = (
                cycle(sequence) if n is None else
                chain.from_iterable(repeat(sequence, n))
                )
        for value, delay in sequence:
            self._write(value)
            if self._blink_thread.stopping.wait(delay):
                break




*/