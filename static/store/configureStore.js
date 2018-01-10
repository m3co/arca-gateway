import {createStore, applyMiddleware} from 'redux';
import rootReducer from 'static/reducers/index';
import thunk from 'redux-thunk';

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
  return store;
}