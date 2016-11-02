require ("../exc.js");

function inherit(proto) {
  function F() {}
  F.prototype = proto;
  return new F;
}

function Pin() {
    /*
    Abstract base class representing a GPIO pin or a pin from an IO extender.

    Descendents should override property getters and setters to accurately
    represent the capabilities of pins. The following functions *must* be
    overridden:

    * :meth:`_get_function`
    * :meth:`_set_function`
    * :meth:`_get_state`

    The following functions *may* be overridden if applicable:

    * :meth:`close`
    * :meth:`_set_state`
    * :meth:`_get_frequency`
    * :meth:`_set_frequency`
    * :meth:`_get_pull`
    * :meth:`_set_pull`
    * :meth:`_get_bounce`
    * :meth:`_set_bounce`
    * :meth:`_get_edges`
    * :meth:`_set_edges`
    * :meth:`_get_when_changed`
    * :meth:`_set_when_changed`
    * :meth:`pi_info`
    * :meth:`output_with_state`
    * :meth:`input_with_pull`

    .. warning::

        Descendents must ensure that pin instances representing the same
        physical hardware are identical, right down to object identity. The
        framework relies on this to correctly clean up resources at interpreter
        shutdown.
    """
	*/
    this._blink_timer = undefined;
}

Pin.prototype = {
	toString: function () { return "Abstract pin";},
	close: function () {
		/*
        Cleans up the resources allocated to the pin. After this method is
        called, this :class:`Pin` instance may no longer be used to query or
        control the pin's state.
        */
        this._stop_blink();
	},
	output_with_state: function (state) {
		/*
        Sets the pin's function to "output" and specifies an initial state
        for the pin. By default this is equivalent to performing::

            pin.function = 'output'
            pin.state = state

        However, descendents may override this in order to provide the smallest
        possible delay between configuring the pin for output and specifying an
        initial value (which can be important for avoiding "blips" in
        active-low configurations).
        */
        this._function ='output';        
        this.state (state);        
	},
	input_with_pull: function (pull){
		/*
        Sets the pin's function to "input" and specifies an initial pull-up
        for the pin. By default this is equivalent to performing::

            pin.function = 'input'
            pin.pull = pull

        However, descendents may override this order to provide the smallest
        possible delay between configuring the pin for input and pulling the
        pin up/down (which can be important for avoiding "blips" in some
        configurations).
        */
        this.pin_function ('input');
        this.pull (pull);	
	},
    /*
        The function of the pin. This property is a string indicating the
        current function or purpose of the pin. Typically this is the string
        "input" or "output". However, in some circumstances it can be other
        strings indicating non-GPIO related functionality.

        With certain pin types (e.g. GPIO pins), this attribute can be changed
        to configure the function of a pin. If an invalid function is
        specified, for this attribute, :exc:`PinInvalidFunction` will be
        raised.
    */
	pin_function: function (value) {
        if (value == undefined) {
            return "input";
        }
        if (value != "input") {
            throw new exc.PinInvalidFunction(
                "Cannot set the function of pin " + this + " to " + value);
        }
	},
    /*
        The state of the pin. This is 0 for low, and 1 for high. As a low level
        view of the pin, no swapping is performed in the case of pull ups (see
        :attr:`pull` for more information).

        If PWM is currently active (when :attr:`frequency` is not ``None``),
        this represents the PWM duty cycle as a value between 0.0 and 1.0.

        If a pin is currently configured for input, and an attempt is made to
        set this attribute, :exc:`PinSetInput` will be raised. If an invalid
        value is specified for this attribute, :exc:`PinInvalidState` will be
        raised.

    */
    state: function (value) {
        if (value == undefined) {
            return 0;
        }  
        throw new PinSetInput("Cannot set the state of input pin " + this);
    },
    blink: function (on_time, off_time, loops) {
        this.on_time = (on_time==undefined ? 1000 : on_time*1000);
        this.off_time = (off_time==undefined ? 1000 : off_time*1000);
        this.number_of_blinks = loops;
        
        this._stop_blink();
        if(loops==undefined) {
            this._blink_timer = setInterval(function(that) {
                that.state(1);
                setTimeout (function() {
                    that.state(0);
                }, that.off_time);
            }, this.on_time + this.off_time, this);

            this.state(1);
            setTimeout (function(that) {
                    that.state(0);
                }, this.off_time, this);

        } else {
            this._blink_timer = setInterval(function(that) {
                if(that.number_of_blinks>0) {
                    that.state(1);
                    setTimeout (function() {
                        that.state(0);
                        that.number_of_blinks --;
                    }, that.on_time);
                } else {
                    that._stop_blink();
                }
            }, this.on_time + this.off_time, this)
            this.state(1);
            setTimeout (function(that) {
                    that.state(0);
                    that.number_of_blinks --;
                }, this.on_time, this);
        }
    },
    _stop_blink : function() {
        if (this._blink_timer != undefined ) {

            clearInterval(this._blink_timer);
            this._blink_timer = undefined;
        }
    }
}


var _PI_REVISION = undefined;

function LocalPin(){
    /*
    Abstract base class representing pins attached locally to a Pi. This forms
    the base class for local-only pin interfaces (:class:`RPiGPIOPin`,
    :class:`RPIOPin`, and :class:`NativePin`).
    */
    Pin.call(this);

}

LocalPin.prototype = inherit(Pin.prototype);
LocalPin.prototype.constructor = LocalPin;

LocalPin.prototype.pi_info = function (){
    throw new NotImplementedError();
}
/*

    def _get_pull(self):
        return 'floating'

    def _set_pull(self, value):
        raise PinFixedPull("Cannot change pull-up on pin %r" % self)

    pull = property(
        lambda self: self._get_pull(),
        lambda self, value: self._set_pull(value),
        doc="""\
        The pull-up state of the pin represented as a string. This is typically
        one of the strings "up", "down", or "floating" but additional values
        may be supported by the underlying hardware.

        If the pin does not support changing pull-up state (for example because
        of a fixed pull-up resistor), attempts to set this property will raise
        :exc:`PinFixedPull`. If the specified value is not supported by the
        underlying hardware, :exc:`PinInvalidPull` is raised.
        """)

    def _get_frequency(self):
        return None

    def _set_frequency(self, value):
        if value is not None:
            raise PinPWMUnsupported("PWM is not supported on pin %r" % self)

    frequency = property(
        lambda self: self._get_frequency(),
        lambda self, value: self._set_frequency(value),
        doc="""\
        The frequency (in Hz) for the pin's PWM implementation, or ``None`` if
        PWM is not currently in use. This value always defaults to ``None`` and
        may be changed with certain pin types to activate or deactivate PWM.

        If the pin does not support PWM, :exc:`PinPWMUnsupported` will be
        raised when attempting to set this to a value other than ``None``.
        """)

    def _get_bounce(self):
        return None

    def _set_bounce(self, value):
        if value is not None:
            raise PinEdgeDetectUnsupported("Edge detection is not supported on pin %r" % self)

    bounce = property(
        lambda self: self._get_bounce(),
        lambda self, value: self._set_bounce(value),
        doc="""\
        The amount of bounce detection (elimination) currently in use by edge
        detection, measured in seconds. If bounce detection is not currently in
        use, this is ``None``.

        If the pin does not support edge detection, attempts to set this
        property will raise :exc:`PinEdgeDetectUnsupported`. If the pin
        supports edge detection, the class must implement bounce detection,
        even if only in software.
        """)

    def _get_edges(self):
        return 'none'

    def _set_edges(self, value):
        raise PinEdgeDetectUnsupported("Edge detection is not supported on pin %r" % self)

    edges = property(
        lambda self: self._get_edges(),
        lambda self, value: self._set_edges(value),
        doc="""\
        The edge that will trigger execution of the function or bound method
        assigned to :attr:`when_changed`. This can be one of the strings
        "both" (the default), "rising", "falling", or "none".

        If the pin does not support edge detection, attempts to set this
        property will raise :exc:`PinEdgeDetectUnsupported`.
        """)

    def _get_when_changed(self):
        return None

    def _set_when_changed(self, value):
        raise PinEdgeDetectUnsupported("Edge detection is not supported on pin %r" % self)

    when_changed = property(
        lambda self: self._get_when_changed(),
        lambda self, value: self._set_when_changed(value),
        doc="""\
        A function or bound method to be called when the pin's state changes
        (more specifically when the edge specified by :attr:`edges` is detected
        on the pin). The function or bound method must take no parameters.

        If the pin does not support edge detection, attempts to set this
        property will raise :exc:`PinEdgeDetectUnsupported`.
        """)

    @classmethod
    def pi_info(cls):
        """
        Returns a :class:`PiBoardInfo` instance representing the Pi that
        instances of this pin class will be attached to.

        If the pins represented by this class are not *directly* attached to a
        Pi (e.g. the pin is attached to a board attached to the Pi, or the pins
        are not on a Pi at all), this may return ``None``.
        """
        return None


class LocalPin(Pin):
    """
    Abstract base class representing pins attached locally to a Pi. This forms
    the base class for local-only pin interfaces (:class:`RPiGPIOPin`,
    :class:`RPIOPin`, and :class:`NativePin`).
    """
    _PI_REVISION = None

    @classmethod
    def pi_info(cls):
        """
        Returns a :class:`PiBoardInfo` instance representing the local Pi.
        The Pi's revision is determined by reading :file:`/proc/cpuinfo`. If
        no valid revision is found, returns ``None``.
        """
        # Cache the result as we can reasonably assume it won't change during
        # runtime (this is LocalPin after all; descendents that deal with
        # remote Pis should inherit from Pin instead)
        if cls._PI_REVISION is None:
            with io.open('/proc/cpuinfo', 'r') as f:
                for line in f:
                    if line.startswith('Revision'):
                        revision = line.split(':')[1].strip().lower()
                        overvolted = revision.startswith('100')
                        if overvolted:
                            revision = revision[-4:]
                        cls._PI_REVISION = revision
                        break
                if cls._PI_REVISION is None:
                    return None # something weird going on
        return pi_info(cls._PI_REVISION)


*/

exports.Pin = Pin;
exports.LocalPin = LocalPin;
