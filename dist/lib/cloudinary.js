"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVerificationDocument = uploadVerificationDocument;
exports.deleteVerificationDocument = deleteVerificationDocument;
exports.verificationDocumentDownloadUrl = verificationDocumentDownloadUrl;
const node_crypto_1 = require("node:crypto");
const cloudinary_1 = require("cloudinary");
function configureCloudinary() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary credentials are missing in the API .env file");
    }
    cloudinary_1.v2.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });
}
async function uploadVerificationDocument(file) {
    configureCloudinary();
    const isPdf = file.mimetype === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";
    const publicId = `${(0, node_crypto_1.randomUUID)()}${isPdf ? ".pdf" : ""}`;
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: "medixo/verification",
            public_id: publicId,
            resource_type: resourceType,
            type: "authenticated",
            overwrite: false,
        }, (error, result) => {
            if (error || !result) {
                reject(error || new Error("Cloudinary upload failed"));
                return;
            }
            resolve({
                publicId: result.public_id,
                resourceType,
                format: result.format || (isPdf ? "pdf" : "jpg"),
            });
        });
        stream.end(file.buffer);
    });
}
async function deleteVerificationDocument(document) {
    configureCloudinary();
    await cloudinary_1.v2.uploader.destroy(document.publicId, {
        resource_type: document.resourceType,
        type: "authenticated",
        invalidate: true,
    });
}
function verificationDocumentDownloadUrl(document) {
    configureCloudinary();
    return cloudinary_1.v2.utils.private_download_url(document.publicId, document.format, {
        resource_type: document.resourceType,
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + 60,
        attachment: true,
    });
}
