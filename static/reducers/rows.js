export default function rows(state = [], action) {
    switch (action.type) {
        case 'GET_ROW':
            console.log(state);
            return [ ...state, action.payload]

        default:
            return state;
    }
}