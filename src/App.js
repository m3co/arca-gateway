import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as getRow from 'src/actions/GetRow';

function mapStateToProps (state) {
    console.log(state);
    return {
        count: state.count
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getRow: bindActionCreators(getRow, dispatch)
    }
}

class App extends Component {
    render() {
        const { getRow } = this.props.getRow;
        return (
            <div>
                {this.props.count.count}
                <br />

                <button onClick={() => {getRow(15)}}>get row</button>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
