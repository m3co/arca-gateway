import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import rows from 'static/reducers/rows';

export default combineReducers({
  rows,
  routing: routerReducer
})