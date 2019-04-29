import { connect } from 'stores/socket';
import { grab } from 'stores/prefix';
import { push as pushRead } from 'stores/temp';
import { push as pushSet } from 'stores/set';

const REFRESH_RATE = 5000;

let timer;

export function start() {
    if (timer) {
        return;
    }

    function onmsg(evt) {
        const _evt = JSON.parse(evt.data);

        switch (_evt.evt) {
        case 'temp_read':
            pushRead({
                t: new Date(),
                y: _evt.data
            });

            break;

        case 'temp_set':
            pushSet({
                t: new Date(),
                y: _evt.data
            });

            break;

        default:
            break;
        }
    }

    connect()
        .then((ws) => {
            function onclose() {
                ws.removeEventListener('message', onmsg);
                ws.removeEventListener('close', onclose);
                clearInterval(timer);
                timer = null;
            }

            timer = setInterval(() => {
                grab()
                    .then((prefix) => {
                        ws.send(JSON.stringify({
                            evt: 'read_temp',
                            prefix: prefix
                        }));
                    })
                    .catch(() => {});
            }, REFRESH_RATE);

            ws.addEventListener('message', onmsg);
            ws.addEventListener('close', onclose);
        });
}

export function stop() {
    clearInterval(timer);
    timer = null;
}
