
var expect = require('chai').expect,
	assert = require('chai').assert,
	gz = require('../gpiozero/'),
	mp = require('../gpiozero/pins/mock.js')
    isclose = require('../gpiozero/compat.js').isclose;


    

function with_close (device, method) {
	method(device);
	device.close();
}

describe('output_devices', function() { 

	before(function() {
      
    });

 	afterEach(function() { 
        mp.clear_pins();
    	  
    });	

	it('output_initial_values', function() {
		pin = new mp.MockPin(2);			
	    with_close(new gz.OutputDevice(pin,undefined, false), function(device){
		    expect(pin.pin_function()).to.equal('output');
		    expect(pin.state()).to.equal(false);
		});
		with_close(new gz.OutputDevice(pin,undefined, true), function(device){		    
		    expect(pin.state()).to.equal(true);
		});
		with_close(new gz.OutputDevice(pin,undefined, undefined), function(device){		    
		    expect(pin.state()).to.equal(true);
		});
	});

	it('output_write_active_high', function() {			
		pin = new mp.MockPin(2);	
	    with_close(new gz.OutputDevice(pin,undefined, undefined), function(device){
	    	device.on();		    
		    expect(pin.state()).to.equal(true);
		    device.off();
		    expect(pin.state()).to.equal(false);
		});		
	});

	it('output_write_active_low', function() {			
		pin = new mp.MockPin(2);	
	    with_close(new gz.OutputDevice(pin, false, undefined), function(device){
	    	device.on();		    
		    expect(pin.state()).to.equal(false);
		    device.off();
		    expect(pin.state()).to.equal(true);
		});		
	});

	it('output_write_closed', function() {			
		pin = new mp.MockPin(2);	
	    with_close(new gz.OutputDevice(pin, false, undefined), function(device){
	    	device.close();		    
		    expect(device.closed()).to.equal(true);		    
		    expect(function(){
	    		device.on()
	    	}).to.throw(gz.DeviceClosed);
		});		
	});

	it('output_write_silly', function() {			
		pin = new mp.MockPin(2);	
	    with_close(new gz.OutputDevice(pin), function(device){	    	
	    	pin.pin_function('input');	    	    	
		    expect(function(){
	    		device.on();
	    	}).to.throw(gz.PinSetInput);
		});		
	});

	it('output_value', function() {			
		var pin = new mp.MockPin(2);	
	    with_close(new gz.OutputDevice(pin), function(device){   	
		    expect(device.value()).to.equal(false);
		    expect(pin.state()).to.equal(false);
		    device.on();
		    expect(device.value()).to.equal(true);
		    expect(pin.state()).to.equal(true);
		    device.value(false);
		    expect(device.value()).to.equal(false);
		    expect(pin.state()).to.equal(false);
		});		
	});

	it('output_digital_toggle', function() {			
		pin = new mp.MockPin(2);	
	    with_close(new gz.DigitalOutputDevice(pin), function(device){   	
		    expect(device.value()).to.equal(false);
		    expect(pin.state()).to.equal(false);
		    device.toggle();
		    expect(device.value()).to.equal(true);
		    expect(pin.state()).to.equal(true);
		    device.toggle();
		    expect(device.value()).to.equal(false);
		    expect(pin.state()).to.equal(false);
		});		
	});

	it('output_LED_is_Lit', function() {			
		pin = new mp.MockPin(2);	
	    with_close(new gz.LED(pin), function(device){   	
		    expect(device.is_lit()).to.equal(false);		    
		    device.toggle();
		    expect(device.is_lit()).to.equal(true);		    
		    device.off();
		    expect(device.is_lit()).to.equal(false);		    
		});		
	});

    it('test_output_blink_background', done => {            
        pin = new mp.MockPin(2);    
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(0.2, 0.1, 2);
        var expected = [{time:0, state: false},{time:1, state: true},{time:201, state: false},{time:101, state: true},{time:201, state: false}];
        setTimeout(function () {
            try{
                pin.assert_states_and_times(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 1500);
              
          
    });

    it('test_output_blink_interrupt_while_on', done => {            
        pin = new mp.MockPin(2);    
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(1, 0.1);
        var expected = [false,true,false];
        setTimeout(function () {
            try{
                device.off()
                
                expect(pin._blink_thread).to.equal(undefined);

                pin.assert_states(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 200);
    });

    it('test_output_blink_interrupt_while_off', done => {            
        pin = new mp.MockPin(2);    
        var device = new gz.DigitalOutputDevice(pin);

        device.blink(0.1, 1);
        var expected = [false, true, false];
        setTimeout(function () {
            try{
                device.off()
                
                expect(pin._blink_thread).to.equal(undefined);

                pin.assert_states(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 200);
    });

    it('output_Buzzer_has_buzz', done => {  
        pin = new mp.MockPin(2);    
        var device = new gz.Buzzer(pin);

        device.beep();
        //var expected = [false, true, false];
        var expected = [{time:0, state: false},{time:1, state: true},{time:200, state: false}];
        setTimeout(function () {
            try{
                device.off()
                
                expect(pin._blink_thread).to.equal(undefined);
                pin.assert_states_and_times(expected);
                device.close();
                done(); // success: call done with no parameter to indicate that it() is done()
              } catch( e ) {
                device.close();
                done( e ); // failure: call done with an error Object to indicate that it() failed
              }
        }, 200);           
    });

    it('output_pwm_bad_initial_value', function() {          
        pin = new mp.MockPin(2);
        expect(function(){
               new gz.PWMOutputDevice(pin,undefined, 2);
            }).to.throw(gz.OutputDeviceBadValue);    
    });

    it('test_output_pwm_not_supported', function() {          
        pin = new mp.MockPin(2);
        expect(function(){
               new gz.PWMOutputDevice(pin);
            }).to.throw(gz.PinPWMUnsupported);    
    });

    it('output_pwm_states', function() {            
        pin = new mp.MockPWMPin(2);

        var expected = [0.0, 0.1, 0.2, 0.0];    
        with_close(new gz.PWMOutputDevice(pin), function(device){       
            device.value (0.1);
            device.value (0.2);
            device.value (0.0);
            pin.assert_states(expected);          
        });     
    });

    it('output_pwm_read', function() {            
        pin = new mp.MockPWMPin(2);
  
        with_close(new gz.PWMOutputDevice(pin, undefined, undefined, 100), function(device){       
            expect(device.frequency()).to.equal(100);
            device.value(0.1);
            expect(device.value()).to.equal(0.1);
            expect(pin.state()).to.equal(0.1);
            expect(device.is_active()).to.equal(true);
            device.frequency(-1);
            expect(device.value()).to.equal(0.0);
            expect(device.is_active()).equal(false);
            expect(device.frequency()).to.equal(undefined);
                     
        });     
    });

    it('output_pwm_write', function() {            
        pin = new mp.MockPWMPin(2);

        var expected = [0.0, 1.0, 0.0];    
        with_close(new gz.PWMOutputDevice(pin), function(device){       
            device.on();
            device.off();
            pin.assert_states(expected);          
        });     
    });

    it('output_pwm_toggle', function() {            
        pin = new mp.MockPWMPin(2);

        var expected = [0.0, 1.0, 0.5, 0.1, 0.9,0.0];    
        with_close(new gz.PWMOutputDevice(pin), function(device){       
            device.toggle();
            device.value(0.5);
            device.value(0.1);
            device.toggle();
            device.off();
            pin.assert_states(expected);          
        });     
    });

    it('output_pwm_active_high_read', function() {            
        pin = new mp.MockPWMPin(2);

        var expected = [0.0, 1.0, 0.5, 0.1, 0.9,0.0];    
        with_close(new gz.PWMOutputDevice(pin, false), function(device){       
            device.value(0.1);
            assert(isclose(device.value(),0.1));
            expect(pin.state()).to.equal(0.9);
            device.frequency(-1);
            expect(device.value()).to.equal(1.0);
        });     
    });

    it('output_pwm_bad_value', function() {            
        pin = new mp.MockPWMPin(2);
        with_close(new gz.PWMOutputDevice(pin), function(device){ 
            expect(function(){
               device.value(2);
            }).to.throw(gz.ValueError); 
        });
    });

    it('output_pwm_write_closed', function() { 
        pin = new mp.MockPWMPin(2);
        device =  new gz.PWMOutputDevice(pin);
        device.close();

        expect(function(){
              device.on();
            }).to.throw(gz.GPIODeviceClosed);      
    });

    it('output_pwm_write_silly', function() {            
        pin = new mp.MockPWMPin(2);
        with_close(new gz.OutputDevice(pin), function(device){          
            pin.pin_function('input');                  
            expect(function(){
                device.off();
            }).to.throw(gz.PinSetInput);
        });             
    });

    it('output_pwm_blink_callback', function(done) { 
        var fade_in_time = 0.5,
            fade_out_time = 0.5,
            on_time = 0.1, 
            off_time = 0.1,
            n = 1,
            expected = [];

        for (var i=0; i< 50 * fade_in_time ; i++) {
            expected.push(i * (1 / 50) / fade_in_time);
        }
        for (var i=0; i< 50 * fade_out_time ; i++) {
            expected.push(1-(i * (1 / 50)) / fade_out_time);
        }

        pin = new mp.MockPWMPin(2);
        var device = new gz.PWMOutputDevice(pin); 
        device.blink(on_time, off_time, fade_in_time, fade_out_time, n,()=>{
            pin.assert_states(expected);
            done();
        });
    });
});

/*





@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_output_pwm_blink_background():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        start = time()
        device.blink(0.1, 0.1, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        pin.assert_states_and_times([
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ])

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_output_pwm_blink_foreground():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        start = time()
        device.blink(0.1, 0.1, n=2, background=False)
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        pin.assert_states_and_times([
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ])

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_output_pwm_fade_background():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        start = time()
        device.blink(0, 0, 0.2, 0.2, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        pin.assert_states_and_times([
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ])

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_output_pwm_fade_foreground():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        start = time()
        device.blink(0, 0, 0.2, 0.2, n=2, background=False)
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        pin.assert_states_and_times([
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ])

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_output_pwm_pulse_background():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        start = time()
        device.pulse(0.2, 0.2, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        pin.assert_states_and_times([
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ])

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_output_pwm_pulse_foreground():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        start = time()
        device.pulse(0.2, 0.2, n=2, background=False)
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        pin.assert_states_and_times([
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ])

def test_output_pwm_blink_interrupt():
    pin = MockPWMPin(2)
    with PWMOutputDevice(pin) as device:
        device.blink(1, 0.1)
        sleep(0.2)
        device.off() # should interrupt while on
        pin.assert_states([0, 1, 0])

def test_rgbled_missing_pins():
    with pytest.raises(ValueError):
        RGBLED()

def test_rgbled_initial_value():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, initial_value=(0.1, 0.2, 0)) as device:
        assert r.frequency
        assert g.frequency
        assert b.frequency
        assert isclose(r.state, 0.1)
        assert isclose(g.state, 0.2)
        assert isclose(b.state, 0.0)

def test_rgbled_initial_value_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False, initial_value=(0, 1, 1)) as device:
        assert r.state == 0
        assert g.state == 1
        assert b.state == 1

def test_rgbled_initial_bad_value():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with pytest.raises(ValueError):
        RGBLED(r, g, b, initial_value=(0.1, 0.2, 1.2))

def test_rgbled_initial_bad_value_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with pytest.raises(ValueError):
        RGBLED(r, g, b, pwm=False, initial_value=(0.1, 0.2, 0))

def test_rgbled_value():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        assert isinstance(device._leds[0], PWMLED)
        assert isinstance(device._leds[1], PWMLED)
        assert isinstance(device._leds[2], PWMLED)
        assert not device.is_active
        assert device.value == (0, 0, 0)
        device.on()
        assert device.is_active
        assert device.value == (1, 1, 1)
        device.off()
        assert not device.is_active
        assert device.value == (0, 0, 0)
        device.value = (0.5, 0.5, 0.5)
        assert device.is_active
        assert device.value == (0.5, 0.5, 0.5)

def test_rgbled_value_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        assert isinstance(device._leds[0], LED)
        assert isinstance(device._leds[1], LED)
        assert isinstance(device._leds[2], LED)
        assert not device.is_active
        assert device.value == (0, 0, 0)
        device.on()
        assert device.is_active
        assert device.value == (1, 1, 1)
        device.off()
        assert not device.is_active
        assert device.value == (0, 0, 0)

def test_rgbled_bad_value():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        with pytest.raises(ValueError):
            device.value = (2, 0, 0)
    with RGBLED(r, g, b) as device:
        with pytest.raises(ValueError):
            device.value = (0, -1, 0)

def test_rgbled_bad_value_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.value = (2, 0, 0)
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.value = (0, -1, 0)
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.value = (0.5, 0, 0)
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.value = (0, 0.5, 0)
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.value = (0, 0, 0.5)

def test_rgbled_toggle():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        assert not device.is_active
        assert device.value == (0, 0, 0)
        device.toggle()
        assert device.is_active
        assert device.value == (1, 1, 1)
        device.toggle()
        assert not device.is_active
        assert device.value == (0, 0, 0)

def test_rgbled_toggle_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        assert not device.is_active
        assert device.value == (0, 0, 0)
        device.toggle()
        assert device.is_active
        assert device.value == (1, 1, 1)
        device.toggle()
        assert not device.is_active
        assert device.value == (0, 0, 0)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_background():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0.1, 0.1, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_background_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        start = time()
        device.blink(0.1, 0.1, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_foreground():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0.1, 0.1, n=2, background=False)
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_blink_foreground_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        start = time()
        device.blink(0.1, 0.1, n=2, background=False)
        assert isclose(time() - start, 0.4, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.0, 1),
            (0.1, 0),
            (0.1, 1),
            (0.1, 0)
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_fade_background():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0, 0, 0.2, 0.2, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_fade_background_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.blink(0, 0, 0.2, 0.2, n=2)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_fade_foreground():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.blink(0, 0, 0.2, 0.2, n=2, background=False)
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_fade_foreground_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.blink(0, 0, 0.2, 0.2, n=2, background=False)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_pulse_background():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.pulse(0.2, 0.2, n=2)
        assert isclose(time() - start, 0, abs_tol=0.05)
        device._blink_thread.join()
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_pulse_background_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.pulse(0.2, 0.2, n=2)

@pytest.mark.skipif(hasattr(sys, 'pypy_version_info'),
                    reason='timing is too random on pypy')
def test_rgbled_pulse_foreground():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        start = time()
        device.pulse(0.2, 0.2, n=2, background=False)
        assert isclose(time() - start, 0.8, abs_tol=0.05)
        expected = [
            (0.0, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            (0.04, 0.2),
            (0.04, 0.4),
            (0.04, 0.6),
            (0.04, 0.8),
            (0.04, 1),
            (0.04, 0.8),
            (0.04, 0.6),
            (0.04, 0.4),
            (0.04, 0.2),
            (0.04, 0),
            ]
        r.assert_states_and_times(expected)
        g.assert_states_and_times(expected)
        b.assert_states_and_times(expected)

def test_rgbled_pulse_foreground_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.pulse(0.2, 0.2, n=2, background=False)

def test_rgbled_blink_interrupt():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        device.blink(1, 0.1)
        sleep(0.2)
        device.off() # should interrupt while on
        r.assert_states([0, 1, 0])
        g.assert_states([0, 1, 0])
        b.assert_states([0, 1, 0])

def test_rgbled_blink_interrupt_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        device.blink(1, 0.1)
        sleep(0.2)
        device.off() # should interrupt while on
        r.assert_states([0, 1, 0])
        g.assert_states([0, 1, 0])
        b.assert_states([0, 1, 0])

def test_rgbled_close():
    r, g, b = (MockPWMPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b) as device:
        assert not device.closed
        device.close()
        assert device.closed
        device.close()
        assert device.closed

def test_rgbled_close_nonpwm():
    r, g, b = (MockPin(i) for i in (1, 2, 3))
    with RGBLED(r, g, b, pwm=False) as device:
        assert not device.closed
        device.close()
        assert device.closed
        device.close()
        assert device.closed

def test_motor_missing_pins():
    with pytest.raises(ValueError):
        Motor()

def test_motor_pins():
    f = MockPWMPin(1)
    b = MockPWMPin(2)
    with Motor(f, b) as device:
        assert device.forward_device.pin is f
        assert isinstance(device.forward_device, PWMOutputDevice)
        assert device.backward_device.pin is b
        assert isinstance(device.backward_device, PWMOutputDevice)

def test_motor_pins_nonpwm():
    f = MockPin(1)
    b = MockPin(2)
    with Motor(f, b, pwm=False) as device:
        assert device.forward_device.pin is f
        assert isinstance(device.forward_device, DigitalOutputDevice)
        assert device.backward_device.pin is b
        assert isinstance(device.backward_device, DigitalOutputDevice)

def test_motor_close():
    f = MockPWMPin(1)
    b = MockPWMPin(2)
    with Motor(f, b) as device:
        device.close()
        assert device.closed
        assert device.forward_device.pin is None
        assert device.backward_device.pin is None
        device.close()
        assert device.closed

def test_motor_close_nonpwm():
    f = MockPin(1)
    b = MockPin(2)
    with Motor(f, b, pwm=False) as device:
        device.close()
        assert device.closed
        assert device.forward_device.pin is None
        assert device.backward_device.pin is None

def test_motor_value():
    f = MockPWMPin(1)
    b = MockPWMPin(2)
    with Motor(f, b) as device:
        device.value = -1
        assert device.is_active
        assert device.value == -1
        assert b.state == 1 and f.state == 0
        device.value = 1
        assert device.is_active
        assert device.value == 1
        assert b.state == 0 and f.state == 1
        device.value = 0.5
        assert device.is_active
        assert device.value == 0.5
        assert b.state == 0 and f.state == 0.5
        device.value = -0.5
        assert device.is_active
        assert device.value == -0.5
        assert b.state == 0.5 and f.state == 0
        device.value = 0
        assert not device.is_active
        assert not device.value
        assert b.state == 0 and f.state == 0

def test_motor_value_nonpwm():
    f = MockPin(1)
    b = MockPin(2)
    with Motor(f, b, pwm=False) as device:
        device.value = -1
        assert device.is_active
        assert device.value == -1
        assert b.state == 1 and f.state == 0
        device.value = 1
        assert device.is_active
        assert device.value == 1
        assert b.state == 0 and f.state == 1
        device.value = 0
        assert not device.is_active
        assert not device.value
        assert b.state == 0 and f.state == 0

def test_motor_bad_value():
    f = MockPWMPin(1)
    b = MockPWMPin(2)
    with Motor(f, b) as device:
        with pytest.raises(ValueError):
            device.value = -2
        with pytest.raises(ValueError):
            device.value = 2

def test_motor_bad_value_nonpwm():
    f = MockPin(1)
    b = MockPin(2)
    with Motor(f, b, pwm=False) as device:
        with pytest.raises(ValueError):
            device.value = -2
        with pytest.raises(ValueError):
            device.value = 2
        with pytest.raises(ValueError):
            device.value = 0.5
        with pytest.raises(ValueError):
            device.value = -0.5

def test_motor_reverse():
    f = MockPWMPin(1)
    b = MockPWMPin(2)
    with Motor(f, b) as device:
        device.forward()
        assert device.value == 1
        assert b.state == 0 and f.state == 1
        device.reverse()
        assert device.value == -1
        assert b.state == 1 and f.state == 0
        device.backward(0.5)
        assert device.value == -0.5
        assert b.state == 0.5 and f.state == 0
        device.reverse()
        assert device.value == 0.5
        assert b.state == 0 and f.state == 0.5

def test_motor_reverse_nonpwm():
    f = MockPin(1)
    b = MockPin(2)
    with Motor(f, b, pwm=False) as device:
        device.forward()
        assert device.value == 1
        assert b.state == 0 and f.state == 1
        device.reverse()
        assert device.value == -1
        assert b.state == 1 and f.state == 0

def test_servo_pins():
    p = MockPWMPin(1)
    with Servo(p) as device:
        assert device.pwm_device.pin is p
        assert isinstance(device.pwm_device, PWMOutputDevice)

def test_servo_bad_value():
    p = MockPWMPin(1)
    with pytest.raises(ValueError):
        Servo(p, initial_value=2)
    with pytest.raises(ValueError):
        Servo(p, min_pulse_width=30/1000)
    with pytest.raises(ValueError):
        Servo(p, max_pulse_width=30/1000)

def test_servo_pins_nonpwm():
    p = MockPin(2)
    with pytest.raises(PinPWMUnsupported):
        Servo(p)

def test_servo_close():
    p = MockPWMPin(2)
    with Servo(p) as device:
        device.close()
        assert device.closed
        assert device.pwm_device.pin is None
        device.close()
        assert device.closed

def test_servo_pulse_width():
    p = MockPWMPin(2)
    with Servo(p, min_pulse_width=5/10000, max_pulse_width=25/10000) as device:
        assert isclose(device.min_pulse_width, 5/10000)
        assert isclose(device.max_pulse_width, 25/10000)
        assert isclose(device.frame_width, 20/1000)
        assert isclose(device.pulse_width, 15/10000)
        device.value = -1
        assert isclose(device.pulse_width, 5/10000)
        device.value = 1
        assert isclose(device.pulse_width, 25/10000)
        device.value = None
        assert device.pulse_width is None

def test_servo_values():
    p = MockPWMPin(1)
    with Servo(p) as device:
        device.min()
        assert device.is_active
        assert device.value == -1
        assert isclose(p.state, 0.05)
        device.max()
        assert device.is_active
        assert device.value == 1
        assert isclose(p.state, 0.1)
        device.mid()
        assert device.is_active
        assert device.value == 0.0
        assert isclose(p.state, 0.075)
        device.value = 0.5
        assert device.is_active
        assert device.value == 0.5
        assert isclose(p.state, 0.0875)
        device.detach()
        assert not device.is_active
        assert device.value is None
        device.value = 0
        assert device.value == 0
        device.value = None
        assert device.value is None

def test_angular_servo_range():
    p = MockPWMPin(1)
    with AngularServo(p, initial_angle=15, min_angle=0, max_angle=90) as device:
        assert device.min_angle == 0
        assert device.max_angle == 90

def test_angular_servo_angles():
    p = MockPWMPin(1)
    with AngularServo(p) as device:
        device.angle = 0
        assert device.angle == 0
        assert isclose(device.value, 0)
        device.max()
        assert device.angle == 90
        assert isclose(device.value, 1)
        device.min()
        assert device.angle == -90
        assert isclose(device.value, -1)
        device.detach()
        assert device.angle is None
    with AngularServo(p, initial_angle=15, min_angle=0, max_angle=90) as device:
        assert device.angle == 15
        assert isclose(device.value, -2/3)
        device.angle = 0
        assert device.angle == 0
        assert isclose(device.value, -1)
        device.angle = 90
        assert device.angle == 90
        assert isclose(device.value, 1)
        device.angle = None
        assert device.angle is None
    with AngularServo(p, min_angle=45, max_angle=-45) as device:
        assert device.angle == 0
        assert isclose(device.value, 0)
        device.angle = -45
        assert device.angle == -45
        assert isclose(device.value, 1)
        device.angle = -15
        assert device.angle == -15
        assert isclose(device.value, 1/3)


*/