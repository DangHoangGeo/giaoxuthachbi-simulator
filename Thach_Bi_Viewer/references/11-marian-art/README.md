# Marian art from the church: door reliefs, inner-window lunette, rose window

**CONCEPT · PUBLICATION HOLD H8.** The owner passed on three pictures from the parish on **8 November 2026**. The author, the tool or method used to make them, the date and the licence are not recorded. The pictures look like generated images. These files are crops of those pictures, used as model textures because the owner chose to use them ([decision record](../../../docs/engineering/outer-wall-and-marian-art-2026-11-08.md)). They are not covered by the project licences ([NOTICE](../../../NOTICE.md)).

- `relief-1-annunciation.jpg` … `relief-9-assumption.jpg`: nine relief lunettes from the sheet "Đường hành hương Đức Mẹ", one for each outside door. The door for each scene is set in `marian-art.js`.
- `inner-window-m-lunette.jpg`: the silver Ave Maria monogram with crown and cross, used in the head of each inner C/G window.
- `rose-window-m.jpg`: "Hoa hồng Đức Mẹ", a 60 cm round stained-glass window, used in the outer porch wall.
- [provenance.json](provenance.json): the SHA-256 of each supplied picture, the crop box, size and SHA-256 of each file, its use in the model, and the open approvals.

The files are pixel crops only: nothing was resized, recoloured or retouched. They are re-encoded as JPEG at quality 92. The supplied pictures are not committed. `scripts/build_marian_art_textures.py` records the crop boxes and builds `../../marian-art-textures.js`, which embeds the files as data so that a double-clicked offline viewer can still use them; `--check` checks that package. Carving depth, timber, glass type, leading, frames, fixings and weathering are not specified. The pictures do not approve any product or construction.
