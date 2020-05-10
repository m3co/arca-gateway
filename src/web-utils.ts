
import { PK } from './types';

export function canSendNotification(filterPK: PK, rowPK?: PK): boolean {
    if (rowPK) {
        const keys = Object.keys(filterPK);
        for (let i = 0; i < keys.length; i++) {
            const filterValue = filterPK[keys[i]];
            const rowValue = rowPK[keys[i]];

            if (filterValue !== rowValue) {
                if (filterValue && rowValue) {
                    const rowStr = rowValue.toString();
                    let filterStr = filterValue.toString();

                    let match: RegExp;
                    if (filterStr[0] === '%' && filterStr[filterStr.length - 1] === '%') {
                        match = new RegExp(`${filterStr.slice(1, filterStr.length - 1)}`);
                    } else if (filterStr[0] === '%') {
                        match = new RegExp(`${filterStr.slice(1, filterStr.length)}$`);
                    } else if (filterStr[filterStr.length - 1] === '%') {
                        match = new RegExp(`^${filterStr.slice(0, filterStr.length - 1)}`);
                    } else {
                        return false;
                    }
                    return match.test(rowStr);
                }
                return false;
            }
        }
    }
    return true;
}
