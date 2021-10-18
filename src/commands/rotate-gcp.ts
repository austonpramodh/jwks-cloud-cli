import { GCPUploadHelper } from "../cloudHelpers/gcp";
import RotateJWKSCloud from "../baseClasses/rotate-jwks-cloud";

export default class RotateGCP extends RotateJWKSCloud {
    static description = "Creates a new JWKS on S3";

    static examples = [
        `$ jwks-cloud-cli create
hello world from ./src/hello.ts!
`,
    ];

    static flags = {
        ...RotateJWKSCloud.flags,
        ...GCPUploadHelper.flags,
    };

    static args = [{ name: "file" }];

    async run() {
        const { flags } = this.parse(RotateGCP);

        // Initialize the cloudstorage
        this.cloudStorage = new GCPUploadHelper({
            bucket: flags.BUCKET,
            keyFilename: flags.KEY_FILENAME,
        });

        await this.rotateJWKSAndUpload(flags);

        this.exit(0);
    }
}
