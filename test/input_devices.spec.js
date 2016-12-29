/*global it describe afterEach context */
const expect = require('chai').expect;
const assert = require('chai').assert;
const gz = require('../gpiozero/index.js');
const mp = require('../gpiozero/pins/mock.js');
const with_close = require ('../gpiozero/tools.js').with_close;

describe('input_devices', () => {

    afterEach(() => {
        mp.clear_pins();
    });
    context('input_device', ()=> {
        it('initial_values', () => {
            const pin = new mp.MockPin(2);
            with_close(new gz.InputDevice(pin, true), (device) => {
                assert(pin.pin_function() === 'input', 'Input pin function is not set to input');
                assert(pin.pull() === 'up', 'Input pin is not set to pull up');
                assert(device.pull_up(), 'Device pull_up is not true');
                device.close();
                device = new gz.InputDevice(pin);
                assert(pin.pull() === 'down', 'Input pin is not set to pull down');
                assert(device.pull_up() === false, 'Device pull_up is not false');
            });
        });

        it('is_active_low', () => {
            const pin = new mp.MockPin(2);
            with_close(new gz.InputDevice(pin, true), (device) => {
                pin.drive_high();
                assert(device.is_active() === false, 'Device should not be active');
                assert(device.toString() === '<gpiozero.InputDevice object on pin MOCK2, pull_up=true, is_active=false>', 'ToString is incorrect:'+device.toString());
                pin.drive_low();
                assert(device.is_active() === true, 'Device should be active');
                assert(device.toString() === '<gpiozero.InputDevice object on pin MOCK2, pull_up=true, is_active=true>', 'ToString is incorrect:'+device.toString());
            });
        });

        it('is_active_high', () => {
            const pin = new mp.MockPin(2);
            with_close(new gz.InputDevice(pin), (device) => {
                pin.drive_high();
                assert(device.is_active() === true, 'Device should be active');
                assert(device.toString() === '<gpiozero.InputDevice object on pin MOCK2, pull_up=false, is_active=true>', 'ToString is incorrect:'+device.toString());
                pin.drive_low();
                assert(device.is_active() === false, 'Device should not be active');
                assert(device.toString() === '<gpiozero.InputDevice object on pin MOCK2, pull_up=false, is_active=false>', 'ToString is incorrect:'+device.toString());
            });
        });

        it('is pulled up', () => {
            const pin = new mp.MockPulledUpPin(2);
                expect(() => {
                    /*eslint no-new: off*/
                    new gz.InputDevice(pin, true);
                }).to.throw(gz.PinFixedPull);
        });
    });

});

/*


 def test_input_pulled_up():
 pin = MockPulledUpPin(2)
 with pytest.raises(PinFixedPull):
 InputDevice(pin, pull_up=False)
 */