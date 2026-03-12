import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_CONFIG } from '../config/r2';

export class AttachmentService {
    static async signUrl(url: string): Promise<string> {
        if (url.startsWith('r2://')) {
            const key = url.replace('r2://', '');
            try {
                return await getSignedUrl(r2Client, new GetObjectCommand({
                    Bucket: R2_CONFIG.bucket,
                    Key: key,
                }), { expiresIn: 3600 }); // 1 hour
            } catch (error) {
                console.error('Error signing R2 URL:', error);
                return url; // Fallback to original
            }
        }
        return url;
    }

    static async signAttachments<T extends { url: string }>(attachments: T[]): Promise<T[]> {
        return Promise.all(attachments.map(async (att) => ({
            ...att,
            url: await this.signUrl(att.url)
        })));
    }
}
