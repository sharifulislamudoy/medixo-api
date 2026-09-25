import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

export type StoredDocument = {
  publicId: string;
  resourceType: "image" | "raw";
  format: string;
};

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are missing in the API .env file");
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadVerificationDocument(file: {
  buffer: Buffer;
  mimetype: string;
}): Promise<StoredDocument> {
  configureCloudinary();
  const isPdf = file.mimetype === "application/pdf";
  const resourceType = isPdf ? "raw" : "image";
  const publicId = `${randomUUID()}${isPdf ? ".pdf" : ""}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "medixo/verification",
        public_id: publicId,
        resource_type: resourceType,
        type: "authenticated",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          publicId: result.public_id,
          resourceType,
          format: result.format || (isPdf ? "pdf" : "jpg"),
        });
      },
    );
    stream.end(file.buffer);
  });
}

export async function deleteVerificationDocument(document: StoredDocument) {
  configureCloudinary();
  await cloudinary.uploader.destroy(document.publicId, {
    resource_type: document.resourceType,
    type: "authenticated",
    invalidate: true,
  });
}

export function verificationDocumentDownloadUrl(document: StoredDocument) {
  configureCloudinary();
  return cloudinary.utils.private_download_url(
    document.publicId,
    document.format,
    {
      resource_type: document.resourceType,
      type: "authenticated",
      expires_at: Math.floor(Date.now() / 1000) + 60,
      attachment: true,
    },
  );
}
