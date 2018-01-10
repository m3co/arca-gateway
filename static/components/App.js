import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as actionCreators from 'static/actions/actionCreators';

import Main from 'static/components/Main';

function mapStateToProps(state) {
    return {
        projects: state.projects,
        project: state.project
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

const App = connect(mapStateToProps, mapDispatchToProps)(Main);

export default App;