import React, {Component} from 'react';
// import io from 'socket.io-client';
import { connect } from 'react-redux';

function mapStateToProps (state) {
  return {
    count: state.count
  }
}

class App extends Component {
    // constructor() {
    //     super();

    //     this.state = {
    //         count: 0
    //     }
    // }

    // componentWillMount() {
    //     var client = io();
    //     client.on('connect', () => {
    //         console.log('connection');

    //     client.emit('data', {
    //         query: 'subscribe',
    //         module: 'fnCostTasks1'
    //     });

    //     client.emit('data', {
    //             query: 'select',
    //             module: 'fnCostTasks1',
    //             project: 11
    //         });
    //     });

    //     client.on('response', (data) => {
    //         console.log(data);
    //         this.setState({ count: this.state.count + 1 })

    //         console.log(this.state.count);
    //     });
    // }

    render() {
        return (
            <div>
                {this.props.count}
            </div>
        )
    }
}

export default connect(mapStateToProps)(App);
