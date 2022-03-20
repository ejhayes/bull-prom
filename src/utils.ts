import * as client from "prom-client";

/**
 * @internal
 */
export enum Metrics {
    Gauge = "Gauge",
    Summary = "Summary",
    Histogram = "Histogram",
    Counter = "Counter"
};

/**
 * @internal
 */
export type Options =
  | client.GaugeConfiguration<string>
  | client.SummaryConfiguration<string>
  | client.CounterConfiguration<string>
  | client.HistogramConfiguration<string>;

/**
 * @internal
 */
export function getOrCreateMetric<T>(
  type: Metrics,
  options: Options,
): client.Metric<string> {
  const existingMetric = client.register.getSingleMetric(options.name);

  if (existingMetric) {
    return existingMetric;
  }

  switch (type) {
    case "Gauge":
      return new client.Gauge(options as client.GaugeConfiguration<string>);
    case "Counter":
      return new client.Counter(options as client.CounterConfiguration<string>);
    case "Histogram":
      return new client.Histogram(
        options as client.HistogramConfiguration<string>,
      );
    case "Summary":
      return new client.Summary(options as client.SummaryConfiguration<string>);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown type: ${type}`);
  }
}