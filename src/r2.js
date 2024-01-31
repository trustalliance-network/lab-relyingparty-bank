import {AwsClient} from "aws4fetch";

export const r2Endpoint = `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`;

const r2 = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_ACCESS_KEY_SECRET,
  service: 's3',
  endpoint: r2Endpoint,
  region: 'auto',
  signatureVersion: 'v4',
});

export default r2;
