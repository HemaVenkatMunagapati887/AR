# Localization Review Status

| Language | Status | Notes |
|---|---|---|
| English (`en`) | Reviewed | Source language, authored directly. |
| Hindi (`hi`) | Draft, reviewer pending | Grammatically reviewed by the author; recommend a native-speaker pass before field deployment. |
| Santali (`sat`) | **DRAFT — machine-assisted, unreviewed** | Written in romanized Latin script (not Ol Chiki) as a hackathon-timeline shortcut. **Do not present as authoritative safety guidance until a native Santali speaker reviews it.** |

## Why romanized Santali instead of Ol Chiki

Santali is officially written in the Ol Chiki script. Rendering Ol Chiki correctly requires:
1. An Ol Chiki-capable font bundled into the app, and
2. Native-speaker-authored (not machine-translated) safety content, since a mistranslated safety instruction is a real hazard, not a cosmetic bug.

Neither was feasible to source and verify within a 48-hour hackathon window. The MVP ships romanized Santali text with a visible **"DRAFT"** marker in the source JSON and an in-app disclaimer banner (`santali_draft_notice` key, shown when Santali is selected) so this limitation is never hidden from a worker or a judge.

## Action items before any real deployment

- [ ] Engage a native Santali speaker (ideally with mining/industrial-safety vocabulary experience) to translate `Assets/StreamingAssets/Localization/sat.json` properly, in Ol Chiki script.
- [ ] Source or commission an Ol Chiki-capable font and wire it as a TextMeshPro fallback (see `docs/setup.md`).
- [ ] Have a native/fluent Hindi speaker sign off on `hi.json` and the Hindi question/option text in `backend/src/seed/*.data.js`.
- [ ] Re-run the full assessment flow in each language to confirm no text overflows the AR hint bubbles or button labels once real translations replace the placeholders.
