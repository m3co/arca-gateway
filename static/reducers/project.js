function project(state = [], action) {
    switch (action.type) {
        case 'GET_PROJECT':
            console.log(state, 'get project');
            return [...state, action.payload];

        default:
            return state;
    }
}

export default project;