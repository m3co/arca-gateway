import React, {Component} from 'react';

class Project extends Component{
    componentDidMount() {
        this.props.actionCreators();
    }

    render(){
        return (
            <table className='arca-table'>
                <thead>
                    <tr>
                        <th>id</th>
                        <th>keynote</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>12414</td>
                        <td>214124555 testiro</td>
                    </tr>
                    <tr>
                        <td>12414</td>
                        <td>214124555 testiro</td>
                    </tr>
                    <tr>
                        <td>12414</td>
                        <td>214124555 testiro</td>
                    </tr>
                    <tr>
                        <td>12414</td>
                        <td>214124555 testiro</td>
                    </tr>
                </tbody>
            </table>
        )
    }
}

export default Project;