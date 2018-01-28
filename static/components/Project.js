import React, {Component} from 'react';

class Project extends Component{
    componentDidMount() {
        const client = this.props.children;

        client.emit('data', {
            query: 'select',
            module: 'fnCostTasks1',
            project: this.props.params.id
        });

        // client.on('response', (data) => {
        //     console.log(data);
        // });

        this.props.getProject(client);
    }

    componentWillUnmount() {
        this.props.eraseProject();
    }

    drawRow(project, index) {
        return (
            <tr key={index}>
                <td>{project.id}</td>
                <td>{project.keynote}</td>
                <td>{project.parent}</td>
                <td>{project.description}</td>
                <td>{project.expand}</td>
                <td>{project.constrain}</td>
                <td>{project.start}</td>
                <td>{project.end}</td>
                <td className='arca-table-correct'>
                    {
                        project.iscorrect 
                        ? 
                        <img src={require('../assets/check.png')} /> 
                        : 
                        <img src={require('../assets/times.png')} /> 
                    }
                </td>
                <td>{project.connectwith}</td>
            </tr>
        )
    }

    render(){
        return (
            <table className='arca-table'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>keynote</th>
                        <th>parent</th>
                        <th>description</th>
                        <th>expand</th>
                        <th>constrain</th>
                        <th>start</th>
                        <th>end</th>
                        <th>iscorrect</th>
                        <th>connectwith</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.project ? this.props.project.map((project, index) => this.drawRow(project, index)) : null}
                </tbody>
            </table>
        )
    }
}

export default Project;