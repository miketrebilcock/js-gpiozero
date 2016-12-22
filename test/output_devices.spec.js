/*global it describe afterEach */

const expect = require("chai").expect;
const assert = require("chai").assert;
const gz = require("../gpiozero/");
const mp = require("../gpiozero/pins/mock.js");
const isclose = require("../gpiozero/compat.js").isclose;
const with_close = require ("../gpiozero/tools.js").with_close;

describe("output_devices", () => {

    afterEach(() => {
        mp.clear_pins();
    });

    it('output_initial_values', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.OutputDevice(pin, undefined, false), () => {
            expect(pin.pin_function()).to.equal('output');
            expect(pin.state()).to.equal(false);
        });
        with_close(new gz.OutputDevice(pin, undefined, true), () => {
            expect(pin.state()).to.equal(true);
        });
        with_close(new gz.OutputDevice(pin, undefined, undefined), () => {
            expect(pin.state()).to.equal(true);
        });
    });

    it('output_write_active_high', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.OutputDevice(pin, undefined, undefined), (device) => {
            device.on();
            expect(pin.state()).to.equal(true);
            device.off();
            expect(pin.state()).to.equal(false);
        });
    });

    it('output_write_active_low', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.OutputDevice(pin, false, undefined), (device) => {
            device.on();
            expect(pin.state()).to.equal(false);
            device.off();
            expect(pin.state()).to.equal(true);
        });
    });

    it('output_write_closed', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.OutputDevice(pin, false, undefined), (device) => {
            device.close();
            expect(device.closed()).to.equal(true);
            expect(() => {
                device.on();
            }).to.throw(gz.DeviceClosed);
        });
    });

    it('output_write_silly', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.OutputDevice(pin), (device) => {
            pin.pin_function('input');
            expect(() => {
                device.on();
            }).to.throw(gz.PinSetInput);
        });
    });

    it('output_value', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.OutputDevice(pin), (device) => {
            expect(device.value()).to.equal(false);
            expect(pin.state()).to.equal(false);
            device.on();
            expect(device.value()).to.equal(true);
            expect(pin.state()).to.equal(true);
            device.value(false);
            expect(device.value()).to.equal(false);
            expect(pin.state()).to.equal(false);
        });
    });

    it('output_digital_toggle', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.DigitalOutputDevice(pin), (device) => {
            expect(device.value()).to.equal(false);
            expect(pin.state()).to.equal(false);
            device.toggle();
            expect(device.value()).to.equal(true);
            expect(pin.state()).to.equal(true);
            device.toggle();
            expect(device.value()).to.equal(false);
            expect(pin.state()).to.equal(false);
        });
    });

    it('output_LED_is_Lit', () => {
        var pin = new mp.MockPin(2);
        with_close(new gz.LED(pin), (device) => {
            expect(device.is_lit()).to.equal(false);
            device.toggle();
            expect(device.is_lit()).to.equal(true);
            device.off();
            expect(device.is_lit()).to.equal(false);
        });
    });

    it('test_output_blink_background', (done) => {
        var pin = new mp.MockPin(2);
        var device = new gz.DigitalOutputDevice(pin);
        var expected = [{
            time: 0,
            state: false
        }, {
            time: 1,
            state: true
        }, {
            time: 201,
            state: false
        }, {
            time: 101,
            state: true
        }, {
            time: 201,
            state: false
        }];
        device.blink(0.2, 0.1, 2);
        setTimeout(() => {
            try {
                pin.assert_states_and_times(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
            } catch (e) {
                device.close();
                done(e); // failure: call done with an error Object to indicate that it() failed
            }
        }, 1500);


    });

    it('test_output_blink_interrupt_while_on', (done) => {
        var pin = new mp.MockPin(2);
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(1, 0.1);
        var expected = [false, true, false];
        setTimeout(() => {
            try {
                device.off();
                expect(pin._blink_thread).to.equal(undefined);

                pin.assert_states(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
            } catch (e) {
                device.close();
                done(e); // failure: call done with an error Object to indicate that it() failed
            }
        }, 200);
    });

    it('test_output_blink_interrupt_while_off', (done) => {
        var pin = new mp.MockPin(2);
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(0.1, 1);
        var expected = [false, true, false];
        setTimeout(() => {
            try {
                device.off();

                expect(pin._blink_thread).to.equal(undefined);

                pin.assert_states(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
            } catch (e) {
                device.close();
                done(e); // failure: call done with an error Object to indicate that it() failed
            }
        }, 200);
    });

    it('output_Buzzer_has_buzz', (done) => {
        var pin = new mp.MockPin(2);
        var device = new gz.Buzzer(pin);

        device.beep();
        //var expected = [false, true, false];
        var expected = [{
            time: 0,
            state: false
        }, {
            time: 1,
            state: true
        }, {
            time: 200,
            state: false
        }];
        setTimeout(() => {
            try {
                device.off();
                expect(pin._blink_thread).to.equal(undefined);
                pin.assert_states_and_times(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
            } catch (e) {
                device.close();
                done(e); // failure: call done with an error Object to indicate that it() failed
            }
        }, 200);
    });

    it('output_pwm_bad_initial_value', () => {
        var pin = new mp.MockPin(2);
        expect(() => {
            new gz.PWMOutputDevice(pin, undefined, 2);
        }).to.throw(gz.OutputDeviceBadValue);
    });

    it('test_output_pwm_not_supported', () => {
        var pin = new mp.MockPin(2);
        expect(() => {
            new gz.PWMOutputDevice(pin);
        }).to.throw(gz.PinPWMUnsupported);
    });

    it('output_pwm_states', () => {
        var pin = new mp.MockPWMPin(2);

        var expected = [0.0, 0.1, 0.2, 0.0];
        with_close(new gz.PWMOutputDevice(pin), (device) => {
            device.value(0.1);
            device.value(0.2);
            device.value(0.0);
            pin.assert_states(expected);
        });
    });

    it('output_pwm_read', () => {
        var pin = new mp.MockPWMPin(2);

        with_close(new gz.PWMOutputDevice(pin, undefined, undefined, 100), (device) => {
            expect(device.frequency()).to.equal(100);
            device.value(0.1);
            expect(device.value()).to.equal(0.1);
            expect(pin.state()).to.equal(0.1);
            expect(device.is_active()).to.equal(true);
            device.frequency(-1);
            expect(device.value()).to.equal(0.0);
            expect(device.is_active()).equal(false);
            expect(device.frequency()).to.equal(undefined);

        });
    });

    it('output_pwm_write', () => {
       var pin = new mp.MockPWMPin(2);

        var expected = [0.0, 1.0, 0.0];
        with_close(new gz.PWMOutputDevice(pin), (device) => {
            device.on();
            device.off();
            pin.assert_states(expected);
        });
    });

    it('output_pwm_toggle', () => {
        var pin = new mp.MockPWMPin(2);

        var expected = [0.0, 1.0, 0.5, 0.1, 0.9, 0.0];
        with_close(new gz.PWMOutputDevice(pin), (device) => {
            device.toggle();
            device.value(0.5);
            device.value(0.1);
            device.toggle();
            device.off();
            pin.assert_states(expected);
        });
    });

    it('output_pwm_active_high_read', () => {
        var pin = new mp.MockPWMPin(2);

        with_close(new gz.PWMOutputDevice(pin, false), (device) => {
            device.value(0.1);
            assert(isclose(device.value(), 0.1));
            expect(pin.state()).to.equal(0.9);
            device.frequency(-1);
            expect(device.value()).to.equal(1.0);
        });
    });

    it('output_pwm_bad_value', () => {
        var pin = new mp.MockPWMPin(2);
        with_close(new gz.PWMOutputDevice(pin), (device) => {
            expect(() => {
                device.value(2);
            }).to.throw(gz.ValueError);
        });
    });

    it('output_pwm_write_closed', () => {
        var pin = new mp.MockPWMPin(2);
        var device = new gz.PWMOutputDevice(pin);
        device.close();

        expect(() => {
            device.on();
        }).to.throw(gz.GPIODeviceClosed);
    });

    it('output_pwm_write_silly', () => {
        var pin = new mp.MockPWMPin(2);
        with_close(new gz.OutputDevice(pin), (device) => {
            pin.pin_function('input');
            expect(() => {
                device.off();
            }).to.throw(gz.PinSetInput);
        });
    });

    it('output_pwm_blink_callback', (done) => {
        var fade_in_time = 0.5,
            fade_out_time = 0.5,
            on_time = 0.1,
            off_time = 0.1,
            n = 1,
            expected = [];

        for (var i = 0; i < 50 * fade_in_time; i++) {
            expected.push(i * (1 / 50) / fade_in_time);
        }
        for (i = 0; i < 50 * fade_out_time; i++) {
            expected.push(1 - (i * (1 / 50)) / fade_out_time);
        }

        var pin = new mp.MockPWMPin(2);
        var device = new gz.PWMOutputDevice(pin);
        device.blink(on_time, off_time, fade_in_time, fade_out_time, n, () => {
            pin.assert_states(expected);
            done();
        });
    });

    it('output_pwm_blink_interrupt', (done) => {
        var fade_in_time = 1,
            fade_out_time = 1,
            on_time = 1,
            off_time = 1,
            n = 1;

        var pin = new mp.MockPWMPin(2);
        var device = new gz.PWMOutputDevice(pin);
        device.blink(on_time, off_time, fade_in_time, fade_out_time, n);
        setTimeout(() => {
            try {
                device.off();
                expect(pin._blink_thread).to.equal(undefined);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
            } catch (e) {
                device.close();
                done(e); // failure: call done with an error Object to indicate that it() failed
            }
        }, 200);
    });

    it('output_pwm_pulse_interrupt', (done) => {
        var fade_in_time = 0.1,
            fade_out_time = 0.1,
            n = 2,
            expected = [{
                time: 0.0,
                state: 0
            }, {
                time: 0.04,
                state: 0.2
            }, {
                time: 0.04,
                state: 0.4
            }, {
                time: 0.04,
                state: 0.6
            }, {
                time: 0.04,
                state: 0.8
            }, {
                time: 0.04,
                state: 1.0
            }, {
                time: 0.04,
                state: 0.8
            }, {
                time: 0.04,
                state: 0.6
            }, {
                time: 0.04,
                state: 0.4
            }, {
                time: 0.04,
                state: 0.2
            }, {
                time: 0.04,
                state: 0
            }, {
                time: 0.04,
                state: 0.2
            }, {
                time: 0.04,
                state: 0.4
            }, {
                time: 0.04,
                state: 0.6
            }, {
                time: 0.04,
                state: 0.8
            }, {
                time: 0.04,
                state: 1.0
            }, {
                time: 0.04,
                state: 0.8
            }, {
                time: 0.04,
                state: 0.6
            }, {
                time: 0.04,
                state: 0.4
            }, {
                time: 0.04,
                state: 0.2
            }, {
                time: 0.04,
                state: 0
            }];

        var pin = new mp.MockPWMPin(2);
        var device = new gz.PWMOutputDevice(pin);
        device.pulse(fade_in_time, fade_out_time, n);
        setTimeout(() => {
            try {
                pin.assert_states_and_times(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
            } catch (e) {
                device.close();
                done(e); // failure: call done with an error Object to indicate that it() failed
            }
        }, 200);
    });

    it('motor_missing_pins', () => {
        expect(() => {
            /*eslint no-new: off*/
            new gz.Motor();
        }).to.throw(gz.GPIOPinMissing);
    });

    it('motor_test_pins', () => {
        var f = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2);

        with_close(new gz.Motor(f, b), (device) => {
            assert(device.forward_device.pin() === f, "Forward Device Pin is not f");
            assert(device.forward_device instanceof gz.PWMOutputDevice);
            assert(device.backward_device.pin() === b, "Backward Device Pin is not b");
            assert(device.backward_device instanceof gz.PWMOutputDevice);
        });
    });

    it('motor_test_pins_nonpwm', () => {
        var f = new mp.MockPin(1),
            b = new mp.MockPin(2);

        with_close(new gz.Motor(f, b, false), (device) => {
            assert(device.forward_device.pin() === f, "Forward Device Pin is not f");
            assert(device.forward_device instanceof gz.DigitalOutputDevice, "Forward device is not a DigitalOutputDevice");
            assert(device.backward_device.pin() === b, "Backward Device Pin is not b");
            assert(device.backward_device instanceof gz.DigitalOutputDevice, "Backward device is not a DigitalOutputDevice");
        });
    });

    it('motor_close_nonpwm', () => {
        var f = new mp.MockPin(1),
            b = new mp.MockPin(2);

        with_close(new gz.Motor(f, b, false), (device) => {
            device.close();
            assert(device.closed());
            assert(device.forward_device === undefined);
            assert(device.backwardward_device === undefined);
            device.close();
            assert(device.closed());
        });
    });

    it('motor_close', () => {
        var f = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2);

        with_close(new gz.Motor(f, b), (device) => {
            device.close();
            assert(device.closed());
            assert(device.forward_device === undefined);
            assert(device.backwardward_device === undefined);
            device.close();
            assert(device.closed());
        });
    });

    it('motor_value', () => {
        var f = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2);

        with_close(new gz.Motor(f, b), (device) => {
            device.value(-1);
            assert(device.is_active());
            assert(device.value() === -1, "Device value is not -1 it is " + device.value());
            assert(b.state() === 1);
            assert(f.state() === 0);
            device.value(1);
            assert(device.is_active());
            assert(device.value() === 1, "Device value is not 1 it is " + device.value());
            assert(b.state() === 0);
            assert(f.state() === 1);
            device.value(0.5);
            assert(device.is_active());
            assert(device.value() === 0.5, "Device value is not 0.5 it is " + device.value());
            assert(b.state() === 0);
            assert(f.state() === 0.5);
            device.value(-0.5);
            assert(device.is_active());
            assert(device.value() === -0.5, "Device value is not -0.5 it is " + device.value());
            assert(b.state() === 0.5);
            assert(f.state() === 0);
            device.value(0);
            assert(device.is_active() === false);
            assert(device.value() === 0, "Device value is not 0 it is " + device.value());
            assert(b.state() === 0);
            assert(f.state() === 0);
        });
    });

    it('motor_value_nonpwm', () => {
        var f = new mp.MockPin(1),
            b = new mp.MockPin(2);

        with_close(new gz.Motor(f, b, false), (device) => {
            device.value(-1);
            assert(device.is_active(), "Device is not active but should be");
            assert(device.value() === -1, "Device value is not -1 it is " + device.value());
            assert(b.state() === true);
            assert(f.state() === false, "Forward Device state should be false but is " + f.state());
            device.value(1);
            assert(device.is_active(), "Device is not active but should be");
            assert(device.value() === 1, "Device value is not 1 it is " + device.value());
            assert(b.state() === false);
            assert(f.state() === true);
            device.value(0);
            assert(device.is_active() === false, "Device is active but should NOT be");
            assert(device.value() === 0, "Device value is not 0 it is " + device.value());
            assert(b.state() === false);
            assert(f.state() === false);
        });
    });

    it('motor_badvalue', () => {
        var f = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2);
        with_close(new gz.Motor(f, b), (device) => {
            expect(() => {
                device.value(2);
            }).to.throw(gz.ValueError);
            expect(() => {
                device.value(-2);
            }).to.throw(gz.ValueError);
        });
    });

    it('motor_badvalue_nonpwm', () => {
        var f = new mp.MockPin(1),
            b = new mp.MockPin(2);
        with_close(new gz.Motor(f, b, false), (device) => {
            expect(() => {
                device.value(2);
            }).to.throw(gz.ValueError);
            expect(() => {
                device.value(-2);
            }).to.throw(gz.ValueError);
            expect(() => {
                device.value(0.5);
            }).to.throw(gz.ValueError);
            expect(() => {
                device.value(-0.5);
            }).to.throw(gz.ValueError);
        });
    });

    it('motor_reverse', () => {
        var f = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2);

        with_close(new gz.Motor(f, b), (device) => {
            device.forward();
            assert(device.is_active());
            assert(device.value() === 1, "Device value is not 1 it is " + device.value());
            assert(b.state() === 0);
            assert(f.state() === 1);
            device.reverse();
            assert(device.is_active());
            assert(device.value() === -1, "Device value is not -1 it is " + device.value());
            assert(b.state() === 1);
            assert(f.state() === 0);
            device.backward(0.5);
            assert(device.is_active());
            assert(device.value() === -0.5, "Device value is not -0.5 it is " + device.value());
            assert(b.state() === 0.5);
            assert(f.state() === 0);
            device.reverse();
            assert(device.is_active());
            assert(device.value() === 0.5, "Device value is not 0.5 it is " + device.value());
            assert(b.state() === 0);
            assert(f.state() === 0.5);
            device.stop();
            assert(device.is_active() === false);
            assert(device.value() === 0, "Device value is not 0 it is " + device.value());
            assert(b.state() === 0);
            assert(f.state() === 0);
        });
    });

    it('motor_reverse_nonpwm', () => {
        var f = new mp.MockPin(1),
            b = new mp.MockPin(2);

        with_close(new gz.Motor(f, b, false), (device) => {
            device.forward();
            assert(device.is_active());
            assert(device.value() === 1, "Device value is not 1 it is " + device.value());
            assert(b.state() === false);
            assert(f.state() === true);
            device.reverse();
            assert(device.is_active());
            assert(device.value() === -1, "Device value is not -1 it is " + device.value());
            assert(b.state() === true);
            assert(f.state() === false);
            device.stop();
            assert(device.is_active() === false);
            assert(device.value() === 0, "Device value is not 0 it is " + device.value());
            assert(b.state() === false);
            assert(f.state() === false);
        });
    });

    it('rgbled_missing_pins', () => {
        expect(() => {
            /*eslint no-new: off*/
            new gz.RGBLED();
        }).to.throw(gz.ValueError);
    });

    it('rgbled_initial_value', () => {
        var r = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2),
            g = new mp.MockPWMPin(3);

        with_close(new gz.RGBLED(r, g, b, undefined, [0.1, 0.2, 0]), () => {
            assert(r.frequency(), "Frequency is not defined");
            assert(g.frequency(), "Frequency is not defined");
            assert(b.frequency(), "Frequency is not defined");

            assert(isclose(r.state(), 0.1), "Red State is not 0.1:" + r.state());
            assert(isclose(g.state(), 0.2), "Green State is not 0.2:" + g.state());
            assert(isclose(b.state(), 0.0), "Blue State is not 0.0:" + b.state());

        });
    });

    it('rgbled_initial_value_nonpwm', () => {
        var r = new mp.MockPin(1),
            b = new mp.MockPin(2),
            g = new mp.MockPin(3);

        with_close(new gz.RGBLED(r, g, b, undefined, [0, 1, 1], false), () => {
            assert(r.state() === false, "Red State is not false:" + r.state());
            assert(g.state() === true, "Green State is not true:" + g.state());
            assert(b.state() === true, "Blue State is not true:" + b.state());

        });
    });

    it('rgbled_initial_bad_value', () => {
        var r = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2),
            g = new mp.MockPWMPin(3);
        expect(() => {
            gz.RGBLED(r, g, b, undefined, [0.1, 0.2, 1.2]);
        }).to.throw(gz.ValueError);
    });

    it('rgbled_initial_bad_value_nonpwm', () => {
        var r = new mp.MockPin(1),
            b = new mp.MockPin(2),
            g = new mp.MockPin(3);
        expect(() => {
            gz.RGBLED(r, g, b, undefined, [0.1, 0.2, 0]);
        }).to.throw(gz.ValueError);
    });

    it('rgbled_value', () => {
        var r = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2),
            g = new mp.MockPWMPin(3);

        with_close(new gz.RGBLED(r, g, b), (device) => {

            assert(device._leds[0] instanceof gz.PWMLED, "LED 0 not set to PWMLED");
            assert(device._leds[1] instanceof gz.PWMLED, "LED 1 not set to PWMLED");
            assert(device._leds[2] instanceof gz.PWMLED, "LED 2 not set to PWMLED");

            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === 0 &&
                device.value()[1] === 0 &&
                device.value()[2] === 0, "Device value is not 0,0,0");
            device.on();
            assert(device.is_active(), "Device has not switched to active");
            assert(device.value()[0] === 1 &&
                device.value()[1] === 1 &&
                device.value()[2] === 1, "Device value is not 1,1,1");
            device.off();
            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === 0 &&
                device.value()[1] === 0 &&
                device.value()[2] === 0, "Device value is not 0,0,0");
            device.value([0.5, 0.5, 0.5]);
            assert(device.is_active(), "Device has not switched to active");
            assert(device.value()[0] === 0.5 &&
                device.value()[1] === 0.5 &&
                device.value()[2] === 0.5, "Device value is not 0.5,0.5,0.5");

        });
    });

    it('rgbled_value_nonpwm', () => {
        var r = new mp.MockPin(1),
            b = new mp.MockPin(2),
            g = new mp.MockPin(3);

        with_close(new gz.RGBLED(r, g, b, undefined, undefined, false), (device) => {

            assert(device._leds[0] instanceof gz.LED, "LED 0 not set to LED");
            assert(device._leds[1] instanceof gz.LED, "LED 1 not set to LED");
            assert(device._leds[2] instanceof gz.LED, "LED 2 not set to LED");

            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === false &&
                device.value()[1] === false &&
                device.value()[2] === false, "Device value is not false,false,false");
            device.on();
            assert(device.is_active(), "Device has not switched to active");
            assert(device.value()[0] === true &&
                device.value()[1] === true &&
                device.value()[2] === true, "Device value is not true,true,true");
            device.off();
            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === false &&
                device.value()[1] === false &&
                device.value()[2] === false, "Device value is not false,false,false");
        });
    });

    it('rgbled_bad_value', () => {
        var r = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2),
            g = new mp.MockPWMPin(3);
        var device = new gz.RGBLED(r, g, b);
        expect(() => {
            device.value([2, 0, 0]);
        }).to.throw(gz.ValueError);
        expect(() => {
            device.value([0, -1, 0]);
        }).to.throw(gz.ValueError);
        device.close();
        assert(device.closed() === true);
    });


    it('rgbled_bad_value_nonpwm', () => {
        var r = new mp.MockPin(1),
            b = new mp.MockPin(2),
            g = new mp.MockPin(3);
        var device = new gz.RGBLED(r, g, b, undefined, undefined, false);
        expect(() => {
            device.value([2, 0, 0]);
        }).to.throw(gz.ValueError);
        expect(() => {
            device.value([0, -1, 0]);
        }).to.throw(gz.ValueError);
        expect(() => {
            device.value([0.5, 0, 0]);
        }).to.throw(gz.ValueError);
        expect(() => {
            device.value([0, 0.5, 0]);
        }).to.throw(gz.ValueError);
        expect(() => {
            device.value([0, 0, 0.5]);
        }).to.throw(gz.ValueError);
        device.close();
        assert(device.closed() === true);
    });

    it('rgbled_toggle', () => {
        var r = new mp.MockPWMPin(1),
            b = new mp.MockPWMPin(2),
            g = new mp.MockPWMPin(3);

        with_close(new gz.RGBLED(r, g, b), (device) => {

            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === 0 &&
                device.value()[1] === 0 &&
                device.value()[2] === 0, "Device value is not 0,0,0");

            device.toggle();

            assert(device.is_active(), "Device has not switched to active");
            assert(device.value()[0] === 1 &&
                device.value()[1] === 1 &&
                device.value()[2] === 1, "Device value is not 1,1,1");

            device.toggle();

            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === 0 &&
                device.value()[1] === 0 &&
                device.value()[2] === 0, "Device value is not 0,0,0");
        });
    });

    it('rgbled_value_nonpwm', () => {
        var r = new mp.MockPin(1),
            b = new mp.MockPin(2),
            g = new mp.MockPin(3);

        with_close(new gz.RGBLED(r, g, b, undefined, undefined, false), (device) => {

            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === false &&
                device.value()[1] === false &&
                device.value()[2] === false, "Device value is not false,false,false");

            device.toggle();

            assert(device.is_active(), "Device has not switched to active");
            assert(device.value()[0] === true &&
                device.value()[1] === true &&
                device.value()[2] === true, "Device value is not true,true,true");

            device.toggle();

            assert(device.is_active() === false, "Device is incorrectly set to active when values are: " + device.value());
            assert(device.value()[0] === false &&
                device.value()[1] === false &&
                device.value()[2] === false, "Device value is not false,false,false");
        });
    });

    /*it('rgbled_blink_background', function(done) {            
        var r = new mp.MockPWMPin(1),
     		b = new mp.MockPWMPin(2),
     		g = new mp.MockPWMPin(3),
     		device =  new gz.RGBLED(r,g, b);
        
        var expected = [{time:0, state: false},{time:1, state: true},{time:201, state: false},{time:101, state: true},{time:201, state: false}];
        device.blink(0.2, 0.1, 2);
        
        setTimeout(function () {
            try{
                r.assert_states_and_times(expected);
                g.assert_states_and_times(expected);
                b.assert_states_and_times(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                console.log(e);
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 1500);
              
          
    });
*/
    /*it('test_output_blink_interrupt_while_on', function(done) {            
        pin = new mp.MockPin(2);    
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(1, 0.1);
        var expected = [false,true,false];
        setTimeout(function () {
            try{
                device.off();                
                expect(pin._blink_thread).to.equal(undefined);

                pin.assert_states(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 200);
    });

    it('test_output_blink_interrupt_while_off', function(done) {            
        pin = new mp.MockPin(2);    
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(0.1, 1);
        var expected = [false, true, false];
        setTimeout(function () {
            try{
                device.off();
                
                expect(pin._blink_thread).to.equal(undefined);

                pin.assert_states(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 200);
    });*/
});

/*

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_background():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0.1, 0.1, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_background_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        start = time()
        device.blink(0.1, 0.1, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_foreground():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0.1, 0.1, n=2, background=False)
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_foreground_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        start = time()
        device.blink(0.1, 0.1, n=2, background=False)
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_fade_background():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0, 0, 0.2, 0.2, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_fade_background_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.blink(0, 0, 0.2, 0.2, n=2)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_fade_foreground():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0, 0, 0.2, 0.2, n=2, background=False)
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_fade_foreground_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.blink(0, 0, 0.2, 0.2, n=2, background=False)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_pulse_background():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.pulse(0.2, 0.2, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_pulse_background_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.pulse(0.2, 0.2, n=2)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_pulse_foreground():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.pulse(0.2, 0.2, n=2, background=False)
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_pulse_foreground_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.pulse(0.2, 0.2, n=2, background=False)

def test_rgbled_blink_interrupt():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        device.blink(1, 0.1)
        sleep(0.2)
        device.off() # should interrupt while on
        r.assert_states([0, 1, 0])
        g.assert_states([0, 1, 0])
        b.assert_states([0, 1, 0])

def test_rgbled_blink_interrupt_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        device.blink(1, 0.1)
        sleep(0.2)
        device.off() # should interrupt while on
        r.assert_states([0, 1, 0])
        g.assert_states([0, 1, 0])
        b.assert_states([0, 1, 0])

def test_rgbled_close():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        assert not device.closed
        device.close()
        assert device.closed
        device.close()
        assert device.closed

def test_rgbled_close_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        assert not device.closed
        device.close()
        assert device.closed
        device.close()
        assert device.closed


def test_servo_pins():
    p = MockPWMPin(1)
    with Servo(p) as device:
        assert device.pwm_device.pin is p
        assert isinstance(device.pwm_device, PWMOutputDevice)

def test_servo_bad_value():
    p = MockPWMPin(1)
    with pytest.raises(ValueError):
        Servo(p, initial_value=2)
    with pytest.raises(ValueError):
        Servo(p, min_pulse_width=30/1000)
    with pytest.raises(ValueError):
        Servo(p, max_pulse_width=30/1000)

def test_servo_pins_nonpwm():
    p = MockPin(2)
    with pytest.raises(PinPWMUnsupported):
        Servo(p)

def test_servo_close():
    p = MockPWMPin(2)
    with Servo(p) as device:
        device.close()
        assert device.closed
        assert device.pwm_device.pin is None
        device.close()
        assert device.closed

def test_servo_pulse_width():
    p = MockPWMPin(2)
    with Servo(p, min_pulse_width=5/10000, max_pulse_width=25/10000) as device:
        assert isclose(device.min_pulse_width, 5/10000)
        assert isclose(device.max_pulse_width, 25/10000)
        assert isclose(device.frame_width, 20/1000)
        assert isclose(device.pulse_width, 15/10000)
        device.value = -1
        assert isclose(device.pulse_width, 5/10000)
        device.value = 1
        assert isclose(device.pulse_width, 25/10000)
        device.value = None
        assert device.pulse_width is None

def test_servo_values():
    p = MockPWMPin(1)
    with Servo(p) as device:
        device.min()
        assert device.is_active
        assert device.value == -1
        assert isclose(p.state, 0.05)
        device.max()
        assert device.is_active
        assert device.value == 1
        assert isclose(p.state, 0.1)
        device.mid()
        assert device.is_active
        assert device.value == 0.0
        assert isclose(p.state, 0.075)
        device.value = 0.5
        assert device.is_active
        assert device.value == 0.5
        assert isclose(p.state, 0.0875)
        device.detach()
        assert not device.is_active
        assert device.value is None
        device.value = 0
        assert device.value == 0
        device.value = None
        assert device.value is None

def test_angular_servo_range():
    p = MockPWMPin(1)
    with AngularServo(p, initial_angle=15, min_angle=0, max_angle=90) as device:
        assert device.min_angle == 0
        assert device.max_angle == 90

def test_angular_servo_angles():
    p = MockPWMPin(1)
    with AngularServo(p) as device:
        device.angle = 0
        assert device.angle == 0
        assert isclose(device.value, 0)
        device.max()
        assert device.angle == 90
        assert isclose(device.value, 1)
        device.min()
        assert device.angle == -90
        assert isclose(device.value, -1)
        device.detach()
        assert device.angle is None
    with AngularServo(p, initial_angle=15, min_angle=0, max_angle=90) as device:
        assert device.angle == 15
        assert isclose(device.value, -2/3)
        device.angle = 0
        assert device.angle == 0
        assert isclose(device.value, -1)
        device.angle = 90
        assert device.angle == 90
        assert isclose(device.value, 1)
        device.angle = None
        assert device.angle is None
    with AngularServo(p, min_angle=45, max_angle=-45) as device:
        assert device.angle == 0
        assert isclose(device.value, 0)
        device.angle = -45
        assert device.angle == -45
        assert isclose(device.value, 1)
        device.angle = -15
        assert device.angle == -15
        assert isclose(device.value, 1/3)


*/