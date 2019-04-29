import React from 'react';
import QR from './qrcode';

function getBackingStorePixelRatio(ctx) {
    return (
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1
    );
}

class QRCode extends React.Component {
    static defaultProps = {
        level: 'L',
        bgColor: '#FFFFFF',
        fgColor: '#000000',
    };

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        if (this._canvas === null) {
            return;
        }

        const {
                value,
                level,
                bgColor,
                fgColor
            } = this.props,
            qrcode = QR(-1, level),
            canvas = this._canvas,
            ctx = canvas.getContext('2d');

        qrcode.addData(value);
        qrcode.make();

        const dim = qrcode.getModuleCount(),
            nodeDim = canvas.offsetWidth < canvas.offsetHeight ? canvas.offsetWidth : canvas.offsetHeight,
            tileW = nodeDim / dim,
            tileH = nodeDim / dim;
        let ni, no;

        canvas.height = canvas.width = nodeDim;

        for (ni = 0; ni < dim; ni++) {
            for (no = 0; no < dim; no++) {
                ctx.fillStyle = qrcode.isDark(ni, no) ? fgColor : bgColor;
                ctx.fillRect(
                    Math.round(ni * tileW),
                    Math.round(no * tileH),
                    Math.ceil((ni + 1) * tileW) - Math.floor(ni * tileW),
                    Math.ceil((no + 1) * tileH) - Math.floor(no * tileH)
                );
            }
        }
    }

    render() {
        return (
            <canvas
                ref={ (ref) => { this._canvas = ref } } />
        );
    }
}

export default QRCode;
