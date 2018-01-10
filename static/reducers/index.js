import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import projects from 'static/reducers/projects';
import project from 'static/reducers/project';

const rootReducer = combineReducers({projects, project, routing: routerReducer});

export default rootReducer;