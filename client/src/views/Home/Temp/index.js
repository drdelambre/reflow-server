import React from 'react';
import Input from 'views/Input';

import { connect } from 'stores/socket';
import { grab } from 'stores/prefix';

import style from './styles';

class Temp extends React.Component {
    state = {
        temp: '0.0'
    };

    componentDidMount() {
        if (!this.boundListener) {
            this.boundListener = this.message.bind(this);
        }

        connect()
            .then((ws) => {
                ws.addEventListener('message', this.boundListener);
            });
    }

    componentWillUnmount() {
        connect()
            .then((ws) => {
                ws.removeEventListener('message', this.boundListener);
            });
    }

    message(evt) {
        grab()
            .then((prefix) => {
                const _evt = JSON.parse(evt.data);

                if (_evt.prefix !== prefix) {
                    return;
                }

                if (_evt.evt !== 'temp_set') {
                    return;
                }

                this.setState({
                    temp: '' + _evt.data
                });
            })
            .catch((e) => {});
    }

    change(evt) {
        this.setState({
            temp: evt.target.value
        });
    }

    click(evt) {
        connect()
            .then((ws) => {
                grab()
                    .then((prefix) => {
                        ws.send(JSON.stringify({
                            evt: 'set_temp',
                            prefix: prefix,
                            data: parseFloat(this.state.temp)
                        }));
                    })
                    .catch(() => {
                        console.error('set the prefix before setting the temperature');
                    });
            });
    }

    render() {
        return (
            <div className={ style.main }>
                <div className={ style.button }
                    onClick={ (evt) => this.click(evt) }>Set</div>
                <Input label='temperature'
                    value={ this.state.temp }
                    onChange={ (evt) => this.change(evt) } />
            </div>
        );
    }
}

export default Temp;
