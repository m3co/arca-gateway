export function getProjects(client) {
    return (dispatch) => {
        client.off('response');
        client.on('response', (data) => {
            dispatch({
                type: 'GET_PROJECTS',
                payload: data.row
            })
        });
    }
}

export function redactProjects(client, id, value) {
    client.off('response');
    client.emit('data', {
        query: 'update',
        module: 'Projects',
        id: id,
        idkey: 'id',
        value: [value],
        key: ['name']
    });

    return (dispatch) => {
        client.off('response');
        client.on('response', (data) => {
            dispatch({
                type: 'CHANGE_PROJECT_NAME',
                payload: data.row
            })
        });
    }
}

export function getProject(client) {
    return (dispatch) => {
        client.off('response');
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
