import { S3Client } from '@aws-sdk/client-s3';
import { fromWebToken } from '@aws-sdk/credential-providers';
import { getVercelOidcToken } from '@vercel/oidc';

/**
 * Returns an S3Client authenticated via Vercel OIDC → STS AssumeRoleWithWebIdentity.
 * Must be called inside a request handler (getVercelOidcToken() requires request context).
 */
export async function getS3Client(): Promise<S3Client> {
    const token = await getVercelOidcToken();
    return new S3Client({
        region: process.env.AWS_MEDIA_REGION!,
        credentials: fromWebToken({
            roleArn: process.env.AWS_MEDIA_ROLE_ARN!,
            webIdentityToken: token,
            roleSessionName: 'noseblind-media',
        }),
    });
}
