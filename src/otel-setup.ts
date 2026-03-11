import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

const getUrl = (path: string) => {
  const url = process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];
  if (!url) {
    return;
  }

  return url + path;
};

export const nodeSDK = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env['APP_NAME'],
    [ATTR_SERVICE_VERSION]: process.env['APP_VERSION'],
  }),
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: getUrl('/v1/metrics'),
      }),
      exportIntervalMillis: 5000,
    }),
  ],
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: getUrl('/v1/traces'),
      }),
    ),
  ],
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new NestInstrumentation(),
    new PinoInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

nodeSDK.start();
