import React, {Component} from 'react';

class Project extends Component{
    componentDidMount() {
        this.props.actionCreators();
    }

    render(){
        return (
            <div>
                SINGLE PROJECT
            </div>
        )
    }
}

export default Project;