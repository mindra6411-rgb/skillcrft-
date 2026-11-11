#!/usr/bin/env python3
"""
Gera o vídeo de fundo do Hero da Skill Craft (public/video/hero-loop.mp4).

Loop perfeito de 12 s @ 24 fps, 1280x720, H.264 (yuv420p):
- fundo Deep Slate com profundidade;
- brilhos azuis derivando em órbitas periódicas;
- grade isométrica discreta com deriva lenta;
- hexágonos wireframe (monograma geométrico da marca) com glow;
- partículas flutuantes e varredura de luz;
- vinheta suave. Sem texto, sem marcas de terceiros.

Todo movimento usa senoides com período inteiro de T => loop sem emenda.
Reproduzível: python3 scripts/generate_hero_video.py
Dependências: numpy, pillow, imageio, imageio-ffmpeg.
"""

from __future__ import annotations

import math
import os

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1280, 720
FPS = 24
T = 12.0  # segundos do loop
N_FRAMES = int(FPS * T)

DEEP_950 = np.array([8, 15, 36], dtype=np.float32)
DEEP_800 = np.array([16, 27, 61], dtype=np.float32)
SKILL = np.array([49, 85, 217], dtype=np.float32)
ACCENT = np.array([107, 140, 255], dtype=np.float32)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "video")

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def base_frame() -> np.ndarray:
    """Gradiente vertical + respiração radial central."""
    t_v = (yy / H)[..., None]
    base = DEEP_950 * (1 - t_v) + DEEP_800 * t_v
    r = np.sqrt((xx - W * 0.62) ** 2 + (yy - H * 0.42) ** 2) / (W * 0.75)
    base = base + SKILL * (0.10 * np.exp(-(r**2) * 3.0))[..., None]
    return base


def vignette() -> np.ndarray:
    u = (xx / W - 0.5) * 2.0
    v = (yy / H - 0.5) * 2.0
    d = np.sqrt(u**2 + v**2)
    return (1.0 - 0.38 * np.clip(d - 0.35, 0, 1.4) ** 1.6)[..., None]


BASE = base_frame()
VIG = vignette()


def blobs(frame: np.ndarray, t: float) -> None:
    """Brilhos azuis em órbitas periódicas (k inteiro => loop)."""
    ph = 2 * math.pi * t / T
    specs = [
        (0.30 + 0.10 * math.sin(ph), 0.30 + 0.12 * math.cos(ph), 0.34, SKILL, 0.16),
        (0.78 + 0.08 * math.cos(ph + 2.1), 0.62 + 0.10 * math.sin(ph + 1.2), 0.30, ACCENT, 0.10),
        (0.55 + 0.16 * math.sin(ph + 4.0), 0.85 + 0.06 * math.cos(ph + 3.1), 0.26, SKILL, 0.08),
    ]
    for cx, cy, sigma, cor, amp in specs:
        r2 = ((xx / W - cx) ** 2 + (yy / H - cy) ** 2) / (sigma**2)
        frame += cor * (amp * np.exp(-r2 * 2.2))[..., None]


def grade_isometrica(t: float) -> Image.Image:
    """Grade isométrica discreta com deriva periódica."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ph = 2 * math.pi * t / T
    drift = 26 * math.sin(ph)
    sp = 96
    slope = math.tan(math.radians(30))
    alpha = int(19 + 5 * math.sin(ph + 1.0))
    for i in range(-int(H * slope) - sp, W + sp, sp):
        x0 = i + drift
        d.line([(x0, -4), (x0 + (H + 8) * slope, H + 4)], fill=(107, 140, 255, alpha), width=1)
        d.line([(x0, -4), (x0 - (H + 8) * slope, H + 4)], fill=(49, 85, 217, alpha), width=1)
    return img


def hexagono(d: ImageDraw.ImageDraw, cx: float, cy: float, r: float, rot: float, cor, alpha: int, width: int = 2, interno: bool = True):
    pts = []
    for k in range(6):
        a = math.radians(-90 + k * 60 + rot)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.line(pts + [pts[0]], fill=cor + (alpha,), width=width, joint="curve")
    if interno:
        pts2 = [(cx + (p[0] - cx) * 0.62, cy + (p[1] - cy) * 0.62) for p in pts]
        d.line(pts2 + [pts2[0]], fill=cor + (max(alpha - 46, 8),), width=1)
        for k in (0, 2, 4):
            d.line([pts[k], pts2[k]], fill=cor + (max(alpha - 62, 6),), width=1)


def formas_geometricas(t: float) -> Image.Image:
    """Hexágonos wireframe + partículas, com deriva/rotação periódicas."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ph = 2 * math.pi * t / T

    hexagono(d, W * 0.76 + 18 * math.sin(ph), H * 0.34 + 14 * math.cos(ph), 190, 8 * math.sin(ph), (107, 140, 255), 128, 2)
    hexagono(d, W * 0.16 + 12 * math.cos(ph + 2.0), H * 0.72 + 10 * math.sin(ph + 2.0), 120, -6 * math.sin(ph + 1.0), (72, 108, 235), 138, 2)
    hexagono(d, W * 0.52 + 22 * math.sin(ph + 4.2), H * 0.12 + 8 * math.cos(ph + 3.0), 70, 10 * math.cos(ph), (107, 140, 255), 104, 2, interno=False)
    hexagono(d, W * 0.90 + 10 * math.cos(ph + 5.0), H * 0.86 + 12 * math.sin(ph + 4.4), 96, -8 * math.cos(ph + 2.2), (72, 108, 235), 116, 2)

    # partículas flutuantes
    for i in range(34):
        s = i * 1.37
        cx = (0.08 + 0.84 * ((i * 0.618) % 1.0)) * W + 30 * math.sin(ph * (1 + i % 3) + s)
        cy = (0.10 + 0.80 * ((i * 0.377) % 1.0)) * H + 24 * math.cos(ph * (1 + (i + 1) % 3) + s * 1.7)
        a = int(96 + 60 * math.sin(ph * 2 + s * 3.1))
        r = 1.8 + (i % 3) * 0.8
        cor = (147, 171, 255) if i % 2 else (107, 140, 255)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor + (max(a, 8),))
    return img


def varredura_luz(t: float) -> np.ndarray:
    """Faixa diagonal de luz que atravessa a cena uma vez por loop."""
    c = -0.35 + 1.7 * ((t / T) % 1.0)
    u = (xx / W) * 0.72 + (yy / H) * 0.28
    banda = np.exp(-(((u - c) / 0.10) ** 2))
    return ACCENT * (0.08 * banda)[..., None]


def compor(t: float) -> np.ndarray:
    frame = BASE.copy()
    blobs(frame, t)
    frame += varredura_luz(t)

    # camadas PIL em 0..255 com alpha straight: contribui cor * alpha01
    grade = np.asarray(grade_isometrica(t), dtype=np.float32)
    frame += grade[..., :3] * (grade[..., 3:4] / 255.0)

    formas = formas_geometricas(t)
    glow = formas.filter(ImageFilter.GaussianBlur(6))
    g = np.asarray(glow, dtype=np.float32)
    frame += g[..., :3] * (g[..., 3:4] / 255.0) * 1.6
    f = np.asarray(formas, dtype=np.float32)
    frame += f[..., :3] * (f[..., 3:4] / 255.0)

    frame *= VIG
    return np.clip(frame, 0, 255).astype(np.uint8)


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    mp4 = os.path.join(OUT_DIR, "hero-loop.mp4")
    writer = imageio.get_writer(
        mp4,
        fps=FPS,
        codec="libx264",
        pixelformat="yuv420p",
        macro_block_size=1,
        output_params=["-crf", "30", "-preset", "medium", "-movflags", "+faststart"],
    )
    poster_idx = int(FPS * 3.2)
    for i in range(N_FRAMES):
        frame = compor(i / FPS)
        writer.append_data(frame)
        if i == poster_idx:
            Image.fromarray(frame).save(os.path.join(OUT_DIR, "hero-poster.jpg"), quality=80, optimize=True)
            Image.fromarray(frame).save(os.path.join(OUT_DIR, "hero-poster.webp"), quality=82, method=6)
    writer.close()
    print("ok:", mp4, os.path.getsize(mp4) // 1024, "KB")


if __name__ == "__main__":
    main()
