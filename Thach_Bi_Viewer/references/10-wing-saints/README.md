# Sanctuary wing saints — generated concept pair

Generated on **9 October 2026** with the built-in `image_gen.imagegen` tool, one generation call per asset. Both native PNGs are **1024 × 1536 pixels (2:3 portrait)** and retain their original pixels without resampling.

- [Saint Peter](saint-peter-concept-v1.png): elderly apostle with brass/silver keys and a plain book, in blue and ochre-gold.
- [Saint Paul](saint-paul-concept-v1.png): apostle with a plain book and peaceful, downward-held symbolic sword, in blue and subdued red.
- [Full provenance](provenance.json): exact prompts, generated source paths, native dimensions, byte counts, SHA-256 hashes, style-reference relationship and review status.

The owner-confirmed intent is a **Saint Peter and Saint Paul pair between the two windows in each sanctuary wing**. These two textures can be reused for four modeled pictures: one Peter and one Paul in each wing. Keep two native artwork files, rather than duplicating them for each modeled frame.

The images are **CONCEPT**. Subject and location intent is **USER CONFIRMED**; final artwork, public-use/copyright review and physical product selection remain pending. No print size, substrate, finish, frame, fixing, mounting capacity, moisture resistance, glare performance or maintenance specification is approved. The figures are representative sacred art, not verified historical likenesses.

Visual inspection of each full native output confirmed recognizable attributes, coherent single figures, readable silhouettes and a matching backdrop, figure scale and light. No obvious text, watermark, frame, room mockup, extra people or extra hands is visible. This inspection does not approve engineering or the installed model. The generation tool did not report a model identifier; it remains `null` in the provenance.

This folder contains artwork and provenance only. The coordinated model change owns the placements, frames, dimensions, sightlines, records, global reference manifests and desktop review. The native selected outputs remain at their original generated file paths, recorded in the provenance.

Governing documents checked: [repository rules](../../../AGENTS.md), [sanctuary model](../../../docs/sanctuary-model.md), [church art source hierarchy](../../../docs/church-view-renderings.md), [reference manifest](../manifest.json) and [coverage record](../coverage.json). Repository base read: `cbf47da`. No original drawing or existing artwork is replaced.

## Exact Saint Peter prompt

```text
Use case: stylized-concept
Asset type: original unframed devotional painting texture for the Catholic Thạch Bi Church sanctuary, part of a matched Saint Peter / Saint Paul pair.
Primary request: Create ONE high-quality portrait painting of Saint Peter, the apostle, in a 2:3 portrait canvas. Deliver the artwork itself edge to edge, intended native canvas 1024 by 1536 pixels.
Scene/backdrop: restrained warm umber and muted ochre-gold painted atmosphere, softly luminous behind the head, darkened gently toward the lower corners; no architecture, room, landscape or objects in the background.
Subject: one elderly Mediterranean apostle, dignified weathered face, short curling grey-white hair and beard, calm compassionate expression. His hands must be well formed. He carries a clearly recognizable pair of large keys, one warm brass-gold and one silver, in one hand; his other arm holds a closed dark reddish-brown book with a plain cover and no lettering. A delicate circular gold halo identifies the sacred figure.
Style/medium: original classical Catholic sacred oil painting, rich but restrained glazing, refined painterly realism, softly visible brushwork, convincing fabric folds, warm flesh tones, no imitation of a named painter.
Composition/framing: single near-frontal standing figure shown from head to just below the knees, centered, filling most of the portrait; halo and head have breathing room at the top, both hands, entire keys and book clearly visible. Large simple shapes, strong readable silhouette and expressive face suitable for viewing across a church.
Lighting/mood: gentle light from upper left, reverent and peaceful, moderate contrast, neither gloomy nor theatrical.
Color palette: muted deep blue tunic, warm ochre-gold mantle, earth browns, subtle red accents; harmonious with brass and red lacquer church decoration.
Constraints: exactly one person, no extra hands, coherent anatomy, no frame or decorative border, no room view or mockup, no printed text, no letters or numbers, no writing on the book, no inscriptions, no logos, no watermark.
```

## Exact Saint Paul prompt

Saint Peter's native generated output was provided as a **style/composition reference only**, using the exact source path recorded in the provenance.

```text
Use case: stylized-concept
Asset type: original unframed devotional painting texture for the Catholic Thạch Bi Church sanctuary, the Saint Paul companion to the Saint Peter style reference.
Primary request: Create ONE new high-quality portrait painting of Saint Paul, the apostle, in a 2:3 portrait canvas. Deliver the artwork itself edge to edge, intended native canvas 1024 by 1536 pixels.
Input images: Image 1 is a STYLE AND COMPOSITION REFERENCE ONLY, the newly generated Saint Peter painting. Match its painterly technique, warm backdrop, scale of the figure, face lighting, halo treatment and sense of dignity. Create a visibly distinct Saint Paul; do not retain Peter's face, white hair, keys or gold mantle.
Scene/backdrop: the same restrained warm umber and muted ochre-gold painted atmosphere, softly luminous behind the head, darkened gently toward the lower corners; no architecture, room, landscape or objects in the background.
Subject: exactly one mature Mediterranean apostle with a high balding forehead, short dark brown hair at the sides and a full dark beard with a little grey, thoughtful dignified face and calm peaceful expression. His hands must be well formed. One arm cradles a closed dark reddish-brown book with a plain cover and no lettering. The other hand rests gently around the hilt of one simple straight symbolic sword at waist height, the entire sword held vertically downward beside the body, tip down, blade clear and visible. Peaceful traditional Catholic iconography, no combat posture. A delicate circular gold halo identifies the sacred figure.
Style/medium: original classical Catholic sacred oil painting, rich but restrained glazing, refined painterly realism, softly visible brushwork, convincing fabric folds, warm flesh tones, no imitation of a named painter.
Composition/framing: single near-frontal standing figure shown from head to just below the knees, centered, filling most of the portrait at the same scale as the reference; halo and head have breathing room at the top, both hands, the entire sword including downward tip, and book clearly visible. Large simple shapes, strong readable silhouette and expressive face suitable for viewing across a church.
Lighting/mood: gentle light from upper left, reverent and peaceful, moderate contrast, neither gloomy nor theatrical.
Color palette: muted deep blue tunic, rich subdued red mantle, earth browns and muted gold accents; harmonious with the Saint Peter companion, brass and red lacquer church decoration.
Constraints: exactly one person, exactly one downward-held sword, no keys, no extra hands, coherent anatomy, no frame or decorative border, no room view or mockup, no printed text, no letters or numbers, no writing on the book, no inscriptions, no logos, no watermark.
```


## Offline texture packaging

`python3 scripts/build_saint_textures.py` (repository root) generates `Thach_Bi_Viewer/wing-saint-textures.js` from these exact native PNGs after checking their provenance hashes. `--check` verifies deterministic packaging without writing. It embeds each original PNG once as a data URL for ordinary double-clicked `file:` WebGL viewing; neither pixels nor dimensions are changed. The two shared GPU textures still serve four frames. The PNGs remain the native artwork masters and direct reference-gallery sources. A real Chrome test without any special file-access flag verifies GPU upload and actual rendering; a loaded HTML image alone is insufficient.
