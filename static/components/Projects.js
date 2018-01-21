import React, {Component} from 'react';
import io from 'socket.io-client';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    constructor() {
        super();
        this.client = io();
    }

    componentDidMount() {
        this.props.getProjects(this.client);
    }

    componentWillUnmount() {
        this.props.eraseProjects();
    }

    render(){
        return (
            <div>
                {this.props.projects ? this.props.projects.map((project, i) => <ProjectPreview key={i} project={project} />) : null}
            </div>
        )
    }
}

export default Projects;