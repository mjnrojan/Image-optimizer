# Image Optimizer - Update Summary

## Changes Made

### 1. **Enhanced Format Support**
- ✅ Added GIF support (`.gif`)
- ✅ Added video format support (`.mp4`, `.mov`, `.webm`, `.avi`)
- ✅ Preserves animation in GIFs and videos

### 2. **Dynamic Format Selection**
- ✅ Added AVIF format support alongside WebP
- ✅ Users can now choose between WebP or AVIF output
- ✅ Command-line argument support: `node optimize-images.js [webp|avif]`

### 3. **New NPM Scripts**
```json
{
  "optimize": "node optimize-images.js webp",           // Default WebP
  "optimize-webp": "node optimize-images.js webp",     // Explicit WebP
  "optimize-avif": "node optimize-images.js avif",     // AVIF format
  "optimize:custom": "node optimize-images.js"         // Custom usage
}
```

### 4. **Usage Examples**

#### Convert to WebP (Default):
```bash
npm run optimize-webp
```

#### Convert to AVIF:
```bash
npm run optimize-avif
```

#### With Custom Directory:
```bash
# Windows
$env:ASSETS_DIR="D:\my-images"; npm run optimize-webp

# Linux/Mac
ASSETS_DIR=/path/to/images npm run optimize-avif
```

### 5. **Configuration Options**

| Option | Default | Description |
|--------|---------|-------------|
| `OUTPUT_FORMAT` | `webp` | Output format: `webp` or `avif` |
| `WEBP_QUALITY` | `80` | WebP quality (0-100) |
| `WEBP_EFFORT` | `6` | WebP compression effort (0-6) |
| `AVIF_QUALITY` | `75` | AVIF quality (0-100) |
| `AVIF_EFFORT` | `6` | AVIF compression effort (0-9) |

### 6. **Supported Formats**

#### Input Formats:
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **Videos**: `.mp4`, `.mov`, `.webm`, `.avi`

#### Output Formats:
- **WebP**: Fast encoding, good compression, wide browser support
- **AVIF**: Superior compression (~50% smaller), slower encoding, modern browsers

### 7. **Key Features**
- 🎬 Animated GIF support with frame preservation
- 🎥 Video-to-image format conversion
- 🔄 Automatic animation detection
- ⚡ Optimized effort settings for animated content
- 📊 Detailed statistics for each file type

### 8. **Updated Files**
- ✅ `optimize-images.js` - Complete rewrite with new features
- ✅ `package.json` - Updated scripts and description
- ✅ `README.md` - Comprehensive documentation update

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run optimization**:
   ```bash
   npm run optimize-webp    # For WebP format
   # OR
   npm run optimize-avif    # For AVIF format
   ```

## Example Output

```
🚀 Starting WEBP optimization...

📋 Configuration:
============================================================
Assets Directory: D:\your-project\src\assets\images
Output Format: WEBP
Supported Image Formats: .jpg, .jpeg, .png, .gif
Supported Video Formats: .mp4, .mov, .webm, .avi
WebP Quality: 80
WebP Effort: 6
============================================================

🔄 Converting image: hero.jpg (1920x1080)
  ✅ WEBP: 145.23 KB (62.3% smaller)

🔄 Converting GIF: animation.gif (400x300, 24 frames)
  ✅ WEBP: 234.56 KB (58.7% smaller)

🔄 Converting video: demo.mp4 (1280x720)
  ✅ WEBP: 512.34 KB (45.2% smaller)
```

## Notes

- Original files are **never deleted** - conversions are saved alongside originals
- Animated content (GIFs, videos) uses optimized effort settings to prevent timeouts
- AVIF provides better compression but takes longer to encode
- WebP is faster and has wider browser support
