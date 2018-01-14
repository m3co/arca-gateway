import React, {Component} from 'react';
import {Link} from 'react-router';

class Main extends Component{
    render(){
        return (
            <div className='wrapper'>
                <h1>
                    <Link to='/'>Arca</Link>
                </h1>
                
                <div className='container'>
                    {React.cloneElement(this.props.children, this.props)}
                </div>
            </div>
        )
    }
}

export default Main;