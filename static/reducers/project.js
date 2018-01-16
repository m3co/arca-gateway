function project(state = [], action) {
    switch (action.type) {
        case 'GET_PROJECTS':
            return [...state, action.payload];

        case 'GET_PROJECT':
            return [...state, action.payload];

        case 'ERASE_PROJECT':
            return [];

        default:
            return state;
    }
}

export default project;