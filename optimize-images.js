/**
 * Image Optimization Script
 * 
 * This script converts all JPG/PNG images in a specified directory to WebP format
 * using Sharp library for optimal compression and quality.
 * 
 * Features:
 * - Recursive directory scanning
 * - WebP conversion with configurable quality
 * - Skip already converted images
 * - Detailed progress reporting
 * - Statistics summary
 * 
 * Usage: node optimize-images.js [options]
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    // Directory to scan (relative to script location)
    ASSETS_DIR: process.env.ASSETS_DIR || path.join(__dirname, '../src/assets/images'),

    // Supported input formats
    SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png'],

    // WebP quality (0-100, higher = better quality but larger file)
    WEBP_QUALITY: parseInt(process.env.WEBP_QUALITY) || 80,

    // WebP effort (0-6, higher = slower but better compression)
    WEBP_EFFORT: parseInt(process.env.WEBP_EFFORT) || 6,
};

// Statistics tracking
let stats = {
    totalFiles: 0,
    converted: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    webpSize: 0,
};

/**
 * Get all image files recursively from a directory
 * @param {string} dir - Directory to scan
 * @returns {Promise<string[]>} Array of image file paths
 */
async function getImageFiles(dir) {
    const files = [];

    try {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Recursively scan subdirectories
                files.push(...await getImageFiles(fullPath));
            } else if (CONFIG.SUPPORTED_FORMATS.includes(path.extname(item.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`❌ Error reading directory ${dir}:`, error.message);
    }

    return files;
}

/**
 * Convert a single image to WebP format
 * @param {string} imagePath - Path to the image file
 */
async function convertImage(imagePath) {
    try {
        const ext = path.extname(imagePath);
        const webpPath = imagePath.replace(ext, '.webp');

        // Check if WebP already exists
        const webpExists = await fs.access(webpPath).then(() => true).catch(() => false);

        if (webpExists) {
            console.log(`⏭️  Skipped (already exists): ${path.basename(imagePath)}`);
            stats.skipped++;
            return;
        }

        // Get original file size
        const originalStats = await fs.stat(imagePath);
        stats.originalSize += originalStats.size;

        // Load image with Sharp
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        console.log(`🔄 Converting: ${path.basename(imagePath)} (${metadata.width}x${metadata.height})`);

        // Convert to WebP
        await image
            .clone()
            .webp({
                quality: CONFIG.WEBP_QUALITY,
                effort: CONFIG.WEBP_EFFORT
            })
            .toFile(webpPath);

        const webpStats = await fs.stat(webpPath);
        stats.webpSize += webpStats.size;

        const savings = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
        console.log(`  ✅ WebP: ${formatBytes(webpStats.size)} (${savings}% smaller)`);

        stats.converted++;
    } catch (error) {
        console.error(`❌ Error converting ${imagePath}:`, error.message);
        stats.errors++;
    }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Print configuration
 */
function printConfig() {
    console.log('\n📋 Configuration:');
    console.log('='.repeat(60));
    console.log(`Assets Directory: ${CONFIG.ASSETS_DIR}`);
    console.log(`Supported Formats: ${CONFIG.SUPPORTED_FORMATS.join(', ')}`);
    console.log(`WebP Quality: ${CONFIG.WEBP_QUALITY}`);
    console.log(`WebP Effort: ${CONFIG.WEBP_EFFORT}`);
    console.log('='.repeat(60) + '\n');
}

/**
 * Print summary statistics
 */
function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total images found:     ${stats.totalFiles}`);
    console.log(`Successfully converted: ${stats.converted}`);
    console.log(`Skipped (existing):     ${stats.skipped}`);
    console.log(`Errors:                 ${stats.errors}`);
    console.log('');
    console.log(`Original total size:    ${formatBytes(stats.originalSize)}`);
    console.log(`WebP total size:        ${formatBytes(stats.webpSize)}`);
    console.log('');

    if (stats.originalSize > 0) {
        const webpSavings = ((1 - stats.webpSize / stats.originalSize) * 100).toFixed(1);
        console.log(`💾 WebP savings:        ${webpSavings}% (${formatBytes(stats.originalSize - stats.webpSize)})`);
    }
    console.log('='.repeat(60));
    console.log('\n✨ Optimization complete!\n');
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting image optimization...\n');

    printConfig();

    console.log(`📁 Scanning directory: ${CONFIG.ASSETS_DIR}\n`);

    try {
        // Check if directory exists
        await fs.access(CONFIG.ASSETS_DIR);

        const imageFiles = await getImageFiles(CONFIG.ASSETS_DIR);
        stats.totalFiles = imageFiles.length;

        console.log(`📸 Found ${imageFiles.length} images to process\n`);

        if (imageFiles.length === 0) {
            console.log('⚠️  No images found. Please check the ASSETS_DIR path.');
            return;
        }

        // Process images sequentially to avoid memory issues
        for (const imagePath of imageFiles) {
            await convertImage(imagePath);
        }

        printSummary();

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`❌ Directory not found: ${CONFIG.ASSETS_DIR}`);
            console.error('💡 Tip: Set ASSETS_DIR environment variable or update the script configuration.');
        } else {
            console.error('❌ Fatal error:', error);
        }
        process.exit(1);
    }
}

main();
