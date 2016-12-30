
function EventsMixin () {
    this._active_event = false;
    this._inactive_event = false;
    this.when_activated = null;
    this.when_deactivated = null;
    this._last_state = null;
    this._last_changed = (new Date()).getTime();
}

exports.EventsMixin = EventsMixin;

EventsMixin.prototype._fire_events = function() {
    const old_state = this._last_state;
    const new_state = this._last_state = this.is_active();
    if (old_state === null) {
        // Initial "indeterminate" state; set events but don't fire
        // callbacks as there's not necessarily an edge
        if (new_state !== false) {
            this._active_event = true;
        } else {
            this._inactive_event = true;
        }
    } else if (old_state !== new_state) {
        this._last_changed = (new Date()).getTime();
        if (new_state !== false) {
            this._inactive_event = false;
            this._active_event = true;
            this._fire_activated();
        } else {
            this._active_event = false;
            this._inactive_event = true;
            this._fire_deactivated();
        }
    }
};

/**
 * These methods are largely here to be overridden by descendents.
 *
 * @private
 */
EventsMixin.prototype._fire_activated = function () {
    if (this.when_activated !== null) {
        this.when_activated();
    }
};

/**
 * These methods are largely here to be overridden by descendents.
 *
 * @private
 */
EventsMixin.prototype._fire_deactivated = function () {
    if (this.when_deactivated !== null) {
        this.when_deactivated();
    }
};

/*
 def wait_for_active(self, timeout=None):
 """
 Pause the script until the device is activated, or the timeout is
 reached.

 :param float timeout:
 Number of seconds to wait before proceeding. If this is ``None``
 (the default), then wait indefinitely until the device is active.
 """
 return self._active_event.wait(timeout)

 def wait_for_inactive(self, timeout=None):
 """
 Pause the script until the device is deactivated, or the timeout is
 reached.

 :param float timeout:
 Number of seconds to wait before proceeding. If this is ``None``
 (the default), then wait indefinitely until the device is inactive.
 """
 return self._inactive_event.wait(timeout)

 @property
 def when_activated(self):
 """
 The function to run when the device changes state from inactive to
 active.

 This can be set to a function which accepts no (mandatory) parameters,
 or a Python function which accepts a single mandatory parameter (with
 as many optional parameters as you like). If the function accepts a
 single mandatory parameter, the device that activated will be passed
 as that parameter.

 Set this property to ``None`` (the default) to disable the event.
 """
 return self._when_activated

 @when_activated.setter
 def when_activated(self, value):
 self._when_activated = self._wrap_callback(value)

 @property
 def when_deactivated(self):
 """
 The function to run when the device changes state from active to
 inactive.

 This can be set to a function which accepts no (mandatory) parameters,
 or a Python function which accepts a single mandatory parameter (with
 as many optional parameters as you like). If the function accepts a
 single mandatory parameter, the device that deactivated will be
 passed as that parameter.

 Set this property to ``None`` (the default) to disable the event.
 """
 return self._when_deactivated

 @when_deactivated.setter
 def when_deactivated(self, value):
 self._when_deactivated = self._wrap_callback(value)

 @property
 def active_time(self):
 """
 The length of time (in seconds) that the device has been active for.
 When the device is inactive, this is ``None``.
 """
 if self._active_event.is_set():
 return time() - self._last_changed
 else:
 return None

 @property
 def inactive_time(self):
 """
 The length of time (in seconds) that the device has been inactive for.
 When the device is active, this is ``None``.
 """
 if self._inactive_event.is_set():
 return time() - self._last_changed
 else:
 return None

 def _wrap_callback(self, fn):
 if fn is None:
 return None
 elif not callable(fn):
 raise BadEventHandler('value must be None or a callable')
 # If fn is wrapped with partial (i.e. partial, partialmethod, or wraps
 # has been used to produce it) we need to dig out the "real" function
 # that's been wrapped along with all the mandatory positional args
 # used in the wrapper so we can test the binding
 args = ()
 wrapped_fn = fn
 while isinstance(wrapped_fn, partial):
 args = wrapped_fn.args + args
 wrapped_fn = wrapped_fn.func
 if inspect.isbuiltin(wrapped_fn):
 # We can't introspect the prototype of builtins. In this case we
 # assume that the builtin has no (mandatory) parameters; this is
 # the most reasonable assumption on the basis that pre-existing
 # builtins have no knowledge of gpiozero, and the sole parameter
 # we would pass is a gpiozero object
 return fn
 else:
 # Try binding ourselves to the argspec of the provided callable.
 # If this works, assume the function is capable of accepting no
 # parameters
 try:
 inspect.getcallargs(wrapped_fn, *args)
 return fn
 except TypeError:
 try:
 # If the above fails, try binding with a single parameter
 # (ourselves). If this works, wrap the specified callback
 inspect.getcallargs(wrapped_fn, *(args + (self,)))
 @wraps(fn)
 def wrapper():
 return fn(self)
 return wrapper
 except TypeError:
 raise BadEventHandler(
 'value must be a callable which accepts up to one '
 'mandatory parameter')
 */
