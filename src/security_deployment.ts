/**
 * Pepfuels Deployment & Security Checklist
 * 
 * Deployment Strategy:
 * 1. Containerization: Docker for Backend, Redis, and PostgreSQL.
 * 2. CI/CD: GitHub Actions for automated testing and deployment to AWS/GCP.
 * 3. Infrastructure: Kubernetes for scaling, Nginx as Reverse Proxy.
 * 4. Monitoring: Prometheus & Grafana for metrics, Sentry for error tracking.
 * 
 * Security Best Practices:
 * - Rate Limiting: express-rate-limit on all public endpoints.
 * - Input Validation: Zod schemas for every request body/query.
 * - RBAC: Strict role-based middleware for all sensitive routes.
 * - Audit Logging: Record every state change in the database.
 * - Idempotency: Use X-Idempotency-Key for order creation.
 * - File Security: S3 Signed URLs for KYC and challan uploads.
 * - Database: Row-level security (RLS) where applicable, encryption at rest.
 * - OTP Security: Max 3 attempts per OTP, 60s cooldown between requests.
 */

export const SECURITY_CHECKLIST = [
  "Enable Helmet.js for secure headers",
  "Implement CORS with strict origin whitelist",
  "Use JWT rotation with short-lived access tokens",
  "Regularly rotate database and API secrets",
  "Perform periodic penetration testing",
  "Sanitize all user inputs to prevent SQLi/XSS",
];
