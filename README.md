# Smart Shift Scheduler Application

A mobile-first progressive web app that converts photographed shift rosters into a digital schedule and estimated earnings.

## Features

- Upload a schedule image and run OCR in-browser via Tesseract.js.
- Detect `E` (Evening) and `N` (Night) shift labels from OCR text.
- Assign each shift sequentially from a user-provided start date.
- Auto-apply shift times:
  - Evening: 2:30 PM – 10:30 PM
  - Night: 10:30 PM – 6:30 AM
- Calculate per-shift pay, total hours, and total earnings from hourly wage.
- iPhone-style card layout optimized for touch/mobile.
- PWA support (`manifest.webmanifest` + `sw.js`) for installability and offline caching.

## Run locally

Because this is a PWA using a service worker, run from a local web server (not via `file://`).

Examples:

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Current limitations

- OCR accuracy depends on image quality (lighting, blur, contrast).
- The app currently maps detected shifts from a chosen start date; it does not extract exact calendar dates directly from the image.
