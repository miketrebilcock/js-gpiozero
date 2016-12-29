const Device = require ('./Device.js').Device;
const inherit = require('../tools.js').inherit;

/**
 *  Represents a device composed of multiple devices like simple HATs, H-bridge motor controllers, robots composed of multiple motors, etc.
 *  The constructor accepts subordinate devices as positional or keyword arguments.
 *  Positional arguments form unnamed devices accessed via the (@link CompositeDevice#all|all) attribute,
 *  while keyword arguments are added to the device as named attributes.
 *
 * @param {Array} devices - An Array of positional devices.
 * @param {Array} kwdevices - An Array of tuples containing device name and device.
 * @class
 * @augments Device
 */
function CompositeDevice(devices, kwdevices) {
    this._all = [];
    this._namedtuple = [];
    let i;
    if(devices !== undefined) {
        for (i = 0; i < devices.length; i++) {
            this[i] = devices[i];
            this._namedtuple.push('_' + i);
            this._all.push(devices[i]);
        }
    }

    if(kwdevices !== undefined) {
        for (i = 0; i < kwdevices.length; i++) {
            const device_name = kwdevices[i][0];
            this[device_name] = kwdevices[i][1];
            this._namedtuple.push(kwdevices[i][0]);
            this._all.push(kwdevices[i][1]);
        }
    }
    Device.call(this);
}

CompositeDevice.prototype = inherit(Device.prototype);
CompositeDevice.prototype.constructor = CompositeDevice;

/**
 *
 * @returns {number} - The number of subordinate devices.
 */
CompositeDevice.prototype.length = function() {
    return this._all.length;
};

/**
 *
 * @returns {Array} - An array of subordinate device names.
 */
CompositeDevice.prototype.namedtuple = function() {
    return this._namedtuple;
};

/**
 *
 * @returns {Array} - An array of all subordinate device values.
 */
CompositeDevice.prototype.value = function () {
    let i;
    const result = [];
    for (i = 0; i < this._all.length; i++) {
        result[i] = this._all[i].value();
    }
    return result;
};

/**
 *
 * @returns {boolean} - An array of each subordinate devices active state.
 */
CompositeDevice.prototype.is_active = function () {
    let i;
    for (i = 0; i < this._all.length; i++) {
        if (this._all[i].value()) {
            return true;
        }
    }
    return false;
};

/**
 * Close all subordinate devices.
 */
CompositeDevice.prototype.close = function () {
    this._all.forEach((device) => {
        device.close();
    });
};

exports.CompositeDevice = CompositeDevice;
/*
 class CompositeDevice(Device):

 :param list _order:
 If specified, this is the order of named items specified by keyword
 arguments (to ensure that the :attr:`value` tuple is constructed with a
 specific order). All keyword arguments *must* be included in the
 collection. If omitted, an alphabetically sorted order will be selected
 for keyword arguments.
 """
 def __init__(self, *args, **kwargs):
 self._all = ()
 self._named = frozendict({})
 self._namedtuple = None
 self._order = kwargs.pop('_order', None)
 if self._order is None:
 self._order = sorted(kwargs.keys())
 else:
 for missing_name in set(kwargs.keys()) - set(self._order):
 raise CompositeDeviceBadOrder('%s missing from _order' % missing_name)
 self._order = tuple(self._order)
 super(CompositeDevice, self).__init__()
 for name in set(self._order) & set(dir(self)):
 raise CompositeDeviceBadName('%s is a reserved name' % name)
 self._all = args + tuple(kwargs[v] for v in self._order)
 for dev in self._all:
 if not isinstance(dev, Device):
 raise CompositeDeviceBadDevice("%s doesn't inherit from Device" % dev)
 self._named = frozendict(kwargs)
 self._namedtuple = namedtuple('%sValue' % self.__class__.__name__, chain(
 (str(i) for i in range(len(args))), self._order),
 rename=True)

 def __getattr__(self, name):
 # if _named doesn't exist yet, pretend it's an empty dict
 if name == '_named':
 return frozendict({})
 try:
 return self._named[name]
 except KeyError:
 raise AttributeError("no such attribute %s" % name)

 def __setattr__(self, name, value):
 # make named components read-only properties
 if name in self._named:
 raise AttributeError("can't set attribute %s" % name)
 return super(CompositeDevice, self).__setattr__(name, value)

 def __repr__(self):
 try:
 self._check_open()
 return "<gpiozero.%s object containing %d devices: %s and %d unnamed>" % (
 self.__class__.__name__,
 len(self), ','.join(self._order),
 len(self) - len(self._named)
 )
 except DeviceClosed:
 return "<gpiozero.%s object closed>" % (self.__class__.__name__)

 def __getitem__(self, index):
 return self._all[index]

 def __iter__(self):
 return iter(self._all)

 @property
 def all(self):
 # XXX Deprecate this in favour of using the instance as a container
 return self._all

 def close(self):
 if self._all:
 for device in self._all:
 device.close()

 @property
 def closed(self):
 return all(device.closed for device in self)

 @property
 def namedtuple(self):
 return self._namedtuple

 @property
 def value(self):
 return self.namedtuple(*(device.value for device in self))

 @property
 def is_active(self):
 return any(self.value)

 */