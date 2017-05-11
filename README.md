# Kue Prom
Provides [promotheus](https://prometheus.io/) metrics for [Kue](https://github.com/Automattic/kue)

Metrics:
- inactive count (gauge)
- active count (gauge)
- complete count (gauge)
- failed count (gauge)
- delayed count (gauge)

## Usage
```typescript
import promClient from 'prom-client';
import KueProm from 'kue-prom';

const queue: kue.Queue = kue.createQueue(...);

const kueMetric = KueProm({
  jobName: 'pdf_job',
  queue,
  promClient, // optional, it will use internal prom client if it is not given
  interval: 1000, // optional
  prefixMetricName: 'my_app' // optional
});

kueMetric.run();

// Metrics result in Promotheus
// my_app_pdf_job_inactive_count
// my_app_pdf_job_active_count
// my_app_pdf_job_complete_count
// my_app_pdf_job_failed_count
// my_app_pdf_job_delayed_count
```

## License
MIT [Budi Irawan](https://github.com/deerawan)