import React from 'react';
import {render} from 'react-dom';
import {HashRouter} from 'react-router-dom';
import {Provider} from 'react-redux';

import App from 'static/App';
import configureStore from 'static/store/configureStore';

const rootEl = document.getElementById('root');
const store = configureStore();

const renderContainer = Component => {
    render(
        <HashRouter>
            <Provider store={store}>
                <Component />
            </Provider>
        </HashRouter>,
        rootEl
    )
}

renderContainer(App);
