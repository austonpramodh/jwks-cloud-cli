import { AWSUploadHelper } from "../cloudHelpers/AWS";
import RotateJWKSCloud from "../baseClasses/rotate-jwks-cloud";

export default class RotateAWS extends RotateJWKSCloud {
    static description = "Creates a new JWKS on S3";

    static examples = [
        `$ jwks-cloud-cli create
hello world from ./src/hello.ts!
`,
    ];

    static flags = {
        ...RotateJWKSCloud.flags,
        ...AWSUploadHelper.flags,
    };

    static args = [{ name: "file" }];

    async run() {
        const { flags } = this.parse(RotateAWS);

        // Initialize the cloudstorage
        this.cloudStorage = new AWSUploadHelper({
            accessKeyId: flags.S3_ACCESS_KEY_ID,
            secretAccessKey: flags.S3_ACCESS_KEY_SECRET,
            endpoint: flags.S3_ENDPOINT,
            bucket: flags.S3_BUCKET,
        });

        await this.rotateJWKSAndUpload(flags);

        this.exit(0);
    }
}
