import { flags } from "@oclif/command";
import S3 from "aws-sdk/clients/s3";
import { CloudHelper } from "./cloud-helper.interface";

interface AWSUploadHelperOptions {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
    bucket: string;
}

export class AWSUploadHelper implements CloudHelper {
    static flags = {
        S3_ACCESS_KEY_ID: flags.string({ required: true, char: "i", env: "S3_ACCESS_KEY_ID" }),
        S3_ACCESS_KEY_SECRET: flags.string({ required: true, char: "k", env: "S3_ACCESS_KEY_SECRET" }),
        S3_ENDPOINT: flags.string({ required: false, char: "e", env: "S3_ENDPOINT" }),
        S3_BUCKET: flags.string({ required: true, char: "b", env: "S3_ENDPOINT" }),
    };

    private s3: S3;

    private bucket: string;

    constructor(options: AWSUploadHelperOptions) {
        this.s3 = new S3({
            credentials: {
                accessKeyId: options.accessKeyId,
                secretAccessKey: options.secretAccessKey,
            },
            endpoint: options.endpoint,
        });
        this.bucket = options.bucket;
    }

    async getFileIfExists(key: string): Promise<string | null> {
        try {
            const rawFile = await this.s3
                .getObject({
                    Bucket: this.bucket,
                    Key: key,
                })
                .promise();

            if (!rawFile.Body) return null;

            return rawFile.Body.toString();
        } catch (error) {
            if (error.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async uploadFile(key: string, data: string, isPublic?: boolean) {
        await this.s3
            .putObject({
                Bucket: this.bucket,
                Body: data,
                Key: key,
                ContentType: "application/json",
                ACL: isPublic ? "public-read" : undefined,
            })
            .promise();
    }
}
