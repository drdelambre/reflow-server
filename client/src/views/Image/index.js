import React from 'react';

class Image extends React.Component {
	state = {
		loading: true
	};

	connect(elem) {
		if (!elem) {
			this.elem = null;
			return;
		}

		if (elem === this.elem) {
			return;
		}

		this.elem = elem;

        if (!this.props.src) {
            return;
        }

		const img = document.createElement('img');

        if (this.props.alt) {
            img.alt = this.props.alt;
        }

		img.onload = () => {
			elem.innerHTML = '';
			elem.appendChild(img);
		};

		img.src = this.props.src;
	}

	render() {
		return (
			<div className={ this.props.className || 'image'}
				ref={ this.connect.bind(this) }/>
		);
	}
}

export default Image;
