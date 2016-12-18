var Pin = require ("./index.js").Pin,
    exc = require("../exc.js"),
    expect = require('chai').expect,
    assert = require('chai').assert,
    isclose = require('../compat.js').isclose,
    inherit = require ('../tools.js').inherit,
    _PINS = [];

function MockPin(number) {
    /*
    A mock pin used primarily for testing. This class does *not* support PWM.
    */    

    if ( number < 0 || number > 54){
        throw new Error('invalid pin ' + number.toString() + ' specified (must be 0..53)' );
    }    
    var old_pin = _PINS[number];
    if (old_pin === undefined) {
        Pin.call(this);
        _PINS[number] = this;
        this._number = number;
        this._function = 'input';
        this._state = false;
        this._pull = 'floating';
        this._bounce = undefined;
        this._edges = 'both';
        this._when_changed = undefined;
        this.clear_states();
        return this;
    }
    // Ensure the pin class expected supports PWM (or not)
    //if issubclass(cls, MockPWMPin) != isinstance(old_pin, MockPWMPin):
    //    raise ValueError('pin %d is already in use as a %s' % (number, old_pin.__class__.__name__))
    return old_pin;   
}
MockPin.prototype = inherit(Pin.prototype);
MockPin.prototype.constructor = MockPin;

MockPin.prototype.clear_states = function() {        
    this._last_change = (new Date()).getTime();
    this.states = [{time:0.0, state: this._state}];
};

MockPin.prototype.state_history = function() {        
    return this.states;
};

MockPin.prototype.state = function (value) {
    if (value === undefined) {
        return this._state;
    }
    if (this._function != 'output') {
        throw new exc.PinSetInput('cannot set state of pin ' + this);
    }
    if (value != '0' && value != '1') {
        throw new exc.PinSetInput('Invalid Value - must be 1 or 0 not ' + value.toString());
    }
    this._change_state(Boolean(value)) ;
};

MockPin.prototype._change_state = function (value) {
    if (this._state != value) {
        var t = (new Date()).getTime();
        this._state = value;
        this.states.push({time:t - this._last_change, state: value});
        this._last_change = t;
        return true;
    }
    return false;
};

MockPin.prototype.pin_function = function (value) {
    if (value === undefined) {
        return this._function;
    }
    if (value == 'input' || value == 'output') {
        this._function = value;
        if (value == 'input') {
            //# Drive the input to the pull
            //self._set_pull(self._get_pull())
        }
    } else {
        throw new exc.PinSetInput('Invalid Value - must be input or output not ' + value.toString());
    }        
};

MockPin.prototype.close = function () {    
    this.when_changed = undefined;
    this._function = 'input';

};

MockPin.prototype.frequency = function (value) {
    if (value === undefined) {
        return;
    }
    throw new exc.PinPWMUnsupported();
};

MockPin.prototype.number = function(){ 
    return this._number; 
};

MockPin.prototype.assert_states = function (expected) {
    // Tests that the pin went through the expected states (a list of values)
    for (var i = 0, len = expected.length; i<len; i++ ){
        var actual = this.state_history()[i].state;
        assert(isclose(actual, expected[i] , undefined, 10),actual + " not equal to " + expected[i] )  ;
    } 
};

MockPin.prototype.assert_states_and_times = function (expected) {
    // Tests that the pin went through the expected states at the expected
    // times (times are compared with a tolerance of tens-of-milliseconds as
    // that's about all we can reasonably expect in a non-realtime
    // environment on a Pi 1)
    assert(expected.length<=this.state_history().length, 'Expected length:'+expected.length+' Actual length:' + this.state_history().length);

    for (var i = 0; i<expected.length; i++ ){
        var actual = this.state_history()[i].state;
        assert(isclose(actual, expected[i].state , 0.05, undefined),actual + " not equal to " + expected[i].state )  ;             

        if (expected[i].time === 0) {
            actual = this.state_history()[i].time;
            assert (actual == expected[i].time, "Times are not equal Expected:" + expected[i].time+" Actual:"+actual );
        } else if (expected[i].time !== 1) {
            actual = this.state_history()[i].time;
            assert(isclose(actual, expected[i].time , undefined, 10),actual + " not equal to " + expected[i].time )  ;             
        }                     
    }
};


exports.MockPin = MockPin;


function clear_pins () {
    _PINS = {};
}

exports.clear_pins = clear_pins;


function MockPWMPin(number) {
    MockPin.call(this, number);
    this._state = 0.0;
    this.clear_states();
    this._frequency = undefined;
}

MockPWMPin.prototype = inherit(MockPin.prototype);
MockPWMPin.prototype.constructor = MockPWMPin;

exports.MockPWMPin = MockPWMPin;

MockPWMPin.prototype.close = function () {
    this.frequency(undefined);
    MockPin.prototype.close.call(this);
};

MockPWMPin.prototype.frequency = function (value) {
    if (value === undefined) {
        return this._frequency;
    }
    if (this._function!='output') {
        throw new exc.PinSetInput("Pin is not set for output function");
    }
    if (value == -1) {
        this._frequency = undefined;
        this._change_state(0.0);
    } else {
        this._frequency = value;
    }
};

MockPWMPin.prototype.state = function (value) {
    if (value === undefined) {
        return this._state;
    }
    if (this._function != 'output') {
       throw new exc.PinSetInput('cannot set state of pin ' + this);
    }
    if (value<0 || value>1) {
            throw new exc.OutputDeviceBadValue("initial_value must be between 0 and 1, actual=:"+value);
    }
    this._change_state(parseFloat(value));
};

MockPWMPin.prototype.blink = function(on_time, off_time, fade_in_time, fade_out_time, n, fps, callback) {
    this.on_time = (on_time === undefined ? 1 : on_time);
    this.off_time = (off_time === undefined ? 1 : off_time);
    this.fade_in_time = (fade_in_time === undefined ? 0 : fade_in_time);
    this.fade_out_time = (fade_out_time === undefined ? 0 : fade_out_time);
    this.fps = (fps === undefined ? 50 : fps);
    this.n = (n === undefined ? 0 : n);
    this.sequence = [];
    this.blink_callback = callback;
    var i=0;

    if (this.fade_in_time > 0) {
        for (i = 0; i<this.fps*this.fade_in_time; i++ ) {
            this.sequence.push({value: i * (1 / this.fps) / this.fade_in_time, delay: 1/this.fps});
        }
    }
    this.sequence.push({value: 1, delay: this.on_time});

    if (this.fade_out_time > 0) {
        for (i = 0; i<this.fps*this.fade_out_time; i++ ) {
            this.sequence.push({value:  1 - (i * (1 / this.fps)) / this.fade_out_time, delay: 1/ this.fps});
        }
    }
    this.sequence.push({value: 0, delay: this.off_time});

    if (this.n>0) {
        for (i = 0; i<(this.n-1); i++) {
            this.sequence = this.sequence.concat(this.sequence);
        }

        var nextStep = this.sequence.pop();
        this.state(nextStep.value);
        var that = this;
        this._blink_timer = setTimeout(that._run_blink, nextStep.delay, this.sequence, this);
    }
};

MockPWMPin.prototype._run_blink = function (sequence, that){
    if(sequence.length>0) {
        var nextStep = sequence.pop();
        that.state (nextStep.value);        
        that._blink_timer = setTimeout(that._run_blink, nextStep.delay, sequence, that);
    } else {
        if(that.blink_callback !== undefined)
        {
            that.blink_callback();
        }
    }
};

    
/*    
    def pi_info(cls):
        return pi_info('a21041') # Pretend we're a Pi 2B       

    def __repr__(self):
        return 'MOCK%d' % self._number

    @property
    def number(self):
        return self._number

    def close(self):
        self.when_changed = None
        self.function = 'input'

    def _get_frequency(self):
        return None

    def _set_frequency(self, value):
        if value is not None:
            raise PinPWMUnsupported()

    def _get_pull(self):
        return self._pull

    def _set_pull(self, value):
        assert self._function == 'input'
        assert value in ('floating', 'up', 'down')
        self._pull = value
        if value == 'up':
            self.drive_high()
        elif value == 'down':
            self.drive_low()

    def _get_bounce(self):
        return self._bounce

    def _set_bounce(self, value):
        # XXX Need to implement this
        self._bounce = value

    def _get_edges(self):
        return self._edges

    def _set_edges(self, value):
        assert value in ('none', 'falling', 'rising', 'both')
        self._edges = value

    def _get_when_changed(self):
        return self._when_changed

    def _set_when_changed(self, value):
        self._when_changed = value

    def drive_high(self):
        assert self._function == 'input'
        if self._change_state(True):
            if self._edges in ('both', 'rising') and self._when_changed is not None:
                self._when_changed()

    def drive_low(self):
        assert self._function == 'input'
        if self._change_state(False):
            if self._edges in ('both', 'falling') and self._when_changed is not None:
                self._when_changed()

    def clear_states(self):
        self._last_change = time()
        self.states = [PinState(0.0, self._state)]

    def assert_states(self, expected_states):
        # Tests that the pin went through the expected states (a list of values)
        for actual, expected in zip(self.states, expected_states):
            assert actual.state == expected

    def assert_states_and_times(self, expected_states):
        # Tests that the pin went through the expected states at the expected
        # times (times are compared with a tolerance of tens-of-milliseconds as
        # that's about all we can reasonably expect in a non-realtime
        # environment on a Pi 1)
        for actual, expected in zip(self.states, expected_states):
            assert isclose(actual.timestamp, expected[0], rel_tol=0.05, abs_tol=0.05)
            assert isclose(actual.state, expected[1])


class MockPulledUpPin(MockPin):
    """
    This derivative of :class:`MockPin` emulates a pin with a physical pull-up
    resistor.
    """
    def _set_pull(self, value):
        if value != 'up':
            raise PinFixedPull('pin has a physical pull-up resistor')


class MockChargingPin(MockPin):
    """
    This derivative of :class:`MockPin` emulates a pin which, when set to
    input, waits a predetermined length of time and then drives itself high
    (as if attached to, e.g. a typical circuit using an LDR and a capacitor
    to time the charging rate).
    """
    def __init__(self, number):
        super(MockChargingPin, self).__init__()
        self.charge_time = 0.01 # dark charging time
        self._charge_stop = Event()
        self._charge_thread = None

    def _set_function(self, value):
        super(MockChargingPin, self)._set_function(value)
        if value == 'input':
            if self._charge_thread:
                self._charge_stop.set()
                self._charge_thread.join()
            self._charge_stop.clear()
            self._charge_thread = Thread(target=self._charge)
            self._charge_thread.start()
        elif value == 'output':
            if self._charge_thread:
                self._charge_stop.set()
                self._charge_thread.join()

    def _charge(self):
        if not self._charge_stop.wait(self.charge_time):
            try:
                self.drive_high()
            except AssertionError:
                # Charging pins are typically flipped between input and output
                # repeatedly; if another thread has already flipped us to
                # output ignore the assertion-error resulting from attempting
                # to drive the pin high
                pass


class MockTriggerPin(MockPin):
    """
    This derivative of :class:`MockPin` is intended to be used with another
    :class:`MockPin` to emulate a distance sensor. Set :attr:`echo_pin` to the
    corresponding pin instance. When this pin is driven high it will trigger
    the echo pin to drive high for the echo time.
    """
    def __init__(self, number):
        super(MockTriggerPin, self).__init__()
        self.echo_pin = None
        self.echo_time = 0.04 # longest echo time
        self._echo_thread = None

    def _set_state(self, value):
        super(MockTriggerPin, self)._set_state(value)
        if value:
            if self._echo_thread:
                self._echo_thread.join()
            self._echo_thread = Thread(target=self._echo)
            self._echo_thread.start()

    def _echo(self):
        sleep(0.001)
        self.echo_pin.drive_high()
        sleep(self.echo_time)
        self.echo_pin.drive_low()





class MockSPIClockPin(MockPin):
    """
    This derivative of :class:`MockPin` is intended to be used as the clock pin
    of a mock SPI device. It is not intended for direct construction in tests;
    rather, construct a :class:`MockSPIDevice` with various pin numbers, and
    this class will be used for the clock pin.
    """
    def __init__(self, number):
        super(MockSPIClockPin, self).__init__()
        if not hasattr(self, 'spi_devices'):
            self.spi_devices = []

    def _set_state(self, value):
        super(MockSPIClockPin, self)._set_state(value)
        for dev in self.spi_devices:
            dev.on_clock()


class MockSPISelectPin(MockPin):
    """
    This derivative of :class:`MockPin` is intended to be used as the select
    pin of a mock SPI device. It is not intended for direct construction in
    tests; rather, construct a :class:`MockSPIDevice` with various pin numbers,
    and this class will be used for the select pin.
    """
    def __init__(self, number):
        super(MockSPISelectPin, self).__init__()
        if not hasattr(self, 'spi_device'):
            self.spi_device = None

    def _set_state(self, value):
        super(MockSPISelectPin, self)._set_state(value)
        if self.spi_device:
            self.spi_device.on_select()


class MockSPIDevice(object):
    def __init__(
            self, clock_pin, mosi_pin, miso_pin, select_pin=None,
            clock_polarity=False, clock_phase=False, lsb_first=False,
            bits_per_word=8, select_high=False):
        self.clock_pin = MockSPIClockPin(clock_pin)
        self.mosi_pin = None if mosi_pin is None else MockPin(mosi_pin)
        self.miso_pin = None if miso_pin is None else MockPin(miso_pin)
        self.select_pin = None if select_pin is None else MockSPISelectPin(select_pin)
        self.clock_polarity = clock_polarity
        self.clock_phase = clock_phase
        self.lsb_first = lsb_first
        self.bits_per_word = bits_per_word
        self.select_high = select_high
        self.rx_bit = 0
        self.rx_buf = []
        self.tx_buf = []
        self.clock_pin.spi_devices.append(self)
        self.select_pin.spi_device = self

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, exc_tb):
        self.close()

    def close(self):
        if self in self.clock_pin.spi_devices:
            self.clock_pin.spi_devices.remove(self)
        if self.select_pin is not None:
            self.select_pin.spi_device = None

    def on_select(self):
        if self.select_pin.state == self.select_high:
            self.on_start()

    def on_clock(self):
        # Don't do anything if this SPI device isn't currently selected
        if self.select_pin is None or self.select_pin.state == self.select_high:
            # The XOR of the clock pin's values, polarity and phase indicates
            # whether we're meant to be acting on this edge
            if self.clock_pin.state ^ self.clock_polarity ^ self.clock_phase:
                self.rx_bit += 1
                if self.mosi_pin is not None:
                    self.rx_buf.append(self.mosi_pin.state)
                if self.miso_pin is not None:
                    try:
                        tx_value = self.tx_buf.pop(0)
                    except IndexError:
                        tx_value = 0
                    if tx_value:
                        self.miso_pin.drive_high()
                    else:
                        self.miso_pin.drive_low()
                self.on_bit()

    def on_start(self):
        """
        Override this in descendents to detect when the mock SPI device's
        select line is activated.
        """
        self.rx_bit = 0
        self.rx_buf = []
        self.tx_buf = []

    def on_bit(self):
        """
        Override this in descendents to react to receiving a bit.

        The :attr:`rx_bit` attribute gives the index of the bit received (this
        is reset to 0 by default by :meth:`on_select`). The :attr:`rx_buf`
        sequence gives the sequence of 1s and 0s that have been recevied so
        far. The :attr:`tx_buf` sequence gives the sequence of 1s and 0s to
        transmit on the next clock pulses. All these attributes can be modified
        within this method.

        The :meth:`rx_word` and :meth:`tx_word` methods can also be used to
        read and append to the buffers using integers instead of bool bits.
        """
        pass

    def rx_word(self):
        result = 0
        bits = reversed(self.rx_buf) if self.lsb_first else self.rx_buf
        for bit in bits:
            result <<= 1
            result |= bit
        return result

    def tx_word(self, value, bits_per_word=None):
        if bits_per_word is None:
            bits_per_word = self.bits_per_word
        bits = [0] * bits_per_word
        for bit in range(bits_per_word):
            bits[bit] = value & 1
            value >>= 1
        assert not value
        if not self.lsb_first:
            bits = reversed(bits)
        self.tx_buf.extend(bits)

*/