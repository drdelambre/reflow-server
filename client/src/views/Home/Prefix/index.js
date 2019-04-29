import React from 'react';
import Input from 'views/Input';
import { connect } from 'stores/socket';
import {
    grab,
    populate,
    watch
} from 'stores/prefix';

import style from './styles';

class Prefix extends React.Component {
    state = {
        prefix: ''
    };

    componentDidMount() {
        grab()
            .then((prefix) => {
                connect()
                    .then((ws) => {
                        ws.send(JSON.stringify({
                            evt: 'switch_prefix',
                            data: prefix
                        }));
                    });

                this.setState({
                    prefix: prefix
                });
            })
            .catch(() => {});

        watch((data) => {
            connect()
                .then((ws) => {
                    ws.send(JSON.stringify({
                        evt: 'switch_prefix',
                        data: data
                    }));
                });

            this.setState({
                prefix: data
            });
        });
    }

    onchange(evt) {
        populate(evt.target.value);
    }

    render() {
        return (
            <div className={ style.wrap }>
                <Input label='prefix'
                    value={ this.state.prefix }
                    onChange={ (evt) => this.onchange(evt) } />
            </div>
        );
    }
}

export default Prefix;
