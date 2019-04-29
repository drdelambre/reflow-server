import React from 'react';
import PropTypes from 'prop-types';

import style from './styles';

class Input extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.string,
        onChange: PropTypes.func
    };

    render() {
        let klass = style.inpWrap;

        if (this.props.className) {
            klass += ' ' + this.props.className;
        }

        return (
            <div className={ klass }>
                <input value={ this.props.value }
                    onChange={ this.props.onChange } />
                <label className={ style.label }>{ this.props.label }</label>
            </div>
        );
    }
}

export default Input;
