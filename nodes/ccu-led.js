const fs = require('fs');
const {spawn, exec} = require('child_process');

module.exports = function (RED) {
    class CcuLedNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.on('input', msg => {
                switch (String(msg.payload).toLowerCase()) {
                    case 'red':
                        this.manual(255, 0, 0);
                        break;
                    case 'green':
                        this.manual(0, 255, 0);
                        break;
                    case 'blue':
                        this.manual(0, 0, 255);
                        break;
                    case 'yellow':
                        this.manual(255, 255, 0);
                        break;
                    case 'magenta':
                        this.manual(255, 0, 255);
                        break;
                    case 'cyan':
                        this.manual(0, 255, 255);
                        break;
                    case 'white':
                        this.manual(255, 255, 255);
                        break;
                    case 'off':
                        this.manual(0, 0, 0);
                        break;
                    case 'auto':
                        this.auto();
                        break;
                    default:
                }
            });
        }

        manual(r, g, b) {
            exec('killall hss_led', () => {
                fs.writeFile('/sys/devices/platform/leds/leds/rpi_rf_mod:red/brightness', String(r), () => {});
                fs.writeFile('/sys/devices/platform/leds/leds/rpi_rf_mod:green/brightness', String(g), () => {});
                fs.writeFile('/sys/devices/platform/leds/leds/rpi_rf_mod:blue/brightness', String(b), () => {});
            });
        }

        auto() {
            exec('killall hss_led', () => {
                spawn('/bin/hss_led', {
                    stdio: 'ignore',
                    detached: true
                });
            });
        }
    }

    RED.nodes.registerType('ccu-led', CcuLedNode);
};
