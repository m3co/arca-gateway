import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as getRow from 'src/actions/GetRow';

function mapStateToProps (state) {
    return {
        rows: state.rows
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getRow: bindActionCreators(getRow, dispatch)
    }
}

class App extends Component {
    drawTableRow(row, index) {
        return (
            <div className='row' key={index}>
                <span>id: {row.id}; </span>
                <span>keynote: {row.keynote}; </span>
                <span>keynote: {row.parent}; </span>
                <span>keynote: {row.description}; </span>
            </div>
        )
    }

    render() {
        const {getRow} = this.props.getRow;
        const drawTr = this.drawTableRow;

        return (
            <div>
                {this.props.rows ? this.props.rows.map((row, index) => drawTr(row, index)) : null}
                <br />

                <button onClick={() => {getRow()}}>get data</button>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
