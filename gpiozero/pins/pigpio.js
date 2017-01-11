const pigpio = require('js-pigpio');
const p = require("./index.js");
const inherit = require('../tools.js').inherit;
const Pin = require("./index.js").Pin;
const PiBoardInfo = require("./data.js").PiBoardInfo;

const _CONNECTIONS = []; // maps (host, port) to (connection, pi_info)
const _PINS = [];
/*
const GPIO_EDGES = {
    'both':    pigpio.EITHER_EDGE,
    'rising':  pigpio.RISING_EDGE,
    'falling': pigpio.FALLING_EDGE,
}*/

const GPIO_PULL_UPS = {
    'up':       pigpio.PUD_UP,
    'down':     pigpio.PUD_DOWN,
    'floating': pigpio.PUD_OFF,
};

/**
 *
 * Uses the library {@link https://www.npmjs.com/package/js-pigpio|js-pigpio} to interface to the Pi's GPIO pins. The pigpio library relies on a daemon {@link http://abyz.co.uk/rpi/pigpio/|pigpiod}  to be running as root to provide access to the GPIO pins, and communicates with this daemon over a network socket.
 *
 * While this does mean only the daemon itself should control the pins, the architecture does have several advantages:
 * * Pins can be remote controlled from another machine (the other machine doesn't even have to be a Raspberry Pi; it simply needs the `pigpio`_ client library installed on it),
 * * The daemon supports hardware PWM via the DMA controller.
 * * Your script itself doesn't require root privileges; it just needs to be able to communicate with the daemon.
 *
 * @example
 * from gpiozero.pins.pigpiod import PiGPIOPin
 * from gpiozero import LED
 * led = LED(PiGPIOPin(12))
 *
 * This is particularly useful for controlling pins on a remote machine. To
 * accomplish this simply specify the host (and optionally port) when
 * constructing the pin.
 *
 * @example
 * from gpiozero.pins.pigpiod import PiGPIOPin
 * from gpiozero import LED
 * from signal import pause
 * led = LED(PiGPIOPin(12, '192.168.0.2',5000)
 *
 * @param {number} number - GPIO Pin.
 * @param {string} [host] - IP address of remote server defaults to localhost.
 * @param {string} [port] - Port of remote server.
 * @returns {PiGPIOPin} - An instance of a PiGPIOPin.
 *
 * @class
 */
function PiGPIOPin (number, host, port) {
    if (host === undefined) {
        host = process.env.PIGPIO_ADDR || 'localhost';
    }
    if (port === undefined) {
        port =  process.env.PIGPIO_PORT || '8888';
    }
    const old_pin = _PINS[number+':'+host+':'+port];
    if (old_pin === undefined) {
        Pin.call(this);

        this._number = number;
        this._host = host;
        this._port = port;
        this._function = 'input';
        this._state = false;
        this._bounce = null;
        this._edges =  pigpio.EITHER_EDGE;
        this._when_changed = null;
        this._callback = null;
        this.pi_info(host, port);
        _PINS[number+':'+host+':'+port] = this;
        return this;
    }
}

PiGPIOPin.prototype = inherit(p.Pin.prototype);
PiGPIOPin.prototype.constructor = PiGPIOPin;

exports.PiGPIOPin = PiGPIOPin;

PiGPIOPin.prototype.pi_info = function (host, port) {
    if (host === undefined) {
        host = process.env.PIGPIO_ADDR || 'localhost';
    }
    if (port === undefined) {
        port =  process.env.PIGPIO_PORT || '8888';
    }
    let connection = _CONNECTIONS[host+':'+ port];

    if(connection === undefined) {
        const that = this;
        connection = pigpio.pi(host, port, (err) => {
            if (err !== undefined) {
                throw new Error(err);
            }
            connection.get_hardware_revision((err,data)=> {
                const info = PiBoardInfo(data);
                that._connection = connection;
                that._pi_info = info;
                that._pi_info.physical_pin('GPIO' + that._number); //Cause an error if not valid
                that._pull =  that._pi_info.pulled_up('GPIO' + that._number)?'up':'floating';
                that._connection.set_mode(this._number, pigpio.INPUT);
                that._connection.set_pull_up_down(that._number, GPIO_PULL_UPS[this._pull]);
                that._connection.set_glitch_filter(that._number, 0);
                _CONNECTIONS[host + ':' + port] = {connection, info};
            });
        });
    } else {
        this._connection = connection.connection;
        this._pi_info = connection._info;
    }
};
 /*
class PiGPIOPin(Pin):
"""
GPIO_FUNCTIONS = {
    'input':   pigpio.INPUT,
    'output':  pigpio.OUTPUT,
    'alt0':    pigpio.ALT0,
    'alt1':    pigpio.ALT1,
    'alt2':    pigpio.ALT2,
    'alt3':    pigpio.ALT3,
    'alt4':    pigpio.ALT4,
    'alt5':    pigpio.ALT5,
}


GPIO_FUNCTION_NAMES = {v: k for (k, v) in GPIO_FUNCTIONS.items()}
GPIO_PULL_UP_NAMES = {v: k for (k, v) in GPIO_PULL_UPS.items()}
GPIO_EDGES_NAMES = {v: k for (k, v) in GPIO_EDGES.items()}

def __repr__(self):
if self._host == 'localhost':
return "GPIO%d" % self._number
else:
return "GPIO%d on %s:%d" % (self._number, self._host, self._port)

@property
def host(self):
return self._host

@property
def port(self):
return self._port

@property
def number(self):
return self._number

def close(self):
# If we're shutting down, the connection may have disconnected itself
# already. Unfortunately, the connection's "connected" property is
# rather buggy - disconnecting doesn't set it to False! So we're
# naughty and check an internal variable instead...
if self._connection.sl.s is not None:
    self.frequency = None
self.when_changed = None
self.function = 'input'
self.pull = 'up' if self._pi_info.pulled_up('GPIO%d' % self.number) else 'floating'

def _get_function(self):
return self.GPIO_FUNCTION_NAMES[self._connection.get_mode(self._number)]

def _set_function(self, value):
if value != 'input':
self._pull = 'floating'
try:
self._connection.set_mode(self._number, self.GPIO_FUNCTIONS[value])
except KeyError:
    raise PinInvalidFunction('invalid function "%s" for pin %r' % (value, self))

def _get_state(self):
if self._pwm:
return (
    self._connection.get_PWM_dutycycle(self._number) /
    self._connection.get_PWM_range(self._number)
)
else:
return bool(self._connection.read(self._number))

def _set_state(self, value):
if self._pwm:
try:
value = int(value * self._connection.get_PWM_range(self._number))
if value != self._connection.get_PWM_dutycycle(self._number):
self._connection.set_PWM_dutycycle(self._number, value)
except pigpio.error:
raise PinInvalidState('invalid state "%s" for pin %r' % (value, self))
elif self.function == 'input':
raise PinSetInput('cannot set state of pin %r' % self)
else:
# write forces pin to OUTPUT, hence the check above
self._connection.write(self._number, bool(value))

def _get_pull(self):
return self._pull

def _set_pull(self, value):
if self.function != 'input':
raise PinFixedPull('cannot set pull on non-input pin %r' % self)
if value != 'up' and self._pi_info.pulled_up('GPIO%d' % self._number):
raise PinFixedPull('%r has a physical pull-up resistor' % self)
try:
self._connection.set_pull_up_down(self._number, self.GPIO_PULL_UPS[value])
self._pull = value
except KeyError:
    raise PinInvalidPull('invalid pull "%s" for pin %r' % (value, self))

def _get_frequency(self):
if self._pwm:
return self._connection.get_PWM_frequency(self._number)
return None

def _set_frequency(self, value):
if not self._pwm and value is not None:
    self._connection.set_PWM_frequency(self._number, value)
self._connection.set_PWM_range(self._number, 10000)
self._connection.set_PWM_dutycycle(self._number, 0)
self._pwm = True
elif self._pwm and value is not None:
    if value != self._connection.get_PWM_frequency(self._number):
self._connection.set_PWM_frequency(self._number, value)
self._connection.set_PWM_range(self._number, 10000)
elif self._pwm and value is None:
    self._connection.write(self._number, 0)
self._pwm = False

def _get_bounce(self):
return None if not self._bounce else self._bounce / 1000000

def _set_bounce(self, value):
if value is None:
    value = 0
elif value < 0:
raise PinInvalidBounce('bounce must be 0 or greater')
self._connection.set_glitch_filter(self._number, int(value * 1000000))

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
if self._callback is None:
    return None
return self._callback.callb.func

def _set_when_changed(self, value):
if self._callback is not None:
    self._callback.cancel()
self._callback = None
if value is not None:
    self._callback = self._connection.callback(
        self._number, self._edges,
        lambda gpio, level, tick: value())

*/