import { afterEach, describe, expect, it } from "bun:test";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import {
  resolveRidAuthConfig,
  RID_ACCESS_TOKEN_ALGORITHMS,
  verifyRidAccessToken,
  type RidAuthConfig,
} from "../src/index.js";

const TEST_ISSUER = "https://id.a-l-l-a-h.com";
const TEST_AUDIENCE = "urn:moonwitness:api";
const ENV_KEYS = [
  "MW_RID_JWKS_URL",
  "MW_RID_ISSUER",
  "MW_RID_AUDIENCE",
] as const;
const savedEnv = new Map<string, string | undefined>();

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const value = savedEnv.get(key);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  savedEnv.clear();
}

afterEach(() => {
  restoreEnv();
});

async function createTestKeyFixture() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = "mylove-test-key-1";
  publicJwk.alg = "RS256";
  publicJwk.use = "sig";

  const keyResolver = createLocalJWKSet({ keys: [publicJwk] });
  const ridAuth: RidAuthConfig = {
    jwksUrl: undefined,
    issuer: TEST_ISSUER,
    audience: TEST_AUDIENCE,
    keyResolver,
  };

  return { privateKey, ridAuth };
}

describe("mw-mylove mw-rid JWKS SSO verification (ADR-001)", () => {
  it("exports only asymmetric signing algorithms and rejects a forged HS256 token", async () => {
    expect(RID_ACCESS_TOKEN_ALGORITHMS).not.toContain("HS256");
    for (const algorithm of RID_ACCESS_TOKEN_ALGORITHMS) {
      expect(algorithm).not.toMatch(/^HS/);
    }

    const { ridAuth } = await createTestKeyFixture();
    const forgedSecret = new TextEncoder().encode(
      "forged-symmetric-secret-key",
    );
    const forgedToken = await new SignJWT({ scope: "api:read" })
      .setProtectedHeader({ alg: "HS256", typ: "at+jwt" })
      .setSubject("usr-attacker")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(forgedSecret);

    await expect(verifyRidAccessToken(forgedToken, ridAuth)).rejects.toThrow();
  });

  it("verifies a valid RS256 access token and returns the session fields", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const accessToken = await new SignJWT({ scope: "openid api:read" })
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);

    await expect(verifyRidAccessToken(accessToken, ridAuth)).resolves.toEqual({
      authenticated: true,
      subject: "usr-mylove-1",
      issuer: TEST_ISSUER,
      scope: "openid api:read",
    });
  });

  it("rejects OIDC ID tokens that use token_use, at_hash, or c_hash", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const cases = [
      { token_use: "id" },
      { at_hash: "id-token-hash" },
      { c_hash: "code-hash" },
    ];

    for (const claims of cases) {
      const idToken = await new SignJWT(claims)
        .setProtectedHeader({
          alg: "RS256",
          typ: "JWT",
          kid: "mylove-test-key-1",
        })
        .setSubject("usr-mylove-1")
        .setIssuer(TEST_ISSUER)
        .setAudience(TEST_AUDIENCE)
        .setExpirationTime("15m")
        .sign(privateKey);

      await expect(verifyRidAccessToken(idToken, ridAuth)).rejects.toThrow(
        /ID tokens.*rejected/i,
      );
    }
  });

  it("rejects expired tokens and missing or empty exp and sub claims", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const expiredToken = await new SignJWT({})
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(privateKey);
    const missingExpToken = await new SignJWT({})
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .sign(privateKey);
    const missingSubToken = await new SignJWT({})
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);
    const emptySubToken = await new SignJWT({})
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setSubject("   ")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);

    await expect(verifyRidAccessToken(expiredToken, ridAuth)).rejects.toThrow();
    await expect(
      verifyRidAccessToken(missingExpToken, ridAuth),
    ).rejects.toThrow(/exp claim/i);
    await expect(
      verifyRidAccessToken(missingSubToken, ridAuth),
    ).rejects.toThrow(/sub claim/i);
    await expect(verifyRidAccessToken(emptySubToken, ridAuth)).rejects.toThrow(
      /sub claim/i,
    );
  });

  it("rejects wrong issuer, wrong audience, and missing verifier configuration", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const wrongIssuerToken = await new SignJWT({})
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setSubject("usr-mylove-1")
      .setIssuer("https://evil.example.com")
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);
    const wrongAudienceToken = await new SignJWT({})
      .setProtectedHeader({
        alg: "RS256",
        typ: "at+jwt",
        kid: "mylove-test-key-1",
      })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience("urn:wrong:audience")
      .setExpirationTime("15m")
      .sign(privateKey);

    await expect(
      verifyRidAccessToken(wrongIssuerToken, ridAuth),
    ).rejects.toThrow();
    await expect(
      verifyRidAccessToken(wrongAudienceToken, ridAuth),
    ).rejects.toThrow();
    await expect(verifyRidAccessToken("   ", ridAuth)).rejects.toThrow(
      /non-empty string/i,
    );
    await expect(verifyRidAccessToken("opaque-token", {})).rejects.toThrow(
      /not configured/i,
    );
  });

  it("resolves config from environment and overrides, ignoring blank overrides", () => {
    for (const key of ENV_KEYS) {
      savedEnv.set(key, process.env[key]);
    }
    process.env.MW_RID_JWKS_URL = "  https://env.example.com/jwks  ";
    process.env.MW_RID_ISSUER = "  https://env.example.com  ";
    process.env.MW_RID_AUDIENCE = "  urn:env:api  ";

    expect(resolveRidAuthConfig()).toEqual({
      jwksUrl: "https://env.example.com/jwks",
      issuer: "https://env.example.com",
      audience: "urn:env:api",
      keyResolver: undefined,
    });
    expect(
      resolveRidAuthConfig({ jwksUrl: "   ", audience: "urn:override:api" }),
    ).toEqual({
      jwksUrl: undefined,
      issuer: "https://env.example.com",
      audience: "urn:override:api",
      keyResolver: undefined,
    });
    expect(
      resolveRidAuthConfig({ jwksUrl: "https://override.example.com/jwks" }),
    ).toEqual({
      jwksUrl: "https://override.example.com/jwks",
      issuer: "https://env.example.com",
      audience: "urn:env:api",
      keyResolver: undefined,
    });
  });

  it("resolves a JWKS URL without requiring a local key resolver", () => {
    const config = resolveRidAuthConfig({
      jwksUrl: "https://jwks.example.com/mw-rid.json",
    });
    expect(config.jwksUrl).toBe("https://jwks.example.com/mw-rid.json");
    expect(config.keyResolver).toBeUndefined();
    expect(() => new URL(config.jwksUrl ?? "")).not.toThrow();
  });
});
