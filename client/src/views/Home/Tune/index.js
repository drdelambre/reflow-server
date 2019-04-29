import React from 'react';
import Input from 'views/Input';

import { connect } from 'stores/socket';
import { grab } from 'stores/prefix';

import style from './styles';

class Tune extends React.Component {
    state = {
        kp: '300.0',
        ki: '50.0',
        kd: '600.0'
    };

    componentDidMount() {
        if (!this.boundMsg) {
            this.boundMsg = this.message.bind(this);
        }

        connect()
            .then((ws) => {
                ws.addEventListener('message', this.boundMsg);
            });
    }

    componentWillUnmount() {
        connect()
            .then((ws) => {
                ws.removeEventListener('message', this.boundMsg);
            });
    }

    message(evt) {
        grab()
            .then((prefix) => {
                const _evt = JSON.parse(evt.data);

                if (_evt.prefix !== prefix) {
                    return;
                }

                if (_evt.evt !== 'temp_tune') {
                    return;
                }

                const split = _evt.data.split(':').map((e) => '' + parseFloat(e));

                this.setState({
                    kp: split[0],
                    ki: split[1],
                    kd: split[2]
                });
            })
            .catch((e) => {});
    }

    change(key, evt) {
        const msg = {};

        msg[key] = evt.target.value;
        this.setState(msg);
    }

    click(evt) {
        connect()
            .then((ws) => {
                grab()
                    .then((prefix) => {
                        const str = `${this.state.kp}:${this.state.ki}:${this.state.kd}`,
                            msg = JSON.stringify({
                                evt: 'tune_temp',
                                prefix: prefix,
                                data: str
                            });

                        ws.send(msg);
                    })
                    .catch((e) => {});
            });
    }

    render() {
        return (
            <div className={ style.main }>
                <div className={ style.button }
                    onClick={ (evt) => { this.click(evt) } }>
                    Tune
                </div>
                <div className={ style.inpWrap }>
                    <Input label='kp'
                        className={ style.inp }
                        value={ this.state.kp }
                        onChange={ (evt) => { this.change('kp', evt) } } />
                    <Input label='ki'
                        className={ style.inp }
                        value={ this.state.ki }
                        onChange={ (evt) => { this.change('ki', evt) } } />
                    <Input label='kd'
                        className={ style.inp }
                        value={ this.state.kd }
                        onChange={ (evt) => { this.change('kd', evt) } } />
                </div>
            </div>
        );
    }
}

export default Tune;
