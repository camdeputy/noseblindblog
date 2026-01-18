import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";


export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const tableName = this.node.tryGetContext("tableName") as string;
        if (!tableName) {
            throw new Error("Missing context value: tableName (pass -c tableName=YOUR_TABLE)");
        }
        const postsTable = dynamodb.Table.fromTableName(this, "BlogPosts", tableName);

        const contentBucketName = this.node.tryGetContext("contentBucketName");
        if (typeof contentBucketName !== "string" || contentBucketName.trim().length === 0) {
            throw new Error(
                "Missing or empty context: contentBucketName. Deploy with: -c contentBucketName=YOUR_BUCKET"
            );
        }
        const contentBucket = s3.Bucket.fromBucketName(this, "noseblindblog-content", contentBucketName);

        // Admin API key stored in Secrets Manager
        const adminApiKeySecret = new secretsmanager.Secret(this, "AdminApiKeySecret", {
            secretName: "noseblindblog/admin-api-key",
            description: "API key for admin endpoints",
            generateSecretString: {
                excludePunctuation: true,
                passwordLength: 32
            }
        });

        // Admin API key authorizer
        const authorizerFn = new lambdaNodejs.NodejsFunction(this, "AuthorizerFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/authorizer.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            environment: {
                ADMIN_API_KEY_SECRET_ARN: adminApiKeySecret.secretArn
            }
        });
        adminApiKeySecret.grantRead(authorizerFn);

        const adminAuthorizer = new authorizers.HttpLambdaAuthorizer(
            "AdminAuthorizer",
            authorizerFn,
            {
                responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE],
                identitySource: ["$request.header.x-api-key"]
            }
        );

        const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
            apiName: "blog-http-api",
            corsPreflight: {
                allowOrigins: ["*"],
                allowMethods: [
                    apigwv2.CorsHttpMethod.GET,
                    apigwv2.CorsHttpMethod.POST,
                    apigwv2.CorsHttpMethod.PUT,
                    apigwv2.CorsHttpMethod.DELETE,
                    apigwv2.CorsHttpMethod.OPTIONS
                ],
                allowHeaders: ["Content-Type", "Authorization", "x-api-key"],
                maxAge: cdk.Duration.days(1)
            }
        });

        const healthFn = new lambdaNodejs.NodejsFunction(this, "HealthFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/health.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(10)
        });

        const postsListFn = new lambdaNodejs.NodejsFunction(this, "PostsListFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/posts-list.ts",
            handler: "handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: tableName
            }
        });
        postsListFn.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["dynamodb:Query"],
                resources: [
                    postsTable.tableArn,
                    `${postsTable.tableArn}/index/published-index`
                ]
            })
        );
        postsTable.grantReadData(postsListFn);

        const postsGetBySlugFn = new lambdaNodejs.NodejsFunction(this, "PostsGetBySlugFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/posts-get-by-slug.ts",
            handler: "handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: tableName,
                CONTENT_BUCKET: contentBucketName
            }
        });
        postsGetBySlugFn.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["dynamodb:Query"],
                resources: [
                    postsTable.tableArn,
                    `${postsTable.tableArn}/index/slug-index`
                ]
            })
        );
        contentBucket.grantRead(postsGetBySlugFn);

        httpApi.addRoutes({
            path: "/health",
            methods: [apigwv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration(
                "HealthIntegration",
                healthFn
            )
        });

        httpApi.addRoutes({
            path: "/posts",
            methods: [apigwv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration("PostsListIntegration", postsListFn)
        });

        httpApi.addRoutes({
            path: "/posts/{slug}",
            methods: [apigwv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration(
                "PostsGetBySlugIntegration",
                postsGetBySlugFn
            )
        });

        // Admin handlers
        const adminPostsListFn = new lambdaNodejs.NodejsFunction(this, "AdminPostsListFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/admin-posts-list.ts",
            handler: "handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: tableName
            }
        });
        adminPostsListFn.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["dynamodb:Scan"],
                resources: [postsTable.tableArn]
            })
        );

        const adminPostsCreateFn = new lambdaNodejs.NodejsFunction(this, "AdminPostsCreateFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/admin-posts-create.ts",
            handler: "handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: tableName,
                CONTENT_BUCKET: contentBucketName
            }
        });
        adminPostsCreateFn.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["dynamodb:PutItem"],
                resources: [postsTable.tableArn]
            })
        );
        contentBucket.grantWrite(adminPostsCreateFn);

        const adminPostsUpdateFn = new lambdaNodejs.NodejsFunction(this, "AdminPostsUpdateFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/admin-posts-update.ts",
            handler: "handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: tableName,
                CONTENT_BUCKET: contentBucketName
            }
        });
        adminPostsUpdateFn.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["dynamodb:Query", "dynamodb:UpdateItem"],
                resources: [
                    postsTable.tableArn,
                    `${postsTable.tableArn}/index/slug-index`
                ]
            })
        );
        contentBucket.grantWrite(adminPostsUpdateFn);

        const adminPostsDeleteFn = new lambdaNodejs.NodejsFunction(this, "AdminPostsDeleteFn", {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: "../api/src/handlers/admin-posts-delete.ts",
            handler: "handler",
            memorySize: 256,
            timeout: cdk.Duration.seconds(10),
            environment: {
                TABLE_NAME: tableName,
                CONTENT_BUCKET: contentBucketName
            }
        });
        adminPostsDeleteFn.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["dynamodb:Query", "dynamodb:DeleteItem"],
                resources: [
                    postsTable.tableArn,
                    `${postsTable.tableArn}/index/slug-index`
                ]
            })
        );
        contentBucket.grantDelete(adminPostsDeleteFn);

        httpApi.addRoutes({
            path: "/admin/posts",
            methods: [apigwv2.HttpMethod.GET],
            integration: new integrations.HttpLambdaIntegration(
                "AdminPostsListIntegration",
                adminPostsListFn
            ),
            authorizer: adminAuthorizer
        });

        httpApi.addRoutes({
            path: "/admin/posts",
            methods: [apigwv2.HttpMethod.POST],
            integration: new integrations.HttpLambdaIntegration(
                "AdminPostsCreateIntegration",
                adminPostsCreateFn
            ),
            authorizer: adminAuthorizer
        });

        httpApi.addRoutes({
            path: "/admin/posts/{slug}",
            methods: [apigwv2.HttpMethod.PUT],
            integration: new integrations.HttpLambdaIntegration(
                "AdminPostsUpdateIntegration",
                adminPostsUpdateFn
            ),
            authorizer: adminAuthorizer
        });

        httpApi.addRoutes({
            path: "/admin/posts/{slug}",
            methods: [apigwv2.HttpMethod.DELETE],
            integration: new integrations.HttpLambdaIntegration(
                "AdminPostsDeleteIntegration",
                adminPostsDeleteFn
            ),
            authorizer: adminAuthorizer
        });

        new cdk.CfnOutput(this, "ApiBaseUrl", {
            value: httpApi.apiEndpoint
        });

        new cdk.CfnOutput(this, "AdminApiKeySecretArn", {
            value: adminApiKeySecret.secretArn,
            description: "ARN of the admin API key secret in Secrets Manager"
        });
    }
}
