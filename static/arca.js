import React from 'react';
import {render} from 'react-dom';

import Main from 'static/components/Main';
import Project from 'static/components/Project';
import Projects from 'static/components/Projects';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import store, {history} from 'static/store';

const router = (
    <Provider store={store}>
        <Router history={history}>
            <Route path='/' component={Main}>
                <IndexRoute component={Projects}></IndexRoute>
                <Route path='/project/:id' component={Project}></Route>
            </Route>
        </Router>
    </Provider>
)

render(router, document.getElementById('root'));