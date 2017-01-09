/*global it describe context */

const PiBoardInfo = require('../gpiozero/pins/data.js').PiBoardInfo;
const assert = require('chai').assert;

describe('data', () => {

    context('PiBoardInfo', () => {
        it('Works with Pi 3', () => {
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
    });
});
