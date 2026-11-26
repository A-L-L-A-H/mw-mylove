import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
  type JWTPayload,
} from "jose";

const ALLOWED_ASYMMETRIC_ALGS = [
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
  "EdDSA",
] as const;

export interface RidAuthConfig {
  readonly jwksUrl?: string;
  readonly issuer?: string;
  readonly audience?: string;
  readonly keyResolver?: JWTVerifyGetKey;
}

export interface VerifiedRidSession {
  readonly authenticated: true;
  readonly subject: string;
  readonly issuer: string;
  readonly scope: string | null;
}

const remoteJwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function resolveRemoteJwks(jwksUrl: string): ReturnType<typeof createRemoteJWKSet> {
  const cached = remoteJwksCache.get(jwksUrl);
  if (cached) {
    return cached;
  }
  const jwks = createRemoteJWKSet(new URL(jwksUrl));
  remoteJwksCache.set(jwksUrl, jwks);
  return jwks;
}

export function resolveRidAuthConfig(overrides: RidAuthConfig = {}): RidAuthConfig {
  const jwksUrl = (overrides.jwksUrl ?? process.env.MW_RID_JWKS_URL ?? "").trim() || undefined;
  const issuer = (overrides.issuer ?? process.env.MW_RID_ISSUER ?? "").trim() || undefined;
  const audience = (overrides.audience ?? process.env.MW_RID_AUDIENCE ?? "").trim() || undefined;
  return {
    jwksUrl,
    issuer,
    audience,
    keyResolver: overrides.keyResolver,
  };
}

export async function verifyRidAccessToken(
  token: string,
  config: RidAuthConfig,
): Promise<VerifiedRidSession> {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new Error("Bearer access token must be a non-empty string");
  }

  const keyResolver =
    config.keyResolver ??
    (config.jwksUrl ? resolveRemoteJwks(config.jwksUrl) : undefined);
  if (!keyResolver) {
    throw new Error("mw-rid JWKS verifier is not configured");
  }

  const verification = await jwtVerify(trimmedToken, keyResolver, {
    issuer: config.issuer,
    audience: config.audience,
    algorithms: [...ALLOWED_ASYMMETRIC_ALGS],
  });

  const payload: JWTPayload = verification.payload;

  if (payload.token_use === "id") {
    throw new Error("OIDC ID tokens are rejected; an access token is required");
  }

  if (typeof payload.at_hash === "string" || typeof payload.c_hash === "string") {
    throw new Error("OIDC ID tokens containing at_hash or c_hash are rejected");
  }

  if (typeof payload.exp !== "number") {
    throw new Error("Access token must contain a numeric exp claim");
  }

  if (typeof payload.sub !== "string" || payload.sub.trim().length === 0) {
    throw new Error("Access token must contain a non-empty sub claim");
  }

  const resolvedIssuer =
    typeof payload.iss === "string" ? payload.iss : (config.issuer ?? "");
  const resolvedScope =
    typeof payload.scope === "string" ? payload.scope : null;

  return {
    authenticated: true,
    subject: payload.sub,
    issuer: resolvedIssuer,
    scope: resolvedScope,
  };
}
