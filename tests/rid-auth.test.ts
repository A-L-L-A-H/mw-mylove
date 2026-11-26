import { describe, expect, it } from "bun:test";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { handleRequest, resolveConfig } from "../src/server.ts";
import { verifyRidAccessToken, type RidAuthConfig } from "../src/rid-auth.ts";

const TEST_ISSUER = "https://id.a-l-l-a-h.com";
const TEST_AUDIENCE = "urn:moonwitness:api";

async function createTestKeyFixture() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = "mylove-test-key-1";
  publicJwk.alg = "RS256";
  publicJwk.use = "sig";

  const keyResolver = createLocalJWKSet({ keys: [publicJwk] });
  const ridAuth: RidAuthConfig = {
    issuer: TEST_ISSUER,
    audience: TEST_AUDIENCE,
    keyResolver,
  };

  return { privateKey, ridAuth };
}

describe("mw-mylove mw-rid JWKS SSO verification (ADR-001)", () => {
  it("returns 200 { authenticated: false } on GET /api/auth/session without Authorization header", async () => {
    const config = resolveConfig();
    const response = await handleRequest(
      new Request("http://127.0.0.1:4460/api/auth/session"),
      config,
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as { authenticated: boolean };
    expect(body).toEqual({ authenticated: false });
  });

  it("verifies valid RS256 Bearer access token on GET /api/auth/session", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const accessToken = await new SignJWT({ scope: "openid api:read" })
      .setProtectedHeader({ alg: "RS256", typ: "at+jwt", kid: "mylove-test-key-1" })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);

    const config = resolveConfig({ ridAuth });
    const response = await handleRequest(
      new Request("http://127.0.0.1:4460/api/auth/session", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      config,
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      authenticated: boolean;
      subject: string;
      issuer: string;
      scope: string | null;
    };
    expect(body).toEqual({
      authenticated: true,
      subject: "usr-mylove-1",
      issuer: TEST_ISSUER,
      scope: "openid api:read",
    });
  });

  it("rejects forged HS256 token with 401 fail-closed", async () => {
    const { ridAuth } = await createTestKeyFixture();
    const forgedSecret = new TextEncoder().encode("forged-symmetric-secret-key");
    const forgedToken = await new SignJWT({ scope: "api:read" })
      .setProtectedHeader({ alg: "HS256", typ: "at+jwt" })
      .setSubject("usr-attacker")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(forgedSecret);

    await expect(verifyRidAccessToken(forgedToken, ridAuth)).rejects.toThrow();

    const config = resolveConfig({ ridAuth });
    const response = await handleRequest(
      new Request("http://127.0.0.1:4460/api/auth/session", {
        headers: { Authorization: `Bearer ${forgedToken}` },
      }),
      config,
    );
    expect(response.status).toBe(401);
  });

  it("rejects OIDC ID token (token_use === 'id') with 401", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const idToken = await new SignJWT({ token_use: "id" })
      .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: "mylove-test-key-1" })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);

    await expect(verifyRidAccessToken(idToken, ridAuth)).rejects.toThrow(/ID tokens are rejected/i);

    const config = resolveConfig({ ridAuth });
    const response = await handleRequest(
      new Request("http://127.0.0.1:4460/api/auth/session", {
        headers: { Authorization: `Bearer ${idToken}` },
      }),
      config,
    );
    expect(response.status).toBe(401);
  });

  it("rejects wrong issuer and wrong audience", async () => {
    const { privateKey, ridAuth } = await createTestKeyFixture();
    const wrongIssuerToken = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256", typ: "at+jwt", kid: "mylove-test-key-1" })
      .setSubject("usr-mylove-1")
      .setIssuer("https://evil.example.com")
      .setAudience(TEST_AUDIENCE)
      .setExpirationTime("15m")
      .sign(privateKey);

    const wrongAudienceToken = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256", typ: "at+jwt", kid: "mylove-test-key-1" })
      .setSubject("usr-mylove-1")
      .setIssuer(TEST_ISSUER)
      .setAudience("urn:wrong:audience")
      .setExpirationTime("15m")
      .sign(privateKey);

    await expect(verifyRidAccessToken(wrongIssuerToken, ridAuth)).rejects.toThrow();
    await expect(verifyRidAccessToken(wrongAudienceToken, ridAuth)).rejects.toThrow();
  });
});
