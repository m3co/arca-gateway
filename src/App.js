import React, {Component} from 'react';
import io from 'socket.io-client';

class App extends Component {
    componentWillMount() {
        var client = io();
        client.on('connect', () => {
            console.log('connection');

        client.emit('data', {
            query: 'subscribe',
            module: 'fnCostTasks1'
        });

        client.emit('data', {
                query: 'select',
                module: 'fnCostTasks1',
                project: 11
            });
        });

        client.on('response', (data) => {
            console.log(data);
        });
    }

    render() {
        return (
            <div>
                test
            </div>
        )
    }
}

export default App;
