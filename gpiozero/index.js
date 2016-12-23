const exc = require('./exc.js');
const devices = require('./devices.js');
const output_devices = require('./output_devices.js');
const tools = require('./tools.js');
const boards = require('./boards.js');

//noinspection JSUnresolvedVariable
module.exports = {
	GPIOPinMissing	: exc.GPIOPinMissing,
	GPIOPinInUse 	: exc.GPIOPinInUse,
	OutputDeviceBadValue : exc.OutputDeviceBadValue,
	PinPWMUnsupported : exc.PinPWMUnsupported,
	PinInputState 	: exc.PinInputState,

	CompositeDevice : devices.CompositeDevice,
	GPIODevice 		: devices.GPIODevice,


	OutputDevice: output_devices.OutputDevice,
	DigitalOutputDevice: output_devices.DigitalOutputDevice,
	PWMOutputDevice : output_devices.PWMOutputDevice,

	LED 	: output_devices.LED,
	Buzzer 	: output_devices.Buzzer,
	Motor	: output_devices.Motor,
	PWMLED 	: output_devices.PWMLED,
	RGBLED 	: output_devices.RGBLED,

    CompositeOutputDevice : boards.CompositeOutputDevice,
	TrafficLights : boards.TrafficLights,
	PiTraffic: boards.PiTraffic,

	with_close : tools.with_close,
	inherit : tools.inherit
};
