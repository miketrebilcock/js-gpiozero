const inherit = require('../tools.js').inherit;
const PWMOutputDevice = require('./PWMOutputDevice.js').PWMOutputDevice;
const DigitalOutputDevice = require('./DigitalOutputDevice.js').DigitalOutputDevice;
const OutputDevice = require('./OutputDevice.js').OutputDevice;
const CompositeDevice = require('../devices/CompositeDevice.js').CompositeDevice;
const exc = require('../exc.js');

exports.Motor = Motor;

/**
 * Represents a generic motor connected to a bi-directional motor driver circuit (i.e.  an `H-bridge`_).
 * Attach an `H-bridge`_ motor controller to your Pi; connect a power source (e.g. a battery pack or the 5V pin) to the controller; connect the outputs
 * of the controller board to the two terminals of the motor; connect the inputs of the controller board to two GPIO pins.
 *
 * @param {int} forward - The GPIO pin that the forward input of the motor driver chip is connected to.
 * @param {int} backward - The GPIO pin that the backward input of the motor driver chip is connected to.
 * @param {boolean} [pwm] - If ``true`` (the default), construct {@link PWMOutputDevice} instances for the motor controller pins, allowing both direction and variable speed control. If ``False``, construct {@link DigitalOutputDevice} instances, allowing only direction control.
 * @class
 * @augments CompositeDevice
 * @throws GPIOPinMissing - If either Forward or Backward pin is not provided.
 */
function Motor(forward, backward, pwm) {
    if (forward === undefined || backward === undefined) {
        throw new exc.GPIOPinMissing('Forward and Backward pins must be provided');
    }
    if (pwm === undefined || pwm === true) {
        CompositeDevice.call(this,undefined, [['forward_device', new PWMOutputDevice(forward)],
            ['backward_device', new PWMOutputDevice(backward)]]);
    } else {
        CompositeDevice.call(this, undefined, [['forward_device', new DigitalOutputDevice(forward)],
            ['backward_device', new DigitalOutputDevice(backward)]]);
    }
}

Motor.prototype = inherit(CompositeDevice.prototype);
Motor.prototype.constructor = Motor;

/**
 * Close down the output devices and release the pins.
 */
Motor.prototype.close = function() {
    if (this.forward_device !== undefined) {
        this.forward_device.close();
        this.forward_device = undefined;
    }

    if (this.backward_device !== undefined) {
        this.backward_device.close();
        this.backward_device = undefined;
    }
    OutputDevice.prototype.close.call(this);
};

/**
 *
 * @returns {boolean} - If true then the forward and backward devices are undefined.
 */
Motor.prototype.closed = function() {
    return (this.forward_device === undefined && this.backward_device === undefined);
};
/**
 * Gets and Sets the motor speed between -1 (full backwards) and 1 (full forwards).
 *
 * @param {int} [value] - Motor speed.
 * @returns {number} - If value is undefined then returns the current speed.
 * @throws OutputDeviceBadValue - If the value is defined but not between 1 and -1.
 */
Motor.prototype.value = function(value) {
    if (value === undefined) {
        return this.forward_device.value() - this.backward_device.value();
    }

    if (value > 1 || value < -1) {
        throw new exc.OutputDeviceBadValue("Motor value must be between -1 and 1, actual=:" + value);
    }

    if (value > 0) {
        this.forward(value);
    } else if (value < 0) {
        this.backward(-value);
    } else {
        this.stop();
    }
};
/**
 *
 * @returns {boolean} - If the motor is currently running then ``true`` otherwise ``false``.
 */
Motor.prototype.is_active = function() {
    /*

     */
    return this.value() !== 0;
};

/**
 * Drive the motor forwards.
 *
 * @param {float} speed - The speed at which the motor should turn. Can be any value between 0 (stopped)
 * and the default 1 (maximum speed) if ``pwm`` was ``true`` when the class was constructed (and only 0 or 1 if not).
 *
 * @throws ValueError - When the speed is less than 0 or greater than 1.
 * @throws ValueError - When the speed is between 0 and 1 on non-pwm motors.
 */
Motor.prototype.forward = function(speed) {
    if (speed === undefined) {
        speed = 1;
    }

    if (speed < 0 || speed > 1) {
        throw new exc.ValueError('forward speed must be between 0 and 1');
    }

    if (this.forward_device instanceof DigitalOutputDevice && speed !== 1 && speed !== 0) {
        throw new exc.ValueError('forward speed must be 0 or 1 with non-PWM Motors');
    }

    this.backward_device.off();
    this.forward_device.value(speed);
};

/**
 * Drive the motor backwards.
 *
 * @param {float} speed - The speed at which the motor should turn. Can be any value between 0 (stopped)
 * and the default 1 (maximum speed) if ``pwm`` was ``true`` when the class was constructed (and only 0 or 1 if not).
 *
 * @throws ValueError - When the speed is less than 0 or greater than 1.
 * @throws ValueError - When the speed is between 0 and 1 on non-pwm motors.
 */
Motor.prototype.backward = function(speed) {
    if (speed === undefined) {
        speed = 1;
    }

    if (speed < 0 || speed > 1) {
        throw new exc.ValueError('backward speed must be between 0 and 1');
    }

    if (this.backward_device instanceof DigitalOutputDevice && speed !== 1 && speed !== 0) {
        throw new exc.ValueError('backward speed must be 0 or 1 with non-PWM Motors');
    }

    this.forward_device.off();
    this.backward_device.value(speed);
};

/**
 *     Reverse the current direction of the motor. If the motor is currently
 *     idle this does nothing. Otherwise, the motor's direction will be
 *     reversed at the current speed.
 */
Motor.prototype.reverse = function() {
    this.value(-1 * this.value());
};

/**
 * Stop the motor.
 */
Motor.prototype.stop = function() {
    this.forward_device.off();
    this.backward_device.off();
};
