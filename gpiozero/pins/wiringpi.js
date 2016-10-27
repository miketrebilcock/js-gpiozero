var wpi = require("wiring-pi"),
    p = require ("./index.js"),
    exc = require("../exc.js");;

var _PINS = {};
var WIRING_PI;
var PI_INFO = undefined;

function inherit(proto) {
  function F() {}
  F.prototype = proto;
  return new F;
}

function WiringPiPin(LocalPin) {
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
    if (WIRING_PI==undefined) {       
    	wpi.setup('gpio');
    	WIRING_PI = true;
    }

    GPIO_FUNCTIONS = {
        'input':   wpi.INPUT,
        'output':  wpi.OUTPUT,
        //'i2c':     GPIO.I2C,
        //'spi':     GPIO.SPI,
        'pwm':     wpi.PWM_OUTPUT,
        //'serial':  GPIO.SERIAL,
        //'unknown': GPIO.UNKNOWN,
        }

    GPIO_PULL_UPS = {
        'up':       wpi.PUD_UP,
        'down':     wpi.PUD_DOWN,
        'floating': wpi.PUD_OFF,
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



    if (PI_INFO == undefined) {
        PI_INFO = wpi.piBoardRev();
    }
    if(_PINS[number] != undefined)
    {
        return _PINS[number];
    }
    p.Pin.call(this);
    this._number = number;
    this._pwm = undefined;
    this._frequency = undefined;
    this._duty_cycle = undefined;
    this._bounce = -666
    this._when_changed = undefined;
    this._function = 'input';
    this._state = false;
    this._pull = 'floating';
    this._bounce = undefined;
    this._edges = 'both';

    wpi.pinMode(number, wpi.INPUT);
    PINS[number] = this;
    return this;
}

WiringPiPin.prototype = inherit (p.LocalPin.prototype);
WiringPiPin.prototype.constructor = WiringPiPin;

WiringPiPin.prototype.toString = function () {
    return "GPIO " + this._number.toString();
}

WiringPiPin.prototype.number = function () {
    return this._number();
}

WiringPiPin.prototype.close = function () {
    this._frequency = undefined;
    this._when_changed = undefined;
    wpi.pullUpDnControl(pin, wpi.PUD_OFF);
}

WiringPiPin.prototype.output_with_state = function (state) {
    this._pull = 'floating'
    wpi.pinMode(_number, wpi.OUT);
    wpi.digitalWrite(_number, state);
}

WiringPiPin.prototype.input_with_pull = function (pull) {
   // if (pull != 'up' and self.PI_INFO.pulled_up('GPIO%d' % self._number):
    //    raise PinFixedPull('%r has a physical pull-up resistor' % self)
    //try:
    wpi.pinMode(_number, wpi.IN);
        //GPIO.setup(self._number, GPIO.IN, self.GPIO_PULL_UPS[pull])
    wpi.pullUpDnControl(pin, wpi.PUD_UP);
    this._pull = pull
    //except KeyError:
    //    raise PinInvalidPull('invalid pull "%s" for pin %r' % (pull, self))
}

WiringPiPin.prototype.pin_function = function (value) {
    if ( value == undefined) {
        return this._function;   
    }
    if (value != 'input') {
        this._pull = 'floating';
    }
    if (value == 'input' || value == 'output') {
         wpi.pinMode(_number, this.GPIO_FUNCTIONS[value])
         wpi.pullUpDnControl(pin, this.GPIO_PULL_UPS[this._pull]);
    } else {
        throw exc.PinInvalidFunction('invalid function " + value + " for pin ' + this._number.toString());
    }
}

WiringPiPin.prototype.state = function (value) {
    if ( value == undefined) {
        if (this._pwm != undefined) {
            return this._duty_cycle;
        } else {
            return wpi.digitalRead(this._number);
        }        
    }
    if (this._pwm != undefined) {
        wpi.pwmWrite(this._number, value);
        this._duty_cycle = value;
    } else {
        wpi.digitalWrite (this._number, value);
    }
}

WiringPiPin.prototype.pull = function (value) {
    if (value == undefined) {
        return this._pull;
    }
    if (this.function != 'input') {
        throw new exc.PinFixedPull('cannot set pull on non-input pin ' + this._number.toString());
    }
    /*if value != 'up' and self.PI_INFO.pulled_up('GPIO%d' % self._number):
            raise PinFixedPull('%r has a physical pull-up resistor' % self)
    }*/
    this._pull = value;
    wpi.pullUpDnControl(pin, this.GPIO_PULL_UPS[this._pull]);
}
/*

    def _get_frequency(self):
        return self._frequency

    def _set_frequency(self, value):
        if self._frequency is None and value is not None:
            try:
                self._pwm = GPIO.PWM(self._number, value)
            except RuntimeError:
                raise PinPWMFixedValue('cannot start PWM on pin %r' % self)
            self._pwm.start(0)
            self._duty_cycle = 0
            self._frequency = value
        elif self._frequency is not None and value is not None:
            self._pwm.ChangeFrequency(value)
            self._frequency = value
        elif self._frequency is not None and value is None:
            self._pwm.stop()
            self._pwm = None
            self._duty_cycle = None
            self._frequency = None

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