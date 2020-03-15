
export const ECONNRESET = 'ECONNRESET';
export const ECONNREFUSED = 'ECONNREFUSED';
export const errorUnexpectedEndJSONInput = 'Unexpected end of JSON input'.toLocaleLowerCase();

export interface Response {
    ID: string;
    Context: {
        Source: string;
        Target: string;
        Notification: true;
    };
    Result: {
        [key: string]: string;
    };
    Error: {
        Code: number;
        Message: string;
    } | null
}

export interface Request {
    ID: string,
    Method: string,
    Context: {
        [key:string]: string;
    }
}
