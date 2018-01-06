import React from 'react';
import {render} from 'react-dom';
import {HashRouter} from 'react-router-dom'

import App from 'src/App';

const rootEl = document.getElementById('root');

const renderContainer = Component => {
    render(
        <HashRouter>
            <Component />
        </HashRouter>,
        rootEl
    )
}

renderContainer(App);
