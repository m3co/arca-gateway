import {createStore, applyMiddleware} from 'redux';
import {syncHistoryWithStore} from 'react-router-redux';
import {browserHistory} from 'react-router';
import thunk from 'redux-thunk';

// import the root reducer
import rootReducer from 'static/reducers/index';

import projects from 'static/data/projects';

const defaultState = {
    projects
};

const store = createStore(rootReducer, defaultState, applyMiddleware(thunk));

export const history = syncHistoryWithStore(browserHistory, store);

export default store;