import {createStore, applyMiddleware} from 'redux';
import rootReducer from 'src/reducers/index';

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState);
  return store;
}