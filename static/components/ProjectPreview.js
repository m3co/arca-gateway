import React, {Component} from 'react';
import {Link} from 'react-router';

class ProjectPreview extends Component{
    render(){
        // console.log(this.props);
        const project = this.props.project;

        return (
            <Link className='arca-projects-grid-item' to={`/project/${project.id}`}>
                <span>{project.name}</span>
            </Link>
        )
    }
}

export default ProjectPreview;