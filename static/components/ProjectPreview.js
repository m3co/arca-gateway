import React, {Component} from 'react';
import {Link} from 'react-router';

class ProjectPreview extends Component{
    render(){
        // console.log(this.props);
        const project = this.props.project;

        return (
            <li>
                <Link to={`/project/${project.id}`}>{project.name}</Link>
            </li>
        )
    }
}

export default ProjectPreview;