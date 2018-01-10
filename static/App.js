import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from 'static/actions/getRow';
import Main from './Main';

function mapStateToProps(state) {
    return {
        rows: state.rows
    }
}

function mapDispatchProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

const App = connect(mapStateToProps, mapDispatchProps)(Main);

export default App;

// import React, {Component} from 'react';
// import {connect} from 'react-redux';
// import {bindActionCreators} from 'redux';
// import * as getRow from 'static/actions/GetRow';

// function mapStateToProps (state) {
//     return {
//         rows: state.rows
//     }
// }

// function mapDispatchToProps(dispatch) {
//     return bindActionCreators(getRow, dispatch);
// }

// class App extends Component {
//     drawTableRow(row, index) {
//         return (
//             <div className='row' key={index}>
//                 <span>id: {row.id}; </span>
//                 <span>keynote: {row.keynote}; </span>
//                 <span>keynote: {row.parent}; </span>
//                 <span>keynote: {row.description}; </span>
//             </div>
//         )
//     }

//     render() {
//         const drawTr = this.drawTableRow;

//         return (
//             <div>
//                 {this.props.rows.length > 0 ? this.props.rows.map((row, index) => drawTr(row, index)) : null}

//                 <button onClick={() => this.props.getRow()}>Get data</button>
//             </div>
//         )
//     }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(App);
