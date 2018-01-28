// a reducer takes in 2 thins: action and copy of current state

function projects(state = [], action) {
    switch (action.type) {
        case 'CHANGE_PROJECT_NAME':
            return [...state, action.payload];

        case 'GET_PROJECTS':
            return [...state, action.payload];

        case 'ERASE_PROJECTS':
            return [];

        default:
            return state;
    }
}

export default projects;