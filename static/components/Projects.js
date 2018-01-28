import React, {Component} from 'react';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    componentDidMount() {
        const client = this.props.children;

        client.emit('data', {
            query: 'select',
            module: 'Projects',
            from: 'Projects'
        });

        // client.on('response', (data) => {
        //     console.log(data);
        // });

        this.props.getProjects(client);
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