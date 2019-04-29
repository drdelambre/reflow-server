import React from 'react';
import {
    grab,
    push,
    watch
} from 'stores/workflow';
import StopEntry from 'views/Home/Workflow/StopEntry';
import DwellEntry from 'views/Home/Workflow/DwellEntry';

import style from './styles';

class Workflow extends React.Component {
    state = {
        entries: []
    };

    componentDidMount() {
        grab()
            .then((entries) => {
                this.setState({
                    entries: entries
                });
            });

        watch((data) => {
            this.setState({
                entries: data
            });
        })
            .then((handle) => {
                this._watch = handle;
            });
    }

    componentWillUnmount() {
        if (this._watch) {
            this._watch.remove();
            delete this._watch;
        }
    }

    add(type) {
        switch (type) {
        case 'stop':
            push({
                type: 'stop',
                edit: true
            });

            break;
        case 'dwell':
            push({
                type: 'dwell',
                edit: true
            });

            break;
        default:
            break;
        }
    }

    render() {
        const steps = this.state.entries.map((e, idx) => {
            switch (e.type) {
            case 'stop':
                return (
                    <StopEntry key={ `step-${idx}` }
                        index={ idx }
                        data={ e } />
                );
            case 'dwell':
                return (
                    <DwellEntry key={ `step-${idx}` }
                        index={ idx }
                        data={ e } />
                );
            default:
                return false;
            }
        });

        return (
            <div>
                <div className={ style.stops }>
                    { steps }
                </div>
                <div className={ style.footer }>
                    <div className={ style.button }
                        onClick={ () => { this.add('stop') } }>
                        <span>Add Stop</span>
                    </div>
                    <div className={ style.button }
                        onClick={ () => { this.add('dwell') } }>
                        <span>Add Dwell</span>
                    </div>
                </div>
            </div>
        );
    }
}

export default Workflow;
