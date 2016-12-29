const LEDCollection = require ('./LEDCollection.js').LEDCollection;
const inherit = require ('../tools.js').inherit;
const extend = require ('../tools.js').extend;
const ReadWriteLock = require('rwlock');

exports.LEDBoard = LEDBoard;

/**
 * Represents a generic LED board or collection of LEDs.
 * The following example turns on all the LEDs on a board containing 5 LEDs attached to GPIO pins 2 through 6.
 *
 * @example
 * 		const LEDBoard = require('gpiozero').LEDBoard;
 * 		var leds = new LEDBoard([2, 3, 4, 5, 6]);
 * 		leds.on();
 *
 * @param {Array} pins - Specify the GPIO pins that the LEDs of the board are attached to. You can designate as many pins as necessary.
 * @param {Array} kwpins - Specify an array of arrays that has the Name of the device and the GPIO pins that the LEDs of the board are attached to.
 * You can designate as many pins as necessary.
 * @param {Object} _options - Set options for the Collection:
 * *     pwm: Default: false, If true, creates PWMLED instances for each pin, else LED.
 * *     active_high: Default: true, If true, the on method will set all the associated pins to HIGH.
 *                                   If false, the on method will set all pins to LOW (the `off` method always does the opposite).
 *  *    initial_value: If false, all LEDs will be off initially, if true the device will be Switched on initialled.
 * @augments LEDCollection
 * @class
 */
function LEDBoard(pins, kwpins, _options) {
    "use strict";
    const defaults = {
        pwm: false,
        active_high: true,
        initial_value: false,
    };
    this.options = extend(defaults, _options);
    this._blink_leds = [];
    this._blink_lock = new ReadWriteLock();
    LEDCollection.call(this, pins, kwpins, this.options);
}
LEDBoard.prototype = inherit(LEDCollection.prototype);
LEDBoard.prototype.constructor = LEDBoard;

LEDBoard.prototype.close = function () {
    LEDCollection.prototype.close.call(this);
}

/*
 class LEDBoard(LEDCollection):

 def close(self):
 self._stop_blink()
 super(LEDBoard, self).close()

 def on(self, *args):
 self._stop_blink()
 if args:
 for index in args:
 self[index].on()
 else:
 super(LEDBoard, self).on()

 def off(self, *args):
 self._stop_blink()
 if args:
 for index in args:
 self[index].off()
 else:
 super(LEDBoard, self).off()

 def toggle(self, *args):
 self._stop_blink()
 if args:
 for index in args:
 self[index].toggle()
 else:
 super(LEDBoard, self).toggle()

 def blink(
 self, on_time=1, off_time=1, fade_in_time=0, fade_out_time=0,
 n=None, background=True):
 """
 Make all the LEDs turn on and off repeatedly.

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

 :param int n:
 Number of times to blink; ``None`` (the default) means forever.

 :param bool background:
 If ``True``, start a background thread to continue blinking and
 return immediately. If ``False``, only return when the blink is
 finished (warning: the default value of *n* will result in this
 method never returning).
 """
 for led in self.leds:
 if isinstance(led, LED):
 if fade_in_time:
 raise ValueError('fade_in_time must be 0 with non-PWM LEDs')
 if fade_out_time:
 raise ValueError('fade_out_time must be 0 with non-PWM LEDs')
 self._stop_blink()
 self._blink_thread = GPIOThread(
 target=self._blink_device,
 args=(on_time, off_time, fade_in_time, fade_out_time, n)
 )
 self._blink_thread.start()
 if not background:
 self._blink_thread.join()
 self._blink_thread = None

 def _stop_blink(self, led=None):
 if led is None:
 if self._blink_thread:
 self._blink_thread.stop()
 self._blink_thread = None
 else:
 with self._blink_lock:
 self._blink_leds.remove(led)

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

 def _blink_device(self, on_time, off_time, fade_in_time, fade_out_time, n, fps=25):
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
 with self._blink_lock:
 self._blink_leds = list(self.leds)
 for led in self._blink_leds:
 if led._controller not in (None, self):
 led._controller._stop_blink(led)
 led._controller = self
 for value, delay in sequence:
 with self._blink_lock:
 if not self._blink_leds:
 break
 for led in self._blink_leds:
 led._write(value)
 if self._blink_thread.stopping.wait(delay):
 break
 */
