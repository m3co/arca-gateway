import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import {syncHistoryWithStore} from 'react-router-redux';

import App from 'static/App';
import AppsList from 'static/AppsList';
import Project from 'static/Project';

import configureStore from 'static/store/configureStore';

const rootEl = document.getElementById('root');
const store = configureStore();

const history = syncHistoryWithStore(browserHistory, store);

const router = (
    <Provider store={store}>
        <Router history={history}>
            <Route path='/' component={App}>
                <IndexRoute component={AppsList}></IndexRoute>
                <Route path='/project/:projectId' component={Project}></Route>
            </Route>
        </Router>
    </Provider>
);

render(router, rootEl);
