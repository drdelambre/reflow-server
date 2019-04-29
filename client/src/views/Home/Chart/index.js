import React from 'react';
import { Line } from 'react-chartjs-2';
import Indicator from 'views/Home/Indicator';
import {
    start,
    stop
} from 'services/temp-poll';
import {
    grab as grabRead,
    watch as watchRead
} from 'stores/temp';
import {
    grab as grabSet,
    watch as watchSet
} from 'stores/set';

import style from './styles';

const options = {
    aspectRatio: 1,
    tooltips: {
        enabled: false
    },
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
            type: 'time',
            distribution: 'linear',
            gridLines: {
                color: 'rgba(255,231,133,0.6)',
                drawTicks: false
            },
            ticks: {
                display: false
            }
        }],
        yAxes: [{
            gridLines: {
                color: 'rgba(255,231,133,0.6)',
                drawTicks: false
            },
            ticks: {
                beginAtZero: true,
                padding: 8,
                fontFamily: 'lato',
                fontColor: '#1B140D'
            }
        }]
    }
};

class Chart extends React.Component {
    state = {
        temp: [],
        set: []
    };

    constructor(props, ctx) {
        super(props, ctx);

        grabRead()
            .then((data) => {
                if (this._mounted) {
                    this.setState({
                        temp: data
                    });
                } else {
                    this.state.temp = data;
                }
            });
        watchRead((data) => {
            if (this._mounted) {
                this.setState({
                    temp: data
                });
            } else {
                this.state.temp = data;
            }
        });

        grabSet()
            .then((data) => {
                if (this._mounted) {
                    this.setState({
                        set: data
                    });
                } else {
                    this.state.set = data;
                }
            });
        watchSet((data) => {
            if (this._mounted) {
                this.setState({
                    set: data
                });
            } else {
                this.state.set = data;
            }
        });
    }

    componentDidMount() {
        this._mounted = true;
        start();
    }

    componentWillUnmount() {
        stop();
        this._mounted = false;
    }

    render() {
        let settemp = [];

        if (this.state.set.length) {
            settemp = this.state.set.reduce((prev, curr) => {
                if (!prev.length) {
                    prev.push(curr);
                    return prev;
                }

                prev.push({
                    t: curr.t,
                    y: prev[prev.length - 1].y
                });

                prev.push(curr);

                return prev;
            }, []).concat([{
                t: new Date(),
                y: this.state.set[this.state.set.length - 1].y
            }]);
        }

        const data = {
            datasets: [
                {
                    label: 'Set Temperature',
                    fill: false,
                    borderJoinStyle: 'miter',
                    borderColor: '#CBE673',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    lineTension: 0.01,
                    data: settemp
                }, {
                    label: 'Read Temperature',
                    fill: true,
                    borderJoinStyle: 'miter',
                    borderColor: 'rgba(255,231,133,1)',
                    backgroundColor: 'rgba(255,231,133,0.5)',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    lineTension: 0.8,
                    data: this.state.temp
                }
            ]
        };

        return (
            <div className={ style.main }>
                <Line data={ data }
                    height={ null }
                    width={ null }
                    options={ options } />
                <Indicator />
            </div>
        );
    }
}

export default Chart;
