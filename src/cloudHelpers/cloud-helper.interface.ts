export interface CloudHelper {
    getFileIfExists(key: string): Promise<string | null>;

    uploadFile(key: string, data: string): Promise<void>;
}
