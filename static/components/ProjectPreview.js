import React, {Component} from 'react';
import {Link} from 'react-router';

class ProjectPreview extends Component{
    constructor() {
        super();

        this.onInputKeypress = this.onInputKeypress.bind(this);
    }

    onInputKeypress(e) {
        if (e.key === 'Enter') {
            this.props.redact(this.props.client, this.props.project.id, this.refs.nameInput.value);
        }
    }

    onInputFocus(e) {
        e.preventDefault();
    }

    render(){
        const project = this.props.project;

        return (
            <Link className='arca-projects-grid-item' to={`/project/${project.id}`}>
                <input 
                    type='text'
                    defaultValue={project.name}
                    ref='nameInput'
                    onClick={this.onInputFocus.bind(event)}
                    onKeyPress={this.onInputKeypress}
                />
            </Link>
        )
    }
}

export default ProjectPreview;