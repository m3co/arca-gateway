import io from 'socket.io-client';

export function getProjects(client) {
    // var client = io();

    client.on('connect', () => {
        console.log('connection projects');

        client.emit('data', {
            query: 'select',
            module: 'Projects',
            from: 'Projects'
        });
    });

    return (dispatch) => {
        client.on('response', (data) => {
            console.log(data);

            dispatch({
                type: 'GET_PROJECTS',
                payload: data.row
            })
        });
    }
}

export function getProject(client) {
    
    client.on('connect', () => {
        console.log('connection project');

        client.emit('data', {
            query: 'select',
            module: 'fnCostTasks1',
            project: 11
        });
    });

    return (dispatch) => {
        client.on('response', (data) => {
            console.log(data);

            dispatch({
                type: 'GET_PROJECT',
                payload: data.row
            })
        });
    }
}

export function eraseProject() {
    return (dispatch) => {
        dispatch({
            type: 'ERASE_PROJECT',
            payload: []
        })
    }
}
