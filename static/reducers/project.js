function project(state = [], action) {
    switch (action.type) {
        case 'GET_PROJECT':
            return [...state, action.payload];

        default:
            return state;
    }
}

export default project;