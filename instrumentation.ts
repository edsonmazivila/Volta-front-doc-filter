/**
 * Next.js Instrumentation for Datadog APM
 *
 * This file initializes Datadog distributed tracing and APM for the application.
 * It runs once when the Next.js server starts, before any other code.
 *
 * Required environment variables:
 * - DD_ENV: Environment name (e.g., 'production', 'staging', 'development')
 * - DD_SERVICE: Service name (defaults to 'nexupayroll')
 * - DD_VERSION: Application version for deployment tracking
 * - DD_AGENT_HOST: Datadog Agent host (defaults to 'localhost')
 * - DD_TRACE_AGENT_PORT: Datadog Agent trace port (defaults to 8126)
 *
 * @see https://docs.datadoghq.com/tracing/trace_collection/automatic_instrumentation/dd_libraries/nodejs/
 */

export async function register() {
  // Only initialize tracing on the server side (Node.js runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamically import dd-trace to avoid bundling issues
    const { default: tracer } = await import("dd-trace");

    // Initialize the Datadog tracer with configuration
    tracer.init({
      // Service identification
      service: process.env.DD_SERVICE || "nexupayroll",
      env: process.env.DD_ENV || "development",
      version: process.env.DD_VERSION || "0.1.0",

      // Sampling configuration
      // 1.0 = 100% of traces sampled (adjust for production based on volume)
      sampleRate: Number.parseFloat(process.env.DD_TRACE_SAMPLE_RATE || "1.0"),

      // Enable runtime metrics collection
      runtimeMetrics: true,

      // Enable log injection for trace-log correlation
      logInjection: true,

      // Profiling configuration (requires additional setup)
      profiling: process.env.DD_PROFILING_ENABLED === "true",

      // Enable distributed tracing headers propagation
      // Supports both Datadog and W3C Trace Context formats
      propagationStyle: ["datadog", "tracecontext"],

      // Tag configuration for better filtering in Datadog UI
      tags: {
        "app.type": "nextjs",
        "app.framework.version": "15.5.4",
        "app.runtime": "nodejs",
      },

      // Startup logs for verification
      startupLogs: process.env.NODE_ENV !== "production",
    });

    // Enable debug mode via environment variable (DD_TRACE_DEBUG)
    // This is handled automatically by dd-trace when DD_TRACE_DEBUG=true is set

    // Log successful initialization
    if (process.env.NODE_ENV !== "production") {
      console.log("[Datadog APM] Tracer initialized successfully");
      console.log(`[Datadog APM] Service: ${process.env.DD_SERVICE || "nexupayroll"}`);
      console.log(`[Datadog APM] Environment: ${process.env.DD_ENV || "development"}`);
    }
  }
}

/**
 * Optional: Handle instrumentation errors
 * This function is called if the instrumentation fails to load
 */
export function onRequestError(
  error: Error,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string; revalidateReason?: string }
) {
  // Import tracer for error tracking
  import("dd-trace").then(({ default: tracer }) => {
    const span = tracer.scope().active();
    if (span) {
      span.setTag("error", true);
      span.setTag("error.message", error.message);
      span.setTag("error.stack", error.stack);
      span.setTag("http.route", context.routePath);
      span.setTag("http.method", request.method);
    }
  });
}

