"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.generateUniqueSlug = generateUniqueSlug;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Convert a string into a URL-friendly slug.
 */
function slugify(text) {
    return text
        .toString()
        .normalize('NFD') // split accented characters
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // spaces to hyphens
        .replace(/[^\w\-]+/g, '') // remove non-word chars
        .replace(/\-\-+/g, '-'); // replace multiple hyphens
}
/**
 * Generate a unique slug by appending a counter if necessary.
 */
async function generateUniqueSlug(baseSlug, prismaInstance = prisma, excludeId) {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await prismaInstance.product.findFirst({
            where: {
                slug,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
        if (!existing)
            break;
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}
