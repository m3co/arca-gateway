export function getProjects(client) {
    client.on('connect', () => {
        client.emit('data', {
            query: 'subscribe',
            module: 'Projects'
        });

        client.emit('data', {
            query: 'select',
            module: 'Projects',
            from: 'Projects'
        });
    });

    return (dispatch) => {
        client.on('response', (data) => {
            dispatch({
                type: 'GET_PROJECTS',
                payload: data.row
            })
        });
    }
}

export function redactProjects(client, id, value) {

    client.emit('data', {
        query: 'update',
        module: 'Projects',
        id: id,
        idkey: 'id',
        value: [value],
        key: ['name']
    });

    return (dispatch) => {
        client.on('response', (data) => {
            dispatch({
                type: 'CHANGE_PROJECT_NAME',
                payload: data.row
            })
        });
    }
}

export function getProject(client, id) {
    client.emit('data', {
        query: 'select',
        module: 'fnCostTasks1',
        project: id
    });

    return (dispatch) => {
        client.on('response', (data) => {
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

export function eraseProjects() {
    return (dispatch) => {
        dispatch({
            type: 'ERASE_PROJECTS',
            payload: []
        })
    }
}
