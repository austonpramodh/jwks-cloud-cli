import { flags } from "@oclif/command";
import { Storage } from "@google-cloud/storage";
import { CloudHelper } from "./cloud-helper.interface";

interface GCPUploadHelperOptions {
    keyFilename: string;
    bucket: string;
}

export class GCPUploadHelper implements CloudHelper {
    static flags = {
        KEY_FILENAME: flags.string({ required: true, char: "k", env: "KEY_FILENAME" }),
        BUCKET: flags.string({ required: true, char: "b", env: "BUCKET" }),
    };

    private storage: Storage;

    private bucket: string;

    constructor(options: GCPUploadHelperOptions) {
        this.storage = new Storage({
            keyFilename: options.keyFilename,
        });
        this.bucket = options.bucket;
    }

    async getFileIfExists(key: string): Promise<string | null> {
        try {
            const rawFile = await this.storage.bucket(this.bucket).file(key).download();

            if (!rawFile) return null;

            return rawFile.toString();
        } catch (error) {
            if (error.code === 404) {
                return null;
            }
            throw error;
        }
    }

    async uploadFile(key: string, data: string, isPublic?: boolean) {
        const bucket = this.storage.bucket(this.bucket);

        await bucket.file(key).save(data, { public: isPublic });
    }
}
