import React, {Component} from 'react';

import ProjectPreview from 'static/components/ProjectPreview';

class Projects extends Component{
    render(){
        return (
            <div className='arca-projects-grid'>
                {this.props.projects.map((project, i) => {
                    return (
                        <div className='arca-projects-grid-item-wrapper' key={i}>
                            <ProjectPreview key={i} project={project} />
                        </div>
                    )
                })}
            </div>
        )
    }
}

export default Projects;