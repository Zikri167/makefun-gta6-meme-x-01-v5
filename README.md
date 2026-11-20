# GTA 6 Meme — Breaking News (v5)

[![gta6-meme-x-01](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![rank](https://make.fun/badge/gta6-meme-x-01/Zikri167/makefun-gta6-meme-x-01-v5/rank.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![reward](https://make.fun/badge/gta6-meme-x-01/Zikri167/makefun-gta6-meme-x-01-v5/reward.svg)](https://make.fun/bounty/gta6-meme-x-01)

Bounty: https://make.fun/bounty/gta6-meme-x-01

## The meme

A TV breaking-news parody set in Leonida at sunset. The make.fun ghost is on
air as a field reporter in Vice City, holding a glowing magenta star coin up
to the camera like a microphone, with a small press badge on its chest.

- Top banner: **BREAKING NEWS** with a **LIVE** box.
- Headline: **ROCKSTAR DELAYS GTA 6 AGAIN**
- Chyron: **LOCAL GHOST ALREADY EARNING ON MAKE.FUN**
- Location line: **LEONIDA • STILL NO RELEASE DATE**

The joke lands on the endless GTA 6 delays: while everyone else is still
waiting for a release date, the ghost is already earning on make.fun — the
pitch is woven into the chyron of the news report itself.

## Run

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/meme.png` (1024×1024, byte-identical on every run) and
copies `POST.json` to `out/POST.json`. Node standard library only.
