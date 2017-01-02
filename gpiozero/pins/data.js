/**
 *
 * @class
 */
function PiBoardInfo() {

}

/**
 *
 * @param revision
 */
PiBoardInfo.prototype.from_revision = function (revision) {

    if (revision & 0x800000) {
        /*
        New - style
        revision, parse
        information
        from
        bit - pattern

        MSB----------------------->LSB
        uuuuuuuuFMMMCCCCPPPPTTTTTTTTRRRR

        uuuuuuuu - Unused
        F - New flag(1 = valid new - style revision, 0 = old - style)
        MMM - Memory size(0 = 256, 1 = 512, 2 = 1024)
        CCCC - Manufacturer(0 = Sony, 1 = Egoman, 2 = Embest)
        PPPP - Processor(0 = 2835, 1 = 2836, 2 = 2837)
        TTTTTTTT - Type(0 = A, 1 = B, 2 = A +, 3 = B +, 4 = 2B, 5 = Alpha(? ?), 6 = CM, 8 = 3B, 9 = Zero
        RRRR - Revision(0, 1, 2, etc.)
        */

        const model = {
            0: 'A',
            1: 'B',
            2: 'A+',
            3: 'B+',
            4: '2B',
            6: 'CM',
            8: '3B',
            9: 'Zero',
        }[(revision & 0xff0) >> 4];
        let pcb_revision;
        if (['A', 'B'].indexOf(model) !== -1) {
            pcb_revision = {
                0: '1.0', // is this right?
                1: '1.0',
                2: '2.0'
            }[revision & 0x0f]
        } else {
            pcb_revision = '1.%d' % (revision & 0x0f)
        }
    }
    /*
     try:


     released = {
     'A':    '2013Q1',
     'B':    '2012Q1' if pcb_revision == '1.0' else '2012Q4',
     'A+':   '2014Q4',
     'B+':   '2014Q3',
     '2B':   '2015Q1' if pcb_revision == '1.0' or pcb_revision == '1.1' else '2016Q3',
     'CM':   '2014Q2',
     '3B':   '2016Q1',
     'Zero': '2015Q4' if pcb_revision == '1.2' else '2016Q2',
     }[model]
     soc = {
     0: 'BCM2835',
     1: 'BCM2836',
     2: 'BCM2837',
     }[(revision & 0xf000) >> 12]
     manufacturer = {
     0: 'Sony',
     1: 'Egoman',
     2: 'Embest',
     }[(revision & 0xf0000) >> 16]
     memory = {
     0: 256,
     1: 512,
     2: 1024,
     }[(revision & 0x700000) >> 20]
     storage = {
     'A': 'SD',
     'B': 'SD',
     'CM': 'eMMC',
     }.get(model, 'MicroSD')
     usb = {
     'A':    1,
     'A+':   1,
     'Zero': 1,
     'B':    2,
     'CM':   1,
     }.get(model, 4)
     ethernet = {
     'A':    0,
     'A+':   0,
     'Zero': 0,
     'CM':   0,
     }.get(model, 1)
     wifi = {
     '3B': True,
     }.get(model, False)
     bluetooth = {
     '3B': True,
     }.get(model, False)
     csi = {
     'Zero': 0 if pcb_revision == '1.2' else 1,
     'CM':   2,
     }.get(model, 1)
     dsi = {
     'Zero': 0,
     }.get(model, csi)
     headers = {
     'A':  {'P1': REV2_P1, 'P5': REV2_P5},
     'B':  {'P1': REV1_P1} if pcb_revision == '1.0' else {'P1': REV2_P1, 'P5': REV2_P5},
     'CM': {'SODIMM': CM_SODIMM},
     }.get(model, {'P1': PLUS_P1})
     board = {
     'A':    A_BOARD,
     'B':    REV1_BOARD if pcb_revision == '1.0' else REV2_BOARD,
     'A+':   APLUS_BOARD,
     'CM':   CM_BOARD,
     'Zero': ZERO12_BOARD if pcb_revision == '1.2' else ZERO13_BOARD,
     }.get(model, BPLUS_BOARD)
     except KeyError:
     raise PinUnknownPi('unable to parse new-style revision "%x"' % revision)
     else:
     # Old-style revision, use the lookup table
     try:
     (
     model,
     pcb_revision,
     released,
     soc,
     manufacturer,
     memory,
     storage,
     usb,
     ethernet,
     wifi,
     bluetooth,
     csi,
     dsi,
     headers,
     board,
     ) = PI_REVISIONS[revision]
     except KeyError:
     raise PinUnknownPi('unknown old-style revision "%x"' % revision)
     headers = {
     header: HeaderInfo(name=header, rows=max(header_data) // 2, columns=2, pins={
     number: PinInfo(
     number=number, function=function, pull_up=pull_up,
     row=row + 1, col=col + 1)
     for number, (function, pull_up) in header_data.items()
     for row, col in (divmod(number, 2),)
     })
     for header, header_data in headers.items()
     }
     return cls(
     '%04x' % revision,
     model,
     pcb_revision,
     released,
     soc,
     manufacturer,
     memory,
     storage,
     usb,
     ethernet,
     wifi,
     bluetooth,
     csi,
     dsi,
     headers,
     board,

     */
}
/*

 class PiBoardInfo(namedtuple('PiBoardInfo', (
 'revision',
 'model',
 'pcb_revision',
 'released',
 'soc',
 'manufacturer',
 'memory',
 'storage',
 'usb',
 'ethernet',
 'wifi',
 'bluetooth',
 'csi',
 'dsi',
 'headers',
 'board',
 ))):
 """
 This class is a :func:`~collections.namedtuple` derivative used to
 represent information about a particular model of Raspberry Pi. While it is
 a tuple, it is strongly recommended that you use the following named
 attributes to access the data contained within. The object can be used
 in format strings with various custom format specifications::

 from gpiozero import *

 print('{0:full}'.format(pi_info()))
 print('{0:board}'.format(pi_info()))
 print('{0:specs}'.format(pi_info()))
 print('{0:headers}'.format(pi_info()))

 `'color'` and `'mono'` can be prefixed to format specifications to force
 the use of `ANSI color codes`_. If neither is specified, ANSI codes will
 only be used if stdout is detected to be a tty::

 print('{0:color board}'.format(pi_info())) # force use of ANSI codes
 print('{0:mono board}'.format(pi_info())) # force plain ASCII

 .. _ANSI color codes: https://en.wikipedia.org/wiki/ANSI_escape_code

 .. automethod:: physical_pin

 .. automethod:: physical_pins

 .. automethod:: pprint

 .. automethod:: pulled_up

 .. attribute:: revision

 A string indicating the revision of the Pi. This is unique to each
 revision and can be considered the "key" from which all other
 attributes are derived. However, in itself the string is fairly
 meaningless.

 .. attribute:: model

 A string containing the model of the Pi (for example, "B", "B+", "A+",
 "2B", "CM" (for the Compute Module), or "Zero").

 .. attribute:: pcb_revision

 A string containing the PCB revision number which is silk-screened onto
 the Pi (on some models).

 .. note::

 This is primarily useful to distinguish between the model B
 revision 1.0 and 2.0 (not to be confused with the model 2B) which
 had slightly different pinouts on their 26-pin GPIO headers.

 .. attribute:: released

 A string containing an approximate release date for this revision of
 the Pi (formatted as yyyyQq, e.g. 2012Q1 means the first quarter of
 2012).

 .. attribute:: soc

 A string indicating the SoC (`system on a chip`_) that this revision
 of the Pi is based upon.

 .. attribute:: manufacturer

 A string indicating the name of the manufacturer (usually "Sony" but a
 few others exist).

 .. attribute:: memory

 An integer indicating the amount of memory (in Mb) connected to the
 SoC.

 .. note::

 This can differ substantially from the amount of RAM available
 to the operating system as the GPU's memory is shared with the
 CPU. When the camera module is activated, at least 128Mb of RAM
 is typically reserved for the GPU.

 .. attribute:: storage

 A string indicating the type of bootable storage used with this
 revision of Pi, e.g. "SD", "MicroSD", or "eMMC" (for the Compute
 Module).

 .. attribute:: usb

 An integer indicating how many USB ports are physically present on
 this revision of the Pi.

 .. note::

 This does *not* include the micro-USB port used to power the Pi.

 .. attribute:: ethernet

 An integer indicating how many Ethernet ports are physically present
 on this revision of the Pi.

 .. attribute:: wifi

 A bool indicating whether this revision of the Pi has wifi built-in.

 .. attribute:: bluetooth

 A bool indicating whether this revision of the Pi has bluetooth
 built-in.

 .. attribute:: csi

 An integer indicating the number of CSI (camera) ports available on
 this revision of the Pi.

 .. attribute:: dsi

 An integer indicating the number of DSI (display) ports available on
 this revision of the Pi.

 .. attribute:: headers

 A dictionary which maps header labels to :class:`HeaderInfo` tuples.
 For example, to obtain information about header P1 you would query
 ``headers['P1']``. To obtain information about pin 12 on header P1 you
 would query ``headers['P1'].pins[12]``.

 A rendered version of this data can be obtained by using the
 :class:`PiBoardInfo` object in a format string::

 from gpiozero import *
 print('{0:headers}'.format(pi_info()))

 .. attribute:: board

 An ASCII art rendition of the board, primarily intended for console
 pretty-print usage. A more usefully rendered version of this data can
 be obtained by using the :class:`PiBoardInfo` object in a format
 string. For example::

 from gpiozero import *
 print('{0:board}'.format(pi_info()))

 .. _system on a chip: https://en.wikipedia.org/wiki/System_on_a_chip
 """
 __slots__ = () # workaround python issue #24931


 */



/**
 * Returns a {@link PiBoardInfo} instance containing information about a
 * *revision* of the Raspberry Pi.
 *
 * @param {string} [revision] - The revision of the Pi to return information about. If this is omitted
 * or `undefined` (the default), then the library will attempt to determine
 * the model of Pi it is running on and return information about that.
 */
function pi_info(revision){
/*
 if revision is None:
 # NOTE: This import is declared locally for two reasons. Firstly it
 # avoids a circular dependency (devices->pins->pins.data->devices).
 # Secondly, pin_factory is one global which might potentially be
 # re-written by a user's script at runtime hence we should re-import
 # here in case it's changed since initialization
 from ..devices import pin_factory
 result = pin_factory.pi_info()
 if result is None:
 raise PinUnknownPi('The default pin_factory is not attached to a Pi')
 else:
 return result
 else:
 */
    if (revision instanceof 'string') {
        revision = parseInt(revision, 16);
    }
    return PiBoardInfo.from_revision(revision);
}