const wpi = require("wiring-pi");
const p = require("./index.js");
const exc = require("../exc.js");
const inherit = require('../tools.js').inherit;
const Pin = require("./index.js").Pin;

var _PINS = {},
    WIRING_PI,
    PI_INFO,
    GPIO_FUNCTIONS = {
        'input': wpi.INPUT,
        'output': wpi.OUTPUT,
        //'i2c':     GPIO.I2C,
        //'spi':     GPIO.SPI,
        'pwm': wpi.PWM_OUTPUT,
        //'serial':  GPIO.SERIAL,
        //'unknown': GPIO.UNKNOWN,
    },
    GPIO_PULL_UPS = {
        'up': wpi.PUD_UP,
        'down': wpi.PUD_DOWN,
        'floating': wpi.PUD_OFF,
    };

exports.WiringPiPin = WiringPiPin;

function WiringPiPin(number) {
    /*
    Uses the `wiringPi`_ library to interface to the Pi's GPIO pins. This is
    the default pin implementation.
    Supports all features including PWM (via software).

    Because this is the default pin implementation you can use it simply by
    specifying an integer number for the pin in most operations, e.g.::

        from gpiozero import LED

        led = LED(12)

    However, you can also construct RPi.GPIO pins manually if you wish::

        from gpiozero.pins.rpigpio import RPiGPIOPin
        from gpiozero import LED

        led = LED(RPiGPIOPin(12))

    
    */
    if (WIRING_PI === undefined) {
        wpi.setup('gpio');
        WIRING_PI = true;
    }
    /*

    GPIO_EDGES = {
        'both':    GPIO.BOTH,
        'rising':  GPIO.RISING,
        'falling': GPIO.FALLING,
        }

    GPIO_FUNCTION_NAMES = {v: k for (k, v) in GPIO_FUNCTIONS.items()}
    GPIO_PULL_UP_NAMES = {v: k for (k, v) in GPIO_PULL_UPS.items()}
    GPIO_EDGES_NAMES = {v: k for (k, v) in GPIO_EDGES.items()}
*/



    if (PI_INFO === undefined) {
        PI_INFO = wpi.piBoardRev();
    }
    if (number < 0 || number > 54) {
        throw new Error('invalid pin ' + number.toString() + ' specified (must be 0..53)');
    }

    if (_PINS[number] !== undefined) {
        return _PINS[number];
    }
    p.Pin.call(this);
    this._number = number;
    this._pwm = undefined;
    this._frequency = undefined;
    this._duty_cycle = undefined;
    this._bounce = -666;
    this._when_changed = undefined;
    this._function = 'input';
    this._state = false;
    this._pull = 'floating';
    this._bounce = undefined;
    this._edges = 'both';

    wpi.pinMode(number, wpi.INPUT);
    _PINS[number] = this;
    return this;
}

WiringPiPin.prototype = inherit(p.LocalPin.prototype);
WiringPiPin.prototype.constructor = WiringPiPin;

WiringPiPin.prototype.toString = function() {
    return "GPIO " + this._number.toString();
};
WiringPiPin.prototype.when_changed = function(next) {
    this._when_changed = next;
}

WiringPiPin.prototype.number = function() {
    return this._number();
};

WiringPiPin.prototype.close = function() {
    this._frequency = undefined;
    this._when_changed = undefined;
    wpi.pullUpDnControl(this._number, wpi.PUD_OFF);
};

WiringPiPin.prototype.output_with_state = function(state) {
    this._pull = 'floating';
    this.pin_function ('output');
    wpi.digitalWrite(this._number, state);
};

WiringPiPin.prototype.input_with_pull = function(pull) {
    // if (pull != 'up' and self.PI_INFO.pulled_up('GPIO%d' % self._number):
    //    raise PinFixedPull('%r has a physical pull-up resistor' % self)
    //try:
    wpi.pinMode(this._number, wpi.IN);
    //GPIO.setup(self._number, GPIO.IN, self.GPIO_PULL_UPS[pull])
    wpi.pullUpDnControl(this._number, wpi.PUD_UP);
    this._pull = pull;
    //except KeyError:
    //    raise PinInvalidPull('invalid pull "%s" for pin %r' % (pull, self))
};

WiringPiPin.prototype.pin_function = function(value) {
    if (value === undefined) {
        return this._function;
    }
    if (value !== 'input') {
        this._pull = 'floating';
    }
    if (value === 'input' || value === 'output') {
        wpi.pinMode(this._number, GPIO_FUNCTIONS[value]);
        wpi.pullUpDnControl(this._number, GPIO_PULL_UPS[this._pull]);
        this._function = value;
    } else {
        throw exc.PinInvalidFunction('invalid function " + value + " for pin ' + this._number.toString());
    }
};

WiringPiPin.prototype.state = function(value) {
    if (value === undefined) {
        if (this._pwm !== undefined) {
            return this._duty_cycle;
        }
        return wpi.digitalRead(this._number);
    }
    if (this._pwm !== undefined) {
        wpi.pwmWrite(this._number, value);
        this._duty_cycle = value;
    } else {
        wpi.digitalWrite(this._number, value ? 1 : 0);
    }
};

WiringPiPin.prototype.pull = function(value) {
    if (value === undefined) {
        return this._pull;
    }
    if (this.function !== 'input') {
        throw new exc.PinFixedPull('cannot set pull on non-input pin ' + this._number.toString());
    }
    /*if value != 'up' and self.PI_INFO.pulled_up('GPIO%d' % self._number):
            raise PinFixedPull('%r has a physical pull-up resistor' % self)
    }*/
    this._pull = value;
    wpi.pullUpDnControl(this._number, this.GPIO_PULL_UPS[this._pull]);
};

WiringPiPin.prototype.frequency = function(value) {
    if (value === undefined) {
        return this._frequency;
    }
    if (this._function !== 'output') {
        throw new exc.PinSetInput("Pin is not set for output function");
    }
    if (value === -1) {
        this._frequency = undefined;
        this._pwm = undefined;
        wpi.pwmToneWrite(this._number, 0);
    } else {
        if (this._frequency === undefined) {
            this._pwm = wpi.pinMode(this._number, wpi.PWM_OUTPUT);
        }
        wpi.pwmToneWrite(this._number, value);
        this._frequency = value;
    }
};

WiringPiPin.prototype.blink = function(on_time, off_time, fade_in_time, fade_out_time, n, fps, callback) {

    if(this._pwm === undefined) {
        Pin.prototype.blink.call(this, on_time, off_time, n, callback);
        return;
    }
    this.on_time = (on_time === undefined ? 1 : on_time);
    this.off_time = (off_time === undefined ? 1 : off_time);
    this.fade_in_time = (fade_in_time === undefined ? 0 : fade_in_time);
    this.fade_out_time = (fade_out_time === undefined ? 0 : fade_out_time);
    this.fps = (fps === undefined ? 50 : fps);
    this.n = (n === undefined ? 0 : n);
    this.sequence = [];
    this.blink_callback = callback;
    var i = 0;

    if (this.fade_in_time > 0) {
        for (i = 0; i < this.fps * this.fade_in_time; i++) {
            this.sequence.push({
                value: i * (1 / this.fps) / this.fade_in_time,
                delay: 1 / this.fps
            });
        }
    }
    this.sequence.push({
        value: 1,
        delay: this.on_time
    });

    if (this.fade_out_time > 0) {
        for (i = 0; i < this.fps * this.fade_out_time; i++) {
            this.sequence.push({
                value: 1 - (i * (1 / this.fps)) / this.fade_out_time,
                delay: 1 / this.fps
            });
        }
    }
    this.sequence.push({
        value: 0,
        delay: this.off_time
    });

    if (this.n > 0) {
        for (i = 0; i < (this.n - 1); i++) {
            this.sequence = this.sequence.concat(this.sequence);
        }

        var nextStep = this.sequence.pop();
        this.state(nextStep.value);
        var that = this;
        this._blink_timer = setTimeout(that._run_blink, nextStep.delay, this.sequence, this);
    }
};

WiringPiPin.prototype._run_blink = function(sequence, that) {
    if (sequence.length > 0) {
        var nextStep = sequence.pop();
        that.state(nextStep.value);
        that._blink_timer = setTimeout(that._run_blink, nextStep.delay, sequence, that);
    } else if (that.blink_callback !== undefined) {
        that.blink_callback();
    }
};

/*

    def _get_bounce(self):
        return None if self._bounce == -666 else (self._bounce / 1000)

    def _set_bounce(self, value):
        if value is not None and value < 0:
            raise PinInvalidBounce('bounce must be 0 or greater')
        f = self.when_changed
        self.when_changed = None
        try:
            self._bounce = -666 if value is None else int(value * 1000)
        finally:
            self.when_changed = f

    def _get_edges(self):
        return self.GPIO_EDGES_NAMES[self._edges]

    def _set_edges(self, value):
        f = self.when_changed
        self.when_changed = None
        try:
            self._edges = self.GPIO_EDGES[value]
        finally:
            self.when_changed = f

    def _get_when_changed(self):
        return self._when_changed

    def _set_when_changed(self, value):
        if self._when_changed is None and value is not None:
            self._when_changed = value
            GPIO.add_event_detect(
                self._number, self._edges,
                callback=lambda channel: self._when_changed(),
                bouncetime=self._bounce)
        elif self._when_changed is not None and value is None:
            GPIO.remove_event_detect(self._number)
            self._when_changed = None
        else:
            self._when_changed = value

*/