import type {
    APIGatewayRequestSimpleAuthorizerHandlerV2WithContext,
    APIGatewaySimpleAuthorizerWithContextResult
} from "aws-lambda";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

interface AuthContext {
    isAdmin: boolean;
}

export const handler: APIGatewayRequestSimpleAuthorizerHandlerV2WithContext<AuthContext> = async (
    event
): Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthContext>> => {
    if (!ADMIN_API_KEY) {
        console.error("ADMIN_API_KEY environment variable not set");
        return {
            isAuthorized: false,
            context: { isAdmin: false }
        };
    }

    const apiKey = event.headers?.["x-api-key"];

    if (!apiKey || apiKey !== ADMIN_API_KEY) {
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
