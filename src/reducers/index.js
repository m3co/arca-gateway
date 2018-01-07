import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form'
import rows from 'src/reducers/rows';

export default combineReducers({
  rows,
  form: formReducer
})