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
        const style = {
            border: '1px solid red',
            padding: '15px'
        };

        const divStyle = {
            padding: '15px'
        }

        return (
            <div style={divStyle} key={index}>
                <span style={style}>id: {row.id}; </span>
                <span style={style}>keynote: {row.keynote}; </span>
                <span style={style}>keynote: {row.parent}; </span>
                <span style={style}>keynote: {row.description}; </span>
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
