import sys, numpy as np
from PIL import Image, ImageFilter

PAPER = np.array([0xF2,0xEB,0xDC], float)/255
INKS = {"blue": np.array([0x00,0x78,0xBF])/255., "orange": np.array([0xFF,0x6C,0x2F])/255.,
        "black": np.array([0x23,0x1F,0x20])/255., "teal": np.array([0x00,0xA9,0x5C])/255.}

def riso(src, dst, w=1600, seed=1, misreg=3, contrast=0.7, gain=1.5, levels=3, ink_a="blue", ink_b="orange", grain=0.16, cell=2):
    rng = np.random.default_rng(seed)
    im = Image.open(src).convert("RGB")
    im = im.resize((w, round(w*im.height/im.width)), Image.LANCZOS)
    a = np.asarray(im, float)/255.0
    R,G,B = a[...,0],a[...,1],a[...,2]
    L = 0.299*R+0.587*G+0.114*B
    warm = np.clip(0.5 + (R - B)*2.2, 0, 1)
    D = np.clip((1-L - 0.06)/0.82, 0, 1) ** contrast
    d_a = np.clip(D*(1-warm)*gain, 0, 1)
    d_b = np.clip(D*warm*gain, 0, 1)
    shadow = np.clip((0.32 - L)/0.12, 0, 1)          # deep shadow -> overprint both
    d_a = np.maximum(d_a, shadow*0.95); d_b = np.maximum(d_b, shadow*0.55)
    out = np.ones_like(a) * PAPER
    for i,(name,d) in enumerate([(ink_a,d_a),(ink_b,d_b)]):
        # coarse stochastic grain: noise at `cell` px scale, then stochastic-threshold posterise
        gh, gw = -(-d.shape[0]//cell), -(-d.shape[1]//cell)
        n = np.kron(rng.normal(0, grain, (gh, gw)), np.ones((cell, cell)))[:d.shape[0], :d.shape[1]]
        d = np.clip(d + n, 0, 1)
        d = np.round(d*levels)/levels
        # ink bleed: solids swell slightly
        d = np.asarray(Image.fromarray((d*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8)), float)/255
        if i: d = np.roll(np.roll(d, misreg-1, axis=0), -misreg, axis=1)
        out = out * (1 - d[...,None]*(1-INKS[name]))
    out = np.clip(out + rng.normal(0, 0.02, out.shape[:2]+(1,)), 0, 1)
    flecks = rng.random(out.shape[:2]) > 0.9985            # paper fibre flecks
    out[flecks] = np.minimum(out[flecks] + 0.12, 1)
    Image.fromarray((out*255).astype(np.uint8)).save(dst, quality=88)

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    kw = dict(x.split("=") for x in sys.argv[3:])
    for k in ("w","misreg","seed","levels"):
        if k in kw: kw[k]=int(kw[k])
    for k in ("contrast","gain","grain"):
        if k in kw: kw[k]=float(kw[k])
    riso(src, dst, **kw); print("ok", dst)
