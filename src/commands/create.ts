import { Command, flags } from "@oclif/command";
import { JWK } from "node-jose";
import * as path from "path";
import cli from "cli-ux";
import { exists, storeData } from "../utils/storage";

export default class Create extends Command {
    static description = "Creates a new JWKS";

    static examples = [
        `$ jwks-cloud-cli create
hello world from ./src/hello.ts!
`,
    ];

    static flags = {
        help: flags.help({ char: "h" }),
        force: flags.boolean({
            allowNo: true,
            char: "f",
            description: "Overwrite existing keys",
            default: false,
            type: "boolean",
        }),
        fileName: flags.string({
            description: "File Name",
            default: "jwks",
            env: "JWKS_FILE_NAME",
        }),
        folder: flags.string({
            default: "",
            required: false,
            name: "Upload folder for cloud storage",
            multiple: false,
            env: "JWKS_UPLOAD_FOLDER",
        }),
    };

    static args = [{ name: "file" }];

    isAbstractMode = false;

    async createJWKS(options: { force: boolean; fileName: string; folder: string }) {
        if (!this.isAbstractMode) cli.action.start("Checking if JWKS is already generated...");

        const folderpath = path.join(this.config.dataDir, "keys", options.folder);
        const publicJWKSFileName = options.fileName + ".json";
        const privateJWKSFileName = options.fileName + "-private.json";

        // Check if file exists
        const alreadyFileExists =
            (await exists(path.join(folderpath, publicJWKSFileName))) ||
            (await exists(path.join(folderpath, privateJWKSFileName)));

        if (!this.isAbstractMode) cli.action.stop(alreadyFileExists ? "JWKS Exists" : "JWKS doesn't exist");

        const confirmOverride =
            options.force ||
            (alreadyFileExists && (await cli.confirm("Continue to overwrite existing JWKS? (yes/no)")));

        if (alreadyFileExists && !confirmOverride) {
            this.log("Exiting...");
            this.exit(0);
        }

        cli.action.start("creating JWKS...");

        const jwks = JWK.createKeyStore();
        // Generate a JWKS add
        const jwk = await jwks.generate("RSA", 128);
        // add in first key
        jwks.add(jwk);
        cli.action.stop("done");

        const publicJWKS = jwks.toJSON();
        const privateJWKS = jwks.toJSON(true);

        cli.action.start("Storing JWKS locally...");
        await storeData({
            data: JSON.stringify(privateJWKS),
            fileName: privateJWKSFileName,
            folderpath: folderpath,
        });

        await storeData({
            data: JSON.stringify(publicJWKS),
            fileName: publicJWKSFileName,
            folderpath: folderpath,
        });

        // Store in PEM Format
        const publicKeyPEM = jwk.toPEM();
        const privateKeyPEM = jwk.toPEM(true);

        const publicKeyPEMFileName = `${options.fileName}.key.pub`;
        const privateKeyPEMFileName = `${options.fileName}.key`;

        await storeData({
            data: publicKeyPEM,
            fileName: publicKeyPEMFileName,
            folderpath: folderpath,
        });

        await storeData({
            data: privateKeyPEM,
            fileName: privateKeyPEMFileName,
            folderpath: folderpath,
        });

        cli.action.stop("done");

        return { publicJWKS, privateJWKS, publicKeyPEM, privateKeyPEM };
    }

    async run() {
        const { flags } = this.parse(Create);

        await this.createJWKS(flags);

        this.exit(0);
    }
}
