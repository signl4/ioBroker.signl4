'use strict';

/*
 * Created with @iobroker/create-adapter v1.17.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

class Signl4 extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'signl4',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.info('config option1: ' + this.config.option1);
        this.log.info('config team_secret: ' + this.config.team_secret);

        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "statusLastAlert"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        await this.setObjectAsync('statusLastAlert', {
            type: 'state',
            common: {
                name: 'statusLastAlert',
                type: 'json',
                role: 'indicator',
                read: true,
                write: true,
            },
            native: {},
        });

        // in this template all states changes inside the adapters namespace are subscribed
        this.subscribeStates('*');

        /*
        setState examples
        you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable statusLastAlert is set to true as command (ack=false)
        await this.setStateAsync('statusLastAlert', '');

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        // await this.setStateAsync('testVariable', { val: true, ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        // await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync('admin', 'iobroker');
        this.log.info('check user admin pw ioboker: ' + result);

        result = await this.checkGroupAsync('admin', 'admin');
        this.log.info('check group user admin group admin: ' + result);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.message" property to be set to true in io-package.json
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
		
    	if (typeof obj === 'object' && obj.message) {
    		if (obj.command === 'send') {
    			
				this.log.info('send command');

				// Send SIGNL4 alert
				const strJSON = JSON.stringify(obj.message);
				this.sendSIGNL4Alert(strJSON);

    			// Send response in callback if required
    			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    		}
    	}
    }
	
	// Send SIGNL4 alert
	sendSIGNL4Alert(data) {

		const https = require('https')

		const options = {
		  hostname: 'connect.signl4.com',
		  port: 443,
		  path: '/webhook/' + this.config.team_secret,
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  }
		}

		const req = https.request(options, (res) => {
		  this.log.info('statusCode: ' + res.statusCode)

		  res.on('data', (d) => {
			this.setStateAsync('statusLastAlert', d.toString());
			
			this.log.info('Response: ' + d)
		  })
		})

		req.on('error', (error) => {
		  this.log.info(error)
		})

		req.write(data)
		req.end()

	}

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Signl4(options);
} else {
    // otherwise start the instance directly
    new Signl4();
}

