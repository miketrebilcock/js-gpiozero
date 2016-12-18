var ReadWriteLock = require('rwlock'),
	inherit = require ('./tools.js').inherit,
    extend = require ('./tools.js').extend;

exports.LEDCollection = LEDCollection;

/**
 * Extends :class:`CompositeOutputDevice`. Abstract base class for
 * :class:`LEDBoard` and :class:`LEDBarGraph`.
 * 
 * @param {array}
 * @param {object}
 */
function LEDCollection (_pins, _options) {
	var defaults = {
        pwm: false, //If true, creates PWMLED instances for each pin, else LED
        active_high: true,  //If ``True`` (the default), the :meth:`on` method will set all the
    						//associated pins to HIGH. If ``False``, the :meth:`on` method will set
    						//all pins to LOW (the :meth:`off` method always does the opposite). This
    						//parameter can only be specified as a keyword parameter.
        initial_value: false, // If False, all LEDs will be off initially, if True the device will be
        					  // Switched on initialled
	};
    this.options = extend(defaults, _options);
    this._leds = [];
    var i = 0;
    for (i = 0; i < _pins.length; i++) {
    	this._leds[i] = this.options.pwm ? new PWMLED (_pins[i]) : new LED(_pin[i]);
    }
}
/*
class LEDCollection(CompositeOutputDevice):

    @property
    def leds(self):
        """
        A flat tuple of all LEDs contained in this collection (and all
        sub-collections).
        """
        return self._leds

    @property
    def active_high(self):
        return self[0].active_high



 */


exports.LEDBoard = LEDBoard;

/**
* Extends :class:`LEDCollection` and represents a generic LED board or collection of LEDs.
* The following example turns on all the LEDs on a board containing 5 LEDs
* attached to GPIO pins 2 through 6::
* 		from gpiozero import LEDBoard
* 		leds = LEDBoard(2, 3, 4, 5, 6)
* 		leds.on()
* @param {array} pins Specify the GPIO pins that the LEDs of the board are attached to. You can designate as many pins as necessary. You can also specify :class:`LEDBoard` instances to create trees of LEDs.
* @param {object} _options [description]
*/
function LEDBoard (pins, _options) {

	var defaults = {
	        pwm: false, //If true, creates PWMLED instances for each pin, else LED
	        active_high: true,  //If ``True`` (the default), the :meth:`on` method will set all the
        						//associated pins to HIGH. If ``False``, the :meth:`on` method will set
        						//all pins to LOW (the :meth:`off` method always does the opposite). This
        						//parameter can only be specified as a keyword parameter.
	        initial_value: false, // If False, all LEDs will be off initially, if True the device will be
	        					  // Switched on initialled
	    };
    this.options = extend(defaults, _options);
    this._blink_leds = [];
    this._blink_lock = new ReadWriteLock();
    LEDCollection.call(this, pins, this.options);
}
LEDBoard.prototype = inherit(LEDCollection.prototype);
LEDBoard.prototype.constructor = LEDBoard;
/*
class LEDBoard(LEDCollection):


    :param \*\*named_pins:
        Specify GPIO pins that LEDs of the board are attached to, associating
        each LED with a property name. You can designate as many pins as
        necessary and use any names, provided they're not already in use by
        something else. You can also specify :class:`LEDBoard` instances to
        create trees of LEDs.
    """
    def __init__(self, *args, **kwargs):
        self._blink_leds = []
        self._blink_lock = Lock()
        super(LEDBoard, self).__init__(*args, **kwargs)

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



exports.TrafficLights = TrafficLights;


/**
* Extends :class:`LEDBoard` for devices containing red, yellow, and green LEDs.
* @param {number} red The GPIO pin that the red LED is attached to.
* @param {number} amber The GPIO pin that the amber LED is attached to.
* @param {number} green The GPIO pin that the green LED is attached to.
* @param {object} _options 
*/
function TrafficLights (red, amber, green, _options) {


	var defaults = {
	        pwm: false, //If true, creates PWMLED instances, else LED
	        initial_value: false, // If False, all LEDs will be off initially, if True the device will be
	        					  // Switched on initialled

	    };
    this.options = extend(defaults, _options);
    this.devices = {red : red,
    				amber : amber,
    				green : green};
    if (this.devices.red === undefined || 
    	this.devices.amber === undefined ||
    	this.devices.green === undefined) {
    	throw new exc.GPIOPinMissing('Pins must be provided for all LEDs');
    }
    LEDBoard.call(this, this.devices, this.options);
}

TrafficLights.prototype = inherit(LEDBoard.prototype);
TrafficLights.prototype.constructor = TrafficLights;



/*
class TrafficLights(LEDBoard):
    
    def __init__(self, red=None, amber=None, green=None,
                 pwm=False, initial_value=False, yellow=None):
        if not all(p is not None for p in devices.values()):
            raise GPIOPinMissing(
                ', '.join(devices.keys())+' pins must be provided'
            )
        super(TrafficLights, self).__init__(
            pwm=pwm, initial_value=initial_value,
            _order=devices.keys(),
            **devices)

    def __getattr__(self, name):
        if name == 'amber' and self._display_yellow:
            name = 'yellow'
        elif name == 'yellow' and not self._display_yellow:
            name = 'amber'
        return super(TrafficLights, self).__getattr__(name)



*/