const PinUnknownPi = require('../exc.js').PinUnknownPi;
const PinMultiplePins = require('../exc.js').PinMultiplePins;
const PinNoPins = require('../exc.js').PinNoPins;

/**
 * This class represents information about a particular model of Raspberry Pi.
 *
 * @class
 */
function PiBoardInfo() {
    this.revision='';
    this.model  ='';
    this.pcb_revision='';
    this.released='';
    this.soc='';
    this.manufacturer='';
    this.memory='';
    this.storage='';
    this.usb = '';
    this.ethernet='';
    this.wifi='';
    this.bluetooth='';
    this.csi='';
    this.dsi='';
    this.headers='';
    this.board='';
}

module.exports.PiBoardInfo = PiBoardInfo;

//Some useful constants for describing pins

const V1_8   = '1V8';
const V3_3   = '3V3';
const V5     = '5V';
const GND    = 'GND';
const NC     = 'NC'; // not connected
const GPIO0  = 'GPIO0';
const GPIO1  = 'GPIO1';
const GPIO2  = 'GPIO2';
const GPIO3  = 'GPIO3';
const GPIO4  = 'GPIO4';
const GPIO5  = 'GPIO5';
const GPIO6  = 'GPIO6';
const GPIO7  = 'GPIO7';
const GPIO8  = 'GPIO8';
const GPIO9  = 'GPIO9';
const GPIO10 = 'GPIO10';
const GPIO11 = 'GPIO11';
const GPIO12 = 'GPIO12';
const GPIO13 = 'GPIO13';
const GPIO14 = 'GPIO14';
const GPIO15 = 'GPIO15';
const GPIO16 = 'GPIO16';
const GPIO17 = 'GPIO17';
const GPIO18 = 'GPIO18';
const GPIO19 = 'GPIO19';
const GPIO20 = 'GPIO20';
const GPIO21 = 'GPIO21';
const GPIO22 = 'GPIO22';
const GPIO23 = 'GPIO23';
const GPIO24 = 'GPIO24';
const GPIO25 = 'GPIO25';
const GPIO26 = 'GPIO26';
const GPIO27 = 'GPIO27';
const GPIO28 = 'GPIO28';
const GPIO29 = 'GPIO29';
const GPIO30 = 'GPIO30';
const GPIO31 = 'GPIO31';
const GPIO32 = 'GPIO32';
const GPIO33 = 'GPIO33';
const GPIO34 = 'GPIO34';
const GPIO35 = 'GPIO35';
const GPIO36 = 'GPIO36';
const GPIO37 = 'GPIO37';
const GPIO38 = 'GPIO38';
const GPIO39 = 'GPIO39';
const GPIO40 = 'GPIO40';
const GPIO41 = 'GPIO41';
const GPIO42 = 'GPIO42';
const GPIO43 = 'GPIO43';
const GPIO44 = 'GPIO44';
const GPIO45 = 'GPIO45';

// Board layout ASCII art

const REV1_BOARD = `
{style:white on green}+------------------{style:black on white}| |{style:white on green}--{style:on cyan}| |{style:on green}------+{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1 {style:black on yellow}|C|{style:white on green}  {style:on cyan}|A|{style:on green}      |{style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}    {style:black on yellow}+-+{style:white on green}  {style:on cyan}+-+{style:on green}      |{style:reset}
{style:white on green}|                                |{style:reset}
{style:white on green}|                {style:on black}+---+{style:on green}          {style:black on white}+===={style:reset}
{style:white on green}|                {style:on black}|SoC|{style:on green}          {style:black on white}| USB{style:reset}
{style:white on green}|   {style:on black}|D|{style:on green} {style:bold}Pi Model{style:normal} {style:on black}+---+{style:on green}          {style:black on white}+===={style:reset}
{style:white on green}|   {style:on black}|S|{style:on green} {style:bold}{model:2s} V{pcb_revision:3s}{style:normal}                  |{style:reset}
{style:white on green}|   {style:on black}|I|{style:on green}                  {style:on black}|C|{style:black on white}+======{style:reset}
{style:white on green}|                        {style:on black}|S|{style:black on white}|   Net{style:reset}
{style:white on green}|                        {style:on black}|I|{style:black on white}+======{style:reset}
{style:black on white}=pwr{style:on green}             {style:on white}|HDMI|{style:white on green}          |{style:reset}
{style:white on green}+----------------{style:black on white}|    |{style:white on green}----------+{style:reset}`;

const REV2_BOARD = `
{style:white on green}+------------------{style:black on white}| |{style:white on green}--{style:on cyan}| |{style:on green}------+{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1 {style:black on yellow}|C|{style:white on green}  {style:on cyan}|A|{style:on green}      |{style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}    {style:black on yellow}+-+{style:white on green}  {style:on cyan}+-+{style:on green}      |{style:reset}
{style:white on green}|    {P5:{style} col1}{style:white on green}                        |{style:reset}
{style:white on green}| P5 {P5:{style} col2}{style:white on green}        {style:on black}+---+{style:on green}          {style:black on white}+===={style:reset}
{style:white on green}|                {style:on black}|SoC|{style:on green}          {style:black on white}| USB{style:reset}
{style:white on green}|   {style:on black}|D|{style:on green} {style:bold}Pi Model{style:normal} {style:on black}+---+{style:on green}          {style:black on white}+===={style:reset}
{style:white on green}|   {style:on black}|S|{style:on green} {style:bold}{model:2s} V{pcb_revision:3s}{style:normal}                  |{style:reset}
{style:white on green}|   {style:on black}|I|{style:on green}                  {style:on black}|C|{style:black on white}+======{style:reset}
{style:white on green}|                        {style:on black}|S|{style:black on white}|   Net{style:reset}
{style:white on green}|                        {style:on black}|I|{style:black on white}+======{style:reset}
{style:black on white}=pwr{style:on green}             {style:on white}|HDMI|{style:white on green}          |{style:reset}
{style:white on green}+----------------{style:black on white}|    |{style:white on green}----------+{style:reset}`;

const A_BOARD = `
{style:white on green}+------------------{style:black on white}| |{style:white on green}--{style:on cyan}| |{style:on green}------+{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1 {style:black on yellow}|C|{style:white on green}  {style:on cyan}|A|{style:on green}      |{style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}    {style:black on yellow}+-+{style:white on green}  {style:on cyan}+-+{style:on green}      |{style:reset}
{style:white on green}|    {P5:{style} col1}{style:white on green}                        |{style:reset}
{style:white on green}| P5 {P5:{style} col2}{style:white on green}        {style:on black}+---+{style:on green}          {style:black on white}+===={style:reset}
{style:white on green}|                {style:on black}|SoC|{style:on green}          {style:black on white}| USB{style:reset}
{style:white on green}|   {style:on black}|D|{style:on green} {style:bold}Pi Model{style:normal} {style:on black}+---+{style:on green}          {style:black on white}+===={style:reset}
{style:white on green}|   {style:on black}|S|{style:on green} {style:bold}{model:2s} V{pcb_revision:3s}{style:normal}                  |{style:reset}
{style:white on green}|   {style:on black}|I|{style:on green}                  {style:on black}|C|{style:on green}     |{style:reset}
{style:white on green}|                        {style:on black}|S|{style:on green}     |{style:reset}
{style:white on green}|                        {style:on black}|I|{style:on green}     |{style:reset}
{style:black on white}=pwr{style:on green}             {style:on white}|HDMI|{style:white on green}          |{style:reset}
{style:white on green}+----------------{style:black on white}|    |{style:white on green}----------+{style:reset}`;

const BPLUS_BOARD = `
{style:white on green},--------------------------------.{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1     {style:black on white}+===={style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}        {style:black on white}| USB{style:reset}
{style:white on green}|                             {style:black on white}+===={style:reset}
{style:white on green}|      {style:bold}Pi Model {model:2s} V{pcb_revision:3s}{style:normal}          |{style:reset}
{style:white on green}|      {style:on black}+----+{style:on green}                 {style:black on white}+===={style:reset}
{style:white on green}| {style:on black}|D|{style:on green}  {style:on black}|SoC |{style:on green}                 {style:black on white}| USB{style:reset}
{style:white on green}| {style:on black}|S|{style:on green}  {style:on black}|    |{style:on green}                 {style:black on white}+===={style:reset}
{style:white on green}| {style:on black}|I|{style:on green}  {style:on black}+----+{style:on green}                    |{style:reset}
{style:white on green}|                   {style:on black}|C|{style:on green}     {style:black on white}+======{style:reset}
{style:white on green}|                   {style:on black}|S|{style:on green}     {style:black on white}|   Net{style:reset}
{style:white on green}| {style:black on white}pwr{style:white on green}        {style:black on white}|HDMI|{style:white on green} {style:on black}|I||A|{style:on green}  {style:black on white}+======{style:reset}
{style:white on green}+-{style:black on white}| |{style:white on green}--------{style:black on white}|    |{style:white on green}----{style:on black}|V|{style:on green}-------'{style:reset}`;

const APLUS_BOARD = `
{style:white on green},--------------------------.{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1  |{style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}     |{style:reset}
{style:white on green}|                          |{style:reset}
{style:white on green}|      {style:bold}Pi Model {model:2s} V{pcb_revision:3s}{style:normal}    |{style:reset}
{style:white on green}|      {style:on black}+----+{style:on green}           {style:black on white}+===={style:reset}
{style:white on green}| {style:on black}|D|{style:on green}  {style:on black}|SoC |{style:on green}           {style:black on white}| USB{style:reset}
{style:white on green}| {style:on black}|S|{style:on green}  {style:on black}|    |{style:on green}           {style:black on white}+===={style:reset}
{style:white on green}| {style:on black}|I|{style:on green}  {style:on black}+----+{style:on green}              |{style:reset}
{style:white on green}|                   {style:on black}|C|{style:on green}    |{style:reset}
{style:white on green}|                   {style:on black}|S|{style:on green}    |{style:reset}
{style:white on green}| {style:black on white}pwr{style:white on green}        {style:black on white}|HDMI|{style:white on green} {style:on black}|I||A|{style:on green} |{style:reset}
{style:white on green}+-{style:black on white}| |{style:white on green}--------{style:black on white}|    |{style:white on green}----{style:on black}|V|{style:on green}-'{style:reset}`;

const ZERO12_BOARD = `
{style:white on green},-------------------------.{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1 |{style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}    |{style:reset}
{style:black on white}---+{style:white on green}       {style:on black}+----+{style:on green} {style:bold}PiZero{style:normal}  |{style:reset}
{style:black on white} sd|{style:white on green}       {style:on black}|SoC |{style:on green}  {style:bold}V{pcb_revision:3s}{style:normal}   |{style:reset}
{style:black on white}---+|hdmi|{style:white on green} {style:on black}+----+{style:on green} {style:black on white}usb{style:on green} {style:black on white}pwr{style:white on green} |{style:reset}
{style:white on green}+---{style:black on white}|    |{style:white on green}--------{style:black on white}| |{style:white on green}-{style:black on white}| |{style:white on green}-'{style:reset}`;

const ZERO13_BOARD = `
{style:white on green}.-------------------------.{style:reset}
{style:white on green}| {P1:{style} col2}{style:white on green} P1 |{style:reset}
{style:white on green}| {P1:{style} col1}{style:white on green}   {style:black on white}|c{style:reset}
{style:black on white}---+{style:white on green}       {style:on black}+----+{style:on green} {style:bold}PiZero{style:normal} {style:black on white}|s{style:reset}
{style:black on white} sd|{style:white on green}       {style:on black}|SoC |{style:on green}  {style:bold}V{pcb_revision:3s}{style:normal}  {style:black on white}|i{style:reset}
{style:black on white}---+|hdmi|{style:white on green} {style:on black}+----+{style:on green} {style:black on white}usb{style:on green} {style:on white}pwr{style:white on green} |{style:reset}
{style:white on green}+---{style:black on white}|    |{style:white on green}--------{style:black on white}| |{style:white on green}-{style:black on white}| |{style:white on green}-'{style:reset}`;

const CM_BOARD = `
{style:white on green}+-----------------------------------------------------------------------------------------------------------------------+{style:reset}
{style:white on green}| Raspberry Pi Compute Module                                                                                           |{style:reset}
{style:white on green}|                                                                                                                       |{style:reset}
{style:white on green}| You were expecting more detail? Sorry, the Compute Module's a bit hard to do right now!                               |{style:reset}
{style:white on green}|                                                                                                                       |{style:reset}
{style:white on green}|                                                                                                                       |{style:reset}
{style:white on green}||||||||||||||||||||-||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||{style:reset}`;

// Pin maps for various board revisions and headers

const REV1_P1 = {
    1:  {func: V3_3,   pullup: false}, 2:  {func: V5,     pullup: false},
    3:  {func: GPIO0,  pullup: true},  4:  {func: V5,     pullup: false},
    5:  {func: GPIO1,  pullup: true},  6:  {func: GND,    pullup: false},
    7:  {func: GPIO4,  pullup: false}, 8:  {func: GPIO14, pullup: false},
    9:  {func: GND,    pullup: false}, 10: {func: GPIO15, pullup: false},
    11: {func: GPIO17, pullup: false}, 12: {func: GPIO18, pullup: false},
    13: {func: GPIO21, pullup: false}, 14: {func: GND,    pullup: false},
    15: {func: GPIO22, pullup: false}, 16: {func: GPIO23, pullup: false},
    17: {func: V3_3,   pullup: false}, 18: {func: GPIO24, pullup: false},
    19: {func: GPIO10, pullup: false}, 20: {func: GND,    pullup: false},
    21: {func: GPIO9,  pullup: false}, 22: {func: GPIO25, pullup: false},
    23: {func: GPIO11, pullup: false}, 24: {func: GPIO8,  pullup: false},
    25: {func: GND,    pullup: false}, 26: {func: GPIO7,  pullup: false}
};

const REV2_P1 = {
    1:  {func: V3_3,   pullup: false}, 2:  {func: V5,     pullup: false},
    3:  {func: GPIO2,  pullup: true},  4:  {func: V5,     pullup: false},
    5:  {func: GPIO3,  pullup: true},  6:  {func: GND,    pullup: false},
    7:  {func: GPIO4,  pullup: false}, 8:  {func: GPIO14, pullup: false},
    9:  {func: GND,    pullup: false}, 10: {func: GPIO15, pullup: false},
    11: {func: GPIO17, pullup: false}, 12: {func: GPIO18, pullup: false},
    13: {func: GPIO27, pullup: false}, 14: {func: GND,    pullup: false},
    15: {func: GPIO22, pullup: false}, 16: {func: GPIO23, pullup: false},
    17: {func: V3_3,   pullup: false}, 18: {func: GPIO24, pullup: false},
    19: {func: GPIO10, pullup: false}, 20: {func: GND,    pullup: false},
    21: {func: GPIO9,  pullup: false}, 22: {func: GPIO25, pullup: false},
    23: {func: GPIO11, pullup: false}, 24: {func: GPIO8,  pullup: false},
    25: {func: GND,    pullup: false}, 26: {func: GPIO7,  pullup: false}
};

const REV2_P5 = {
    1:  {func: V5,     pullup: false}, 2:  {func: V3_3,   pullup: false},
    3:  {func: GPIO28, pullup: false}, 4:  {func: GPIO29, pullup: false},
    5:  {func: GPIO30, pullup: false}, 6:  {func: GPIO31, pullup: false},
    7:  {func: GND,    pullup: false}, 8:  {func: GND,    pullup: false}
};

const PLUS_P1 = {
    1:  {func: V3_3,   pullup: false}, 2:  {func: V5,     pullup: false},
    3:  {func: GPIO2,  pullup: true},  4:  {func: V5,     pullup: false},
    5:  {func: GPIO3,  pullup: true},  6:  {func: GND,    pullup: false},
    7:  {func: GPIO4,  pullup: false}, 8:  {func: GPIO14, pullup: false},
    9:  {func: GND,    pullup: false}, 10: {func: GPIO15, pullup: false},
    11: {func: GPIO17, pullup: false}, 12: {func: GPIO18, pullup: false},
    13: {func: GPIO27, pullup: false}, 14: {func: GND,    pullup: false},
    15: {func: GPIO22, pullup: false}, 16: {func: GPIO23, pullup: false},
    17: {func: V3_3,   pullup: false}, 18: {func: GPIO24, pullup: false},
    19: {func: GPIO10, pullup: false}, 20: {func: GND,    pullup: false},
    21: {func: GPIO9,  pullup: false}, 22: {func: GPIO25, pullup: false},
    23: {func: GPIO11, pullup: false}, 24: {func: GPIO8,  pullup: false},
    25: {func: GND,    pullup: false}, 26: {func: GPIO7,  pullup: false},
    27: {func: GPIO0,  pullup: false}, 28: {func: GPIO1,  pullup: false},
    29: {func: GPIO5,  pullup: false}, 30: {func: GND,    pullup: false},
    31: {func: GPIO6,  pullup: false}, 32: {func: GPIO12, pullup: false},
    33: {func: GPIO13, pullup: false}, 34: {func: GND,    pullup: false},
    35: {func: GPIO19, pullup: false}, 36: {func: GPIO16, pullup: false},
    37: {func: GPIO26, pullup: false}, 38: {func: GPIO20, pullup: false},
    39: {func: GND,    pullup: false}, 40: {func: GPIO21, pullup: false}
};

const CM_SODIMM = {
    1:   {func: GND,              pullup: false}, 2:   {func: 'EMMC DISABLE N', pullip: false},
    3:   {func: GPIO0,            pullup: false}, 4:   {func: NC,               pullip: false},
    5:   {func: GPIO1,            pullup: false}, 6:   {func: NC,               pullip: false},
    7:   {func: GND,              pullup: false}, 8:   {func: NC,               pullip: false},
    9:   {func: GPIO2,            pullup: false}, 10:  {func: NC,               pullip: false},
    11:  {func: GPIO3,            pullup: false}, 12:  {func: NC,               pullip: false},
    13:  {func: GND,              pullup: false}, 14:  {func: NC,               pullip: false},
    15:  {func: GPIO4,            pullup: false}, 16:  {func: NC,               pullip: false},
    17:  {func: GPIO5,            pullup: false}, 18:  {func: NC,               pullip: false},
    19:  {func: GND,              pullup: false}, 20:  {func: NC,               pullip: false},
    21:  {func: GPIO6,            pullup: false}, 22:  {func: NC,               pullip: false},
    23:  {func: GPIO7,            pullup: false}, 24:  {func: NC,               pullip: false},
    25:  {func: GND,              pullup: false}, 26:  {func: GND,              pullip: false},
    27:  {func: GPIO8,            pullup: false}, 28:  {func: GPIO28,           pullip: false},
    29:  {func: GPIO9,            pullup: false}, 30:  {func: GPIO29,           pullip: false},
    31:  {func: GND,              pullup: false}, 32:  {func: GND,              pullip: false},
    33:  {func: GPIO10,           pullup: false}, 34:  {func: GPIO30,           pullip: false},
    35:  {func: GPIO11,           pullup: false}, 36:  {func: GPIO31,           pullip: false},
    37:  {func: GND,              pullup: false}, 38:  {func: GND,              pullip: false},
    39:  {func: 'GPIO0-27 VREF',  pullup: false}, 40:  {func: 'GPIO0-27 VREF',  pullip: false},
// Gap in SODIMM pins
    41:  {func: 'GPIO28-45 VREF', pullup: false}, 42:  {func: 'GPIO28-45 VREF', pullip: false},
    43:  {func: GND,              pullup: false}, 44:  {func: GND,              pullip: false},
    45:  {func: GPIO12,           pullup: false}, 46:  {func: GPIO32,           pullip: false},
    47:  {func: GPIO13,           pullup: false}, 48:  {func: GPIO33,           pullip: false},
    49:  {func: GND,              pullup: false}, 50:  {func: GND,              pullip: false},
    51:  {func: GPIO14,           pullup: false}, 52:  {func: GPIO34,           pullip: false},
    53:  {func: GPIO15,           pullup: false}, 54:  {func: GPIO35,           pullip: false},
    55:  {func: GND,              pullup: false}, 56:  {func: GND,              pullip: false},
    57:  {func: GPIO16,           pullup: false}, 58:  {func: GPIO36,           pullip: false},
    59:  {func: GPIO17,           pullup: false}, 60:  {func: GPIO37,           pullip: false},
    61:  {func: GND,              pullup: false}, 62:  {func: GND,              pullip: false},
    63:  {func: GPIO18,           pullup: false}, 64:  {func: GPIO38,           pullip: false},
    65:  {func: GPIO19,           pullup: false}, 66:  {func: GPIO39,           pullip: false},
    67:  {func: GND,              pullup: false}, 68:  {func: GND,              pullip: false},
    69:  {func: GPIO20,           pullup: false}, 70:  {func: GPIO40,           pullip: false},
    71:  {func: GPIO21,           pullup: false}, 72:  {func: GPIO41,           pullip: false},
    73:  {func: GND,              pullup: false}, 74:  {func: GND,              pullip: false},
    75:  {func: GPIO22,           pullup: false}, 76:  {func: GPIO42,           pullip: false},
    77:  {func: GPIO23,           pullup: false}, 78:  {func: GPIO43,           pullip: false},
    79:  {func: GND,              pullup: false}, 80:  {func: GND,              pullip: false},
    81:  {func: GPIO24,           pullup: false}, 82:  {func: GPIO44,           pullip: false},
    83:  {func: GPIO25,           pullup: false}, 84:  {func: GPIO45,           pullip: false},
    85:  {func: GND,              pullup: false}, 86:  {func: GND,              pullip: false},
    87:  {func: GPIO26,           pullup: false}, 88:  {func: 'GPIO46 1V8',     pullip: false},
    89:  {func: GPIO27,           pullup: false}, 90:  {func: 'GPIO47 1V8',     pullip: false},
    91:  {func: GND,              pullup: false}, 92:  {func: GND,              pullip: false},
    93:  {func: 'DSI0 DN1',       pullup: false}, 94:  {func: 'DSI1 DP0',       pullip: false},
    95:  {func: 'DSI0 DP1',       pullup: false}, 96:  {func: 'DSI1 DN0',       pullip: false},
    97:  {func: GND,              pullup: false}, 98:  {func: GND,              pullip: false},
    99:  {func: 'DSI0 DN0',       pullup: false}, 100: {func: 'DSI1 CP',        pullip: false},
    101: {func: 'DSI0 DP0',       pullup: false}, 102: {func: 'DSI1 CN',        pullip: false},
    103: {func: GND,              pullup: false}, 104: {func: GND,              pullip: false},
    105: {func: 'DSI0 CN',        pullup: false}, 106: {func: 'DSI1 DP3',       pullip: false},
    107: {func: 'DSI0 CP',        pullup: false}, 108: {func: 'DSI1 DN3',       pullip: false},
    109: {func: GND,              pullup: false}, 110: {func: GND,              pullip: false},
    111: {func: 'HDMI CK N',      pullup: false}, 112: {func: 'DSI1 DP2',       pullip: false},
    113: {func: 'HDMI CK P',      pullup: false}, 114: {func: 'DSI1 DN2',       pullip: false},
    115: {func: GND,              pullup: false}, 116: {func: GND,              pullip: false},
    117: {func: 'HDMI D0 N',      pullup: false}, 118: {func: 'DSI1 DP1',       pullip: false},
    119: {func: 'HDMI D0 P',      pullup: false}, 120: {func: 'DSI1 DN1',       pullip: false},
    121: {func: GND,              pullup: false}, 122: {func: GND,              pullip: false},
    123: {func: 'HDMI D1 N',      pullup: false}, 124: {func: NC,               pullip: false},
    125: {func: 'HDMI D1 P',      pullup: false}, 126: {func: NC,               pullip: false},
    127: {func: GND,              pullup: false}, 128: {func: NC,               pullip: false},
    129: {func: 'HDMI D2 N',      pullup: false}, 130: {func: NC,               pullip: false},
    131: {func: 'HDMI D2 P',      pullup: false}, 132: {func: NC,               pullip: false},
    133: {func: GND,              pullup: false}, 134: {func: GND,              pullip: false},
    135: {func: 'CAM1 DP3',       pullup: false}, 136: {func: 'CAM0 DP0',       pullip: false},
    137: {func: 'CAM1 DN3',       pullup: false}, 138: {func: 'CAM0 DN0',       pullip: false},
    139: {func: GND,              pullup: false}, 140: {func: GND,              pullip: false},
    141: {func: 'CAM1 DP2',       pullup: false}, 142: {func: 'CAM0 CP',        pullip: false},
    143: {func: 'CAM1 DN2',       pullup: false}, 144: {func: 'CAM0 CN',        pullip: false},
    145: {func: GND,              pullup: false}, 146: {func: GND,              pullip: false},
    147: {func: 'CAM1 CP',        pullup: false}, 148: {func: 'CAM0 DP1',       pullip: false},
    149: {func: 'CAM1 CN',        pullup: false}, 150: {func: 'CAM0 DN1',       pullip: false},
    151: {func: GND,              pullup: false}, 152: {func: GND,              pullip: false},
    153: {func: 'CAM1 DP1',       pullup: false}, 154: {func: NC,               pullip: false},
    155: {func: 'CAM1 DN1',       pullup: false}, 156: {func: NC,               pullip: false},
    157: {func: GND,              pullup: false}, 158: {func: NC,               pullip: false},
    159: {func: 'CAM1 DP0',       pullup: false}, 160: {func: NC,               pullip: false},
    161: {func: 'CAM1 DN0',       pullup: false}, 162: {func: NC,               pullip: false},
    163: {func: GND,              pullup: false}, 164: {func: GND,              pullip: false},
    165: {func: 'USB DP',         pullup: false}, 166: {func: 'TVDAC',          pullip: false},
    167: {func: 'USB DM',         pullup: false}, 168: {func: 'USB OTGID',      pullip: false},
    169: {func: GND,              pullup: false}, 170: {func: GND,              pullip: false},
    171: {func: 'HDMI CEC',       pullup: false}, 172: {func: 'VC TRST N',      pullip: false},
    173: {func: 'HDMI SDA',       pullup: false}, 174: {func: 'VC TDI',         pullip: false},
    175: {func: 'HDMI SCL',       pullup: false}, 176: {func: 'VC TMS',         pullip: false},
    177: {func: 'RUN',            pullup: false}, 178: {func: 'VC TDO',         pullip: false},
    179: {func: 'VDD CORE',       pullup: false}, 180: {func: 'VC TCK',         pullip: false},
    181: {func: GND,              pullup: false}, 182: {func: GND,              pullip: false},
    183: {func: V1_8,             pullup: false}, 184: {func: V1_8,             pullip: false},
    185: {func: V1_8,             pullup: false}, 186: {func: V1_8,             pullip: false},
    187: {func: GND,              pullup: false}, 188: {func: GND,              pullip: false},
    189: {func: 'VDAC',           pullup: false}, 190: {func: 'VDAC',           pullip: false},
    191: {func: V3_3,             pullup: false}, 192: {func: V3_3,             pullip: false},
    193: {func: V3_3,             pullup: false}, 194: {func: V3_3,             pullip: false},
    195: {func: GND,              pullup: false}, 196: {func: GND,              pullip: false},
    197: {func: 'VBAT',           pullup: false}, 198: {func: 'VBAT',           pullip: false},
    199: {func: 'VBAT',           pullup: false}, 200: {func: 'VBAT',           pullip: false}
};

// The following data is sourced from a combination of the following locations:
//
// http://elinux.org/RPi_HardwareHistory
// http://elinux.org/RPi_Low-level_peripherals
// https://git.drogon.net/?p=wiringPi;a=blob;f=wiringPi/wiringPi.c#l807

const PI_REVISIONS = {
//  rev       model    pcb_rev released soc        manufacturer ram   storage    usb eth wifi   bt     csi dsi headers                         board
    0x2:      {model: 'B', pcb_revision:   '1.0',released: '2012Q1',soc: 'BCM2835',manufacturer: 'Egoman',ram:    256,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV1_P1},                board: REV1_BOARD  },
    0x3:      {model: 'B', pcb_revision:   '1.0',released: '2012Q3',soc: 'BCM2835',manufacturer: 'Egoman',ram:    256,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV1_P1},                board: REV1_BOARD   },
    0x4:      {model: 'B', pcb_revision:   '2.0',released: '2012Q3',soc: 'BCM2835',manufacturer: 'Sony',  ram:    256,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: REV2_BOARD   },
    0x5:      {model: 'B', pcb_revision:   '2.0',released: '2012Q4',soc: 'BCM2835',manufacturer: 'Qisda', ram:    256,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: REV2_BOARD   },
    0x6:      {model: 'B', pcb_revision:   '2.0',released: '2012Q4',soc: 'BCM2835',manufacturer: 'Egoman',ram:    256,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: REV2_BOARD   },
    0x7:      {model: 'A', pcb_revision:   '2.0',released: '2013Q1',soc: 'BCM2835',manufacturer: 'Egoman',ram:    256,storage:  'SD',    usb:  1, ethernet:  0, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: A_BOARD      },
    0x8:      {model: 'A', pcb_revision:   '2.0',released: '2013Q1',soc: 'BCM2835',manufacturer: 'Sony',  ram:    256,storage:  'SD',    usb:  1, ethernet:  0, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: A_BOARD      },
    0x9:      {model: 'A', pcb_revision:   '2.0',released: '2013Q1',soc: 'BCM2835',manufacturer: 'Qisda', ram:    256,storage:  'SD',    usb:  1, ethernet:  0, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: A_BOARD      },
    0xd:      {model: 'B', pcb_revision:   '2.0',released: '2012Q4',soc: 'BCM2835',manufacturer: 'Egoman',ram:    512,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: REV2_BOARD   },
    0xe:      {model: 'B', pcb_revision:   '2.0',released: '2012Q4',soc: 'BCM2835',manufacturer: 'Sony',  ram:    512,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: REV2_BOARD   },
    0xf:      {model: 'B', pcb_revision:   '2.0',released: '2012Q4',soc: 'BCM2835',manufacturer: 'Qisda', ram:    512,storage:  'SD',    usb:  2, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': REV2_P1, 'P5': REV2_P5}, board: REV2_BOARD   },
    0x10:     {model: 'B+',pcb_revision:   '1.2',released: '2014Q3',soc: 'BCM2835',manufacturer: 'Sony',  ram:    512,storage:  'MicroSD',usb: 4, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': PLUS_P1},                board: BPLUS_BOARD  },
    0x11:     {model: 'CM',pcb_revision:   '1.1',released: '2014Q2',soc: 'BCM2835',manufacturer: 'Sony',  ram:    512,storage:  'eMMC',   usb: 1, ethernet:  0, wifi:  false, bluetooth: false, csi: 2, dsi:  2, headers: {'SODIMM': CM_SODIMM},          board: CM_BOARD     },
    0x12:     {model: 'A+',pcb_revision:   '1.1',released: '2014Q4',soc: 'BCM2835',manufacturer: 'Sony',  ram:    256,storage:  'MicroSD',usb: 1, ethernet:  0, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': PLUS_P1},                board: APLUS_BOARD  },
    0x13:     {model: 'B+',pcb_revision:   '1.2',released: '2015Q1',soc: 'BCM2835',manufacturer: 'Egoman',ram:    512,storage:  'MicroSD',usb: 4, ethernet:  1, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': PLUS_P1},                board: BPLUS_BOARD  },
    0x14:     {model: 'CM',pcb_revision:   '1.1',released: '2014Q2',soc: 'BCM2835',manufacturer: 'Embest',ram:    512,storage:  'eMMC',   usb: 1, ethernet:  0, wifi:  false, bluetooth: false, csi: 2, dsi:  2, headers: {'SODIMM': CM_SODIMM},          board: CM_BOARD     },
    0x15:     {model: 'A+',pcb_revision:   '1.1',released: '2014Q4',soc: 'BCM2835',manufacturer: 'Embest',ram:    256,storage:  'MicroSD',usb: 1, ethernet:  0, wifi:  false, bluetooth: false, csi: 1, dsi:  1, headers: {'P1': PLUS_P1},                board: APLUS_BOARD  }
};


PiBoardInfo.prototype.from_revision = function (_revision) {
    this.revision = _revision;
    if (_revision  & 0x800000) {
    // New-style revision, parse information from bit-pattern:
    //
    // MSB -----------------------> LSB
    // uuuuuuuuFMMMCCCCPPPPTTTTTTTTRRRR
    //
    // uuuuuuuu - Unused
    // F        - New flag (1=valid new-style revision, 0=old-style)
    // MMM      - Memory size (0=256, 1=512, 2=1024)
    // CCCC     - Manufacturer (0=Sony, 1=Egoman, 2=Embest)
    // PPPP     - Processor (0=2835, 1=2836, 2=2837)
    // TTTTTTTT - Type (0=A, 1=B, 2=A+, 3=B+, 4=2B, 5=Alpha (??), 6=CM, 8=3B, 9=Zero)
    // RRRR     - Revision (0, 1, 2, etc.)
        this.model = {
            0: 'A',
            1: 'B',
            2: 'A+',
            3: 'B+',
            4: '2B',
            6: 'CM',
            8: '3B',
            9: 'Zero'
        }[(_revision & 0xff0) >> 4];

        if (['A', 'B'].includes(this.model)) {
            this.pcb_revision = {
                0 : '1.0', // is this right ?
                1 : '1.0',
                2 : '2.0',
            }[_revision & 0x0f];
        } else {
            this.pcb_revision = '1.' + (_revision & 0x0f);
        }

        this.released = {
            'A':    '2013Q1',
            'B':    '2012Q1', //if pcb_revision == '1.0' else '2012Q4',
            'A+':   '2014Q4',
            'B+':   '2014Q3',
            '2B':   '2015Q1', //if pcb_revision == '1.0' or pcb_revision == '1.1' else '2016Q3',
            'CM':   '2014Q2',
            '3B':   '2016Q1',
            'Zero': '2015Q4'// if pcb_revision == '1.2' else '2016Q2',
        }[this.model];
        this.soc = {
            0: 'BCM2835',
            1: 'BCM2836',
            2: 'BCM2837',
        }[(_revision & 0xf000) >> 12];
        this.manufacturer = {
            0: 'Sony',
            1: 'Egoman',
            2: 'Embest',
        }[(_revision & 0xf0000) >> 16];
        this.memory = {
            0: 256,
            1: 512,
            2: 1024,
        }[(_revision & 0x700000) >> 20];
        this.storage = ['A','B','CM'].includes(this.model) ? {
                'A': 'SD',
                'B': 'SD',
                'CM': 'eMMC',
            }[this.model]: 'MicroSD';
        this.usb = ['A','A+','Zero','B','CM'].includes(this.model) ? {
            'A':    1,
            'A+':   1,
            'Zero': 1,
            'B':    2,
            'CM':   1,
        }[this.model] : 4;
        this.ethernet = ['A','A+','ZERO','CM'].includes(this.model) ? {
            'A':    0,
            'A+':   0,
            'Zero': 0,
            'CM':   0,
        }[this.model]: 1;
        this.wifi = (this.model ==='3B');
        this.bluetooth = (this.model ==='3B');
        this.csi = this.model==='Zero'? ( this.pcb_revision === '1.2' ? 0 : 1)
            : this.model==='CM' ? 2 : 1;
        this.dsi = this.model==='Zero'? 0 : this.csi;
        this.headers = ['A','B','CM'].includes(this.model) ? {
            'A':  {'P1': REV2_P1, 'P5': REV2_P5},
            'B':  this.pcb_revision === '1.0' ? {'P1': REV1_P1 }: {'P1': REV2_P1, 'P5': REV2_P5},
            'CM': {'SODIMM': CM_SODIMM},
        }[this.model]: {'P1': PLUS_P1};
        this.board = ['A','B','A+','CM','Zero'].includes(this.model) ?  {
            'A':    A_BOARD,
            'B':    this.pcb_revision==='1.0'? REV1_BOARD : REV2_BOARD,
            'A+':   APLUS_BOARD,
            'CM':   CM_BOARD,
            'Zero': this.pcb_revision === '1.2' ? ZERO12_BOARD : ZERO13_BOARD
        }[this.model]: BPLUS_BOARD;
    } else {
        const info = PI_REVISIONS[_revision];
        if(info!==undefined) {
            this.model = info.model;
            this.pcb_revision = info.pcb_revision;
            this.released = info.released;
            this.soc = info.soc;
            this.memory = info.memory;
            this.manufacturer = info.manufacturer;
            this.storage = info.storage;
            this.usb = info.usb;
            this.ethernet = info.ethernet;
            this.wifi = info.wifi;
            this.bluetooth = info.bluetooth;
            this.csi = info.csi;
            this.dsi = info.dsi;
            this.headers = info.headers;
            this.board = info.board;
        }
    }
    if (this.model === undefined) {
        throw new PinUnknownPi("Revision :" + _revision + " did not map to a known Pi.");
    }
    return this;
};

/**
 * Return the physical pins supporting the specified *function* as objects
 * of `{header, pin_number}` where *header* is a string specifying the
 * header containing the *pin_number*. Note that the return value is a
 * array. Use {@link PiBoardInfo#physical_pin|physical_pin} if you
 * are expecting a single return value.
 *
 * @param {string} pin_function - The pin function you wish to search for. Usually this is something
 * like "GPIO9" for Broadcom GPIO pin 9, or "GND" for all the pins connecting to electrical ground.
 * @returns {Object} - An array of objects containing {header, pin}.
 */
PiBoardInfo.prototype.physical_pins = function(pin_function) {
    const result = [];
    for (const prop in this.headers) {
        const header = prop;
        for (const pin in this.headers[prop])
        {
            if (this.headers[prop][pin].func === pin_function) {
                result.push({header, pin});
            }
        }
    }
    return result;
};

/**
 * Return the physical pin supporting the specified *function*. If no pins
 * support the desired *function*, this function raises {@link PinNoPins}.
 * If multiple pins support the desired *function*, {@link PinMultiplePins}
 * will be raised (use {@link PiBoardInfo#physical_pins|physical_pins} if you expect multiple pins
 * in the result, such as for electrical ground).
 *
 * @param {string} pin_function - The pin function you wish to search for. Usually this is something
 * like "GPIO9" for Broadcom GPIO pin 9.
 * @returns {Object} - An array of objects containing {header, pin}.
 */
PiBoardInfo.prototype.physical_pin = function(pin_function) {
    const result = this.physical_pins(pin_function);
    if (result.length > 1) {
        throw new PinMultiplePins();
    } else if (result.length === 0) {
        throw new PinNoPins();
    }
    return result.pop();
};

/**
 * Returns a bool indicating whether a physical pull-up is attached to
 * the pin supporting the specified *function*. Either {@link PinNoPins}
 * or {@link PinMultiplePins} may be raised if the function is not
 * associated with a single pin.
 *
 * @param {string} pin_function - The pin function you wish to search for. Usually this is something
 * like "GPIO9" for Broadcom GPIO pin 9.
 * @returns {boolean} - Indicating if the pin is pulled up.
 */
PiBoardInfo.prototype.pulled_up = function (pin_function) {
    const pin =  this.physical_pin(pin_function);
    return this.headers[pin.header][pin.pin].pullup;
};