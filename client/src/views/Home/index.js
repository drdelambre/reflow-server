import React from 'react';
import Helmet from 'react-helmet';
import Chart from 'views/Home/Chart';
import Prefix from 'views/Home/Prefix';
import Temp from 'views/Home/Temp';
import Tune from 'views/Home/Tune';
import Workflow from 'views/Home/Workflow';
import Control from 'views/Home/Control';

import style from './styles';

class Home extends React.Component {
    render() {
        return (
            <div className={ style.home }>
                <Helmet>
                    <title>Reflux Oven</title>
                    <meta name='description' content='An interface for debugging the reflow oven' />
                </Helmet>
                <div className={ style.wrap }>
                    <div className={ style.left }>
                        <Chart />
                        <div className={ style.footer }>
                            <Temp />
                            <Prefix />
                            <Tune />
                        </div>
                    </div>
                    <div className={ style.right }>
                        <Workflow />
                        <Control />
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
