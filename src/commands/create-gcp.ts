import CreateCommand from "./create";
import { GCPUploadHelper } from "../cloudHelpers/gcp";
import CreateJWKSCloud from "../baseClasses/create-jwks-cloud";

export default class CreateAWS extends CreateJWKSCloud {
    static description = "Creates a new JWKS on GCP";

    static examples = [
        `$ jwks-cloud-cli create
hello world from ./src/hello.ts!
`,
    ];

    static flags = {
        ...CreateCommand.flags,
        ...GCPUploadHelper.flags,
    };

    static args = [{ name: "file" }];

    async run() {
        const { flags } = this.parse(CreateAWS);

        // Initialize the cloudstorage
        this.cloudStorage = new GCPUploadHelper({
            keyFilename: flags.KEY_FILENAME,
            bucket: flags.BUCKET,
        });

        await this.createJWKSAndUpload(flags);

        this.exit(0);
    }
}
