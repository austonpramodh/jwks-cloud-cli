import CreateCommand from "../commands/create";
import cli from "cli-ux";
import * as path from "path";
import { deleteIfExists, storeKeys } from "../utils/storage";
import { CloudHelper } from "../cloudHelpers/cloud-helper.interface";

export default abstract class CreateJWKSCloud extends CreateCommand {
    cloudStorage: CloudHelper | null = null;

    async uploadfile(key: string, data: string, fileName: string) {
        if (!this.cloudStorage) throw new Error("cloud Helper uninitialized");
        cli.action.start(`Uploading ${fileName}...`);
        const uploadedData = await this.cloudStorage.uploadFile(key, data);
        cli.action.stop("done");
        return uploadedData;
    }

    async init() {
        super.init();
        // Turn on abstract mode for inherited class
        this.isAbstractMode = true;
    }

    async createJWKSAndUpload(options: { fileName: string; folder: string; force: boolean }) {
        if (!this.cloudStorage) throw new Error("cloudStorage not initialized");

        // name all the files
        const privateJWKSFileName = `${options.fileName}-private.json`;
        const publicJWKSFileName = `${options.fileName}.json`;

        // Upload Keys for files
        const privateJWKSkey = `${options.folder.replace(/\/$/, "")}${options.folder ? "/" : ""}${privateJWKSFileName}`;
        const publicJWKSkey = `${options.folder.replace(/\/$/, "")}${options.folder ? "/" : ""}${publicJWKSFileName}`;

        // FileStorage Folder
        const storageFolder = path.join(this.config.dataDir, "keys", options.folder);

        // Get Existing keys from cloud
        cli.action.start("Getting JWKS from cloud...");
        const rawPrivateJWKSfile = await this.cloudStorage.getFileIfExists(privateJWKSkey);
        const rawPublicJWKSfile = await this.cloudStorage.getFileIfExists(publicJWKSkey);
        cli.action.stop("done");

        if (!rawPrivateJWKSfile || !rawPublicJWKSfile) {
            // Remove already present JWKS from local if they exist
            await deleteIfExists(storageFolder, privateJWKSFileName);
            await deleteIfExists(storageFolder, publicJWKSFileName);
            this.log("JWKS Files not found on cloud");
        } else {
            await storeKeys({
                privateJWKS: rawPrivateJWKSfile,
                publicJWKS: rawPublicJWKSfile,
                privateJWKSFileName,
                publicJWKSFileName,
                folderpath: storageFolder,
            });
            // write the files to storage
            this.log("JWKS already present on cloud... Downloaded...");
        }

        // Create JWKS Keys
        const jwks = await this.createJWKS(options);
        // Upload the jwks to the aws cloud
        await this.uploadfile(privateJWKSkey, JSON.stringify(jwks.privateJWKS), "PrivateJWKS");
        await this.uploadfile(publicJWKSkey, JSON.stringify(jwks.publicJWKS), "PublicJWKS");
    }
}
