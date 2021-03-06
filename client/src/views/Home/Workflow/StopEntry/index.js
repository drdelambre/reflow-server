import React from 'react';
import Input from 'views/Input';
import Entry from 'views/Home/Workflow/Entry';

import style from 'views/Home/Workflow/Entry/styles';

class StopEntry extends Entry {
    render() {
        const { data } = this.props;
        let klass = style.main;

        if (data.edit) {
            klass = style.edit;

            return (
                <div className={ klass }>
                    <div className={ style.button }
                        onClick={ () => { this.update() } }>
                        Save
                    </div>
                    <Input label='temperature'
                        value={ data.value }
                        onChange={ (evt) => { this.change(evt) } } />
                </div>
            );
        }

        return (
            <div className={ klass }>
                <div className={ style.buttonGroup }>
                    <div className={ style.groupDanger }
                        onClick={ () => { this.remove() } }>
                        <span>X</span>
                    </div>
                    <div className={ style.groupButton }
                        onClick={ () => { this.edit() } }>
                        <span>Edit</span>
                    </div>
                </div>
                <div className={ style.stopValue }>
                    { data.value || 0.0 }
                    <label>temperature</label>
                </div>
            </div>
        );
    }
}

export default StopEntry;
