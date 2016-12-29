const exc = require('../exc.js');
const CompositeDevice = require('../devices/CompositeDevice.js').CompositeDevice;
const OutputDevice = require('../output_devices/OutputDevice.js').OutputDevice;
const inherit = require('../tools.js').inherit;

/**
*  Extends {@link CompositeDevice} with {@link CompositeDevice#on|on}, {@link CompositeDevice#off|off},
*  and {@link CompositeDevice#toggle|toggle} methods for controlling subordinate output devices
*  and extends {@link CompositeDevice#value|value} to be writable.
*
*  @param {Array} [devices] - An array of devices that create this composite device.
*  @param {Array} [kwdevices] - An array of tuples that contain the device name and device eg ['red', new LED(1)].
*  @param {Array} [options] -
*  @augments CompositeDevice
*  @class
*/
function CompositeOutputDevice (devices, kwdevices, options) {
    "use strict";
    CompositeDevice.call(this, devices, kwdevices, options);
}

CompositeOutputDevice.prototype = inherit(CompositeDevice.prototype);
CompositeOutputDevice.prototype.constructor = CompositeOutputDevice;

exports.CompositeOutputDevice = CompositeOutputDevice;

/**
 * Calls the on method on all child devices within this composite device.
 */
CompositeOutputDevice.prototype.on = function () {
    this._all.forEach((device) => {
        if (device instanceof OutputDevice || device instanceof CompositeOutputDevice) {
            device.on();
        }
    });
};

/**
 * Calls the off method on all child devices within this composite device.
 */
CompositeOutputDevice.prototype.off = function () {
    this._all.forEach((device) => {
        if (device instanceof OutputDevice || device instanceof CompositeOutputDevice) {
            device.off();
        }
    });
};


/**
 * Calls the toggle method on all child devices within this composite device.
 **/
CompositeOutputDevice.prototype.toggle = function () {
    this._all.forEach((device) => {
        if (device instanceof OutputDevice || device instanceof CompositeOutputDevice) {
            device.toggle();
        }
    });
};

/**
 * When value is undefined then the function returns the value of all child
 * devices as an array.
 * When value is set, all child devices will have their value set according
 * to the value array.
 *
 * @param {Array} [value] - The value to set all of the child devices to.
 * @returns {Array} - The current value of each output device returned as an array.
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
};