import React, {Component} from 'react';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    // componentDidMount() {
    //     console.log('mounted', this.props.projects);
    // }

    render(){
        return (
            <div>
                {this.props.projects.map((project, i) => <ProjectPreview key={i} project={project} />)}
            </div>
        )
    }
}

export default Projects;