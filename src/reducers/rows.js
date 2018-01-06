const initialState = {
    count: 0
};

export default function count(state = initialState, action) {
    switch (action.type) {
        case 'GET_ROW':
            return { ...state, count: action.payload }

        default:
            return state;
    }
}