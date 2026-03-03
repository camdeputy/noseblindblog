import type {
    APIGatewayRequestSimpleAuthorizerHandlerV2WithContext,
    APIGatewaySimpleAuthorizerWithContextResult
} from "aws-lambda";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(new URL("https://oidc.vercel.com/.well-known/jwks"));
const VERCEL_ISSUER = "https://oidc.vercel.com";
const EXPECTED_AUD = "https://aws.amazon.com/sts";
const EXPECTED_PROJECT = process.env.VERCEL_PROJECT_NAME ?? "noseblindblog";

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
    const authHeader = event.headers?.["authorization"] ?? event.headers?.["Authorization"] ?? "";

    if (!authHeader.startsWith("Bearer ")) {
        return DENY;
    }

    const token = authHeader.slice(7);

    // Primary path: validate as a Vercel OIDC JWT
    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: VERCEL_ISSUER,
            audience: EXPECTED_AUD,
        });

        const sub = typeof payload.sub === "string" ? payload.sub : "";
        if (!sub.includes(`project:${EXPECTED_PROJECT}`)) {
            console.warn(`[auth] sub claim does not match expected project: ${sub}`);
            return DENY;
        }

        return { isAuthorized: true, context: { isAdmin: true } };
    } catch {
        // Not a valid Vercel OIDC JWT — fall through to static key check
    }

    return DENY;
};
