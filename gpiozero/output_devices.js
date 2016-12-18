var Lock = require('rwlock'),
    GPIODevice = require('./devices.js').GPIODevice,
    Device = require('./devices.js').Device,
    exc = require('./exc.js'),
    inherit = require ('./tools.js').inherit;

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
    this.active_high( (active_high === undefined) ? true : active_high );
    if (initial_value === undefined) {        
        this._pin.pin_function('output');
    } else {
        this._pin.output_with_state(this._value_to_state(initial_value));
    } 
}


OutputDevice.prototype = inherit(GPIODevice.prototype);
OutputDevice.prototype.constructor = OutputDevice;

OutputDevice.prototype._value_to_state = function (value) {
    return (value)?this._active_state : this._inactive_state;
};

OutputDevice.prototype._write = function (value) {    
    this._check_open(this);
    this._pin.state (this._value_to_state(value));
};

OutputDevice.prototype.on = function () {
    /*
    Turns the device on.
    */
    this._pin._stop_blink();
    this._write(true);
};

OutputDevice.prototype.off = function() {
    /*
    Turns the device off.
    */
    this._pin._stop_blink();
    this._write(false);
};

OutputDevice.prototype.active_high = function (value) {
    /*
    When ``True``, the :attr:`value` property is ``True`` when the device's
    :attr:`pin` is high. When ``False`` the :attr:`value` property is
    ``True`` when the device's pin is low (i.e. the value is inverted).

    This property can be set after construction; be warned that changing it
    will invert :attr:`value` (i.e. changing this property doesn't change
    the device's pin state - it just changes how that state is
    interpreted).
    */
    if(value === undefined)
    {
        return this._active_state;
    }
    this._active_state = value ? true : false;
    this._inactive_state = value ? false : true;
};

OutputDevice.prototype.value = function (value) {
    if (value === undefined) {
        return this._read();
    }
    this._pin._stop_blink();
    this._write(value);
};

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
};

exports.DigitalOutputDevice = DigitalOutputDevice;

function DigitalOutputDevice (pin, active_high, initial_value) {
    OutputDevice.call(this, pin, active_high, initial_value);    
}

DigitalOutputDevice.prototype = inherit(OutputDevice.prototype);
DigitalOutputDevice.prototype.constructor = DigitalOutputDevice;

DigitalOutputDevice.prototype.blink = function (on_time, off_time, n, callback) {
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
    this._pin.blink(on_time,off_time, n, callback);
};

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
};


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
    this.blink();
};

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

    if (initial_value !== undefined) {
        if (initial_value<0 || initial_value>1) {
            throw new exc.OutputDeviceBadValue("initial_value must be between 0 and 1, actual=:"+initial_value);
        }
    }

    OutputDevice.call(this, pin, active_high, initial_value);
    
    try {
        this._pin.frequency (frequency === undefined ? 100: frequency);
        this.value (initial_value === undefined ? 0 : initial_value);
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
    if(value === undefined) {
        return this._read();
    }
    this._pin._stop_blink();
    this._write(value);
};

PWMOutputDevice.prototype._read = function () {
    this._check_open();
    if (this.active_high()) {
        return this._pin.state();
    } else {
        return 1 - this._pin.state();
    }
};

PWMOutputDevice.prototype._write = function (value) {
    if (!this.active_high()) {
        value = 1 - value;
    }
    if (value<0 || value >1) {
        throw new exc.OutputDeviceBadValue("PWM value must be between 0 and 1");
    }
    this._check_open();
    this._pin.state(value);
};

PWMOutputDevice.prototype.frequency = function (value) {
    if (value === undefined) {
        return this._pin.frequency();
    }
    this._pin.frequency(value);
};

PWMOutputDevice.prototype.is_active = function() {
    return this.value() !== 0;
};

PWMOutputDevice.prototype.on  = function () {
    this._pin._stop_blink();
    this._write(1);
};

PWMOutputDevice.prototype.off  = function () {
    this._pin._stop_blink();
    this._write(0);
};

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
};

PWMOutputDevice.prototype.close = function() {
    this._pin._stop_blink();
    this._pin.frequency (-1);
    OutputDevice.prototype.close.call(this);
};


PWMOutputDevice.prototype.blink = function(on_time, off_time, fade_in_time, fade_out_time, n, callback) {

    /*
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

    */
    this._pin.blink(on_time, off_time, fade_in_time, fade_out_time, n, undefined, callback);
};

PWMOutputDevice.prototype.pulse = function (fade_in_time, fade_out_time, n, callback) {
    /*
    Make the device fade in and out repeatedly.

    :param float fade_in_time:
        Number of seconds to spend fading in. Defaults to 1.

    :param float fade_out_time:
        Number of seconds to spend fading out. Defaults to 1.

    :param int n:
        Number of times to blink; ``None`` (the default) means forever.
    */
    var on_time =0,  off_time = 0;

    this._pin.blink(on_time, off_time, fade_in_time, fade_out_time, n, undefined, callback);
};

exports.Motor = Motor;

function Motor (forward, backward, pwm) {
    /*
    Extends :class:`CompositeDevice` and represents a generic motor
    connected to a bi-directional motor driver circuit (i.e.  an `H-bridge`_).

    Attach an `H-bridge`_ motor controller to your Pi; connect a power source
    (e.g. a battery pack or the 5V pin) to the controller; connect the outputs
    of the controller board to the two terminals of the motor; connect the
    inputs of the controller board to two GPIO pins.

    .. _H-bridge: https://en.wikipedia.org/wiki/H_bridge

    The following code will make the motor turn "forwards"::

        from gpiozero import Motor

        motor = Motor(17, 18)
        motor.forward()

    :param int forward:
        The GPIO pin that the forward input of the motor driver chip is
        connected to.

    :param int backward:
        The GPIO pin that the backward input of the motor driver chip is
        connected to.

    :param bool pwm:
        If ``True`` (the default), construct :class:`PWMOutputDevice`
        instances for the motor controller pins, allowing both direction and
        variable speed control. If ``False``, construct
        :class:`DigitalOutputDevice` instances, allowing only direction
        control.
    */

    if(forward === undefined || backward === undefined) {
        throw new exc.GPIOPinMissing('Forward and Backward pins must be provided');
    }
    if (pwm === undefined || pwm === true){
        this.forward_device = new PWMOutputDevice(forward);
        this.backward_device = new PWMOutputDevice(backward);
        //this._order = ('forward_device', 'backward_device');
    } else {
        this.forward_device = new DigitalOutputDevice(forward);
        this.backward_device = new DigitalOutputDevice(backward);
    }
}


Motor.prototype = inherit(Device.prototype);
Motor.prototype.constructor = Motor;


Motor.prototype.close = function () {
    if (this.forward_device !== undefined) {
        this.forward_device.close();  
        this.forward_device = undefined;  
    }
    
    if (this.backward_device !== undefined) {
        this.backward_device.close();
        this.backward_device = undefined;
    }
    OutputDevice.prototype.close.call(this);
};

Motor.prototype.closed = function () {
    return (this.forward_device === undefined && this.backward_device === undefined);
};

Motor.prototype.value = function (value) {
    if (value === undefined) {
        return this.forward_device.value() - this.backward_device.value();
    }

    if (value >1 || value < -1) {
        throw new exc.OutputDeviceBadValue("Motor value must be between -1 and 1, actual=:" + value);
    }
    
    if (value > 0) {
        this.forward(value);
    } else if (value < 0) {
        this.backward (-value);
    } else {
        this.stop();
    }
};

Motor.prototype.is_active = function () {
    /*
    Returns ``True`` if the motor is currently running and ``False``
    otherwise.
    */
    return this.value() !== 0;
};
    
Motor.prototype.forward = function (speed) {
    /*
    Drive the motor forwards.

    :param float speed:
        The speed at which the motor should turn. Can be any value between
        0 (stopped) and the default 1 (maximum speed) if ``pwm`` was
        ``True`` when the class was constructed (and only 0 or 1 if not).
    */
    if (speed === undefined) {
        speed = 1;
    }

    if (speed < 0 || speed > 1) {
        throw new exc.ValueError('forward speed must be between 0 and 1');
    }

    if (this.forward_device instanceof DigitalOutputDevice && speed != 1 && speed !== 0) {
        throw new exc.ValueError('forward speed must be 0 or 1 with non-PWM Motors');
    }

    this.backward_device.off();
    this.forward_device.value (speed);
};

Motor.prototype.backward = function (speed) {
    /*
    Drive the motor forwards.

    :param float speed:
        The speed at which the motor should turn. Can be any value between
        0 (stopped) and the default 1 (maximum speed) if ``pwm`` was
        ``True`` when the class was constructed (and only 0 or 1 if not).
    */
    if (speed === undefined) {
        speed = 1;
    }

    if (speed < 0 || speed > 1) {
        throw new exc.ValueError('backward speed must be between 0 and 1');
    }

    if (this.backward_device instanceof DigitalOutputDevice && speed != 1 && speed !== 0) {
        throw new exc.ValueError('backward speed must be 0 or 1 with non-PWM Motors');
    }

    this.forward_device.off();
    this.backward_device.value (speed);
};

Motor.prototype.reverse = function () {
    /*
    Reverse the current direction of the motor. If the motor is currently
    idle this does nothing. Otherwise, the motor's direction will be
    reversed at the current speed.
    */
    this.value(-1 * this.value());
};

Motor.prototype.stop = function () {
    /*
    Stop the motor.
    */
    this.forward_device.off();
    this.backward_device.off();
};

exports.PWMLED = PWMLED;

function PWMLED (pin, active_high, initial_value, frequency){
    /*
    Extends :class:`PWMOutputDevice` and represents a light emitting diode
    (LED) with variable brightness.

    A typical configuration of such a device is to connect a GPIO pin to the
    anode (long leg) of the LED, and the cathode (short leg) to ground, with
    an optional resistor to prevent the LED from burning out.

    :param int pin:
        The GPIO pin which the LED is attached to. See :ref:`pin_numbering` for
        valid pin numbers.

    :param bool active_high:
        If ``True`` (the default), the :meth:`on` method will set the GPIO to
        HIGH. If ``False``, the :meth:`on` method will set the GPIO to LOW (the
        :meth:`off` method always does the opposite).

    :param float initial_value:
        If ``0`` (the default), the LED will be off initially. Other values
        between 0 and 1 can be specified as an initial brightness for the LED.
        Note that ``None`` cannot be specified (unlike the parent class) as
        there is no way to tell PWM not to alter the state of the pin.

    :param int frequency:
        The frequency (in Hz) of pulses emitted to drive the LED. Defaults
        to 100Hz.
    */
    PWMOutputDevice.call(this, pin, active_high, initial_value, frequency);
}

PWMLED.prototype = inherit(PWMOutputDevice.prototype);
PWMLED.prototype.constructor = PWMLED;

PWMLED.prototype.is_lit = function () {
    return this.is_active();
};

function RGBLED(red, green, blue, active_high, initial_value, pwm) {
    /*
    Extends :class:`Device` and represents a full color LED component (composed
    of red, green, and blue LEDs).

    Connect the common cathode (longest leg) to a ground pin; connect each of
    the other legs (representing the red, green, and blue anodes) to any GPIO
    pins.  You can either use three limiting resistors (one per anode) or a
    single limiting resistor on the cathode.

    The following code will make the LED purple::

        from gpiozero import RGBLED

        led = RGBLED(2, 3, 4)
        led.color = (1, 0, 1)

    :param int red:
        The GPIO pin that controls the red component of the RGB LED.

    :param int green:
        The GPIO pin that controls the green component of the RGB LED.

    :param int blue:
        The GPIO pin that controls the blue component of the RGB LED.

    :param bool active_high:
        Set to ``True`` (the default) for common cathode RGB LEDs. If you are
        using a common anode RGB LED, set this to ``False``.

    :param tuple initial_value:
        The initial color for the RGB LED. Defaults to black ``(0, 0, 0)``.

    :param bool pwm:
        If ``True`` (the default), construct :class:`PWMLED` instances for
        each component of the RGBLED. If ``False``, construct regular
        :class:`LED` instances, which prevents smooth color graduations.
    */

    this._leds = [];
    if (red === undefined || blue === undefined || green === undefined ) {
        throw new exc.GPIOPinMissing('red, green, and blue pins must be provided');
    }
    pwm = (pwm === undefined ? true : pwm);
    var LEDClass = pwm ? PWMLED : LED;
    Device.call(this);
    this._leds = [new LEDClass(red, active_high), new LEDClass(green, active_high), new LEDClass(blue, active_high)];   
    if (initial_value === undefined) {
        initial_value = [0,0,0];
    }
    this.value (initial_value);   
}

exports.RGBLED = RGBLED;
RGBLED.prototype = inherit(Device.prototype);
RGBLED.prototype.constructor = RGBLED;

RGBLED.prototype.value = function (value) {
    if (value === undefined) {
        /*
        Represents the color of the LED as an RGB 3-tuple of ``(red, green,
        blue)`` where each value is between 0 and 1 if ``pwm`` was ``True``
        when the class was constructed (and only 0 or 1 if not).

        For example, purple would be ``(1, 0, 1)`` and yellow would be ``(1, 1,
        0)``, while orange would be ``(1, 0.5, 0)``.
        */
        return [this.red, this.green, this.blue];
    }
    if (value.length < 3) {
        throw new exc.OutputDeviceBadValue('RGB values must be an array of three components');
    }
    var i;
    for (i=0; i< 3 ; i++) {
        if (value[i]<0 || value[i]>1) {
            throw new exc.OutputDeviceBadValue('each RGB component must be between 0 and 1');
        }
        if (this._leds[i] instanceof LED) {            
            if (value[i] !==0 && value[i] != 1) {
                throw new exc.OutputDeviceBadValue('each RGB color component must be 0 or 1 with non-PWM RGBLEDs');   
            }
        }
    }
   
    for (i=0; i< 3 ; i++) {
        this._leds[i].value(value [i]);
    }
    this.red = this._leds[0].value();
    this.green = this._leds[1].value();
    this.blue = this._leds[2].value();
};

RGBLED.prototype.close = function () {
    var i;
    for (i=0; i< 3 ; i++) {
        if (this._leds[i] !== undefined ) {
            this._leds[i].close();
            this._leds[i] = undefined;
        }
    }   
    this._leds = [];
    Device.prototype.close.call(this);
};

RGBLED.prototype.is_active = function() {
    /*
    Returns ``True`` if the LED is currently active (not black) and
    ``False`` otherwise.
    */
    return (this.value()[0] + this.value()[1] + this.value()[2] > 0 );
};

RGBLED.prototype.on = function () {
    /*
    Turn the LED on. This equivalent to setting the LED color to white
    ``(1, 1, 1)``.
    */
    this.value ([1, 1, 1]);
};

RGBLED.prototype.off = function () {
    /*
    Turn the LED on. This equivalent to setting the LED color to white
    ``(1, 1, 1)``.
    */
    this.value ([0, 0, 0]);
};

RGBLED.prototype.toggle = function() {
    /*
    Toggle the state of the device. If the device is currently off
    (:attr:`value` is ``(0, 0, 0)``), this changes it to "fully" on
    (:attr:`value` is ``(1, 1, 1)``).  If the device has a specific color,
    this method inverts the color.
    */
    var current = this.value();
    this.value ([1 - current[0], 1 - current[1], 1 - current[2]]);
};

RGBLED.prototype.closed = function () {
    return this._leds.length === 0;
};

/*RGBLED.prototype.blink = function(on_time, off_time, fade_in_time, fade_out_time, on_color, off_color, n, callback) {

    /*
    Make the device turn on and off repeatedly.

    :param float on_time:
        Number of seconds on. Defaults to 1 second.

    :param float off_time:
        Number of seconds off. Defaults to 1 second.

    :param float fade_in_time:
        Number of seconds to spend fading in. Defaults to 0.

    :param float fade_out_time:
        Number of seconds to spend fading out. Defaults to 0.

    :param tuple on_color:
            The color to use when the LED is "on". Defaults to white.

    :param tuple off_color:
        The color to use when the LED is "off". Defaults to black.

    :param int n:
        Number of times to blink; ``None`` (the default) means forever.

    
    if (this._leds[0] instanceof LED) {
        if (fade_in_time !== undefined) {
            throw new  exc.ValueError('fade_in_time must be 0 with non-PWM RGBLEDs');
        }
        if (fade_out_time !== undefined) {
            throw new exc.ValueError('fade_out_time must be 0 with non-PWM RGBLEDs');
        }
    }

    this._leds[0].blink (on_time, off_time, fade_in_time, fade_out_time, n, callback);
    this._leds[1].blink (on_time, off_time, fade_in_time, fade_out_time, n, callback);
    this._leds[2].blink (on_time, off_time, fade_in_time, fade_out_time, n, callback);

};

RGBLED.prototype._stop_blink = function () {
    this._leds[0]._pin._stop_blink();
    this._leds[1]._pin._stop_blink();
    this._leds[2]._pin._stop_blink();
}

 /* def _blink_device(
            self, on_time, off_time, fade_in_time, fade_out_time, on_color,
            off_color, n, fps=25):
        # Define some simple lambdas to perform linear interpolation between
        # off_color and on_color
        lerp = lambda t, fade_in: tuple(
            (1 - t) * off + t * on
            if fade_in else
            (1 - t) * on + t * off
            for off, on in zip(off_color, on_color)
            )
        sequence = []
        if fade_in_time > 0:
            sequence += [
                (lerp(i * (1 / fps) / fade_in_time, True), 1 / fps)
                for i in range(int(fps * fade_in_time))
                ]
        sequence.append((on_color, on_time))
        if fade_out_time > 0:
            sequence += [
                (lerp(i * (1 / fps) / fade_out_time, False), 1 / fps)
                for i in range(int(fps * fade_out_time))
                ]
        sequence.append((off_color, off_time))
        sequence = (
                cycle(sequence) if n is None else
                chain.from_iterable(repeat(sequence, n))
                )
        for l in self._leds:
            l._controller = self
        for value, delay in sequence:
            for l, v in zip(self._leds, value):
                l._write(v)
            if self._blink_thread.stopping.wait(delay):
                break
*/


/*
class RGBLED(SourceMixin, Device):


    def blink(
            self, on_time=1, off_time=1, fade_in_time=0, fade_out_time=0,
            on_color=(1, 1, 1), off_color=(0, 0, 0), n=None, background=True):
        """
        Make the device turn on and off repeatedly.

        :param float on_time:
            Number of seconds on. Defaults to 1 second.

        :param float off_time:
            Number of seconds off. Defaults to 1 second.

        :param float fade_in_time:
            Number of seconds to spend fading in. Defaults to 0. Must be 0 if
            ``pwm`` was ``False`` when the class was constructed
            (:exc:`ValueError` will be raised if not).

        :param float fade_out_time:
            Number of seconds to spend fading out. Defaults to 0. Must be 0 if
            ``pwm`` was ``False`` when the class was constructed
            (:exc:`ValueError` will be raised if not).

        :param tuple on_color:
            The color to use when the LED is "on". Defaults to white.

        :param tuple off_color:
            The color to use when the LED is "off". Defaults to black.

        :param int n:
            Number of times to blink; ``None`` (the default) means forever.

        :param bool background:
            If ``True`` (the default), start a background thread to continue
            blinking and return immediately. If ``False``, only return when the
            blink is finished (warning: the default value of *n* will result in
            this method never returning).
        """
        if isinstance(self._leds[0], LED):
            if fade_in_time:
                raise ValueError('fade_in_time must be 0 with non-PWM RGBLEDs')
            if fade_out_time:
                raise ValueError('fade_out_time must be 0 with non-PWM RGBLEDs')
        
    def pulse(
            self, fade_in_time=1, fade_out_time=1,
            on_color=(1, 1, 1), off_color=(0, 0, 0), n=None, background=True):
        """
        Make the device fade in and out repeatedly.

        :param float fade_in_time:
            Number of seconds to spend fading in. Defaults to 1.

        :param float fade_out_time:
            Number of seconds to spend fading out. Defaults to 1.

        :param tuple on_color:
            The color to use when the LED is "on". Defaults to white.

        :param tuple off_color:
            The color to use when the LED is "off". Defaults to black.

        :param int n:
            Number of times to pulse; ``None`` (the default) means forever.

        :param bool background:
            If ``True`` (the default), start a background thread to continue
            pulsing and return immediately. If ``False``, only return when the
            pulse is finished (warning: the default value of *n* will result in
            this method never returning).
        """
        on_time = off_time = 0
        self.blink(
            on_time, off_time, fade_in_time, fade_out_time,
            on_color, off_color, n, background
        )

    def _stop_blink(self, led=None):
        # If this is called with a single led, we stop all blinking anyway
        if self._blink_thread:
            self._blink_thread.stop()
            self._blink_thread = None

   


*/