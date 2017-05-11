import * as kue from 'kue';
export interface Options {
    queue: kue.Queue;
    jobName: string;
    promClient?: any;
    prefixMetricName?: string;
    interval?: number;
}
declare const KueProm: (opts: Options) => {
    run: () => void;
    stop: () => void;
};
export default KueProm;
