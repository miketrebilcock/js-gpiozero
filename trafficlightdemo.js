var wpi = require("wiring-pi");
wpi.setup('wpi');

function LED (thePin) {
	var pin = thePin;
	wpi.pinMode(pin, wpi.OUTPUT);
	
	this.getPin = function () {return pin;};
}

LED.prototype.On = function () {
	wpi.digitalWrite(this.getPin(), 1);
}

LED.prototype.Off = function () {
	wpi.digitalWrite(this.getPin(), 0);
}

function phase1() {
	west_green.On()
	setTimeout(phase2,1000);
}

function phase2() {
	west_green.Off()
	setTimeout(phase1,1000);	
}
var west_green=new LED(3);
phase1();
