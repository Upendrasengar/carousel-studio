# wide-cut — theme rules

A panorama pack. One wide canvas, cut into slides that read as one picture.

## The mechanic

```bash
node scripts/render.js decks/deck.json out/deck --panorama 3
```

The renderer builds a canvas three slides wide, then cuts it into three
images. Instagram butts slides together with no gutter, so anything crossing a
cut line lands half on one slide and half on the next — and the reader sees
one continuous picture.

Mark exactly N slides with `"panorama": true`, matching the `--panorama` count:

```json
{ "type": "strip", "panorama": true,
  "headline": "How one prompt\nbecomes a product",
  "titleAt": 4,
  "beats": [
    { "at": 34, "title": "Draft", "body": "one paragraph, no formatting" },
    { "at": 58, "title": "Shape", "body": "the agent asks what is missing" },
    { "at": 82, "title": "Ship", "body": "rendered, checked, posted" }
  ] }
```

`at` and `titleAt` are percentages **of the wide canvas**, never pixels — that
way the same markup works at three slices or five.

## Rules

- **Three slices.** Research puts completion around 80% at three; it falls off
  fast beyond that, and an unfinished panorama is worse than none.
- **Cross the cuts with graphics, never with words.** The rail and the
  background glow are full-bleed and already carry across every join — that
  is what sells the continuity. A *beat* centred on a cut gets sliced
  mid-word, which reads as a broken export rather than as one picture.
  Cuts land at 33.3% and 66.7%; a beat is 22% wide, so keep centres at least
  11 away from either. 17 / 50 / 83 works for three slices.
- The strip carries **no counter and no eyebrow**. A counter repeated three
  times across one continuous picture is exactly what gives the cut away.
- Panorama slides go at the **front** of the deck, not the middle. The effect
  is a hook; buried at slide 6 most viewers never reach it.
- Everything else in the deck renders normally at slide width. A deck is
  usually a three-slice strip plus five or six ordinary slides.

## What this theme is not for

Dense text. A panorama is a picture with words on it — if the content needs
paragraphs, cut it into ordinary slides and use a different pack.
