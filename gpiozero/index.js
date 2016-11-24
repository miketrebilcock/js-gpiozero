var exc = require('./exc.js'),
devices = require('./devices.js'),
output_devices = require ('./output_devices.js'),
pins = require('./pins/');

module.exports = {
	
	GPIOPinMissing: exc.GPIOPinMissing,
	GPIOPinInUse : exc.GPIOPinInUse,
	OutputDeviceBadValue : exc.OutputDeviceBadValue,
	PinPWMUnsupported : exc.PinPWMUnsupported,
	PinInputState : exc.PinInputState,
	pins : pins,

	
	GPIODevice : devices.GPIODevice,


	OutputDevice: output_devices.OutputDevice,
	DigitalOutputDevice: output_devices.DigitalOutputDevice,
	PWMOutputDevice : output_devices.PWMOutputDevice,
	LED : output_devices.LED,
	Buzzer : output_devices.Buzzer,
	Motor: output_devices.Motor,
	PWMLED : output_devices.PWMLED,
	RGBLED : output_devices.RGBLED

};
