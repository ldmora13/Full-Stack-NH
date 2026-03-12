import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_API_URL || `https://${isProduction ? process.env.R2_ACCOUNT_ID_PRODUCTION : process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: (isProduction ? process.env.R2_ACCESS_KEY_ID_PRODUCTION : process.env.R2_ACCESS_KEY_ID) || '',
        secretAccessKey: (isProduction ? process.env.R2_SECRET_ACCESS_KEY_PRODUCTION : process.env.R2_SECRET_ACCESS_KEY) || '',
    },
});

export const R2_CONFIG = {
    bucket: (isProduction ? process.env.R2_BUCKET_NAME_PRODUCTION : process.env.R2_BUCKET_NAME) || 'advisory-tickets-bucket',
};

export { r2Client };
