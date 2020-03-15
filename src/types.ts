
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

export interface ResponsesIterator {
    next(value?: Response): Promise<IteratorResult<Response[]>>;
    return?(value?: Response): Promise<IteratorResult<Response[]>>;
    throw?(e?: Error): Promise<IteratorResult<Response[]>>;
}
