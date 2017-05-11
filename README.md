# Kue Prom
Provides [promotheus](https://prometheus.io/) metrics for [Kue](https://github.com/Automattic/kue)

Metrics:
- inactive job (gauge)
- active job (gauge)
- complete job (gauge)
- failed job (gauge)
- delayed job (gauge)

## Usage
```typescript
import promClient from 'prom-client';
import KueProm from 'kue-prom';

const queue: kue.Queue = kue.createQueue(...);

const kueMetric = KueProm({
  jobName: 'pdf',
  queue,
  promClient, // optional, it will use internal prom client if it is not given
  interval: 1000, // optional
  prefixMetricName: 'my_app' // optional
});

kueMetric.run();

// Metrics result in Promotheus
// my_app_pdf_job_inactive
// my_app_pdf_job_active
// my_app_pdf_job_complete
// my_app_pdf_job_failed
// my_app_pdf_job_delayed
```

## License
MIT [Budi Irawan](https://github.com/deerawan)