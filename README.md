# @mjnrojan/image-optimizer

[![npm version](https://img.shields.io/npm/v/@mjnrojan/image-optimizer.svg)](https://www.npmjs.com/package/@mjnrojan/image-optimizer)
[![license](https://img.shields.io/npm/l/@mjnrojan/image-optimizer.svg)](https://github.com/mjnrojan/Image-optimizer/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@mjnrojan/image-optimizer.svg)](https://nodejs.org)

A fast, lightweight CLI tool that converts **JPG / PNG / GIF** images and **MP4 / MOV / WEBM** videos to **WebP** or **AVIF** format using [Sharp](https://sharp.pixelplumbing.com/). Supports recursive directory scanning, animated content preservation, lossless mode, and configurable quality — perfect for optimizing assets in any web project.

---

## ✨ Features

- **WebP & AVIF output** — choose the modern format that fits your needs
- **Recursive scanning** — automatically finds all media in subdirectories
- **Animated content** — preserves animation in GIFs and videos
- **Lossless mode** — `--lossless` flag for pixel-perfect conversions
- **Specific file targeting** — pass individual file paths instead of a directory
- **Smart skipping** — never re-converts files that already have an output version
- **Configurable quality & effort** — tune compression via env vars or CLI
- **Detailed reporting** — per-file progress + summary with total savings
- **Zero config** — works out of the box with sensible defaults

---

## 📦 Installation

### Global install (recommended)

```bash
npm install -g @mjnrojan/image-optimizer
```

After installing globally, the `image-optimizer` command is available everywhere:

```bash
image-optimizer webp
image-optimizer avif --lossless
```

### Per-project install

```bash
npm install --save-dev @mjnrojan/image-optimizer
```

Then add scripts to your project's `package.json`:

```json
{
  "scripts": {
    "optimize:webp": "image-optimizer webp",
    "optimize:avif": "image-optimizer avif"
  }
}
```

### Run without installing (npx)

```bash
npx @mjnrojan/image-optimizer webp
npx @mjnrojan/image-optimizer avif --lossless
```

---

## 🚀 Quick Start

```bash
# 1. Set the directory containing your images (optional — defaults to ./src/assets)
export ASSETS_DIR=./public/images   # Linux / Mac
$env:ASSETS_DIR="./public/images"   # Windows PowerShell

# 2. Convert to WebP
image-optimizer webp

# 3. Or convert to AVIF
image-optimizer avif
```

### Target specific files

```bash
image-optimizer webp ./hero.jpg ./banner.png
image-optimizer avif ./photos/team.jpg
```

### Lossless mode

```bash
image-optimizer webp --lossless
image-optimizer avif -l
```

---

## ⚙️ Configuration

All settings can be controlled via **environment variables**. No code changes needed.

| Variable | Default | Description |
|---|---|---|
| `ASSETS_DIR` | `./src/assets` (relative to CWD) | Directory to scan for media files |
| `WEBP_QUALITY` | `80` | WebP quality (`0`–`100`) |
| `WEBP_EFFORT` | `6` | WebP compression effort (`0`–`6`) |
| `AVIF_QUALITY` | `75` | AVIF quality (`0`–`100`) |
| `AVIF_EFFORT` | `6` | AVIF compression effort (`0`–`9`) |
| `LOSSLESS` | `false` | Enable lossless mode (`true` / `false`) |

### Quality guidelines

| Range | Best for |
|---|---|
| `60`–`70` | Thumbnails, previews |
| `75`–`85` | Standard web images (recommended) |
| `90`–`100` | Hero images, photography |

### Example: high-quality WebP

```bash
# Linux / Mac
WEBP_QUALITY=95 WEBP_EFFORT=6 image-optimizer webp

# Windows PowerShell
$env:WEBP_QUALITY="95"; $env:WEBP_EFFORT="6"; image-optimizer webp
```

### Example: fast AVIF for development

```bash
AVIF_QUALITY=70 AVIF_EFFORT=2 image-optimizer avif
```

---

## 📖 Supported Formats

### Input

| Type | Extensions |
|---|---|
| **Images** | `.jpg`, `.jpeg`, `.png`, `.gif` |
| **Videos** | `.mp4`, `.mov`, `.webm` |

### Output

| Format | Pros |
|---|---|
| **WebP** | Fast encoding, great compression, 97 %+ browser support |
| **AVIF** | Superior compression (~50 % smaller than JPEG), HDR support, 90 %+ browser support |

---

## 📋 Example Output

```
🚀 Starting WEBP optimization...

📋 Configuration:
============================================================
Assets Directory: D:\my-project\src\assets
Output Format: WEBP
Supported Image Formats: .jpg, .jpeg, .png, .gif
Supported Video Formats: .mp4, .mov, .webm
WebP Quality: 80
WebP Effort: 6
============================================================

📁 Scanning directory: D:\my-project\src\assets

📸 Found 18 files to process

🔄 Converting image: hero-image.jpg (1920x1080)
  ✅ WEBP: 145.23 KB (62.3% smaller)

🔄 Converting image: product-1.png (800x600)
  ✅ WEBP: 78.45 KB (71.2% smaller)

🔄 Converting GIF: animation.gif (400x300, 24 frames)
  ✅ WEBP: 234.56 KB (58.7% smaller)

⏭️  Skipped (already exists): logo.jpg

============================================================
📊 OPTIMIZATION SUMMARY
============================================================
Total files found:      18
Successfully converted: 15
Skipped (existing):     2
Errors:                 1

Original total size:    5.82 MB
WEBP total size:        2.14 MB

💾 WEBP savings:        63.2% (3.68 MB)
============================================================

✨ Optimization complete!
```

---

## 🔍 How It Works

1. **Reads configuration** from environment variables (or uses defaults)
2. **Scans the target directory** recursively for supported image and video files
3. **Processes each file** sequentially using [Sharp](https://sharp.pixelplumbing.com/):
   - Detects animated content (multi-frame GIFs, videos)
   - Converts to the chosen output format with the configured quality / effort
   - Preserves animation frames automatically
4. **Skips files** that already have a converted version
5. **Reports progress** per file and prints a summary with total size savings

**File naming:** `photo.jpg` → `photo.webp` (or `photo.avif`). Originals are **never deleted**.

---

## 🐛 Troubleshooting

### "Directory not found"

The `ASSETS_DIR` path doesn't exist. Make sure the directory is correct:

```bash
# Use forward slashes or escaped backslashes on Windows
ASSETS_DIR="D:/project/images"       # ✅
ASSETS_DIR="D:\\project\\images"     # ✅
ASSETS_DIR="D:\project\images"      # ❌ unescaped backslash
```

### "No files found"

Verify the directory contains files with supported extensions (`.jpg`, `.jpeg`, `.png`, `.gif`, `.mp4`, `.mov`, `.webm`).

### Sharp installation fails

1. Make sure you're running **Node.js ≥ 18**
2. On Windows, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) if needed
3. Try: `npm install --platform=win32 --arch=x64 sharp`

### "Error converting [file]"

The file may be corrupted or an unsupported variant. Open it in an image editor and re-save, or check the file for corruption. The script will skip the file and continue processing the rest.

---

## ⚡ Performance Tips

| Tip | Details |
|---|---|
| **Dev vs Prod effort** | Use `WEBP_EFFORT=2` during development for speed; `WEBP_EFFORT=6` for production builds |
| **Batch by folder** | Split large asset sets into subdirectories and process in parallel terminals |
| **AVIF trade-off** | AVIF produces smaller files but encodes slower — use WebP when speed matters |

### CI / CD Integration

```yaml
# GitHub Actions
- name: Optimize images
  run: npx @mjnrojan/image-optimizer webp
  env:
    ASSETS_DIR: ./public/images
    WEBP_QUALITY: 85
```

---

## 📁 What Gets Published

Only the essentials are included in the npm package:

```
@mjnrojan/image-optimizer
├── optimize-images.js   # CLI entry point
├── package.json
└── README.md
```

---

## 📝 License

[MIT](https://github.com/mjnrojan/Image-optimizer/blob/main/LICENSE) — free to use in any project.

---

## 🤝 Contributing

Issues and pull requests are welcome at [github.com/mjnrojan/Image-optimizer](https://github.com/mjnrojan/Image-optimizer).

Ideas for contributions:
- Image resizing presets
- Watermarking support
- Custom output directories
- Parallel processing
- Progress bar

---

**Happy Optimizing! 🚀**
