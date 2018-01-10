import {createStore} from 'redux';
import {syncHistoryWithStore} from 'react-router-redux';
import {browserHistory} from 'react-router';

// import the root reducer
import rootReducer from 'static/reducers/index';

import projects from 'static/data/projects';

const defaultState = {
    projects
};

const store = createStore(rootReducer, defaultState);

export const history = syncHistoryWithStore(browserHistory, store);

export default store;