import { Command, flags } from "@oclif/command";
import { JWK } from "node-jose";
import * as path from "path";
import cli from "cli-ux";
import { exists, getData, storeData } from "../utils/storage";

export default class Rotate extends Command {
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

    async rotateJWKS(options: {
        force: boolean;
        // fileName: string;
        folder: string;
    }) {
        /**
         * check if keys exists
         * if not, stop
         * create new jwk
         * add it to jwk
         * generate pub jwks
         * remove unwanted jwk from jwks
         * generate priv JWKS
         * generate pub PEM
         * generate Priv PEM
         */
        if (!this.isAbstractMode) cli.action.start("Checking if JWKS exists...");

        const folderpath = path.join(this.config.dataDir, "keys", options.folder);
        // const publicJWKSFileName = options.fileName + ".json";
        // const privateKeyPEMFileName = `${options.fileName}.key`;
        const publicJWKSFileName = "jwks.json";
        const privateKeyPEMFileName = `jwtRS256.key`;

        // Check if file exists
        const alreadyFileExists = await exists(path.join(folderpath, publicJWKSFileName));

        if (!alreadyFileExists) {
            if (!this.isAbstractMode) cli.action.stop("JWKS doesnt exist, Please create one.");
            this.exit();
        }

        if (!this.isAbstractMode) cli.action.stop("JWKS Exists");

        const rawJWKS = await getData({ folderpath, fileName: publicJWKSFileName });

        const jwks = await JWK.asKeyStore(rawJWKS);

        cli.action.start("creating a new JWK...");

        // const jwks = JWK.();
        // Generate a JWKS add
        const jwk = await jwks.generate("RSA", 128);
        // add in first key
        jwks.add(jwk);
        cli.action.stop("done");

        const publicJWKS = jwks.toJSON();

        cli.action.start("Storing JWKS locally...");

        await storeData({
            data: JSON.stringify(publicJWKS),
            fileName: publicJWKSFileName,
            folderpath: folderpath,
        });

        cli.action.stop("done");

        cli.action.start("Storing Private PEM Key locally...");
        // Store private key in PEM Format
        const privateKeyPEM = jwk.toPEM(true);

        await storeData({
            data: privateKeyPEM,
            fileName: privateKeyPEMFileName,
            folderpath: folderpath,
        });

        cli.action.stop("done");

        return { publicJWKS, privateKeyPEM };
    }

    async run() {
        const { flags } = this.parse(Rotate);

        await this.rotateJWKS(flags);

        this.exit(0);
    }
}
