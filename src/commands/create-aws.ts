import CreateCommand from "./create";
import cli from "cli-ux";
import { AWSUploadHelper } from "../cloudHelpers/AWS";
import * as path from "path";
import { deleteIfExists, storeKeys } from "../utils/storage";
import { CloudHelper } from "../cloudHelpers/cloud-helper.interface";

export default class CreateAWS extends CreateCommand {
    static description = "Creates a new JWKS";

    static examples = [
        `$ jwks-cloud-cli create
hello world from ./src/hello.ts!
`,
    ];

    static flags = {
        ...CreateCommand.flags,
        ...AWSUploadHelper.flags,
    };

    static args = [{ name: "file" }];

    private cloudStorage: CloudHelper | null = null;

    async uploadfile(key: string, data: string, fileName: string) {
        if (!this.cloudStorage) throw new Error("S3 Helper uninitialized");
        cli.action.start(`Uploading ${fileName}...`);
        const uploadedData = await this.cloudStorage.uploadFile(key, data);
        cli.action.stop("done");
        return uploadedData;
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

        // Get Existing keys from S3
        cli.action.start("Getting JWKS from S3...");
        const rawPrivateJWKSfile = await this.cloudStorage.getFileIfExists(privateJWKSkey);
        const rawPublicJWKSfile = await this.cloudStorage.getFileIfExists(publicJWKSkey);
        cli.action.stop("done");

        if (!rawPrivateJWKSfile || !rawPublicJWKSfile) {
            // Remove already present JWKS from local if they exist
            await deleteIfExists(storageFolder, privateJWKSFileName);
            await deleteIfExists(storageFolder, publicJWKSFileName);
            this.log("JWKS Files not found on S3");
        } else {
            await storeKeys({
                privateJWKS: rawPrivateJWKSfile,
                publicJWKS: rawPublicJWKSfile,
                privateJWKSFileName,
                publicJWKSFileName,
                folderpath: storageFolder,
            });
            // write the files to storage
            this.log("JWKS already present on S3... Downloaded...");
        }

        // Create JWKS Keys
        const jwks = await this.createJWKS(options);
        // Upload the jwks to the aws S3
        await this.uploadfile(privateJWKSkey, JSON.stringify(jwks.privateJWKS), "PrivateJWKS");
        await this.uploadfile(publicJWKSkey, JSON.stringify(jwks.publicJWKS), "PublicJWKS");
    }

    async run() {
        // Turn on abstract mode for inherited class
        this.isAbstractMode = true;

        const { flags } = this.parse(CreateAWS);

        // Initialize the cloudstorage
        this.cloudStorage = new AWSUploadHelper({
            accessKeyId: flags.S3_ACCESS_KEY_ID,
            secretAccessKey: flags.S3_ACCESS_KEY_SECRET,
            endpoint: flags.S3_ENDPOINT,
            bucket: flags.S3_BUCKET,
        });

        await this.createJWKSAndUpload(flags);
        this.exit(0);
    }
}
