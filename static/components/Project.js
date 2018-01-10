import React, {Component} from 'react';

// import the data!!!


class Project extends Component{
    render(){
        return (
            <div>
                SINGLE PROJECT
                <button onClick={() => this.props.actionCreators()}>Get data</button>
            </div>
        )
    }
}

export default Project;