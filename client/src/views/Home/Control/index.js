import React from 'react';
import style from './styles';

import {
    grab,
    start,
    stop,
    watch
} from 'stores/control';

// TODO: this is a long process, so move state control to
// the server in case of a browser closing (dd)
class Control extends React.Component {
    state = {
        playing: false
    };

    componentDidMount() {
        grab()
            .then((data) => {
                this.setState({
                    playing: data.playing
                });
            });

        watch((data) => {
            this.setState({
                playing: data.playing
            });
        }).then((handle) => { this._watch = handle });
    }

    componentWillUnmount() {
        if (this._watch) {
            this._watch.remove();
            delete this._watch;
        }
    }

    play() {
        if (this.state.playing) {
            return;
        }

        start();
    }

    stop() {
        if (!this.state.playing) {
            return;
        }

        stop();
    }

    render() {
        if (!this.state.playing) {
            return (
                <div className={ style.play }
                    onClick={ () => { this.play() } } />
            );
        }

        return (
            <div className={ style.stop }
                onClick={ () => { this.stop() } } />
        );
    }
}

export default Control;
