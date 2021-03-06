import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from 'views/Home';

class App extends React.Component {
    render() {
        return (
            <Switch>
                <Route path='/' component={ Home } />
            </Switch>
        );
    }
}

export default App;
