import React, {Component} from 'react';
// import {Link} from 'react-router';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    render(){
        return (
            <ol>
                {this.props.projects.map((project, i) => <ProjectPreview key={i} project={project} />)}
            </ol>
        )
    }
}

export default Projects;