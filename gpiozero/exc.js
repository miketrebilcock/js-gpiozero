var inherit = require ('./tools.js').inherit;

function NotImplementedError (message) {
	message = message !== undefined?message:"The method is not yet implemented";
	Error.call(this, message);
}

NotImplementedError.prototype = inherit(Error.prototype);
NotImplementedError.prototype.constructor = NotImplementedError;

exports.NotImplementedError = NotImplementedError;

function GPIOZeroError (message) {
	message = message !== undefined?message:"Base class for all exceptions in GPIO Zero";
	Error.call(this, message);
}

GPIOZeroError.prototype = inherit(Error.prototype);
GPIOZeroError.prototype.constructor = GPIOZeroError;

/*var NotImplementedError = GPIOZeroError.extend({
	init : function (message){
			this._super(message!=undefined?message:"Function not Implemented");
	}
});*/

function GPIODeviceError (message) {
	GPIOZeroError.call(this, message !== undefined ? message:"Base class for errors specific to the GPIODevice hierarchy");
}
GPIODeviceError.prototype = inherit(GPIOZeroError.prototype);
GPIODeviceError.prototype.constructor = GPIODeviceError;

function DeviceClosed (message) {
	GPIOZeroError.call(this, message !== undefined ? message:"Base class for errors specific to the GPIODevice hierarchy");
}
DeviceClosed.prototype = inherit(GPIOZeroError.prototype);
DeviceClosed.prototype.constructor = DeviceClosed;
exports.DeviceClosed = DeviceClosed;

function GPIOPinMissing (message) {
	GPIODeviceError.call(this, message !== undefined ? message:"Error raised when a pin number is not specified");   
}
GPIOPinMissing.prototype =  inherit(GPIODeviceError.prototype);
GPIOPinMissing.prototype.constructor = GPIOPinMissing;
exports.GPIOPinMissing = GPIOPinMissing;


function GPIOPinInUse (message) {
	GPIODeviceError.call(this, message !== undefined?message:"Error raised when attempting to use a pin already in use by another device");
}
GPIOPinInUse.prototype = inherit(GPIODeviceError.prototype);
GPIOPinInUse.prototype.constructor = GPIOPinInUse;
exports.GPIOPinInUse = GPIOPinInUse;

/**
 * Base class for errors related to pin implementations.
 *
 * @param {string} message - Error message.
 * @class
 */
function PinError(message) {
    GPIOZeroError.call(this, message !== undefined?message:"Base class for errors related to pin implementations");
}
PinError.prototype = inherit(GPIOZeroError.prototype);
PinError.prototype.constructor = PinError;

function PinInvalidFunction (message) {
    PinError.call(this, message);
}
PinInvalidFunction.prototype = inherit(PinError.prototype);
PinInvalidFunction.prototype.constructor = PinInvalidFunction;

function PinSetInput (message) {
    PinError.call(this, message);
}
PinSetInput.prototype = inherit(PinError.prototype);
PinSetInput.prototype.constructor = PinSetInput;
exports.PinSetInput = PinSetInput;

function OutputDeviceError (message) {
	GPIOZeroError.call(this, message !== undefined?message:"Base class for errors specific to the GPIODevice hierarchy");
}
OutputDeviceError.prototype = inherit(GPIOZeroError.prototype);
OutputDeviceError.prototype.constructor = OutputDeviceError;

function OutputDeviceBadValue(message){
	OutputDeviceError.call(this, message !== undefined?message:"Error Raised when unacceptable value receieved");
}
OutputDeviceBadValue.prototype = inherit(OutputDeviceError.prototype);
OutputDeviceBadValue.prototype.constructor = OutputDeviceBadValue;
exports.OutputDeviceBadValue = OutputDeviceBadValue;

function AttributeError (message) {
	GPIOZeroError.call(this, message !== undefined?message:"Base class for attribute errors");
}
AttributeError.prototype = inherit(GPIOZeroError.prototype);
AttributeError.prototype.constructor = AttributeError;

function PinPWMUnsupported(message) {
	AttributeError.call(this, message !== undefined?message:"PWM Not Support in this Pin");
}

PinPWMUnsupported.prototype = inherit(AttributeError.prototype);
PinPWMUnsupported.prototype.constructor = PinPWMUnsupported;
exports.PinPWMUnsupported = PinPWMUnsupported;

function PinFixedPull(message) {
    AttributeError.call(this, message !== undefined?message:"Error raised when attempting to set the pull of a pin with fixed pull-up");
}

PinFixedPull.prototype = inherit(AttributeError.prototype);
PinPWMUnsupported.prototype.constructor = PinFixedPull;
exports.PinFixedPull = PinFixedPull;

/**
 * Error raised when gpiozero doesn't recognize a revision of the Pi.
 *
 * @param {string} message - Error message.
 * @class
 */
function PinUnknownPi(message) {
    PinError.call(this, message !== undefined?message:"Error raised when gpiozero doesn't recognize a revision of the Pi");
}
PinUnknownPi.prototype = inherit(PinError.prototype);
PinUnknownPi.prototype.constructor = PinUnknownPi;
exports.PinUnknownPi = PinUnknownPi;

/**
 * Error raised when multiple pins support the requested function.
 *
 * @param {string} message - Error message.
 * @class
 */
function PinMutliplePins(message) {
    PinError.call(this, message !== undefined?message:"Error raised when multiple pins support the requested function");
}
PinMutliplePins.prototype = inherit(PinError.prototype);
PinMutliplePins.prototype.constructor = PinMutliplePins;
exports.PinMultiplePins = PinMutliplePins;

/**
 * Error raised when no pins support the requested function.
 *
 * @param {string} message - Error message.
 * @class
 */
function PinNoPins(message) {
    PinError.call(this, message !== undefined?message:"Error raised when no pins support the requested function");
}
PinNoPins.prototype = inherit(PinError.prototype);
PinNoPins.prototype.constructor = PinMutliplePins;
exports.PinNoPins = PinNoPins;