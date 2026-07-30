/**
 * OpenTelemetry auto-instrumentation bootstrap.
 *
 * This module MUST be imported before anything else (before Nest, HTTP, pg,
 * TypeORM are loaded) so OpenTelemetry can patch those libraries as they load.
 * It is wired as the very first import in `main.ts` and `lambda.ts`.
 *
 * Safe by default: if neither `OTEL_ENABLED=true` nor `OTEL_EXPORTER_OTLP_ENDPOINT`
 * is set, this is a no-op. It never crashes local dev, never blocks startup on an
 * unreachable collector, and adds no runtime dependency on any Apso endpoint.
 *
 * Enable it by setting `OTEL_EXPORTER_OTLP_ENDPOINT` (and optionally `OTEL_SERVICE_NAME`).
 * See README "Observability (OpenTelemetry)".
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

// Read package metadata for sensible resource-attribute defaults.
// Kept lazy and defensive so a missing package.json never breaks startup.
function readPackageMeta(): { name?: string; version?: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    return { name: pkg?.name, version: pkg?.version };
  } catch {
    return {};
  }
}

/**
 * Tracing is enabled when OTEL_ENABLED is truthy, OR when an OTLP endpoint is
 * configured. Setting OTEL_ENABLED=false explicitly disables it regardless of endpoint.
 */
function isTracingEnabled(): boolean {
  const flag = (process.env.OTEL_ENABLED || '').trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'no') return false;
  if (flag === 'true' || flag === '1' || flag === 'yes') return true;
  // No explicit flag: enable only if an OTLP endpoint is configured.
  return Boolean((process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '').trim());
}

let sdk: NodeSDK | undefined;

export function startTracing(): void {
  if (sdk) return; // already started
  if (!isTracingEnabled()) {
    // Safe default: no-op. Nothing is exported, nothing can block startup.
    return;
  }

  const pkg = readPackageMeta();
  const serviceName =
    process.env.OTEL_SERVICE_NAME ||
    process.env.APP_NAME ||
    pkg.name ||
    'apso-service';

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    ...(pkg.version ? { [ATTR_SERVICE_VERSION]: pkg.version } : {}),
  });

  // OTLP HTTP exporter. Endpoint comes from OTEL_EXPORTER_OTLP_ENDPOINT
  // (the SDK reads it automatically), pointed at an OpenTelemetry Collector or
  // a Grafana Cloud OTLP endpoint. Not hardwired to any Apso URL.
  const traceExporter = new OTLPTraceExporter();

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Filesystem spans are noisy and rarely useful; disable by default.
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    // eslint-disable-next-line no-console
    console.log(
      `[otel] tracing enabled (service.name=${serviceName}, endpoint=${
        process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'default http://localhost:4318'
      })`,
    );
  } catch (err) {
    // Never let telemetry setup take down the app.
    // eslint-disable-next-line no-console
    console.error('[otel] failed to start tracing; continuing without it:', err);
    sdk = undefined;
  }
}

/**
 * Flush and shut the SDK down. Wired to SIGTERM/SIGINT so in-flight spans are
 * exported before the process exits. No-op if tracing was never started.
 */
export async function shutdownTracing(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[otel] error during tracing shutdown:', err);
  } finally {
    sdk = undefined;
  }
}

// Start immediately on import so instrumentation is in place before Nest and
// the instrumented libraries (http, pg, typeorm) are required.
startTracing();

// Graceful shutdown: flush spans on termination signals.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    void shutdownTracing().finally(() => {
      // Re-raise default behaviour so the process still exits.
      process.kill(process.pid, signal);
    });
  });
}
