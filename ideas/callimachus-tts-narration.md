# Idea: Callimachus-Driven Audiobook Narration Pipeline

**Date**: 2026-05-24
**Origin**: Alexandria session — searching for a Girl Behind the Gates audiobook (doesn't exist), discussing expressive TTS

## The Problem

Some books simply have no audiobook. Others have poor ones. For books that Callimachus has already ingested and semantically indexed, we're one step away from being able to generate a narrated version — the structure and meaning are already there.

## The Insight

Raw TTS reads words. The interesting approach is an LLM upstream that acts as a director:

1. Analyze each passage for emotional register, pacing, speaker
2. Generate SSML annotations or model-specific steering parameters
3. Feed annotated text to an expressive TTS engine
4. Assemble output into a chapterized M4B with cover art

Callimachus already does semantic passes over ingested EPUBs — a **narration pass** is a natural addition to the pipeline.

## Proposed Narration Pass

Callimachus analyzes each paragraph and emits a structured annotation:

```json
{
  "type": "dialogue | narration | inner_monologue | action | description",
  "speaker": "character name or null",
  "emotion": "grief | tension | comedy | reverence | neutral | ...",
  "pace": "slow | normal | fast",
  "pause_before_ms": 800,
  "emphasis_words": ["word1", "word2"]
}
```

This annotation layer is the "director's script" — the TTS engine consumes it to vary voice, rate, pitch, and pause timing per segment.

## TTS Engine Options

| Engine | Quality | Expressiveness | Self-hostable | Notes |
|--------|---------|----------------|---------------|-------|
| ElevenLabs v3 | ★★★★★ | ★★★★☆ | No | Best quality; Audiobook Creator product exists; API cost at scale |
| Dia (Nari Labs) | ★★★★☆ | ★★★★★ | Yes | Best open-source expressiveness; non-verbals (laughs, sighs) |
| Orpheus TTS | ★★★★☆ | ★★★★☆ | Yes | Very natural, good emotional range |
| Kokoro | ★★★☆☆ | ★★☆☆☆ | Yes | Fast, light (~82M params), limited expressiveness |

**Recommended self-hosted path**: Dia or Orpheus on Tokyo's GTX 1050 Ti. Slow but free per-book.

## Where Callimachus Fits

The pipeline would live as a Callimachus command, e.g. `callimachus narrate <book-id>`:

1. **Narration pass** — LLM (Claude) annotates each paragraph with the schema above; stored in Callimachus DB alongside semantic pass results
2. **SSML generation** — annotations compiled into SSML or engine-native steering
3. **Chapter rendering** — TTS renders chapter by chapter (manages token/context limits naturally)
4. **Assembly** — ffmpeg stitches chapters into M4B with chapter markers, embeds cover art
5. **ABS delivery** — drops into `/mnt/nas/plex-library/Audiobooks/<title>/` and triggers ABS rescan

## Practical Constraints

- A novel is ~80–100k words → 9–11 hours of audio
- LLM annotation pass: feasible chapter-by-chapter, ~$0.10–0.50/book at Sonnet pricing
- GPU rendering: GTX 1050 Ti can run Kokoro/Orpheus inference, just slowly (real-time or slower)
- ElevenLabs cost: ~$0.30/1k chars → $20–40/full novel at quality; viable for specific books

## Best First Target

Books that have no existing audiobook — *The Girl Behind the Gates* (Brenda Davies) is the exact use case that prompted this idea. Callimachus has the EPUB; there's no narrated version anywhere.

## Related

- `packages/callimachus/` — indexing pipeline, semantic pass
- `packages/callimachus/src/pipeline/passes/semantic-pass.ts` — existing pass to model after
- ABS library: `/mnt/nas/plex-library/Audiobooks/`
- Callimachus book adapter: `packages/callimachus-adapter-book/`
