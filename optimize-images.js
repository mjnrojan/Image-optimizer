#!/usr/bin/env node

/**
 * Image & GIF Optimization Script
 * 
 * This script converts images (JPG/PNG/GIF) to WebP or AVIF format
 * using Sharp library for optimal compression and quality.
 * 
 * Features:
 * - Recursive directory scanning
 * - WebP and AVIF conversion with configurable quality
 * - Animated GIF support with frame preservation
 * - Dynamic format selection (WebP or AVIF)
 * - Lossless mode via --lossless flag
 * - Skip already converted files
 * - Detailed progress reporting
 * - Statistics summary
 * 
 * Usage: 
 *   image-optimizer [input_files...] [options]
 *   
 * Options:
 *   webp        Output format (default)
 *   avif        Output format
 *   --lossless  Enable lossless compression
 *   
 * Examples:
 *   image-optimizer webp
 *   image-optimizer avif --lossless
 *   image-optimizer webp ./images/photo.jpg
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let formatArg = 'webp';
let isLossless = process.env.LOSSLESS === 'true';
const explicitFiles = [];

// Separate format arguments from file paths and flags
args.forEach(arg => {
    if (['webp', 'avif'].includes(arg.toLowerCase())) {
        formatArg = arg.toLowerCase();
    } else if (arg.toLowerCase() === '--lossless' || arg.toLowerCase() === '-l') {
        isLossless = true;
    } else {
        explicitFiles.push(arg);
    }
});

const OUTPUT_FORMAT = formatArg;

// Configuration
const CONFIG = {
    // Directory to scan (relative to script location)
    ASSETS_DIR: process.env.ASSETS_DIR || path.join(__dirname, './src/assets'),

    // Supported input formats
    SUPPORTED_IMAGE_FORMATS: ['.jpg', '.jpeg', '.png', '.gif'],
    SUPPORTED_VIDEO_FORMATS: ['.mp4', '.webm', '.mov'],

    // Output format
    OUTPUT_FORMAT: OUTPUT_FORMAT,

    // Lossless mode
    LOSSLESS: isLossless,

    // WebP quality (0-100, higher = better quality but larger file)
    WEBP_QUALITY: parseInt(process.env.WEBP_QUALITY) || 80,

    // WebP effort (0-6, higher = slower but better compression)
    WEBP_EFFORT: parseInt(process.env.WEBP_EFFORT) || 6,

    // AVIF quality (0-100, higher = better quality but larger file)
    AVIF_QUALITY: parseInt(process.env.AVIF_QUALITY) || 75,

    // AVIF effort (0-9, higher = slower but better compression)
    AVIF_EFFORT: parseInt(process.env.AVIF_EFFORT) || 6,
};

// Statistics tracking
let stats = {
    totalFiles: 0,
    converted: 0,
    skipped: 0,
    errors: 0,
    originalSize: 0,
    outputSize: 0,
    avifSize: 0,
};

/**
 * Get all supported files recursively from a directory
 * @param {string} dir - Directory to scan
 * @returns {Promise<string[]>} Array of file paths
 */
async function getMediaFiles(dir) {
    const files = [];
    const allSupportedFormats = [...CONFIG.SUPPORTED_IMAGE_FORMATS, ...CONFIG.SUPPORTED_VIDEO_FORMATS];

    try {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Recursively scan subdirectories
                files.push(...await getMediaFiles(fullPath));
            } else if (allSupportedFormats.includes(path.extname(item.name).toLowerCase())) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`❌ Error reading directory ${dir}:`, error.message);
    }

    return files;
}

/**
 * Check if file is a video format
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if video format
 */
function isVideoFormat(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return CONFIG.SUPPORTED_VIDEO_FORMATS.includes(ext);
}

/**
 * Check if file is a GIF
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if GIF format
 */
function isGifFormat(filePath) {
    return path.extname(filePath).toLowerCase() === '.gif';
}

/**
 * Convert a single image/video to the selected format (WebP or AVIF)
 * @param {string} filePath - Path to the file
 */
async function convertMedia(filePath) {
    try {
        const ext = path.extname(filePath);
        const outputExt = `.${CONFIG.OUTPUT_FORMAT}`;
        const outputPath = filePath.replace(ext, outputExt);

        // Check if output already exists
        const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);

        if (outputExists) {
            console.log(`⏭️  Skipped (already exists): ${path.basename(filePath)}`);
            stats.skipped++;
            return;
        }

        // Get original file size
        const originalStats = await fs.stat(filePath);
        stats.originalSize += originalStats.size;

        // Load file with Sharp
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // Handle animated GIFs and videos
        const isAnimated = isGifFormat(filePath) || isVideoFormat(filePath);
        const fileType = isVideoFormat(filePath) ? 'video' : isGifFormat(filePath) ? 'GIF' : 'image';

        console.log(`🔄 Converting ${fileType}: ${path.basename(filePath)} (${metadata.width}x${metadata.height}${metadata.pages ? `, ${metadata.pages} frames` : ''})`);

        // Configure Sharp for animated content
        let sharpInstance = image.clone();

        // For GIFs and videos, preserve animation
        if (isAnimated && metadata.pages && metadata.pages > 1) {
            sharpInstance = sharpInstance.animated(true);
        }

        // Convert based on selected format
        if (CONFIG.OUTPUT_FORMAT === 'avif') {
            await sharpInstance
                .avif({
                    item: true, // Allow animated AVIF
                    quality: CONFIG.AVIF_QUALITY,
                    effort: CONFIG.AVIF_EFFORT,
                    ...(CONFIG.LOSSLESS && { lossless: true }),
                    // For animated content, use lower effort to avoid timeout
                    ...(isAnimated && { effort: Math.min(CONFIG.AVIF_EFFORT, 4) })
                })
                .toFile(outputPath);
        } else {
            await sharpInstance
                .webp({
                    quality: CONFIG.WEBP_QUALITY,
                    effort: CONFIG.WEBP_EFFORT,
                    ...(CONFIG.LOSSLESS && { lossless: true }),
                    // For animated content, preserve animation
                    ...(isAnimated && { loop: 0 })
                })
                .toFile(outputPath);
        }

        const outputStats = await fs.stat(outputPath);
        stats.outputSize += outputStats.size;

        const savings = ((1 - outputStats.size / originalStats.size) * 100).toFixed(1);
        const formatLabel = CONFIG.OUTPUT_FORMAT.toUpperCase();
        console.log(`  ✅ ${formatLabel}: ${formatBytes(outputStats.size)} (${savings}% smaller)`);

        stats.converted++;
    } catch (error) {
        console.error(`❌ Error converting ${filePath}:`, error.message);
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
    const formatLabel = CONFIG.OUTPUT_FORMAT.toUpperCase();
    console.log('\n📋 Configuration:');
    console.log('='.repeat(60));
    console.log(`Assets Directory: ${CONFIG.ASSETS_DIR}`);
    console.log(`Output Format: ${formatLabel}`);
    console.log(`Supported Image Formats: ${CONFIG.SUPPORTED_IMAGE_FORMATS.join(', ')}`);
    console.log(`Supported Video Formats: ${CONFIG.SUPPORTED_VIDEO_FORMATS.join(', ')}`);

    if (CONFIG.OUTPUT_FORMAT === 'webp') {
        console.log(`WebP Quality: ${CONFIG.WEBP_QUALITY}`);
        console.log(`WebP Effort: ${CONFIG.WEBP_EFFORT}`);
    } else {
        console.log(`AVIF Quality: ${CONFIG.AVIF_QUALITY}`);
        console.log(`AVIF Effort: ${CONFIG.AVIF_EFFORT}`);
    }

    console.log('='.repeat(60) + '\n');
}

/**
 * Print summary statistics
 */
function printSummary() {
    const formatLabel = CONFIG.OUTPUT_FORMAT.toUpperCase();

    console.log('\n' + '='.repeat(60));
    console.log('📊 OPTIMIZATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total files found:      ${stats.totalFiles}`);
    console.log(`Successfully converted: ${stats.converted}`);
    console.log(`Skipped (existing):     ${stats.skipped}`);
    console.log(`Errors:                 ${stats.errors}`);
    console.log('');
    console.log(`Original total size:    ${formatBytes(stats.originalSize)}`);
    console.log(`${formatLabel} total size:        ${formatBytes(stats.outputSize)}`);
    console.log('');

    if (stats.originalSize > 0) {
        const savings = ((1 - stats.outputSize / stats.originalSize) * 100).toFixed(1);
        console.log(`💾 ${formatLabel} savings:        ${savings}% (${formatBytes(stats.originalSize - stats.outputSize)})`);
    }
    console.log('='.repeat(60));
    console.log('\n✨ Optimization complete!\n');
}

/**
 * Main execution
 */
async function main() {
    const formatLabel = CONFIG.OUTPUT_FORMAT.toUpperCase();
    console.log(`🚀 Starting ${formatLabel} optimization...\n`);

    printConfig();

    try {
        let mediaFiles = [];

        if (explicitFiles.length > 0) {
            console.log(`🎯 Targeting specific files:`);
            for (const f of explicitFiles) {
                const fullPath = path.resolve(f);
                console.log(` - ${f}`);
                try {
                    await fs.access(fullPath);
                    mediaFiles.push(fullPath);
                } catch (e) {
                    console.error(`❌ File not found: ${f}`);
                }
            }
            console.log('');
        } else {
            console.log(`📁 Scanning directory: ${CONFIG.ASSETS_DIR}\n`);
            // Check if directory exists
            await fs.access(CONFIG.ASSETS_DIR);
            mediaFiles = await getMediaFiles(CONFIG.ASSETS_DIR);
        }

        stats.totalFiles = mediaFiles.length;

        console.log(`📸 Found ${mediaFiles.length} files to process\n`);

        if (mediaFiles.length === 0) {
            console.log('⚠️  No files found.');
            return;
        }

        // Process files sequentially to avoid memory issues
        for (const filePath of mediaFiles) {
            await convertMedia(filePath);
        }

        printSummary();

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`❌ Path not found. Check your arguments or ASSETS_DIR.`);
        } else {
            console.error('❌ Fatal error:', error);
        }
        process.exit(1);
    }
}

main();
