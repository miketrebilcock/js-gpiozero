const Device = require('../devices/Device.js').Device;
const exc = require('../exc.js');
const inherit = require('../tools.js').inherit;
const PWMLED = require ('./PWMLED.js').PWMLED;
const LED = require ('./LED.js').LED;

exports.RGBLED = RGBLED;

/**
 *
 * Represents a full color LED component (composed of red, green, and blue LEDs).
 *
 * Connect the common cathode (longest leg) to a ground pin; connect each of
 * the other legs (representing the red, green, and blue anodes) to any GPIO
 * pins.  You can either use three limiting resistors (one per anode) or a
 * single limiting resistor on the cathode.
 *
 * @param {int} red - The GPIO pin that controls the red component of the RGB LED.
 * @param {int} green - The GPIO pin that controls the green component of the RGB LED.
 * @param {int} blue - The GPIO pin that controls the blue component of the RGB LED.
 * @param {boolean} [active_high] - Set to ``true`` (the default) for common cathode RGB LEDs. If you are
 *      using a common anode RGB LED, set this to ``false``.
 * @param {Array} [initial_value] - The initial color for the RGB LED. Defaults to black ``[0, 0, 0]``.
 * @param {boolean} [pwm] - If ``true`` (the default), construct {@link PWMLED} instances for
 *      each component of the RGBLED. If ``false``, construct regular {@link LED} instances,
 *      which prevents smooth color graduations.
 * @class
 * @augments Device
 * @throws GPIOPinMissing - If one of the pins is not specified.
 */
function RGBLED(red, green, blue, active_high, initial_value, pwm) {
    this._leds = [];
    if (red === undefined || blue === undefined || green === undefined) {
        throw new exc.GPIOPinMissing('red, green, and blue pins must be provided');
    }
    pwm = (pwm === undefined ? true : pwm);
    var LEDClass = pwm ? PWMLED : LED;
    Device.call(this);
    this._leds = [new LEDClass(red, active_high), new LEDClass(green, active_high), new LEDClass(blue, active_high)];
    if (initial_value === undefined) {
        initial_value = [0, 0, 0];
    }
    this.value(initial_value);
}

RGBLED.prototype = inherit(Device.prototype);
RGBLED.prototype.constructor = RGBLED;

/**
 *  Represents the color of the LED as an RGB 3-tuple of ``[red, green, blue]``
 *  where each value is between 0 and 1 if ``pwm`` was ``true`` when the class was constructed
 *  (and only 0 or 1 if not).
 *
 * @param {Array} [value] - If set, the value for each component will be updated.
 * @returns {Array} - If ``value`` is ``undefined`` then returns the current value for each component.
 *
 * @throws OutputDeviceBadValue - If three values are not passed as an array in value.
 * @throws OutputDeviceBadValue - If any of the RGB values are not between 0 and 1.
 * @throws OutputDeviceBadValue - If pwm is false but a value is between 0 and 1.
 */
RGBLED.prototype.value = function(value) {
    if (value === undefined) {
        return [this.red, this.green, this.blue];
    }
    if (value.length < 3) {
        throw new exc.OutputDeviceBadValue('RGB values must be an array of three components');
    }
    var i;
    for (i = 0; i < 3; i++) {
        if (value[i] < 0 || value[i] > 1) {
            throw new exc.OutputDeviceBadValue('each RGB component must be between 0 and 1');
        }
        if (this._leds[i] instanceof LED) {
            if (value[i] !== 0 && value[i] !== 1) {
                throw new exc.OutputDeviceBadValue('each RGB color component must be 0 or 1 with non-PWM RGBLEDs');
            }
        }
    }

    for (i = 0; i < 3; i++) {
        this._leds[i].value(value[i]);
    }
    this.red = this._leds[0].value();
    this.green = this._leds[1].value();
    this.blue = this._leds[2].value();
};

/**
 * Close each pin and release for reuse.
 */
RGBLED.prototype.close = function() {
    var i;
    for (i = 0; i < 3; i++) {
        if (this._leds[i] !== undefined) {
            this._leds[i].close();
            this._leds[i] = undefined;
        }
    }
    this._leds = [];
    Device.prototype.close.call(this);
};

/**
 *
 * @returns {boolean} - If the LED is currently active (not black) then ``true`` otherwise ``false``.
 */
RGBLED.prototype.is_active = function() {
    return (this.value()[0] + this.value()[1] + this.value()[2] > 0);
};

/**
 * Turn the LED on. This equivalent to setting the LED color to white ``[1, 1, 1]``.
 */
RGBLED.prototype.on = function() {
    this.value([1, 1, 1]);
};

/**
 * Turn the LED off. This equivalent to setting the LED color to black ``[0, 0, 0]``.
 */
RGBLED.prototype.off = function() {
    this.value([0, 0, 0]);
};

/**
 * Toggle the state of the device. If the device is currently off (`value` is ``[0, 0, 0[``),
 * this changes it to "fully" on (`value` is ``[1, 1, 1]``).
 * If the device has a specific color, this method inverts the color.
 */
RGBLED.prototype.toggle = function() {
    var current = this.value();
    this.value([1 - current[0], 1 - current[1], 1 - current[2]]);
};

RGBLED.prototype.closed = function() {
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