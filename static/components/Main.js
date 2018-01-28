import React, {Component} from 'react';
import {Link} from 'react-router';
import io from 'socket.io-client';

class Main extends Component{
    constructor() {
        super();
        this.client = io();

        this.client.on('connect', () => {
            this.client.emit('data', {
                query: 'subscribe',
                module: 'Projects'
            });
        });
    }

    render(){
        return (
            <div className='wrapper'>
                <h1>
                    <Link to='/'>Arca</Link>
                </h1>
                
                <div className='container'>
                    {React.cloneElement(this.props.children, this.props, this.client)}
                </div>
            </div>
        )
    }
}

export default Main;