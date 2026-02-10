import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import {
  BatchSpanProcessor,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';

const provider = new NodeTracerProvider({
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: process.env['OTLP_TRACE_EXPORTER_URL'],
      }),
    ),
  ],
});

provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new NestInstrumentation()],
});
