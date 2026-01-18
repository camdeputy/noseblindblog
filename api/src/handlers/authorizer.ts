import type {
    APIGatewayRequestSimpleAuthorizerHandlerV2WithContext,
    APIGatewaySimpleAuthorizerWithContextResult
} from "aws-lambda";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({});
const SECRET_ARN = process.env.ADMIN_API_KEY_SECRET_ARN;

// Cache the secret to avoid fetching on every request
let cachedApiKey: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getAdminApiKey(): Promise<string | null> {
    if (cachedApiKey && Date.now() < cacheExpiry) {
        return cachedApiKey;
    }

    if (!SECRET_ARN) {
        console.error("ADMIN_API_KEY_SECRET_ARN environment variable not set");
        return null;
    }

    try {
        const response = await secretsManager.send(
            new GetSecretValueCommand({ SecretId: SECRET_ARN })
        );
        cachedApiKey = response.SecretString ?? null;
        cacheExpiry = Date.now() + CACHE_TTL_MS;
        return cachedApiKey;
    } catch (error) {
        console.error("Failed to fetch secret from Secrets Manager:", error);
        return null;
    }
}

interface AuthContext {
    isAdmin: boolean;
}

export const handler: APIGatewayRequestSimpleAuthorizerHandlerV2WithContext<AuthContext> = async (
    event
): Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthContext>> => {
    const adminApiKey = await getAdminApiKey();

    if (!adminApiKey) {
        return {
            isAuthorized: false,
            context: { isAdmin: false }
        };
    }

    const apiKey = event.headers?.["x-api-key"];

    if (!apiKey || apiKey !== adminApiKey) {
        return {
            isAuthorized: false,
            context: { isAdmin: false }
        };
    }

    return {
        isAuthorized: true,
        context: { isAdmin: true }
    };
};
