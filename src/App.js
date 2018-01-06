import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as getRow from 'src/actions/GetRow';

function mapStateToProps (state) {
    console.log(state, 'map state to props');
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
    drawTableRow(row) {
        console.log(row);

        const style = {
            border: '1px solid red',
            padding: '15px'
        };

        const divStyle = {
            padding: '15px'
        }

        return (
            <div style={divStyle} key={row.ley}>
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
                {this.props.rows ? this.props.rows.map(row => drawTr(row)) : null}
                <br />

                <button onClick={() => {getRow()}}>get data</button>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
