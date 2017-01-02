const pigpiod = require('@stheine/pigpiod');
const p = require("./index.js");
const exc = require("../exc.js");
const inherit = require('../tools.js').inherit;
/**
 * Uses the {link http://abyz.co.uk/rpi/pigpio/|pigpio) library to interface to the Pi's GPIO pins. The pigpio
 * library relies on a daemon (``pigpiod``) to be running as root to provide
 * access to the GPIO pins, and communicates with this daemon over a network
 * socket.
 *
 * While this does mean only the daemon itself should control the pins, the
 architecture does have several advantages:

 * * Pins can be remote controlled from another machine (the other
 * machine doesn't even have to be a Raspberry Pi; it simply needs the
 * `pigpio`_ client library installed on it)
 * * The daemon supports hardware PWM via the DMA controller
 * * Your script itself doesn't require root privileges; it just needs to
 * be able to communicate with the daemon
 * You can construct pigpiod pins manually like so:
 *
 * @example
 * from gpiozero.pins.pigpiod import PiGPIOPin
 * from gpiozero import LED
 * led = LED(PiGPIOPin(12))
 *
 * This is particularly useful for controlling pins on a remote machine. To
 * accomplish this simply specify the host (and optionally port) when
 * constructing the pin:
 *
 * @example
 * from gpiozero.pins.pigpiod import PiGPIOPin
 * from gpiozero import LED
 * from signal import pause
 * led = LED(PiGPIOPin(12, host='192.168.0.2'))
 *
 * @param {int} number
 * @class
 */
function PiGPIOPin(number, host, port) {

    assert(number instanceof int, "Pin number must be an integer");
    if (host === undefined) {
        host = process.env.PIGPIO_ADDR | 'localhost';
    }
    if (port === undefined) {
        port = process.env.PIGPIO_PORT | '8888';
    }

    if (_PINS[host+port+number] !== undefined) {
        return _PINS[host+port+number];
    }

    p.Pin.call(this);

    this._pi_info = pi_info(host, port); //implicitly creates connection
    this._connection = _CONNECTIONS[host+port]['connection'];

    this._host = host;
    this._port = port;
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


try:
self._pi_info.physical_pin('GPIO%d' % number)
except PinNoPins:
    warnings.warn(
        PinNonPhysical(
            'no physical pins exist for GPIO%d' % number))
self._host = host
self._port = port
self._number = number
self._pull = 'up' if self._pi_info.pulled_up('GPIO%d' % number) else 'floating'
self._pwm = False
self._bounce = None
self._when_changed = None
self._callback = None
self._edges = pigpio.EITHER_EDGE
try:
self._connection.set_mode(self._number, pigpio.INPUT)
except pigpio.error as e:
raise ValueError(e)
self._connection.set_pull_up_down(self._number, self.GPIO_PULL_UPS[self._pull])
self._connection.set_glitch_filter(self._number, 0)
cls._PINS[(host, port, number)] = self
return self
}

function pi_info(host, port) {

    let connection = null;
    let info = null;
    let revision = null;
    if(_CONNECTIONS[host+port] !== undefined) {
        info = _CONNECTIONS[host+post]['info'];
        connection = _CONNECTIONS[host+post]['connection'];
    } else {
        connection = pigpiod.pigpio_start();
        revision = '%04x'% pigpiod.get_hardware_revision(connection);
        info = pi_info (revision);
        _CONNECTIONS[host+port] = {'info': info, 'connection':connection};
    }
    return info;
}

const _CONNECTIONS = {}; //maps (host, port) to (connection, pi_info)
const _PINS = {};


const GPIO_FUNCTIONS = {
    'input':   pigpiod.INPUT,
    'output':  pigpiod.OUTPUT,
    'alt0':    pigpiod.ALT0,
    'alt1':    pigpiod.ALT1,
    'alt2':    pigpiod.ALT2,
    'alt3':    pigpiod.ALT3,
    'alt4':    pigpiod.ALT4,
    'alt5':    pigpiod.ALT5,
};

GPIO_PULL_UPS = {
    'up':       pigpiod.PUD_UP,
    'down':     pigpiod.PUD_DOWN,
    'floating': pigpiod.PUD_OFF,
}

GPIO_EDGES = {
    'both':    pigpiod.EITHER_EDGE,
    'rising':  pigpiod.RISING_EDGE,
    'falling': pigpiod.FALLING_EDGE,
}


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





