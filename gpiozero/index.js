const exc = require('./exc.js');
const GPIODeviceClass = require('./devices/GPIODevice.js').GPIODevice;
const CompositeDeviceClass = require('./devices/CompositeDevice.js').CompositeDevice;
const OutputDeviceClass = require ('./output_devices/OutputDevice.js').OutputDevice;
const DigitalOutputDeviceClass = require ('./output_devices/DigitalOutputDevice.js').DigitalOutputDevice;
const PWMOutputDeviceClass = require ('./output_devices/PWMOutputDevice.js').PWMOutputDevice;
const LEDClass = require ('./output_devices/LED.js').LED;
const RGBLEDClass = require ('./output_devices/RGBLED.js').RGBLED;
const PWMLEDClass = require ('./output_devices/PWMLED.js').PWMLED;
const BuzzerClass = require ('./output_devices/Buzzer.js').Buzzer;
const MotorClass = require ('./output_devices/Motor.js').Motor;
const tools = require('./tools.js');
const boards = require('./boards.js');

//noinspection JSUnresolvedVariable
module.exports = {
	GPIOPinMissing	: exc.GPIOPinMissing
	,GPIOPinInUse 	: exc.GPIOPinInUse
	,OutputDeviceBadValue : exc.OutputDeviceBadValue
	,PinPWMUnsupported : exc.PinPWMUnsupported
	,PinInputState 	: exc.PinInputState

	,CompositeDevice    : CompositeDeviceClass
	,GPIODevice 		: GPIODeviceClass


	,OutputDevice       : OutputDeviceClass
	,DigitalOutputDevice: DigitalOutputDeviceClass
	,PWMOutputDevice    : PWMOutputDeviceClass

	,LED 	: LEDClass
	,Buzzer : BuzzerClass
	,Motor	: MotorClass
	,PWMLED : PWMLEDClass
	,RGBLED : RGBLEDClass

    ,CompositeOutputDevice : boards.CompositeOutputDevice
	,TrafficLights : boards.TrafficLights
	,PiTraffic: boards.PiTraffic

	,with_close : tools.with_close
	,inherit : tools.inherit
};
