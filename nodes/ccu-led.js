const fs = require('fs');
const {spawn, exec} = require('child_process');

module.exports = function (RED) {
    class CcuLedNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.monit = fs.existsSync('/usr/bin/monit');

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
                        this.startHssLed();
                        break;
                    default:
                }
            });
        }

        manual(r, g, b) {
            this.stopHssLed().then(() => {
                fs.writeFile('/sys/class/leds/rpi_rf_mod:red/brightness', String(r), () => {});
                fs.writeFile('/sys/class/leds/rpi_rf_mod:green/brightness', String(g), () => {});
                fs.writeFile('/sys/class/leds/rpi_rf_mod:blue/brightness', String(b), () => {});
            });
        }

        stopHssLed() {
            return new Promise(resolve => {
                if (this.hssLedStopped) {
                    resolve();
                } else {
                    this.unmonitor().then(() => {
                        exec('/sbin/start-stop-daemon -K -q -p /var/run/hss_led.pid', () => {
                            this.hssLedStopped = true;
                            resolve();
                        });
                    });
                }
            });
        }

        startHssLed() {
            return new Promise(resolve => {
                if (this.hssLedStopped) {
                    exec('/sbin/start-stop-daemon -S -q -b -m -p /var/run/hss_led.pid --exec /bin/hss_led -- -l 6', () => {
                        this.hssLedStopped = false;
                        this.monitor().then(resolve);
                    });
                } else {
                    resolve();
                }
            });
        }

        unmonitor() {
            return new Promise(resolve => {
                if (this.monit) {
                    exec('monit unmonitor hss_led', () => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        }

        monitor() {
            return new Promise(resolve => {
                if (this.monit) {
                    exec('monit monitor hss_led', () => {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        }


    }

    RED.nodes.registerType('ccu-led', CcuLedNode);
};
