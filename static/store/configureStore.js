// import {createStore, applyMiddleware} from 'redux';
// import rootReducer from 'static/reducers/index';
// import {browserHistory} from 'react-router';
// import thunk from 'redux-thunk';

// export default function configureStore(initialState) {
//   const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
//   return store;
// }

import {createStore, compse} from 'redux';
import {syncHistoryWithStore} from 'react-router-redux';
import {browserHistory} from 'react-router';

// impor tthe root reducer
import rootReducer from 'static/reducers/index';

// create and object for the default data

const defaultState = {
    
};

const store = createStore(rootReducer, defaultState);

export const history = syncHistoryWithStore(browserHistory, store);

export default store;