const exc = require('./exc.js');
const GPIODeviceClass = require('./devices/GPIODevice.js').GPIODevice;
const CompositeDeviceClass = require('./devices/CompositeDevice.js').CompositeDevice;
const OutputDeviceClass = require ('./output_devices/OutputDevice.js').OutputDevice;
const DigitalOutputDeviceClass = require ('./output_devices/DigitalOutputDevice.js').DigitalOutputDevice;
const PWMOutputDeviceClass = require ('./output_devices/PWMOutputDevice.js').PWMOutputDevice;
const CompositeOutputDeviceClass = require('./output_devices/CompositeOutputDevice.js').CompositeOutputDevice;
const InputDeviceClass = require ('./input_devices/InputDevice.js').InputDevice;
const DigitalInputDeviceClass = require ('./input_devices/DigitalInputDevice.js').DigitalInputDevice;
const LEDClass = require ('./output_devices/LED.js').LED;
const RGBLEDClass = require ('./output_devices/RGBLED.js').RGBLED;
const PWMLEDClass = require ('./output_devices/PWMLED.js').PWMLED;
const BuzzerClass = require ('./output_devices/Buzzer.js').Buzzer;
const MotorClass = require ('./output_devices/Motor.js').Motor;
const tools = require('./tools.js');
const TrafficLightsClass = require('./boards/TrafficLights.js').TrafficLights;
const PiTrafficClass = require('./boards/PiTraffic.js').PiTraffic;

//noinspection JSUnresolvedVariable
module.exports = {
	GPIOPinInUse 	    : exc.GPIOPinInUse
	,GPIOPinMissing	    : exc.GPIOPinMissing
	,OutputDeviceBadValue : exc.OutputDeviceBadValue
	,PinPWMUnsupported  : exc.PinPWMUnsupported
	,PinInputState 	    : exc.PinInputState
    ,PinFixedPull       : exc.PinFixedPull

	,CompositeDevice    : CompositeDeviceClass
	,GPIODevice 		: GPIODeviceClass


	,OutputDevice       : OutputDeviceClass
	,DigitalOutputDevice: DigitalOutputDeviceClass
	,PWMOutputDevice    : PWMOutputDeviceClass
    ,CompositeOutputDevice : CompositeOutputDeviceClass

    ,InputDevice        : InputDeviceClass
    ,DigitalInputDevice : DigitalInputDeviceClass

	,LED 	: LEDClass
	,Buzzer : BuzzerClass
	,Motor	: MotorClass
	,PWMLED : PWMLEDClass
	,RGBLED : RGBLEDClass

	,TrafficLights : TrafficLightsClass
	,PiTraffic: PiTrafficClass

	,with_close : tools.with_close
	,inherit : tools.inherit
};
