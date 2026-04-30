export function getStorageConfig() {
  return {
    bucket: process.env.S3_BUCKET ?? "darak-dev",
    region: process.env.S3_REGION ?? "eu-west-1",
    endpoint: process.env.S3_ENDPOINT ?? "https://example-s3.local"
  };
}

export async function createUploadUrl(filename: string) {
  const storage = getStorageConfig();
  return {
    filename,
    provider: "s3-compatible",
    uploadUrl: `${storage.endpoint}/${storage.bucket}/${filename}`
  };
}
