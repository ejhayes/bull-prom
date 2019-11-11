import * as bull from 'bull';
export interface Options {
    promClient?: any;
    labels?: string[];
    interval?: number;
}
export declare function init(opts: Options): {
    start: (queue: bull.Queue<any>) => {
        stop: () => any;
    };
};
