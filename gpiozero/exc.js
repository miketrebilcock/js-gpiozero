function inherit(proto) {
  function F() {}
  F.prototype = proto;
  return new F;
}

function GPIOZeroError (message) {
	message!=undefined?message:"Base class for all exceptions in GPIO Zero";
	Error.call(this, message);
}

GPIOZeroError.prototype = inherit(Error.prototype);

/*var NotImplementedError = GPIOZeroError.extend({
	init : function (message){
			this._super(message!=undefined?message:"Function not Implemented");
	}
});*/

function GPIODeviceError (message) {
	GPIOZeroError.call(this, message!=undefined?message:"Base class for errors specific to the GPIODevice hierarchy");
}
GPIODeviceError.prototype = inherit(GPIOZeroError.prototype);

function DeviceClosed (message) {
	GPIOZeroError.call(this, message!=undefined?message:"Base class for errors specific to the GPIODevice hierarchy");
}
DeviceClosed.prototype = inherit(GPIOZeroError.prototype);
exports.DeviceClosed = DeviceClosed;

function GPIOPinMissing (message) {
	GPIODeviceError.call(this, message!=undefined?message:"Error raised when a pin number is not specified");   
}
GPIOPinMissing.prototype =  inherit(GPIODeviceError.prototype);
exports.GPIOPinMissing = GPIOPinMissing;


function GPIOPinInUse (message) {
	GPIODeviceError.call(this, message!=undefined?message:"Error raised when attempting to use a pin already in use by another device");
}
GPIOPinInUse.prototype = inherit(GPIODeviceError.prototype);
exports.GPIOPinInUse = GPIOPinInUse;

function PinError(message) {
    GPIOZeroError.call(this, message!=undefined?message:"Base class for errors related to pin implementations");
}
PinError.prototype = inherit(GPIOZeroError.prototype);

function PinInvalidFunction (message) {
    PinError.call(this, message);
}
PinInvalidFunction.prototype = inherit(PinError.prototype);

function PinSetInput (message) {
    PinError.call(this, message);
}
PinSetInput.prototype = inherit(PinError.prototype);
exports.PinSetInput = PinSetInput;