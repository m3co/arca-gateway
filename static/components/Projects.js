import React, {Component} from 'react';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    componentDidMount() {
        this.props.getProjects(this.props.children);
    }

    componentWillUnmount() {
        this.props.eraseProjects();
    }

    render(){
        return (
            <div>
                {
                    this.props.projects ? 
                    this.props.projects.map((project, i) => {
                        return (
                            <ProjectPreview 
                                key={i} 
                                project={project}
                                client={this.props.children}
                                redact={this.props.redactProjects}
                            />
                        )
                    })
                    : null
                }
            </div>
        )
    }
}

export default Projects;