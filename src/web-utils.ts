
import { PK } from './types';

export function canSendNotification(filterPK: PK, rowPK?: PK): boolean {
    if (rowPK) {
        const keys = Object.keys(filterPK);
        for (let i = 0; i < keys.length; i++) {
            const filterValue = filterPK[keys[i]];
            const rowValue = rowPK[keys[i]];

            if (filterValue !== rowValue) {
                return false;
            }
        }
    }
    return true;
}
