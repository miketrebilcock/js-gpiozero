/*global it describe afterEach */

var expect = require('chai').expect,
    assert = require('chai').assert,
    gz = require('../gpiozero/'),
    mp = require('../gpiozero/pins/mock.js'),
    with_close = require('../gpiozero/').with_close;


//QUnit.module("devices");
describe('devices', () => {

    afterEach(() => {
        mp.clear_pins();
    });

    it('no_pin_throws_error', () => {
        expect(() => {
            /*eslint no-new: off*/
            new gz.GPIODevice();
        }).to.throw(gz.GPIOPinMissing);
    });

    it('device_init', () => {
        var pin = new mp.MockPin(1);
        with_close(new gz.GPIODevice(pin), (device) => {
            assert(device.closed() === false, "Device is incorrectly reporting closed");
            assert(device.pin() === pin, "Device has not returned correct pin");
        });
    });

    it('device_init_twice_on_same_pin_fails', () => {
        var pin = new mp.MockPin(1);
        with_close(new gz.GPIODevice(pin), () => {
            expect(() => {
                /*eslint no-new: off*/
                new gz.GPIODevice(pin);
            }).to.throw(gz.GPIOPinInUse);
        });
    });

    it('device_init_twice_on_diffent_pins_suceeds', () => {
        var pin = new mp.MockPin(1),
            pin2 = new mp.MockPin(2);
        with_close(new gz.GPIODevice(pin), (device1) => {
            with_close(new gz.GPIODevice(pin2), (device2) => {
                assert(device1.pin() === pin, "Device has not returned correct pin");
                assert(device2.pin() === pin2, "Device has not returned correct pin");
            });
        });
    });

    it('device_close', () => {
        var pin = new mp.MockPin(1),
            device = new gz.GPIODevice(pin);
        device.close();
        assert(device.closed() === true, "Device is incorrectly reporting open");
        assert(device.pin() === undefined, "Device still holding onto pin");
    });

    it('reopen_same_pin', () => {
        var pin = new mp.MockPin(1),
            device = new gz.GPIODevice(pin);
        device.close();
        var device2 = new gz.GPIODevice(pin);
        assert(device2.closed() === false, "Device is incorrectly reporting closed");
        assert(device2.pin() === pin, "Device has not returned correct pin");
        assert(device.closed() === true, "Device is incorrectly reporting open");
        assert(device.pin() === undefined, "Device still holding onto pin");
        device2.close();
    });

    it('device_toString', () => {
        var pin = new mp.MockPin(1);
        with_close(new gz.GPIODevice(pin), (device) => {
            expect(device.toString()).to.equal("<gpiozero.GPIODevice object on pin 1, is_active=false>");
        });
    });

    it('compsite_device_sequence', () => {
        with_close(new gz.CompositeDevice([new gz.OutputDevice(new mp.MockPin(2)),
                new gz.OutputDevice(new mp.MockPin(3))]),
            (device) => {
                assert(device.length() === 2, "CompositeDevice length is not 2");
                assert(device[0]._pin.number() === 2);
                assert(device[1]._pin.number() === 3);
                assert(device.namedtuple()[0] === '_0', "CompositeDevice NamedTuple returned "+device.namedtuple());
                assert(device.namedtuple()[1] === '_1', "CompositeDevice NamedTuple returned "+device.namedtuple());
            });
    });

    it('compsite_device_values', () => {
        with_close(new gz.CompositeDevice([new gz.OutputDevice(new mp.MockPin(2)),
                new gz.OutputDevice(new mp.MockPin(3))]),
            (device) => {
                assert(device.value()[0] === false, "CompositeDevice value[0] is not false");
                assert(device.value()[1] === false, "CompositeDevice value[1] is not false");
                assert(device.is_active() === false, "CompositeDevice is_active is not false");
                device[0]._pin.state(true);
                assert(true === device.value()[0], "CompositeDevice value[0] is not true");
                assert(false === device.value()[1], "CompositeDevice value[1] is not false");
                assert(true === device.is_active(), "CompositeDevice is_active is not true");
            });
    });

    it('compsite_device_named', () => {
        with_close(new gz.CompositeDevice(undefined,[
                ['foo', new gz.OutputDevice(new mp.MockPin(2))],
                ['bar', new gz.OutputDevice(new mp.MockPin(3))]
            ]),
            (device) => {
                assert(device.namedtuple()[0] === 'foo', "CompositeDevice NamedTuple returned "+device.namedtuple());
                assert(device.namedtuple()[1] === 'bar', "CompositeDevice NamedTuple returned "+device.namedtuple());
                assert(device.value()[0] === false, "CompositeDevice value[0] is not false");
                assert(device.value()[1] === false, "CompositeDevice value[1] is not false");
                assert(device.is_active() === false, "CompositeDevice is_active is not false");
                assert(device.foo.value() === false, "CompositeDevice value[0] is not false");
                assert(device.bar.value() === false, "CompositeDevice value[1] is not false");
                device.foo._pin.state(true);
                assert(device.foo.value() === true, "CompositeDevice value[0] is not true");
            });
    });

    /*

def test_composite_device_bad_init():
    with pytest.raises(ValueError):
        CompositeDevice(foo=1, bar=2, _order=('foo',))
    with pytest.raises(ValueError):
        CompositeDevice(close=1)
    with pytest.raises(ValueError):
        CompositeDevice(2)
    with pytest.raises(ValueError):
        CompositeDevice(MockPin(2))

def test_composite_device_read_only():
    device = CompositeDevice(
        foo=InputDevice(MockPin(2)),
        bar=InputDevice(MockPin(3))
        )
    with pytest.raises(AttributeError):
        device.foo = 1
	
	 */

});

/*
def test_device_repr():
    pin = MockPin(2)
    with GPIODevice(pin) as device:
        assert repr(device) == '<gpiozero.GPIODevice object on pin %s, is_active=False>' % pin

def test_device_repr_after_close():
    pin = MockPin(2)
    device = GPIODevice(pin)
    device.close()
    assert repr(device) == '<gpiozero.GPIODevice object closed>'


*/