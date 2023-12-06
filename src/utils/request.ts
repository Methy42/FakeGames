import { SERVER_URL } from "./constants";

export interface IRequestOptions {
    method?: string;
    headers?: any;
    data?: any;
    timeout?: number;
    success?: (res: {
        data: any;
        statusCode: number;
        header: any;
    }) => void;
    fail?: (err: Error) => void;
    complete?: () => void;
    responseType?: string;
};

export const request = (url: string, options: IRequestOptions = {}) => {
    url = SERVER_URL + url;

    return new Promise((resolve, reject) => {
        if (!options.success) {
            options.success = (res) => {
                resolve(res);
            };
        }

        if (!options.fail) {
            options.fail = (err) => {
                reject(err);
            };
        }

        (window as any).request(url, options);
    });
}

export const requestAssets = (url: string, options: IRequestOptions = {}) => {
    return new Promise((resolve, reject) => {
        if (!options.success) {
            options.success = (res) => {
                resolve(res);
            };
        }

        if (!options.fail) {
            options.fail = (err) => {
                reject(err);
            };
        }

        (window as any).request(url, options);
    });
}