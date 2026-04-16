#!/usr/bin/env python3
"""Generate launcher / App Store icons from MaterialIcons movie-filter (same as global app bar)."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Glyph "movie-filter" from MaterialIcons.json
MOVIE_FILTER_CODEPOINT: int = 58426
BACKGROUND_RGBA: tuple[int, int, int, int] = (19, 19, 19, 255)
FOREGROUND_RGBA: tuple[int, int, int, int] = (255, 83, 81, 255)


def render_icon_pixel(size_px: int, font_path: Path) -> Image.Image:
    image: Image.Image = Image.new("RGBA", (size_px, size_px), BACKGROUND_RGBA)
    draw: ImageDraw.ImageDraw = ImageDraw.Draw(image)
    font_size: int = max(12, int(size_px * 0.55))
    font: ImageFont.FreeTypeFont = ImageFont.truetype(str(font_path), font_size)
    text: str = chr(MOVIE_FILTER_CODEPOINT)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w: float = float(bbox[2] - bbox[0])
    text_h: float = float(bbox[3] - bbox[1])
    x: float = (size_px - text_w) / 2.0 - float(bbox[0])
    y: float = (size_px - text_h) / 2.0 - float(bbox[1])
    draw.text((x, y), text, font=font, fill=FOREGROUND_RGBA)
    return image


def main() -> None:
    root: Path = Path(__file__).resolve().parents[1]
    font_path: Path = root / "node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf"
    if not font_path.is_file():
        print(f"Missing font: {font_path}", file=sys.stderr)
        sys.exit(1)
    android_map: dict[str, int] = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    res_root: Path = root / "android/app/src/main/res"
    for folder, dim in android_map.items():
        out_dir: Path = res_root / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        img: Image.Image = render_icon_pixel(dim, font_path)
        img.save(out_dir / "ic_launcher.png", format="PNG")
        img.save(out_dir / "ic_launcher_round.png", format="PNG")
    ios_dir: Path = root / "ios/streamlist/Images.xcassets/AppIcon.appiconset"
    ios_dir.mkdir(parents=True, exist_ok=True)
    ios_sizes: list[tuple[str, int]] = [
        ("Icon-20@2x.png", 40),
        ("Icon-20@3x.png", 60),
        ("Icon-29@2x.png", 58),
        ("Icon-29@3x.png", 87),
        ("Icon-40@2x.png", 80),
        ("Icon-40@3x.png", 120),
        ("Icon-60@2x.png", 120),
        ("Icon-60@3x.png", 180),
        ("Icon-1024.png", 1024),
    ]
    for filename, dim in ios_sizes:
        render_icon_pixel(dim, font_path).save(ios_dir / filename, format="PNG")
    print("Wrote Android mipmaps and iOS AppIcon PNGs from movie-filter glyph.")


if __name__ == "__main__":
    main()
