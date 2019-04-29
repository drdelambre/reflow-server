const bonjour = require('bonjour')(),
    mqtt = require('mqtt'),
    WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const waitForIP = (() => {
    let active = false,
        ip, port;
    const cbs = [],
        ret = () => {
            if (ip) {
                return new Promise((resolve) => {
                    resolve({
                        ip: ip,
                        port: port
                    });
                });
            }

            if (active) {
                return new Promise((resolve) => {
                    cbs.push(resolve);
                });
            }

            return new Promise((resolve) => {
                cbs.push(resolve);
                active = true;

                bonjour.find({ type: 'mqtt' }, (service) => {
                    ip = service.referer.address;
                    port = service.referer.port;

                    active = false;

                    let cb;

                    while (cbs.length) {
                        cb = cbs.pop();
                        cb({
                            ip: ip,
                            port: port
                        });
                    }
                });
            });
        };

    return ret;
})();

let client;

function switch_prefix(client, prefix) {
    if (client.prefix) {
        client.unsubscribe(`${client.prefix}/read/result`);
        client.unsubscribe(`${client.prefix}/pid/off`);
        client.unsubscribe(`${client.prefix}/pid/on`);
        client.unsubscribe(`${client.prefix}/tune`);
        client.unsubscribe(`${client.prefix}/temp/reached`);
        client.unsubscribe(`${client.prefix}/temp`);
    }

    client.prefix = prefix;

    client.subscribe(`${client.prefix}/read/result`);
    client.subscribe(`${client.prefix}/pid/off`);
    client.subscribe(`${client.prefix}/pid/on`);
    client.subscribe(`${client.prefix}/tune`);
    client.subscribe(`${client.prefix}/temp/reached`);
    client.subscribe(`${client.prefix}/temp`);
}

wss.on('connection', (ws) => {
    waitForIP()
        .then((conn) => {
            ws.client = mqtt.connect(`mqtt://${conn.ip}`);

            ws.client.on('message', (topic, msg) => {
                let _msg;

                if (ws.readyState !== WebSocket.OPEN) {
                    ws.client.end();
                    delete ws.client;
                    return;
                }

                switch (topic) {
                    case `${ws.client.prefix}/read/result`:
                        _msg = JSON.stringify({
                            evt: 'temp_read',
                            prefix: ws.client.prefix,
                            data: parseFloat(msg)
                        });

                        ws.send(_msg);

                        break;
                    case `${ws.client.prefix}/temp`:
                        _msg = JSON.stringify({
                            evt: 'temp_set',
                            prefix: ws.client.prefix,
                            data: parseFloat(msg)
                        });

                        ws.send(_msg);

                        break;
                    case `${ws.client.prefix}/temp/reached`:
                        _msg = JSON.stringify({
                            evt: 'temp_done',
                            prefix: ws.client.prefix
                        });

                        ws.send(_msg);

                        break;
                    case `${ws.client.prefix}/tune`:
                        _msg = JSON.stringify({
                            evt: 'temp_tune',
                            prefix: ws.client.prefix,
                            data: '' + msg
                        });

                        ws.send(_msg);

                        break;
                    case `${ws.client.prefix}/pid/on`:
                        _msg = JSON.stringify({
                            evt: 'temp_pid',
                            prefix: ws.client.prefix,
                            data: true
                        });

                        ws.send(_msg);

                        break;
                    case `${ws.client.prefix}/pid/off`:
                        _msg = JSON.stringify({
                            evt: 'temp_pid',
                            prefix: ws.client.prefix,
                            data: false
                        });

                        ws.send(_msg);

                        break;
                    default:
                        break;
                }
            });
        });

    ws.on('message', (msg) => {
        if (!ws.client || !ws.client.connected) {
            ws.send(JSON.stringify({
                evt: 'error',
                msg: 'Client Disconnected'
            }));

            return;
        }

        const _msg = JSON.parse(msg);

        if (_msg.evt !== 'switch_prefix' && _msg.prefix !== ws.client.prefix) {
            switch_prefix(ws.client, _msg.prefix);
        }

        switch (_msg.evt) {
            case 'switch_prefix':
                switch_prefix(ws.client, _msg.data);

                break;
            case 'read_temp':
                ws.client.publish(`${_msg.prefix}/read`, 'value');

                break;
            case 'set_temp':
                ws.client.publish(`${_msg.prefix}/temp`, '' + parseFloat(_msg.data));

                if (parseFloat(_msg.data) === 0) {
                    ws.client.publish(`${_msg.prefix}/off`, 'off');

                    let ret_msg = JSON.stringify({
                        evt: 'temp_done',
                        prefix: _msg.prefix
                    });

                    ws.send(ret_msg);
                }

                break;
            case 'tune_temp':
                ws.client.publish(`${_msg.prefix}/tune`, '' + _msg.data);

                break;
            default:
                break;
        }
    });
});

