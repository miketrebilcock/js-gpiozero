/*global it describe context */

const PiBoardInfo = require('../gpiozero/pins/data.js').PiBoardInfo;

const assert = require('chai').assert;
const expect = require('chai').expect;
const chai = require('chai');
chai.use(require('chai-shallow-deep-equal'));

const PinUnknownPi = require('../gpiozero/exc.js').PinUnknownPi;
const PinMultiplePins = require('../gpiozero/exc.js').PinMultiplePins;
const PinNoPins = require('../gpiozero/exc.js').PinNoPins;

describe('data', () => {

    context('PiBoardInfo', () => {
        it('Works with Pi 3 from revision', () => {
            const info = (new PiBoardInfo()).from_revision('0xa02082');
            assert('3B'=== info.model,'Model was not correct ' + info.model);
            assert('1.2'=== info.pcb_revision,'PCB Revision was not correct ' + info.pcb_revision);
            assert('2016Q1'=== info.released,'Released was not correct ' + info.released);
            assert('BCM2837'=== info.soc,'Soc was not correct ' + info.soc);
            assert('Sony'=== info.manufacturer,'Manufacturer was not correct ' + info.manufacturer);
            assert(1024 === info.memory,'Memory was not correct ' + info.memory);
            assert('MicroSD'=== info.storage,'Storage was not correct ' + info.storage);
            assert(4 === info.usb,'USB count was not correct ' + info.usb);
            assert(1 === info.ethernet,'Ethernet count was not correct ' + info.ethernet);
            assert(true === info.wifi,'Wifi was not correct ' + info.wifi);
            assert(true === info.bluetooth,'Bluetooth was not correct ' + info.bluetooth);
            assert(1 === info.csi,'CSI was not correct ' + info.csi);
            assert(1 === info.dsi,'DSI was not correct ' + info.dsi);
        });
        it('Works with Pi B', ()=> {
            const r = (new PiBoardInfo()).from_revision('900011');
            assert (r.model === 'B', 'Model was not correct ' + r.model);
            assert (r.pcb_revision === '1.0', 'PCB Revision was not correct ' + r.pcb_revision);
            assert (r.memory === 512, 'Memory was not correct ' + r.memory);
            assert (r.manufacturer === 'Sony', "Manufacturer was not correct " + r.manufacturer);
            assert (r.storage === 'SD', "Storage was not correct " + r.storage);
            assert (r.usb === 2, "USB was not correct  " + r.usb);
            assert (r.wifi === false, "WIFI was not false");
            assert (r.bluetooth === false, "Bluetooth was not false");
            assert (r.csi === 1, "CSI was not correct " + r.csi);
            assert (r.dsi === 1, "DSI was not correct " + r.dsi);
        });
        it('Raises PinUnknownPi', () => {
            expect(() => {
                /*eslint no-new: off*/
                (new PiBoardInfo()).from_revision('9000f1')
            }).to.throw(PinUnknownPi);

        });
        it('Has physical pins data', () => {
            //Assert physical pins for some well-known Pi's; a21041 is a Pi2B
            assert.shallowDeepEqual ((new PiBoardInfo()).from_revision('a21041').physical_pins('3V3') , [{header: 'P1', pin: 1}, {header: 'P1', pin: 17}]);
            assert.shallowDeepEqual ((new PiBoardInfo()).from_revision('a21041').physical_pins('GPIO2') , [{header: 'P1', pin: 3}]);
            assert.shallowDeepEqual ((new PiBoardInfo()).from_revision('a21041').physical_pins('GPIO47') , []);
        });

        it('Has physical pin data', () => {
            //Assert physical pins for some well-known Pi's; a21041 is a Pi2B
            expect(() => {
                (new PiBoardInfo()).from_revision('a21041').physical_pin('GND');
            }).to.throw(PinMultiplePins);

            assert.shallowDeepEqual ((new PiBoardInfo()).from_revision('a21041').physical_pin('GPIO3') , {header: 'P1', pin: 5});

            expect(() => {
               (new PiBoardInfo()).from_revision('a21041').physical_pin('GPIO47');
            }).to.throw(PinNoPins);
        });

        it('Indicates if a pin is pulled up', () =>{
            assert((new PiBoardInfo()).from_revision('a21041').pulled_up('GPIO2') === true , "GPIO2 should be pulled up");

            assert((new PiBoardInfo()).from_revision('a21041').pulled_up('GPIO4') === false , "GPIO4 should not be pulled up");

            expect(() => {
                (new PiBoardInfo()).from_revision('a21041').pulled_up('GPIO47');
            }).to.throw(PinNoPins);
        });

    });

});