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

