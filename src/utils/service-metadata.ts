/**
 * Shared service-metadata helpers.
 *
 * One place to read the package manifest and the `.apsorc` file so callers
 * (OpenTelemetry resource attributes, Swagger doc title, and anything else that
 * needs to name or version the service) resolve it identically instead of each
 * re-reading these files. All reads are defensive — a missing/invalid file
 * never throws.
 */
import * as fs from 'fs';
import * as path from 'path';

export interface PackageMeta {
  name?: string;
  version?: string;
}

let packageMetaCache: PackageMeta | undefined;

/** name/version from package.json. Cached (the manifest is immutable at runtime). */
export function getPackageMeta(): PackageMeta {
  if (packageMetaCache) return packageMetaCache;
  // Module-relative first (survives cwd changes: dist/utils -> project root),
  // then cwd as a fallback.
  const candidates = [
    path.resolve(__dirname, '../../package.json'),
    path.resolve(process.cwd(), 'package.json'),
  ];
  for (const candidate of candidates) {
    try {
      const pkg = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      packageMetaCache = { name: pkg?.name, version: pkg?.version };
      return packageMetaCache;
    } catch {
      // try the next candidate
    }
  }
  packageMetaCache = {};
  return packageMetaCache;
}

/** Parsed `.apsorc` from the working directory, or `{}` if absent/invalid. */
export function getApsorc(): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.apsorc'), 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Canonical service name: `.apsorc` serviceName → `APP_NAME` env → package name
 * → the provided fallback. Callers that have their own higher-priority override
 * (e.g. OTEL_SERVICE_NAME) should apply it before falling back to this.
 */
export function getServiceName(fallback = 'apso-service'): string {
  const apsorc = getApsorc();
  const fromApsorc = typeof apsorc.serviceName === 'string' ? apsorc.serviceName.trim() : '';
  const fromEnv = (process.env.APP_NAME || '').trim();
  return fromApsorc || fromEnv || getPackageMeta().name || fallback;
}
