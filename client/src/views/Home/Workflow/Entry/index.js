import React from 'react';
import PropTypes from 'prop-types';

import {
    update,
    remove
} from 'stores/workflow';

class Entry extends React.Component {
    static propTypes = {
        data: PropTypes.object,
        index: PropTypes.number
    };

    edit() {
        update(this.props.index, Object.assign(this.props.data, {
            edit: true
        }));
    }

    update() {
        update(this.props.index, Object.assign(this.props.data, {
            edit: false
        }));
    }

    change(evt) {
        update(this.props.index, Object.assign(this.props.data, {
            value: evt.target.value
        }));
    }

    remove() {
        remove(this.props.index);
    }

    render() {
        return false;
    }
}

export default Entry;
