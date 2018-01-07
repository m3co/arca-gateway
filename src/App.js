import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as getRow from 'src/actions/GetRow';
import ProjectForm from 'src/ProjectForm';

function mapStateToProps (state) {
    console.log(state, 'mapStateToProps');
    return {
        rows: state.rows
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(getRow, dispatch);
}

class App extends Component {
    constructor() {
        super();
        this.submit = this.submit.bind(this);
    }

    submit(values) {
        this.props.getRow(values.projectId);
    }

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
        const drawTr = this.drawTableRow;

        return (
            <div>
                <ProjectForm onSubmit={this.submit}></ProjectForm>
                {this.props.rows.length > 0 ? this.props.rows.map((row, index) => drawTr(row, index)) : null}

                <br />
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
