
export const ECONNRESET = 'ECONNRESET';
export const ECONNREFUSED = 'ECONNREFUSED';
export const errorUnexpectedEndJSONInput = 'Unexpected end of JSON input'.toLowerCase();

export interface Response {
    ID?: string;
    Method: string;
    Context: {
        Source: string;
        Target: string;
    };
    Result: {
        [key: string]: string;
    };
    Error: {
        Code: number;
        Message: string;
    } | null
}

export interface Notification {
    Method: string;
    Context: {
        Source: string;
        Target: string;
        Notification: true;
    };
    Row: {
        [key: string]: null | number | boolean | string;
    };
    PK: {
        [key: string]: null | number | boolean | string;
    };
}

export interface Request {
    ID: string,
    Method: string,
    Context: {
        [key:string]: any;
    },
    Params?: {
        [key: string]: any;
    }
}
