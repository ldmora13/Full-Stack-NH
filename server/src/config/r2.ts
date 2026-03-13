import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_API_URL,
    credentials: {
        accessKeyId: (process.env.R2_ACCESS_KEY_ID) || '',
        secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY) || '',
    },
});

export const R2_CONFIG = {
    bucket: (process.env.R2_BUCKET_NAME) || 'advisory-tickets-bucket',
};

export { r2Client };
