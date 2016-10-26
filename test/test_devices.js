
var expect = require('chai').expect,
	assert = require('chai').assert,
	gz = require('../gpiozero/'),
	mp = require('../gpiozero/pins/mock.js');
    

function with_close (device, method) {
	method(device);
	device.close();
}
//QUnit.module("devices");
 describe('devices', function() { 

	before(function() {
      // ...
    });

 	after(function() {
    	mp.clear_pins();  
    });	
	it('no_pin_throws_error', function() {		
	    expect(function(){
	    	device = new gz.GPIODevice();
	    }).to.throw(gz.GPIOPinMissing);
	});

	it('device_init', function() {	
		pin = new mp.MockPin(1);	
	    with_close(new gz.GPIODevice(pin), function(device){
		    assert(device.closed()==false, "Device is incorrectly reporting closed");
		    assert(device.pin() == pin, "Device has not returned correct pin");
		});
	});

	it('device_init_twice_on_same_pin_fails', function() {	
		pin = new mp.MockPin(1);	
	    with_close(new gz.GPIODevice(pin), function (device) {
	    	expect(function(){
	    		device = new gz.GPIODevice(pin);
	    	}).to.throw(gz.GPIOPinInUse)
	    });
	});

	it('device_init_twice_on_diffent_pins_suceeds', function() {	
		pin = new mp.MockPin(1);
		pin2 = new mp.MockPin(2);	
	    with_close(new gz.GPIODevice(pin), function (device1) {
	    	with_close (new gz.GPIODevice(pin2), function (device2) {
			    assert(device1.pin() == pin, "Device has not returned correct pin");
				assert(device2.pin() == pin2, "Device has not returned correct pin");
	    	});
	    });	    	   
	});

	it('device_close', function() {
		pin = new mp.MockPin(1);	
	    device = new gz.GPIODevice(pin);
	    device.close();
		assert(device.closed()==true, "Device is incorrectly reporting open");
		assert(device.pin() == undefined, "Device still holding onto pin");		
	});

	it('reopen_same_pin', function() {
		pin = new mp.MockPin(1);	
	    device = new gz.GPIODevice(pin);
	    device.close();
	    device2 = new gz.GPIODevice(pin);	    
		assert(device2.closed()==false, "Device is incorrectly reporting closed");
		assert(device2.pin() == pin, "Device has not returned correct pin");
		assert(device.closed()==true, "Device is incorrectly reporting open");
		assert(device.pin() == undefined, "Device still holding onto pin");
		device2.close();				
	});

	it('device_toString', function() {
	    pin = new mp.MockPin(1);	
	    with_close(new gz.GPIODevice(pin), function(device){	    	
		    expect(device.toString()).to.equal("<gpiozero.GPIODevice object on pin 1, is_active=false>");
		});	
	});

});

/*
def test_device_repr():
    pin = MockPin(2)
    with GPIODevice(pin) as device:
        assert repr(device) == '<gpiozero.GPIODevice object on pin %s, is_active=False>' % pin

def test_device_repr_after_close():
    pin = MockPin(2)
    device = GPIODevice(pin)
    device.close()
    assert repr(device) == '<gpiozero.GPIODevice object closed>'


*/