import CreateCommand from "./create";
import { AWSUploadHelper } from "../cloudHelpers/AWS";
import CreateJWKSCloud from "../baseClasses/create-jwks-cloud";

export default class CreateAWS extends CreateJWKSCloud {
    static description = "Creates a new JWKS on S3";

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

    async run() {
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
