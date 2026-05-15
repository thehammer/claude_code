#!/usr/bin/env python3
"""Render multidimensional pace bars (cell-based) for tmux statusline.

- Bar length = elapsed_pct of window (0..width cells).
- Gradient within bar: green at left → pace-mapped color at the fill tip.
- Beyond fill: dim dot rail.
- Color interp: OKLab perceptually uniform.

Input: path to ~/.claude/budget-posture.json
Output: tmux format string on stdout
"""
import json, sys

STOPS = [
    (0.0, (0.866, -0.234,  0.179)),  # vivid green   ≈ #00C853
    (0.5, (0.962, -0.071,  0.198)),  # vivid yellow  ≈ #FFD600
    (1.0, (0.628,  0.225,  0.126)),  # vivid red     ≈ #D50000
]


def _interp_lab(t):
    for i in range(len(STOPS) - 1):
        t0, lab0 = STOPS[i]
        t1, lab1 = STOPS[i + 1]
        if t0 <= t <= t1:
            f = (t - t0) / (t1 - t0)
            return tuple(lab0[k] + f * (lab1[k] - lab0[k]) for k in range(3))
    return STOPS[-1][1]


def _oklab_to_linear_srgb(L, a, b):
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l = l_ ** 3
    m = m_ ** 3
    s = s_ ** 3
    r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return (r, g, bl)


def _linear_to_srgb(c):
    if c <= 0.0:
        return 0
    if c >= 1.0:
        return 1
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def _hex_from_t(t):
    L, a, b = _interp_lab(max(0.0, min(1.0, t)))
    r, g, bl = _oklab_to_linear_srgb(L, a, b)
    r = _linear_to_srgb(r)
    g = _linear_to_srgb(g)
    bl = _linear_to_srgb(bl)
    return f"#{int(round(r * 255)):02X}{int(round(g * 255)):02X}{int(round(bl * 255)):02X}"


def bar(elapsed_pct, pace, width=24):
    """Multidimensional bar:
       LENGTH = elapsed_pct/100 * width.
       GRADIENT WITHIN BAR = green at left → pace-mapped tip color."""
    if elapsed_pct is None or pace is None:
        return ""
    e = max(0.0, min(100.0, float(elapsed_pct)))
    p = max(0.0, min(1.5, float(pace)))
    fill_chars = (e / 100.0) * width
    pos = int(fill_chars)
    frac = fill_chars - pos
    end_t = p / 1.5

    def cell_color(i):
        if pos <= 1:
            local_t = end_t
        else:
            local_t = (i / (pos - 1)) * end_t if i < pos else end_t
        return _hex_from_t(max(0.0, min(1.0, local_t)))

    out = []
    for i in range(width):
        if i < pos:
            out.append(f"#[fg={cell_color(i)}]█")
        elif i == pos and frac > 0:
            if   frac >= 0.875: ch = "▉"
            elif frac >= 0.75:  ch = "▊"
            elif frac >= 0.625: ch = "▋"
            elif frac >= 0.5:   ch = "▌"
            elif frac >= 0.375: ch = "▍"
            elif frac >= 0.25:  ch = "▎"
            elif frac >= 0.125: ch = "▏"
            else: ch = ""
            if ch:
                out.append(f"#[fg={cell_color(i)}]{ch}")
            else:
                out.append("#[fg=#262626]·")
        else:
            out.append("#[fg=#262626]·")
    return "".join(out) + "#[fg=colour245]"


def main():
    if len(sys.argv) < 2:
        return
    try:
        d = json.load(open(sys.argv[1]))
        fh = d.get('five_hour') or {}
        sd = d.get('seven_day') or {}
        e5, p5 = fh.get('elapsed_pct'), fh.get('pace')
        e7, p7 = sd.get('elapsed_pct'), sd.get('pace')
        bits = []
        if e5 is not None and p5 is not None:
            bits.append(f"#[fg=colour245]5h ▕{bar(e5, p5)}▕ {p5:.2f}")
        if e7 is not None and p7 is not None:
            bits.append(f"#[fg=colour245]7d ▕{bar(e7, p7)}▕ {p7:.2f}")
        if bits:
            print("  ".join(bits) + "  ")
    except Exception:
        pass


if __name__ == "__main__":
    main()
