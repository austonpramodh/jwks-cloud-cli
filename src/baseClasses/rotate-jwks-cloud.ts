import cli from "cli-ux";
import * as path from "path";
import { storeData } from "../utils/storage";
import { CloudHelper } from "../cloudHelpers/cloud-helper.interface";
import Rotate from "../commands/rotate";

export default abstract class RotateJWKSCloud extends Rotate {
    cloudStorage: CloudHelper | null = null;

    async uploadfile(key: string, data: string, fileName: string, isPublicFile: boolean) {
        if (!this.cloudStorage) throw new Error("cloud Helper uninitialized");
        cli.action.start(`Uploading ${fileName}...`);
        const uploadedData = await this.cloudStorage.uploadFile(key, data, isPublicFile);
        cli.action.stop("done");
        return uploadedData;
    }

    async init() {
        super.init();
        // Turn on abstract mode for inherited class
        this.isAbstractMode = true;
    }

    async rotateJWKSAndUpload(options: {
        // fileName: string;
        folder: string;
        force: boolean;
    }) {
        if (!this.cloudStorage) throw new Error("cloudStorage not initialized");

        // name all the files
        // const publicJWKSFileName = `${options.fileName}.json`;
        // const privateKeyPEMFileName = `${options.fileName}.key`;
        const publicJWKSFileName = "jwks.json";
        const privateKeyPEMFileName = `jwtRS256.key`;

        // Upload Keys for files
        const keyFolder = `${options.folder.replace(/\/$/, "")}${options.folder ? "/" : ""}`;
        const publicJWKSkey = keyFolder + publicJWKSFileName;

        const privateKeyPEMkey = keyFolder + privateKeyPEMFileName;

        // FileStorage Folder
        const storageFolder = path.join(this.config.dataDir, "keys", options.folder);

        // Get Existing keys from cloud
        cli.action.start("Getting JWKS from cloud...");
        const rawPublicJWKSfile = await this.cloudStorage.getFileIfExists(publicJWKSkey);
        cli.action.stop("done");

        if (rawPublicJWKSfile) {
            await storeData({
                data: rawPublicJWKSfile,
                fileName: publicJWKSFileName,
                folderpath: storageFolder,
            });
            // write the files to storage
            this.log("JWKS present on cloud... Downloaded...");
        } else {
            // Remove already present JWKS from local if they exist
            this.log("JWKS File not found on cloud, Please create");
            this.exit();
        }

        // Create JWKS Keys
        const { privateKeyPEM, publicJWKS } = await this.rotateJWKS(options);
        // Upload the public jwks to the cloud
        await this.uploadfile(publicJWKSkey, JSON.stringify(publicJWKS), "PublicJWKS", true);
        // Upload private PEM
        await this.uploadfile(privateKeyPEMkey, privateKeyPEM, "Private Key PEM", false);
    }
}
