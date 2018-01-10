import io from 'socket.io-client';

export function actionCreators() {
    const client = io();

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
