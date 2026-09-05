# kinetic — theme rules

A motion-first poster. The hook renders as a seamless looping MP4; every other
slide is the same design held still, so a deck reads as one thing whether or
not you rendered the video.

## Rendering it

```bash
node scripts/render.js decks/deck.json out/deck --animate
```

Mark the slide with `"animate": true`. It produces **both** an `.mp4` and a
`.png` of the same slide — the still is not optional, see "Publishing" below.

Duration and frame rate live in `theme.json`:

```json
"animate": { "seconds": 4, "fps": 30 }
```

Four seconds at 30fps is 120 frames and takes about 12 seconds to render.
Longer costs linearly and buys nothing: a hook has about two seconds to work.

## How the frames are made, and why it matters

Frames are produced by **seeking** every animation on the page through the Web
Animations API — `a.currentTime = t` on each entry of `document.getAnimations()`
— not by waiting on a clock. Three consequences:

- The render is **deterministic**. The same deck produces byte-identical
  frames forever, which is the guarantee the rest of this pipeline depends on
  and the main reason this is not built on a video framework.
- Themes need **no CSS convention**. Any animation you write is seekable.
- Render time is frames × screenshot time, not real time. A 30-second
  animation would not take 30 seconds to render, it would take about 90.

## The two rules of the motion

**1. Ambient motion loops; entrance motion replays.**

The drifting field returns to its exact origin at 100%, so the ground never
jumps when the loop restarts. Entrance motion — the lines rising, the accent
bar sweeping — assembles once and then *holds* for the rest of the cycle. When
the loop restarts it replays, which is what a viewer expects from a hook.

Do not try to make entrance motion seamless by reversing it. Text that
un-assembles reads as a bug.

**2. Every delayed track needs `fill-mode: both`.**

Without it, an animation shows the element's *normal* state during its delay
rather than its from-state. The symptom is that the first frames look already
finished — lines visible before they are meant to rise, body copy flashing on
before its fade. It is the single easiest mistake to make here and it is
invisible until you extract frame zero and look at it.

## Writing for it

- **Three headline lines, maximum.** Each rises on its own delay; past three
  the last one lands after the viewer has already decided.
- One `*emphasis*` span. It gets the sweeping accent bar, and a second bar
  competing with the first is the whole slide fighting itself.
- The `deck` line fades in last, so it must still make sense arriving a second
  late. Do not put the punchline there.
- Animate the **hook only**. A carousel where several slides move is a Reel
  that has been cut up badly.

## Publishing

**A standalone Reel works.** Verified end to end: `--animate` output uploads
and publishes as `media_type: VIDEO` with no manual step.

```
media_url  = the .mp4
media_type = "reel"
```

**A mixed video+image carousel works too** — the mp4 as the first entry of
`media_urls`, stills after. This needed a fix in the publish wrapper: carousel
children must be created with `video_url` + `media_type=VIDEO` rather than
`image_url`, and video children must be polled to `FINISHED` before the parent
container is created, because they transcode asynchronously.

Note that neither the API response nor `get_recent_posts` can confirm it. Both
report `CAROUSEL_ALBUM` whether or not the video child survived. The only
reliable checks are opening the post, or:

    GET /{post-id}?fields=media_type,children{media_type,media_url}

The renderer writes a `.png` beside every `.mp4` regardless, so a deck can
always ship as stills with nothing lost.

### The audio track

`--animate` emits a silent AAC stream alongside the video. This is required —
Instagram's API rejects video with no audio stream, and the failure is silent:
it uploads, returns success, and appears as a still. Do not strip it.

## Tokens

| | |
|---|---|
| Ground | `#0A0A0D` with a drifting orange/teal field |
| Accent | `#FF5C1A`, second accent `#4EE0C0` |
| Display | Oswald 700, uppercase, 108px |

## What this theme is not for

Anything dense. Motion needs empty space around it to read, and a slide
carrying five rows has none. Use it for a hook and a closing line; put the
substance in the still slides.
