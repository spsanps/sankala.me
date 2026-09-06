# Paper Robots YouTube profile picture — prompts and source notes

## Version 3 — painted-universe robot

Prepared 2026-09-05 after San clarified that both banner and DP should draw from
his supplied painted universe. The existing cobalt robot's identity is preserved:
ivory eyes and folded corner, vermilion ear. Its surfaces and edges are repainted
in broad gouache to match the cobalt architecture and olive characters.

- [Upload picture](current/profile-picture-v3.jpg): 1024 × 1024 RGB JPEG, 256,225 bytes.
- [Generated source](current/profile-picture-v3-source.png): original 1254 × 1254 RGB PNG.
- [Small preview](current/profile-picture-v3-small-preview.png): 96 × 96, preview only.
- [Matching banner and prompts](../banner/prompts.md): version 7.
- [Reference catalog](../../references/painted-universe/README.md).

Mode: built-in image generation. FFmpeg mechanically downscaled and encoded the
JPEG; the 96 px preview was visually inspected for recognition. Head and ear sit
within the circular footprint; lower shoulders can be clipped by the avatar circle.
Dimensions, RGB decoding and size below 1,000,000 bytes checked. Review the actual
YouTube circular preview. Selection/upload unconfirmed; prior versions preserved.

### Version 3 generation prompt

Inputs in order: profile-picture-v2-source.png (character identity only),
agents-across-cobalt-rift.png and cobalt-arcades-and-red-threads.png (painting style).
All local references were visually inspected.

Use case: style-transfer.
Create a finished square Paper Robots profile picture.
Image 1: existing robot, CHARACTER IDENTITY ONLY.
Images 2 and 3: the user's painted universe, AUTHORITATIVE PAINTING STYLE. Match their actual broad opaque gouache strokes, quiet earthy paper, simplified volume, uneven painted edges and tactile colored planes. This must look like a character painted by the same illustrator as those little olive beings.

Repaint the cobalt robot as an inhabitant of that world, from scratch, not a flat vector icon with a noise filter. A close head-and-shoulders portrait: simple slightly irregular squared cobalt head, two warm ivory eyes with small dark pupils, one ivory folded-paper corner at the top right and a single small vermilion ear. Curious and thoughtful expression, slight head tilt. Keep these recognizable identifying features, but soften the ruler-straight geometry into confidently painted forms. Build volume with just two or three broad blue brush-painted planes, like the cobalt structures in the references. Eyes are matte opaque paint, not glossy toy eyes. Fold is one simple painted ivory triangle, not a complicated bevel. A short neck and cropped shoulders. The face should remain exceptionally clear at 48 pixels.

Plain warm ivory painted background matching the reference paintings, with a faint cool blue grounded shadow behind the lower shoulder at most. The entire head, ear and fold sit inside the central 72% of the square with clear breathing room for circular cropping. Warm, intelligent and a little strange, suitable for an adult essay channel. No green companion, landscape, extra object, diagrams, letters, text, logo, border, chrome, digital glow, plastic rendering, clean corporate-vector outlines, polygon tessellation or uniform speckled grain. Real-looking irregular gouache marks and natural pigment variation, restrained detail.

One opaque square image, ideally 2048x2048 at highest available native resolution.

### Version 3 export commands

```bash
ffmpeg -hide_banner -loglevel error -n -i branding/paper-robots/youtube/profile-picture/current/profile-picture-v3-source.png -vf scale=1024:1024:flags=lanczos -pix_fmt yuvj444p -q:v 2 -frames:v 1 -update 1 branding/paper-robots/youtube/profile-picture/current/profile-picture-v3.jpg
ffmpeg -hide_banner -loglevel error -n -i branding/paper-robots/youtube/profile-picture/current/profile-picture-v3.jpg -vf scale=96:96:flags=lanczos -frames:v 1 -update 1 branding/paper-robots/youtube/profile-picture/current/profile-picture-v3-small-preview.png
```


## Version 2 — matching the flatter banner robot

Prepared 2026-09-05 after San requested a matching banner and profile picture.
He likes the angular robot in banner version 3 and wants it refined. This version
uses that character as its reference, and then serves as the robot reference for
banner version 4. Selection/upload of this replacement have not been confirmed.

- [Upload picture](archive/v2/profile-picture-v2.jpg): 1024 × 1024 RGB JPEG, 192,028 bytes.
- [Generated source](archive/v2/profile-picture-v2-source.png): original 1254 × 1254 PNG.
- [Small-size preview](archive/v2/profile-picture-v2-small-preview.png): 96 × 96 PNG, preview only.
- [Matching banner and prompts](../banner/prompts.md): version 4.

Built-in image generation produced the artwork. FFmpeg mechanically downscaled
and JPEG-encoded the upload. The square image, dimensions and file size were
checked, and the 96 px preview was inspected for recognizability. The head, ear
and folded corner have clear margins for circular display; shoulder corners are
decorative and can be clipped. Review the actual YouTube circular preview.

### Version 2 generation prompt

Input: channel-banner-v3-mobile-preview.jpg, robot/style reference only.

Use case: identity-preserve.
Asset: one finished SQUARE profile picture for the Paper Robots YouTube channel.
Input image is the existing banner: use ONLY its robot on the right as the character and graphic-style reference. The user likes THIS flatter angular robot and wants a higher-quality matching profile picture. Do not include any lettering or habitat from the reference.

Create a beautifully composed head-and-shoulders portrait of this same paper robot, large and legible in a tiny circular avatar. Preserve the distinctive simple cobalt squared head with a slight three-quarter turn, single ivory triangular folded corner at its upper right, one vermilion circular ear on the right, two modest ivory circular eyes with cobalt pupils, and short rectangular neck. Keep the same curious, understated expression and angular paper construction; make the outlines and folds intentional, the two eyes coherent and the proportions well resolved. Head dominates, with only a small suggestion of shoulders at the bottom. Keep the entire head, folded corner and ear comfortably inside the central 72% of the square; leave breathing room for a circular crop.

Style: refined editorial cut-paper and screenprint illustration, beautiful simple shapes, crisp fine edges with very subtle natural irregularity, flat cobalt blue with ONE restrained darker-blue side plane, ivory and a small vermilion accent. Very light ink texture only inside colored shapes. Plain warm ivory background (#F7EEDB), no heavy paper grain, fake watercolor wash, drop shadows, glossy highlights or photorealistic material. A small number of confident details, not faceted polygon shading. This is an adult science-and-ideas channel: warm and curious, not a baby toy, corporate stock robot or dramatic movie android.

Square opaque image at highest available native resolution, ideally 2048x2048. One finished profile picture, no border, text, badge, circular frame, scenery, extra symbols, grid, mockup or watermark.

### Version 2 export commands

```bash
ffmpeg -hide_banner -loglevel error -n -i branding/paper-robots/youtube/profile-picture/archive/v2/profile-picture-v2-source.png -vf scale=1024:1024:flags=lanczos -pix_fmt yuvj444p -q:v 2 -frames:v 1 -update 1 branding/paper-robots/youtube/profile-picture/archive/v2/profile-picture-v2.jpg
ffmpeg -hide_banner -loglevel error -n -i branding/paper-robots/youtube/profile-picture/archive/v2/profile-picture-v2.jpg -vf scale=96:96:flags=lanczos -frames:v 1 -update 1 branding/paper-robots/youtube/profile-picture/archive/v2/profile-picture-v2-small-preview.png
```

## Version 1


Created 2026-09-05 with the built-in image generation tool. San liked this design and confirmed version 1 was set on YouTube. A replacement was requested later the same day; see version 2 above.

Asset: [profile-picture-v1.png](archive/v1/profile-picture-v1.png). Square opaque PNG, 1254 × 1254 pixels. Intended to match the film's cobalt, ivory paper, and vermilion palette and remain recognizable in a circular avatar crop. Recognizability is the design goal; no audience performance has been measured.

## Initial generation prompt

Use case: logo-brand. Create one finished square YouTube channel profile picture for a thoughtful illustrated film series about AI and robotics, working name Paper Robots, by San Kala. Primary goal: instantly recognizable, distinctive avatar legible at 48 pixels and inside a circular crop. Subject: one large, charming but thoughtful retro robot head, almost frontal with a very slight three-quarter turn. The head is a broad simple deep cobalt blue silhouette with two generously spaced warm ivory circular eyes. The robot feels made from painted folded paper: one clearly visible folded ivory corner at the upper right of the head is the memorable identifying detail. A single small vermilion red circular ear provides the only red accent. A short cobalt neck and minimal suggestion of shoulders; the HEAD dominates. Style: restrained editorial gouache illustration, opaque matte brush-painted shapes on warm ivory cold-press paper, tactile but subtle brush edges, large flat color regions, sophisticated vintage science-book charm. Match a world of ivory paper, cobalt blue mountains and vermilion painted plains. Composition: one centered icon, head and neck entirely within central 72 percent of square canvas; comfortable clear margins for YouTube circular clipping; strong clear silhouette. Background is plain warm ivory paper edge to edge. Palette: deep cobalt, warm ivory, one tiny vermilion accent, at most one additional lighter blue plane. Keep contrast strong and detail sparse. Mood: curious, intelligent, warm, quietly playful. Constraints: exactly one avatar, no grid, no presentation mockup, no typography, no letters, no text, no watermark, no badge border, no busy scenery, no gradients, no neon, no chrome, no glossy 3D, no photorealism, no circuitry patterns, no generic chatbot speech bubbles, no huge emoji smile, no miniature mechanical details. Output a polished square bitmap, 1024 by 1024.

## Final editing prompt

Input: the robot avatar produced by the initial prompt. Preserved robot identity and changed framing/background.

Edit this existing painted robot avatar into a FINISHED SQUARE PORTRAIT ILLUSTRATION ready to upload as a YouTube profile picture. Keep exactly the same cobalt paper robot identity, curious ivory eyes, vermilion ear, and ivory folded corner on its head, preserving the tactile gouache paper style. Change only the framing and background: make the entire background fully OPAQUE warm ivory (#F5F0E6) with very subtle cold-press paper texture extending to all four edges and corners. This is a flat square illustration on a visible sheet of paper, NOT a transparent cutout. Scale the robot down modestly so there is generous ivory negative space above and beside its head. Keep the complete head and red ear comfortably inside an inscribed circle with at least 10 percent clearance; show only a short neck and a small suggestion of shoulders at the bottom. Robot is centered. Preserve contrast and recognizability at small sizes. Absolutely no alpha transparency, no black background, no text, no border, no mockup, no additional objects. Return one finished opaque square portrait bitmap, approximately 1024 x 1024.
