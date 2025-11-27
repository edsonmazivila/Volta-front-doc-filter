import { NextResponse } from "next/server";

/**
 * Health check endpoint for container orchestration and load balancers.
 * Returns a 200 OK response with basic health information.
 *
 * Used by:
 * - Docker HEALTHCHECK
 * - Kubernetes liveness/readiness probes
 * - Load balancer health checks
 * - Monitoring systems
 */
export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.DD_VERSION || process.env.npm_package_version || "0.1.0",
  };

  return NextResponse.json(healthCheck, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

