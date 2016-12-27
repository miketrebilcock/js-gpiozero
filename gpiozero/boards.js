const ReadWriteLock = require('rwlock');
const inherit = require('./tools.js').inherit;
const extend = require('./tools.js').extend;
const PWMLED = require('./output_devices.js').PWMLED;
const LED = require('./output_devices.js').LED;
const exc = require('./exc.js');
const CompositeDevice = require('./devices.js').CompositeDevice;
const OutputDevice = require('./output_devices.js').OutputDevice;
/**
 *
 *  Extends {@link CompositeDevice} with {@link CompositeDevice#on|on}, {@link CompositeDevice#off|off}, and
 *  {@link CompositeDevice#toggle|toggle} methods for controlling subordinate output devices.  Also
 *  extends {@link CompositeDevice#value|value} to be writeable.
 *  @param {array} [devices]
 *  An array of devices that create this composite device
 *  @param {array} [kwdevices]
 *  An array of tuples that contain the device name and device eg ['red', new LED(1)]
 *  @param {array} [options]
 *  @inheritdoc
 * @extends CompositeDevice
 * @constructor
 */
function CompositeOutputDevice (devices, kwdevices, options) {
    "use strict";
    CompositeDevice.call(this, devices, kwdevices, options);
}

CompositeOutputDevice.prototype = inherit(CompositeDevice.prototype);
CompositeOutputDevice.prototype.constructor = CompositeOutputDevice;

exports.CompositeOutputDevice = CompositeOutputDevice;

/**
 * Calls the on method on all child devices within this composite device
 */
CompositeOutputDevice.prototype.on = function () {
    this._all.forEach((device) => {
        if (device instanceof OutputDevice || device instanceof CompositeOutputDevice) {
            device.on();
        }
    });
};

/**
 * Calls the off method on all child devices within this composite device
 */
CompositeOutputDevice.prototype.off = function () {
    this._all.forEach((device) => {
        if (device instanceof OutputDevice || device instanceof CompositeOutputDevice) {
            device.off();
        }
    });
};


/**
* Calls the toggle method on all child devices within this composite device
**/
CompositeOutputDevice.prototype.toggle = function () {
    this._all.forEach((device) => {
        if (device instanceof OutputDevice || device instanceof CompositeOutputDevice) {
            device.toggle();
        }
    });
};

/**
 * when value is undefined then the function returns the value of all child
 * devices as an array.
 * when value is set, all child devices will have their value set according
 * to the value array.
 * @param {array} [value]
 * The value to set all of the child devices to.
 * @returns {array}
 * The current value of each output device returned as an array.
 */
CompositeOutputDevice.prototype.value = function (value) {
    if (value === undefined) {
        return CompositeDevice.prototype.value.call(this);
    }
    if (value.length !== this._all.length) {
        throw new exc.OutputDeviceError();
    }
    let i = 0;
    for (i = 0; i<this._all.length; i++) {
        this._all[i].value(value[i]);
    }
}


exports.LEDCollection = LEDCollection;

/**
 * Abstract base class for @link{LEDBoard} and @link{LEDBarGraph}.
 * 
 * @param {array} [_pins]
 * Array of pins that LEDs are connect to.
 * @param {array} [_kwpins]
 * Array of tuples listing names for each pin eg [['red',17], ['amber',22]]
 * @param {object} [_options]
 * Set options for the Collection:
 * *     pwm: Default: false, If true, creates PWMLED instances for each pin, else LED.
 * *     active_high: Default: true, If true, the on method will set all the associated pins to HIGH.
 *                                  If false, the on method will set all pins to LOW
 *                                  (the `off` method always does the opposite).
 * *    initial_value: If false, all LEDs will be off initially, if true the device will be Switched on initialled
 * @extends CompositeOutputDevice
 */
function LEDCollection(_pins, _kwpins, _options) {
    "use strict";
    const defaults = {
        pwm: false,
        active_high: true,
        initial_value: false,
    };
    this.options = extend(defaults, _options);
    this._leds = [];
    this._kwleds = [];
    let i;
    if (_pins !== undefined) {
        for (i = 0; i < _pins.length; i++) {
            this._leds.push(this.options.pwm ? new PWMLED(_pins[i]) : new LED(_pins[i]));
        }
    }

    if (_kwpins !== undefined) {
        for (i = 0; i < _kwpins.length; i++) {
            this._kwleds.push([
                    _kwpins[i][0],
                    this.options.pwm ? new PWMLED(_kwpins[i][1]) : new LED(_kwpins[i][1])
            ]);
        }
    }
    CompositeOutputDevice.call(this, this._leds, this._kwleds);
}

LEDCollection.prototype = inherit(CompositeOutputDevice.prototype);
LEDCollection.prototype.constructor = LEDCollection;

/**
 * @returns {array}
 * A flat array of tuples of all LEDs contained in this collection (and all sub-collections).
 */
LEDCollection.prototype.leds = function (){
    return this._leds;
};

/**
 *
 * @returns {boolean}
 */
LEDCollection.prototype.active_high = function (){
    return this[0].active_high;
}

exports.LEDBoard = LEDBoard;

/**
 * Represents a generic LED board or collection of LEDs.
 * The following example turns on all the LEDs on a board containing 5 LEDs
 * attached to GPIO pins 2 through 6::
 * 		const LEDBoard = require('gpiozero').LEDBoard;
 * 		var leds = new LEDBoard([2, 3, 4, 5, 6]);
 * 		leds.on();
 * @param {array} pins
 * Specify the GPIO pins that the LEDs of the board are attached to. You can designate as many pins as necessary.
 * @param {array} kwpins
 * Specify an array of arrays that has the Name of the device and the GPIO pins that the LEDs of the board are attached to.
 * You can designate as many pins as necessary.
 * @param {object} _options
 * Set options for the Collection:
 * *     pwm: Default: false, If true, creates PWMLED instances for each pin, else LED.
 * *     active_high: Default: true, If true, the on method will set all the associated pins to HIGH.
 *                                  If false, the on method will set all pins to LOW
 *                                  (the `off` method always does the opposite).
 *  *    initial_value: If false, all LEDs will be off initially, if true the device will be Switched on initialled
 * @extends LEDCollection
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

exports.TrafficLights = TrafficLights;

/**
 * Represents a traffic light device containing red, amber, and green LEDs.
 * @param {number} red
 * The GPIO pin that the red LED is attached to.
 * @param {number} amber
 * The GPIO pin that the amber LED is attached to.
 * @param {number} green
 * The GPIO pin that the green LED is attached to.
 * @param {object} [_options]
 * * pwm: default: false. If true, creates PWMLED instances, else LED
 * * initial_value: default: false. If false, all LEDs will be off initially, if true the device will be switched on initialled
 * @extends LEDBoards
 * @constructor
 */
function TrafficLights(red, amber, green, _options) {
    "use strict";
    const defaults = {
        pwm: false,
        initial_value: false
    };
    this.options = extend(defaults, _options);

    if (red === undefined ||
        amber === undefined ||
        green === undefined) {
        throw new exc.GPIOPinMissing('Pins must be provided for all LEDs');
    }
    this.devices = [['red', red],['amber',amber],['green',green]];
    LEDBoard.call(this,undefined, this.devices, this.options);
}

TrafficLights.prototype = inherit(LEDBoard.prototype);
TrafficLights.prototype.constructor = TrafficLights;
/**
 * Represents the `Low Voltage Labs PI-TRAFFIC`_
 * vertical traffic lights board when attached to GPIO pins 9, 10, and 11.
 * There's no need to specify the pins if the PI-TRAFFIC is connected to the
 * default pins (9, 10, 11).
 * Low Voltage Labs PI-TRAFFIC: http://lowvoltagelabs.com/products/pi-traffic/
 * @param {object} [_options]
 * * pwm: default: false. If true, creates PWMLED instances, else LED
 * * initial_value: default: false. If false, all LEDs will be off initially, if true the device will be switched on initialled
 * @constructor
 * @extends: TrafficLights
 */
function PiTraffic(_options){
    "use strict";
    const defaults = {
        pwm: false,
        initial_value: false
    };
    this.options = extend(defaults, _options);
    TrafficLights.call(this, 9,10,11, this.options);
}

exports.PiTraffic = PiTraffic;
PiTraffic.prototype = inherit(TrafficLights.prototype);
PiTraffic.prototype.constructor = PiTraffic;