# Image Optimizer - Standalone Package

A lightweight, portable image optimization tool that converts JPG/PNG images to WebP format using Sharp. Perfect for web projects that need fast, modern image formats.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [How It Works](#how-it-works)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)

---

## ✨ Features

- **Recursive Scanning**: Automatically finds all images in subdirectories
- **WebP Conversion**: Converts JPG/PNG to modern WebP format
- **Smart Skipping**: Avoids re-converting already optimized images
- **Configurable Quality**: Adjust compression vs quality trade-off
- **Detailed Reporting**: Shows file-by-file progress and final statistics
- **Environment Variables**: Easy configuration without code changes
- **Zero Config**: Works out of the box with sensible defaults

---

## 🔧 Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js

Check your versions:
```bash
node --version
npm --version
```

---

## 📦 Installation

### Step 1: Copy the Package

Copy the entire `image-optimizer-package` folder to your project or any location.

### Step 2: Install Dependencies

Navigate to the package directory and install:

```bash
cd image-optimizer-package
npm install
```

This will install Sharp (~30MB), the high-performance image processing library.

---

## 🚀 Quick Start

### Basic Usage (Default Settings)

1. **Place your images** in `../src/assets/images/` (relative to the script)
2. **Run the optimizer**:
   ```bash
   npm run optimize
   ```

That's it! The script will:
- Scan for all `.jpg`, `.jpeg`, and `.png` files
- Convert them to `.webp` format
- Save them alongside the originals
- Show you the space savings

### Example Output

```
🚀 Starting image optimization...

📋 Configuration:
============================================================
Assets Directory: D:\your-project\src\assets\images
Supported Formats: .jpg, .jpeg, .png
WebP Quality: 80
WebP Effort: 6
============================================================

📁 Scanning directory: D:\your-project\src\assets\images

📸 Found 15 images to process

🔄 Converting: hero-image.jpg (1920x1080)
  ✅ WebP: 145.23 KB (62.3% smaller)

🔄 Converting: product-1.png (800x600)
  ✅ WebP: 78.45 KB (71.2% smaller)

⏭️  Skipped (already exists): logo.jpg

============================================================
📊 OPTIMIZATION SUMMARY
============================================================
Total images found:     15
Successfully converted: 12
Skipped (existing):     2
Errors:                 1

Original total size:    4.52 MB
WebP total size:        1.67 MB

💾 WebP savings:        63.1% (2.85 MB)
============================================================

✨ Optimization complete!
```

---

## ⚙️ Configuration

### Method 1: Environment Variables (Recommended)

Create a `.env` file in the package directory or set variables in your terminal:

```bash
# .env file
ASSETS_DIR=./my-images
WEBP_QUALITY=85
WEBP_EFFORT=4
```

Then run:
```bash
npm run optimize
```

### Method 2: Command Line

**Windows (PowerShell):**
```powershell
$env:ASSETS_DIR="D:\my-project\images"; npm run optimize
```

**Linux/Mac:**
```bash
ASSETS_DIR=/path/to/images WEBP_QUALITY=90 npm run optimize
```

### Method 3: Edit the Script

Open `optimize-images.js` and modify the `CONFIG` object:

```javascript
const CONFIG = {
    ASSETS_DIR: path.join(__dirname, '../src/assets/images'),
    SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png'],
    WEBP_QUALITY: 80,  // Change this (0-100)
    WEBP_EFFORT: 6,    // Change this (0-6)
};
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `ASSETS_DIR` | `../src/assets/images` | Directory to scan for images |
| `WEBP_QUALITY` | `80` | Output quality (0-100). Higher = better quality, larger file |
| `WEBP_EFFORT` | `6` | Compression effort (0-6). Higher = slower, better compression |

**Quality Guidelines:**
- `60-70`: Acceptable for thumbnails
- `75-85`: Good balance for most web images
- `90-100`: High quality for hero images

---

## 📖 Usage Examples

### Example 1: Optimize a Specific Folder

```bash
# Windows
$env:ASSETS_DIR="D:\my-project\public\images"; npm run optimize

# Linux/Mac
ASSETS_DIR=/home/user/project/public/images npm run optimize
```

### Example 2: High-Quality Conversion

```bash
# Windows
$env:WEBP_QUALITY="95"; $env:WEBP_EFFORT="6"; npm run optimize

# Linux/Mac
WEBP_QUALITY=95 WEBP_EFFORT=6 npm run optimize
```

### Example 3: Fast Conversion (Lower Quality)

```bash
# Windows
$env:WEBP_QUALITY="70"; $env:WEBP_EFFORT="2"; npm run optimize

# Linux/Mac
WEBP_QUALITY=70 WEBP_EFFORT=2 npm run optimize
```

### Example 4: Integrate into Your Project

Add to your project's `package.json`:

```json
{
  "scripts": {
    "optimize-images": "node ./image-optimizer-package/optimize-images.js"
  }
}
```

Then run:
```bash
npm run optimize-images
```

---

## 🔍 How It Works

### Step-by-Step Process

1. **Initialization**
   - Reads configuration from environment variables or defaults
   - Validates the target directory exists

2. **Scanning**
   - Recursively walks through all subdirectories
   - Identifies files with `.jpg`, `.jpeg`, or `.png` extensions
   - Builds a list of files to process

3. **Conversion Loop**
   - For each image:
     - Checks if `.webp` version already exists (skips if yes)
     - Loads the image using Sharp
     - Reads metadata (dimensions, format)
     - Converts to WebP with specified quality/effort
     - Saves alongside the original with `.webp` extension
     - Tracks statistics (file sizes, savings)

4. **Reporting**
   - Displays progress for each file
   - Shows final summary with total savings

### Technical Details

**Sharp Library:**
- Uses libvips (C library) for fast image processing
- Supports SIMD instructions for parallel processing
- Memory-efficient streaming architecture

**WebP Format:**
- Developed by Google for web use
- Supports both lossy and lossless compression
- Typically 25-35% smaller than JPEG at same quality
- Supported by 97%+ of browsers (as of 2024)

**File Naming:**
- Original: `image.jpg` → Converted: `image.webp`
- Originals are **never deleted** (safe operation)

---

## 🐛 Troubleshooting

### Issue: "Directory not found"

**Cause:** The `ASSETS_DIR` path is incorrect or doesn't exist.

**Solution:**
1. Check the path is absolute or correctly relative
2. Ensure the directory exists
3. On Windows, use forward slashes or escaped backslashes:
   ```javascript
   "D:/project/images"  // ✅ Good
   "D:\\project\\images" // ✅ Good
   "D:\project\images"   // ❌ Bad (unescaped)
   ```

### Issue: "No images found"

**Cause:** No `.jpg`, `.jpeg`, or `.png` files in the directory.

**Solution:**
1. Verify images are in the correct directory
2. Check file extensions are lowercase (or modify `SUPPORTED_FORMATS`)
3. Ensure subdirectories contain the images

### Issue: Sharp installation fails

**Cause:** Missing build tools or incompatible Node version.

**Solution:**
1. Update Node.js to v18 or higher
2. On Windows, install Visual Studio Build Tools if needed
3. Try: `npm install --platform=win32 --arch=x64 sharp`

### Issue: "Error converting [file]"

**Cause:** Corrupted image or unsupported format variant.

**Solution:**
1. Open the image in an image editor and re-save
2. Check the file isn't corrupted
3. The script will skip and continue with other images

---

## ⚡ Performance Tips

### 1. Batch Processing
Process images in batches if you have thousands:
```bash
# Process only a subfolder
ASSETS_DIR=./images/batch-1 npm run optimize
ASSETS_DIR=./images/batch-2 npm run optimize
```

### 2. Quality vs Speed
- Use `WEBP_EFFORT=2` for faster processing during development
- Use `WEBP_EFFORT=6` for final production builds

### 3. Parallel Processing
The script processes sequentially to avoid memory issues. For very large batches:
- Split into multiple directories
- Run multiple terminal instances in parallel

### 4. CI/CD Integration
Add to your build pipeline:
```yaml
# GitHub Actions example
- name: Optimize Images
  run: |
    cd image-optimizer-package
    npm install
    npm run optimize
```

---

## 📁 Project Structure

```
image-optimizer-package/
├── optimize-images.js    # Main script
├── package.json          # Dependencies and scripts
├── README.md            # This file
└── node_modules/        # Created after npm install
    └── sharp/           # Image processing library
```

---

## 🔄 Updating to a New Project

1. **Copy the folder** to your new project
2. **Update `ASSETS_DIR`** in the script or via environment variable
3. **Run `npm install`**
4. **Run `npm run optimize`**

That's it! The package is completely self-contained.

---

## 📝 License

MIT License - Feel free to use in any project.

---

## 🤝 Contributing

This is a standalone tool. Modify the script directly for your needs:
- Add AVIF support
- Add different quality presets
- Add image resizing
- Add watermarking

---

## 📞 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Verify Node.js version: `node --version`
3. Check Sharp documentation: https://sharp.pixelplumbing.com/

---

**Happy Optimizing! 🚀**
