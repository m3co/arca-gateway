// a reducer takes in 2 thins: action and copy of current state

function projects(state = [], action) {
    switch (action.type) {
        case 'CHANGE_PROJECT_NAME':
            // console.log('change project fired');
            // console.log(state, action.payload);
            // console.log([...state, action.payload]);
            return [...state, action.payload];

        case 'GET_PROJECTS':
            // console.log('get projects fired');
            return [...state, action.payload];

        case 'ERASE_PROJECTS':
            return [];

        default:
            return state;
    }
}

export default projects;