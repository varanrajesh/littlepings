// Cloudflare Pages Function — serves the ARD manifest at /.well-known/ard.json
//
// Why a Function instead of a static file: Cloudflare Pages does not reliably
// serve files inside the dot-prefixed `.well-known` directory as static assets,
// so a plain public/.well-known/ard.json falls through to the SPA index.html
// (returning HTML, which breaks PageSpeed's ARD audit with "Unexpected token '<'").
// A Pages Function guarantees a raw application/json response on this exact path.
//
// Keep this manifest in sync with public/ai-catalog.json. The CI ARD validator
// (scripts/validate-ard.mjs) checks both against the official ArdManifest schema.
const MANIFEST = {
  specVersion: '1.0',
  host: {
    displayName: 'LittlePings',
    documentationUrl: 'https://littlepings.com/',
    logoUrl: 'https://littlepings.com/icons/icon-512.png',
  },
  entries: [
    {
      identifier: 'urn:air:littlepings.com:app:keyboard-toy',
      displayName: 'LittlePings – Keyboard Toy for Toddlers',
      type: 'text/html',
      url: 'https://littlepings.com/',
      description:
        'A free, safe, browser-based keyboard smashing toy for babies and toddlers aged 0-5. Every key press creates colourful animated emoji bubbles and playful piano sounds. No ads, no accounts, no data collected.',
      version: '1.0.0',
      updatedAt: '2025-07-10T00:00:00Z',
      tags: ['toddler', 'kids', 'keyboard', 'toy', 'baby', 'free', 'safe', 'pwa', 'no-ads', 'educational'],
      capabilities: [
        'KeyboardInteraction',
        'AudioFeedback',
        'AnimatedBubbles',
        'ThemeSwitching',
        'ParentLock',
        'OfflineSupport',
      ],
      representativeQueries: [
        'free keyboard smashing toy for toddlers',
        'safe browser app for babies to play with keyboard',
        'toddler keyboard toy no ads',
        'kids keyboard mashing game online free',
      ],
      metadata: {
        pricing: 'free',
        ageMin: '0',
        ageMax: '5',
        platform: 'web',
        pwa: 'true',
        offline: 'true',
        dataCollection: 'false',
        themes: '6',
        privacyUrl: 'https://littlepings.com/privacy/',
      },
    },
  ],
};

export const onRequestGet = () =>
  new Response(JSON.stringify(MANIFEST, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
