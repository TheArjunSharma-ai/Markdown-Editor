# Portable Markdown Editor

A framework-independent, browser-only Markdown editor with source, live preview, and split modes. Built from [the architecture](./markdown-editor-architecture.md) and [implementation plan](./PROJECT-DESIGN-AND-TEST-PLAN.md).

## Start the demo

Use Node.js 24 LTS (tested with 24.20.0 and npm 11.19.0). Node.js 22.12+ in the 22 LTS line is also permitted by the toolchain.

Stop this project's running development/preview servers before `npm ci`. On Windows their esbuild process can lock files while npm replaces dependencies.

```powershell
Set-Location 'C:\WX\Projects\Markdown-Editor'
npm ci
```

After installation succeeds:

```powershell
npm run dev
```

Open **http://127.0.0.1:5173/demo/**. The demo has two independent editors, theme selection, a read-only toggle, and Markdown download. Changes are held in memory, not saved automatically. Refreshing discards them unless you downloaded a copy.

The dev command builds the library before serving the demo. Restart it after changing library source to regenerate the distribution; demo HTML/JS/CSS changes are served directly. Stop the server with Ctrl+C in its terminal.

VS Code tasks are also available: **Build Markdown Editor** and **Run Markdown Editor Demo**.

## Build and production preview

```powershell
npm run build
```

Output:

| Artifact | Purpose |
|---|---|
| `dist/markdown-editor.js` | Classic-script bundle exposing `window.MarkdownEditor` |
| `dist/markdown-editor.es.js` | ES module exporting `MarkdownEditor` and `create` |
| `dist/markdown-editor.css` | Shared stylesheet, required for either bundle |
| `site/` | Static demo, copied bundles, and browser-test fixture pages |

All runtime dependencies are bundled. No runtime CDN is needed. Do not edit generated output.

After a successful build:

```powershell
npm run preview
```

Open **http://127.0.0.1:4173/demo/**. Use HTTP rather than opening HTML directly from disk. Both servers bind to loopback and fail if their port is occupied; do not terminate unrelated processes to free a port. Production hosting belongs to the embedding application.

## Embed in plain HTML or ASP.NET

Copy the three files in `dist` to your application's static assets directory, for example ASP.NET's `wwwroot/assets`. Include the CSS and classic bundle, then load a separate host initialization script:

```html
<link rel="stylesheet" href="/assets/markdown-editor.css">
<div id="notes"></div>
<script src="/assets/markdown-editor.js" defer></script>
<script src="/assets/notes.js" defer></script>
```

Example host initialization script:

```javascript
const editor = MarkdownEditor.create({
  element: '#notes',
  value: '# Notes\n\nStart writing.',
  mode: 'split',
  theme: 'system',
  onChange(markdown) {
    // Mark your host form dirty; saving remains the host's responsibility.
    console.log('Current character count:', markdown.length);
  },
});
```

Or use the ES module with the same API:

```javascript
import { MarkdownEditor } from '/assets/markdown-editor.es.js';
const editor = MarkdownEditor.create({ element: '#notes' });
```

Read `editor.getValue()` on form submission and send Markdown through the host's authenticated API. Treat returned Markdown as data: fetch it as JSON or use correctly encoded form values; do not interpolate untrusted Markdown into an inline script.

The library does not implement authentication, network requests, storage, uploads, autosave, concurrency handling, or server validation. The demo download is not a server save.

## API

### Creation options

| Option | Default | Contract |
|---|---|---|
| `element` | Required | CSS selector resolving to an HTML element, or an HTML element in the current document/realm |
| `value` | `""` | Markdown string; initialization does not emit a change |
| `mode` | `"split"` | `"source"`, `"preview"`, or `"split"` |
| `readOnly` | `false` | Boolean; host-driven updates remain allowed |
| `placeholder` | `""` | Textarea placeholder string |
| `theme` | `"system"` | `"light"`, `"dark"`, or system color preference |
| `onChange` | Absent | Callback receiving the new Markdown string |
| `onFocus` | Absent | Callback when focus enters the whole editor |
| `onBlur` | Absent | Callback when focus leaves the whole editor |

Invalid arguments throw descriptive errors. Invalid selector syntax throws the browser's selector error. Duplicate attachment to one host is rejected. Optional properties must be omitted or `undefined` to use defaults; `null` is not a valid value.

### Instance methods

| Method | Behavior |
|---|---|
| `getValue()` | Read exact current Markdown |
| `setValue(markdown)` | Immediately update source/preview; emit one callback if the value changed, none if unchanged |
| `getHTML()` | Render and return sanitized HTML for the latest value, even if a preview debounce is pending |
| `setMode(mode)` | Switch visible panels without changing content |
| `setReadOnly(boolean)` | Disable source edits, shortcuts, and formatting; retain copy and programmatic updates |
| `focus()` | Focus source in source/split mode or the preview region in preview mode |
| `destroy()` | Cancel pending work, remove listeners and owned UI, release the host; safe to call repeatedly |

All methods except `destroy()` throw after destruction. Existing host children are preserved. Multiple editors have independent state. Rendering errors clear stale preview HTML, display an accessible error message, and propagate to the caller or browser error handler for scheduled rendering. A later successful render clears the error. Host callback errors are not swallowed.

### Formatting and interaction

- Bold, italic, strikethrough, heading, links, images, bullet/numbered lists, quotes, code blocks, and tables.
- Ctrl/Cmd+B and Ctrl/Cmd+I operate only within editable source.
- Toolbar actions format the current source selection and restore source focus; empty selections insert editable placeholders.
- Strikethrough toggles `~~text~~` on and off in both editors, including selections that contain the markers. Boundary whitespace stays outside the markers; multiline selections format each nonblank line separately.
- Links and images insert example URLs to replace in Markdown; this release has no URL picker or upload dialog.
- Lists, headings, and quotes apply to selected complete lines.
- Preview renders 150 ms after the last input, with composition-aware scheduling for IMEs. Value/callback updates are immediate.
- Split layout stacks below 768 CSS pixels. Code and tables scroll within the editor.
- Character count uses JavaScript string length (UTF-16 code units), not a grapheme count.

There is no WYSIWYG mode, public document-validation event stream, syntax highlighting, extension API, or undo-history API. Browser textarea editing supplies native editing behavior; toolbar/programmatic updates are not guaranteed to join native undo history.

## Inline live editor

The demo also includes **Write directly in the preview**, a separate, independently editable document. Click a line to reveal its Markdown syntax. Move to another line and the previous line returns to its formatted appearance. On blur, all supported inline markers are hidden. A selection spanning several lines reveals syntax on each selected line.

```javascript
const inline = MarkdownEditor.createInline({
  element: '#inline-notes',
  value: '# Start writing\n\nA **bold** idea.',
  theme: 'system',
  onChange(markdown) {
    console.log('Inline document changed:', markdown.length);
  },
});

inline.getValue();
inline.getHTML();
inline.setValue('# Updated\n\nStill Markdown.');
inline.setReadOnly(true);
inline.focus();
inline.destroy();
```

`createInline` is available both on the classic-script `MarkdownEditor` facade and as a named ES module export. It accepts the same creation options **except `mode`** and exposes the same methods **except `setMode`**. One host may contain only one editor of either type. Read-only mode hides markers even on the selected line, but still permits host updates and copying.

The inline editor uses CodeMirror 6 with a Markdown syntax tree rather than converting edited HTML back into Markdown. Headings, emphasis, strikethrough, links, inline code, bullets, quotes, code fences, and images receive live-preview styling. Images use the same sanitized rendering and URL policy as the existing editor; click an image to reveal its source. Link labels are styled, not navigable anchors, so clicking them edits rather than leaving the document.

Normal selection, multiline editing/paste, IME input, Ctrl/Cmd+B/I, and undo/redo are supplied by the editing engine. Formatting buttons participate in inline undo history. CodeMirror selects Cmd shortcuts on Apple/iOS platforms and Ctrl on Windows/Linux. Inline values normalize incoming line endings to LF; the original source editor's exact-value contract is unchanged.

This is a live Markdown surface, **not a full WYSIWYG HTML editor**. Tables, setext headings, reference links, and other advanced block syntax may remain visible as Markdown rather than matching the separate HTML preview exactly. There is no synchronization between demo documents; each has its own download. Appearance and read-only demo controls apply to both editable documents.

The added engine increases bundle size and injects its editor layout styles at runtime. Hosts with a strict style CSP need to evaluate the CodeMirror style policy/nonces before integration. Real-device keyboard and screen-reader qualification remain pending.

## Security and hosting policy

- Raw HTML in Markdown is escaped, not executed.
- Markdown parsing is followed by a separate DOMPurify allowlist.
- Scripts, SVG, frames, forms, styles, arbitrary classes/data/ARIA attributes, and event handlers are excluded from rendered content.
- Links accept HTTP, HTTPS, mailto, relative references, and fragment references.
- Images accept HTTP/HTTPS and relative references. External images are enabled by the approved first-version policy, with `referrerpolicy="no-referrer"`.
- Unsafe explicit schemes, protocol-relative references, backslashes, and embedded whitespace/control characters in URLs are rejected. Encode spaces in valid URLs.
- Relative references resolve against the host page/base URL. External links use the current browsing context.
- No-referrer does not hide the reader's IP address from image hosts. Embedding applications should restrict image origins with CSP if required.
- `getHTML()` is sanitized output, not a replacement for host/server validation. Keep dependencies current.

The host owns CSP, permissions, data encoding, remote resource restrictions, and navigation policy. Native WebViews must load only trusted assets/origins and restrict navigation; no native bridge is provided. Modules require a browser DOM and are not server-side rendering modules.

## Testing

Run each stage only after the previous one succeeds:

```powershell
npm run check
npm run test:coverage
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

Additional commands:

```powershell
npm test
npm run test:watch
npm test -- tests/security.test.js
npm run test:e2e -- --project=chromium
npm audit
```

Playwright starts its own production-preview server on port 4173; stop any preview server you started manually before running it. The development demo may continue running on 5173.

### Automated coverage

- API validation, exact value round-trips, callbacks, focus, composition, formatting, modes, read-only state, multi-instance isolation, and destruction.
- Markdown syntax, raw HTML escaping, malformed content, unsafe URL/HTML fixtures, and rendering failures/recovery.
- Actual built classic-script and ESM assets, no runtime CDN dependency, CSS loading, interactions, keyboard focus, responsive widths, themes, and download behavior.
- Chromium, Firefox, WebKit, Pixel Chromium emulation, and iPhone WebKit emulation.
- 100 KB deterministic ASCII fixture: 30 measured edits after warm-up, including debounce, with p95 <= 500 ms; 1 MB stress fixture must preserve content.

Performance runs on desktop Chromium only; the four corresponding cases in other projects are intentionally skipped. Browser engines and device emulation do not certify real Safari releases or native WebViews.

Coverage thresholds: 90% statements/lines/functions and 85% branches. Reports are generated in `coverage/`, `playwright-report/`, and `test-results/`. The benchmark attaches its environment and measurements to the browser report.

### Verified local results including inline editor (2026-10-22)

| Check | Result |
|---|---|
| Lockfile restore with `npm ci` | Passed with development server stopped |
| Static JavaScript checking | Passed |
| Production bundles and static demo | Built successfully; demo HTTP and bundle HTTP responses verified |
| Unit/DOM tests | 104 passed after strikethrough regression fix |
| Statement / branch / function / line coverage | 98.77% / 97.03% / 97.80% / 99.01% |
| Sanitizer and URL-module coverage | 100% in all four metrics |
| Five-project browser matrix | 76 passed; 4 intentional benchmark skips |
| Original editor 100 KB input-to-preview p95 | 493.3 ms over 30 samples, including debounce |
| Original editor 1 MB stress update | Content preserved; about 1.48 seconds to render |
| Dependency audit | Zero reported vulnerabilities at verification time |

Benchmark environment: Windows `10.0.26200`, Intel Core i7-1165G7 @ 2.80 GHz, Playwright Chromium `156.0.8078.4`. This is a local sample, not a guarantee for mobile hardware or an approved production performance baseline.

The inline addition has 25 browser checks across the five projects, covering active-line reveal/blur, editing, formatting, undo, read-only state, safe images, destruction, demo integration, Unicode multiline insertion, and viewport overflow. Large-document performance thresholds above measure the original editor; a separate inline-editor performance baseline has not been established.

After fixing repeated strikethrough clicks, five additional targeted browser checks passed (one per configured project), verifying toggle-off behavior, sanitized `<s>` output, and actual line-through styling on both active and inactive lines. The full 76-check browser run above predates that focused fix.

The first browser run exposed a Firefox timeout during post-navigation viewport resizing on this machine. Responsive tests now set the exact viewport when creating the browser context and assert its actual width before checking layout; the full matrix subsequently passed.

### Remaining release qualification

- Agree exact supported desktop browser floors and Android/iOS versions; the latest-two-release policy is a target, not a completed certification.
- Run actual Chrome/Edge/Safari version checks and real Android WebView/iOS WKWebView device tests.
- Perform NVDA/VoiceOver testing and manual zoom/contrast review; automated names/focus checks are not a full accessibility audit.
- Integrate and test the actual authenticated ASP.NET host and persistence API.
- Agree baseline performance hardware and account for very large documents blocking the main thread.
- Choose the project license and review dependency license obligations before distribution.

CI configuration is provided for future GitHub hosting, but has not been run remotely. The package is private to prevent accidental publication until release qualification is complete.
