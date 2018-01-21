import React, {Component} from 'react';
import {Link} from 'react-router';

class ProjectPreview extends Component{
    onInputKeypress(event) {
        if (event.key === 'Enter') {
            console.log('submit');
        }
    }

    onInputChange(event) {
        console.log(event.target.value);
        // this.setState({project: event.target.value});
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
                    onChange={this.onInputChange}
                />
            </Link>
        )
    }
}

export default ProjectPreview;