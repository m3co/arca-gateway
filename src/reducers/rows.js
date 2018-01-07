export default function rows(state = [], action) {
    switch (action.type) {
        case 'GET_ROW':
            return [ ...state, action.payload]

        default:
            return state;
    }
}