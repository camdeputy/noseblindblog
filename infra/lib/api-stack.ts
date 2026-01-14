import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";


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




        const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
            apiName: "blog-http-api"
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

        new cdk.CfnOutput(this, "ApiBaseUrl", {
            value: httpApi.apiEndpoint
        });
    }
}
