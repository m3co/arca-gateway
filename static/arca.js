import React from 'react';
import {render} from 'react-dom';

import Main from 'static/components/Main';
import Project from 'static/components/Project';
import Projects from 'static/components/Projects';

import {Router, Route, IndexRoute, browserHistory} from 'react-router';

const router = (
    <Router history={browserHistory}>
        <Route path='/' component={Main}>
            <IndexRoute component={Projects}></IndexRoute>
            <Route path='/project/:id' component={Project}></Route>
        </Route>
    </Router>
)

render(router, document.getElementById('root'));