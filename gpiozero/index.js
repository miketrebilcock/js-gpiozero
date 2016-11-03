var exc = require('./exc.js'),
devices = require('./devices.js'),
output_devices = require ('./output_devices.js'),
pins = require('./pins/');

module.exports = {
	
	GPIOPinMissing: exc.GPIOPinMissing,
	GPIOPinInUse : exc.GPIOPinInUse,
	pins : pins,

	
	GPIODevice : devices.GPIODevice,


	OutputDevice: output_devices.OutputDevice,
	DigitalOutputDevice: output_devices.DigitalOutputDevice,
	LED : output_devices.LED,
	Buzzer : output_devices.Buzzer

}
