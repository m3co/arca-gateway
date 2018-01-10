import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import projects from 'static/reducers/projects';

const rootReducer = combineReducers({projects, routing: routerReducer});

export default rootReducer;