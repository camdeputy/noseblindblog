import type {
    APIGatewayRequestSimpleAuthorizerHandlerV2WithContext,
    APIGatewaySimpleAuthorizerWithContextResult
} from "aws-lambda";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Vercel OIDC docs: https://vercel.com/docs/oidc/reference
// iss:  https://oidc.vercel.com        (global mode)
//   or  https://oidc.vercel.com/<team> (team mode)
// aud:  https://vercel.com/<team-slug>
// sub:  owner:<team>:project:<project>:environment:<env>

const VERCEL_TEAM_SLUG = process.env.VERCEL_TEAM_SLUG ?? "";
const VERCEL_PROJECT_NAME = process.env.VERCEL_PROJECT_NAME ?? "noseblindblog";

// Support both global and team issuer modes by reading from env,
// defaulting to global mode.
const OIDC_ISSUER = process.env.VERCEL_OIDC_ISSUER ?? "https://oidc.vercel.com";
const JWKS_URL = `${OIDC_ISSUER}/.well-known/jwks`;
const EXPECTED_AUD = `https://vercel.com/${VERCEL_TEAM_SLUG}`;

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

interface AuthContext {
    isAdmin: boolean;
}

const DENY: APIGatewaySimpleAuthorizerWithContextResult<AuthContext> = {
    isAuthorized: false,
    context: { isAdmin: false }
};

export const handler: APIGatewayRequestSimpleAuthorizerHandlerV2WithContext<AuthContext> = async (
    event
): Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthContext>> => {
    if (!VERCEL_TEAM_SLUG) {
        console.error("[auth] VERCEL_TEAM_SLUG env var is not set");
        return DENY;
    }

    const authHeader = event.headers?.["authorization"] ?? event.headers?.["Authorization"] ?? "";

    if (!authHeader.startsWith("Bearer ")) {
        return DENY;
    }

    const token = authHeader.slice(7);

    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: OIDC_ISSUER,
            audience: EXPECTED_AUD,
        });

        const sub = typeof payload.sub === "string" ? payload.sub : "";
        if (!sub.includes(`project:${VERCEL_PROJECT_NAME}`)) {
            console.warn(`[auth] sub claim does not match expected project: ${sub}`);
            return DENY;
        }

        return { isAuthorized: true, context: { isAdmin: true } };
    } catch (err) {
        console.error("[auth] JWT verification failed:", err);
        return DENY;
    }
};
