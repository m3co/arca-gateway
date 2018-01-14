import React, {Component} from 'react';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    componentDidMount() {
        console.log('mounted', this.props.projects);
    }

    chunkProjects(array, chunkSize) {
        console.log('chunk');
        const chunks = [];

        while (array.length) {
            chunks.push(array.splice(0, chunkSize));
        }

        return chunks;
    }

    render(){
        return (
            <div className='arca-projects-grid'>
                {this.chunkProjects(this.props.projects, 5).map((chunk, i) => {
                    return (
                        <div key={i} className='arca-projects-grid-row'>
                            {chunk.map((project, i) => {
                                return (
                                    <div className='arca-projects-grid-item-wrapper' key={i}>
                                        <ProjectPreview key={i} project={project} />
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
                
            </div>
        )
    }
}

export default Projects;