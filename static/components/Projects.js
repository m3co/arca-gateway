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

        // console.log(this.props);
    }

    render(){
        return (
            <div>
                {this.props.project ? this.props.project.map((project, i) => <ProjectPreview key={i} project={project} />) : null}
            </div>
        )
    }
}

export default Projects;