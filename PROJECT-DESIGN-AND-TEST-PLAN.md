# Markdown Editor: Project Design, Running and Testing Plan

## 1. Scope and document status

This design implements the direction in [the architecture document](./markdown-editor-architecture.md). The initial runnable implementation is now present. See [README](./README.md) for executable setup instructions, verified results, and remaining platform qualification. Sections below preserve the design and acceptance plan; proposals are not blanket platform certifications.

### First-release scope

- Framework-independent JavaScript editor embedded in an existing DOM element.
- Source, preview, and split modes; Markdown remains the canonical value.
- Headings, bold, italic, strikethrough, links, images, lists, blockquotes, fenced code, and tables.
- Formatting toolbar, keyboard shortcuts, read-only mode, responsive layout, and system/light/dark themes.
- Sanitized HTML output, accessible controls, documented public API, standalone demo, and automated tests.
- Multiple independent instances and reliable teardown.

### Deferred work

WYSIWYG, accounts, backend/database, image uploads, autosave, conflict resolution, collaboration, and native application wrappers are not part of this release. Host applications own persistence and authentication.

### Assumptions requiring approval before implementation

| Topic | Proposed decision |
|---|---|
| Desktop support | Latest two stable Chrome, Edge, Firefox, and Safari releases at release time; record exact tested versions |
| Mobile support | Responsive browser support initially; minimum Android System WebView and iOS/WKWebView versions must be agreed before claiming native compatibility |
| Raw HTML | Disabled; render literal HTML as escaped text |
| Links | Permit HTTP, HTTPS, mailto, relative references, and fragment links; reject other explicit schemes and protocol-relative URLs |
| Images | Permit HTTP/HTTPS and relative image URLs; reject data, blob, file, protocol-relative URLs, and other schemes |
| External images | Host must approve remote image loading because it can disclose reader network information; use `referrerpolicy="no-referrer"` |
| Persistence | Host-managed; the library neither saves nor claims that content is saved |
| Packaging | npm ES module plus a classic-script browser bundle and a separate stylesheet; dependencies bundled, no runtime CDN required |
| Preview scheduling | Proposed 150 ms debounce after user input; programmatic reads and updates remain current |

External HTTP/HTTPS and relative images with no-referrer protection were approved for implementation. Other defaults are implemented as the working first-version baseline. Exact browser/WebView floors remain unconfirmed release qualification requirements.

## 2. Technical design

### Technology choices

| Area | Proposed tool | Reason |
|---|---|---|
| Implementation | JavaScript ES modules with JSDoc and checked JavaScript | Matches the architecture and provides static checking without a framework |
| Markdown | `markdown-it`, with raw HTML disabled | Supports common Markdown and tables behind a small parser adapter |
| Sanitization | `DOMPurify` with an explicit allowlist | Maintained sanitizer independent of Markdown parsing |
| Build and demo | Vite library build and development server | Produces browser artifacts and serves the demo |
| Unit/integration tests | Vitest with a supported jsdom version | Exercises DOM lifecycle, API, parser, and policy |
| Browser tests | Playwright | Real-browser interactions, responsive layout, and built-bundle verification |
| Static checking | TypeScript compiler with `allowJs`, `checkJs`, and `noEmit` | Checks source without changing the distribution language |

Select mutually compatible stable versions during setup, pin them through a lockfile, and document the required Node.js LTS version. Do not substitute a custom sanitizer or parse Markdown using regular expressions.

### Proposed structure

```text
Markdown-Editor\
  src\
    index.js                  Public create entry point
    core\
      editor.js               Public instance facade and lifecycle
      controller.js           Value, mode, scheduling, callbacks
      defaults.js             Defaults and option validation
      commands.js             Selection-aware formatting operations
    ui\
      shell.js                Owned DOM, toolbar, mode controls, status
      styles.css              Scoped styles, themes, responsive layout
    markdown\
      parser.js               Markdown parser configuration
    security\
      sanitize.js             Allowlist and final HTML sanitation
      urls.js                 Shared link/image URL policy
  demo\
    index.html                Development/demo page
    main.js                   Two instances and host-save example
  tests\
    editor.test.js            API and lifecycle integration tests
    commands.test.js          Selection transformations
    markdown.test.js          Syntax and rendering fixtures
    security.test.js          Sanitizer and URL regression cases
    browser\
      editor.spec.js          Real-browser user journeys
      distribution.spec.js    Built classic-script and ESM smoke tests
      fixtures\               Pages served locally for browser tests
  dist\                       Generated; not edited by hand
    markdown-editor.js        Classic-script bundle
    markdown-editor.es.js     ES module bundle
    markdown-editor.css       Extracted stylesheet
  package.json
  package-lock.json
  vite.config.js
  vitest.config.js
  playwright.config.js
  jsconfig.json
  README.md
```

Create modules only when their responsibility is needed. An event bus, plugin framework, serializer, native bridge, and backend project are unnecessary for this scope.

### Data flow

1. `create()` validates options and reserves a host element.
2. The controller stores the Markdown string and creates the UI once.
3. Source input updates the stored value immediately, calls `onChange`, and schedules preview rendering.
4. The parser produces HTML with raw HTML disabled.
5. The security layer applies the shared URL policy and sanitizes HTML with a conservative tag/attribute allowlist.
6. Only sanitized HTML reaches the preview DOM or `getHTML()`.
7. The host reads `getValue()` and saves Markdown through its own authenticated API.
8. `destroy()` cancels pending renders, removes listeners, releases the element, and removes only instance-owned DOM.

Avoid rebuilding the textarea or toolbar on each input: doing so loses selection and keyboard state. Defer preview work during IME composition and schedule it on composition completion.

### Security boundary

- Use DOM creation and `textContent` for UI labels and user-visible errors.
- Retain only Markdown-related tags and attributes; exclude scripts, styles, forms, embedded frames, SVG, event handlers, and arbitrary classes/attributes.
- Apply the same URL rules to generated links, generated images, and toolbar-created content. Resolve allowed relative URLs against the host page; the host owns its base URL.
- Validate normalized URLs using URL parsing and the sanitizer's handling of encoded input, not a prefix-only regular expression.
- Do not open links in new windows by default. If a host introduces that behavior, enforce `noopener noreferrer`.
- Code blocks display text; they never execute code.
- Rendering failures display an accessible error message and propagate to API callers where applicable; never substitute unsafe HTML or silently report success.
- The host still owns CSP, server-side validation, authorization, uploads, and restrictions on remote image origins.

## 3. Public API contract

### Initialization

```javascript
const editor = MarkdownEditor.create({
  element: "#notes",
  value: "# Notes",
  mode: "split",
  readOnly: false,
  placeholder: "Write notes in Markdown...",
  theme: "system",
  onChange(markdown) {},
  onFocus() {},
  onBlur() {}
});
```

For the ES module build, expose the same `MarkdownEditor` facade as a named export. The classic-script build exposes `window.MarkdownEditor`.

| API | Defined behavior |
|---|---|
| `create(options)` | Return an independent instance; reject missing/invalid elements, duplicate attachment, and invalid options with descriptive errors |
| `getValue()` | Return exact current Markdown, including Unicode and line breaks |
| `setValue(markdown)` | Require a string; update source and preview immediately; emit one change callback only if the value changed |
| `getHTML()` | Return sanitized HTML for the latest value, even while a debounced preview update is pending |
| `setMode(mode)` | Accept only `source`, `preview`, or `split`; update visibility and accessible active state without changing content |
| `setReadOnly(boolean)` | Prevent input and formatting commands; retain selection/copy and allow host-driven `setValue()` |
| `focus()` | Focus the textarea in source/split mode; focus the preview region in preview mode |
| `destroy()` | Idempotent teardown; preserve unrelated host content and suppress pending callbacks |

Additional behavior:

- Do not emit `onChange` during initialization or unchanged updates.
- Treat focus/blur as transitions into/out of the whole editor, not movement between its internal controls.
- Toolbar commands preserve selection and restore source focus; disable them in preview mode and read-only mode.
- Support Ctrl/Cmd+B for bold and Ctrl/Cmd+I for italic only inside the editable source.
- Methods other than `destroy()` throw a descriptive lifecycle error after destruction.
- Validation initially means argument/option validation. Document-level validation events and a public subscription API are deferred rather than advertised without an implementation.

## 4. UI and host integration

- Header: editor name and Source / Split / Preview controls.
- Toolbar: accessible text or labeled icons for the supported formatting actions; at least 44 CSS pixel targets.
- Body: labeled textarea and named preview region; two columns on wide screens and stacked below a proposed 768 CSS pixel breakpoint.
- Footer: character count and rendering/error state; never show "Saved" unless the host has confirmed persistence.
- Use scoped selectors and CSS variables so multiple instances coexist without altering host styles.
- Support system theme, visible keyboard focus, 200% zoom, reduced motion, and horizontally scrollable tables/code blocks without page overflow.
- Do not announce the entire preview on every keystroke; reserve a polite live region for concise status/errors.

Plain HTML and ASP.NET integration copy the three distribution assets into the host's static asset location and initialize after the element exists. On form submit, assign `getValue()` to a form field or request payload. Bind initial content through safe encoding or fetch it as data; never concatenate untrusted Markdown into an inline script.

Android/iOS integration is a subsequent qualification step: load trusted local assets or an approved origin, restrict navigation, and expose no unrestricted native bridge. Browser device emulation alone does not qualify a WebView.

## 5. Implementation sequence

| Phase | Deliverables | Completion check |
|---|---|---|
| 1. Foundation | Package scripts, lockfile, parser/sanitizer adapters, minimal build | Both bundle formats load and sanitized fixtures pass |
| 2. Core editor | Lifecycle, textarea, preview, controller, complete API | API/lifecycle tests pass, including two instances |
| 3. Usability | Toolbar, shortcuts, modes, read-only, themes, responsive CSS | Keyboard and responsive browser journeys pass |
| 4. Packaging/docs | Demo, distribution smoke fixtures, README, host example | Clean install/build and classic-script/ESM smoke tests pass |
| 5. Qualification | Browser matrix, manual accessibility, performance measurements | All applicable release gates below pass |
| 6. Host/mobile follow-up | Actual ASP.NET integration and native harnesses | Authenticated save/load and real-device checks pass before platform claims |

Do not mark Phase 6 complete using a static demo. It requires the actual host application or separately supplied integration harnesses.

## 6. Running plan

### Prerequisites

- Supported Node.js LTS and its npm version, recorded in the eventual README and package engines.
- A terminal opened in the project directory.
- Internet access for the initial dependency and browser installation.
- No .NET SDK, database, or native tooling is needed for the standalone editor demo.

### Proposed scripts

| Script | Responsibility |
|---|---|
| `npm run dev` | Serve the demo on `127.0.0.1:5173`, using a strict port |
| `npm run check` | Run checked-JavaScript static validation |
| `npm test` | Run Vitest once, not in watch mode |
| `npm run test:watch` | Run Vitest interactively during development |
| `npm run test:coverage` | Run Vitest with coverage and enforced thresholds |
| `npm run build` | Generate both JavaScript bundles and CSS |
| `npm run preview` | Serve the production demo and built-asset fixtures on `127.0.0.1:4173` |
| `npm run test:e2e` | Run configured Playwright browser projects |

The build must explicitly include a demo/fixture output alongside the library artifacts: a library-only Vite build does not automatically create a production demo page.

### First local run after implementation

```powershell
Set-Location 'C:\WX\Projects\Markdown-Editor'
npm ci
if ($LASTEXITCODE -eq 0) { npm run dev }
```

Open `http://127.0.0.1:5173/demo/`. Confirm that typing updates the preview, mode buttons work, and the second instance stays independent. Stop the foreground server with Ctrl+C.

For initial scaffolding, use `npm install` after creating the dependency manifest to generate the lockfile; subsequent checkouts and CI use `npm ci`.

### Production build verification

Run `npm run build`, stop if it fails, then run `npm run preview`. Open `http://127.0.0.1:4173/demo/` and inspect the built distribution fixtures. Check that there are no missing assets, console errors, or runtime CDN requests.

The development and preview servers are local verification tools, not production hosting. Deploy generated assets through the host application's normal static-file pipeline.

## 7. Automated testing plan

### Unit and DOM integration matrix

| Area | Required cases and expected outcome |
|---|---|
| Initialization | Empty, Unicode, multiline, invalid selector/options, duplicate attachment; valid values preserved and invalid calls throw |
| Value API | Exact round-trip; unchanged update emits zero callbacks; changed update emits one; pending preview never makes `getHTML()` stale |
| Rendering | Every advertised Markdown construct, malformed input, escaping, nested lists, tables, fenced code |
| URL policy | Allowed relative/fragment/mailto links; forbidden schemes, mixed case, whitespace/control characters, encoded variants, protocol-relative URLs; separate image policy |
| Sanitization | Script tags, event attributes, SVG, iframe, style, malformed nesting; no executable or forbidden output survives |
| Commands | Selected and empty-selection formatting, multiline lists/quotes, cursor placement, read-only suppression |
| Modes | Correct visible regions and active states; switching never changes Markdown |
| Events | Input, host updates, focus transitions, composition, callback counts |
| Teardown | Cancel pending debounce, remove owned UI/listeners, preserve host siblings, recreate safely, repeated destroy |
| Isolation | Two instances retain independent values, selection, callbacks, modes, and lifecycle |

### Real-browser journeys

1. Load the actual classic-script distribution and call the global API without module support.
2. Load the ES module distribution and create an equivalent instance.
3. Type Markdown; wait for the configured preview interval; assert rendered structure.
4. Use toolbar and Ctrl/Cmd shortcuts; assert exact Markdown and selection.
5. Switch all modes and read-only state; verify keyboard and copy behavior.
6. Paste malicious/encoded fixtures; assert the preview DOM contains no unsafe attributes/URLs and no execution sentinel fired.
7. Destroy one of two instances, including with a pending render; verify the other remains usable.
8. Test desktop and 320/375/768 CSS pixel widths; assert page width does not exceed viewport width and controls remain reachable.
9. Verify light/dark/system appearance, keyboard-only navigation, accessible names, and focus visibility.

Configure Chromium, Firefox, and WebKit desktop projects plus Chromium/WebKit mobile emulation. WebKit is useful automated coverage but is not evidence that a released Safari or WKWebView version passed.

### Commands after implementation

```powershell
npm run check
npm test -- tests/editor.test.js tests/commands.test.js tests/markdown.test.js tests/security.test.js
npm run test:coverage
npm run build
npx playwright install
npm run test:e2e
```

Run each command only after the preceding command succeeds. Playwright configuration should start and verify the production preview server itself, use port 4173 strictly, and avoid reusing an unrelated process in CI. Install OS browser prerequisites where the CI runner requires them.

### Proposed measurable gates

- All static checks, unit/integration tests, and configured browser projects pass.
- At least 90% statement/line/function coverage and 85% branch coverage across source files; report security modules separately and test every documented policy branch regardless of aggregate coverage.
- Zero known failing sanitizer/URL regression fixtures.
- Proposed preview debounce: a burst of input produces one trailing render; `getValue()` remains immediate and `getHTML()` returns current content.
- Proposed performance target: for a deterministic 100 KB Markdown fixture on an agreed baseline desktop, p95 input-to-preview latency is at most 500 ms across 30 post-warm-up edits, including debounce. Record OS, browser, CPU, fixture, and measurements.
- A 1 MB stress fixture causes no crash or content loss; measure latency and document limits rather than assuming mobile responsiveness.

Coverage and performance numbers are proposed acceptance targets. Agree on baseline hardware before treating timing results as release evidence.

## 8. Manual and integration testing plan

| Environment | Checks |
|---|---|
| Chrome, Edge, Firefox, Safari | Actual supported versions, keyboard selection, clipboard, zoom, printing/host layout where relevant |
| Accessibility | Keyboard-only journey; NVDA with a supported Windows browser and VoiceOver with Safari; names, focus order, mode announcements, no excessive live announcements |
| Android System WebView | Actual agreed minimum and current version; IME, selection handles, keyboard resize, rotation, navigation restrictions |
| iOS WKWebView | Actual agreed minimum and current iOS version; keyboard viewport, copy/paste, selection, rotation, lifecycle |
| ASP.NET host | Safely load Markdown, edit, authenticated save, reopen exact value, permission failure, network failure, host CSP compatibility |
| Host persistence | Show saving/saved/error only from real request results; retain unsaved Markdown on failure; do not overwrite concurrent data without host policy |

Perform WebView and host tests only when the corresponding application/harness exists. Record these as pending, not passed or implicitly covered by desktop tests.

## 9. CI and release checklist

Proposed CI order:

1. Clean checkout and supported Node.js setup.
2. `npm ci`.
3. Static checking and unit tests with coverage.
4. Production build.
5. Browser installation and Playwright production-artifact tests.
6. Dependency vulnerability check with explicit review of findings.
7. Publish coverage, browser traces on failure, and generated artifacts.

Release only when:

- Scope assumptions and the supported browser/platform matrix are approved.
- A clean checkout reproduces the documented setup and build.
- Both bundle formats and CSS work without hidden development-server dependencies.
- Core behavior, output sanitation, multi-instance isolation, and teardown meet the automated gates.
- Manual accessibility and relevant real-browser checks have recorded results.
- Any host/mobile support claimed has actual integration/device evidence.
- README documents installation, assets, all API methods/options, errors, URL policy, persistence ownership, limitations, and exact run/test commands.
- Dependency licenses have been reviewed and the project license is chosen by the owner.

## 10. Current delivery and next step

**Inline-live extension:** A separate `MarkdownEditor.createInline()` surface now provides preview-like Markdown editing with active-line syntax reveal, built on CodeMirror 6. It preserves the original editor modes and independent state. See [README](./README.md#inline-live-editor) for its API, supported live decorations, LF normalization, and advanced-syntax limitations. This does not implement the deferred full WYSIWYG HTML/Markdown conversion mode.

**Implemented:** Phases 1-4, including the editor API, all three modes, formatting, themes, responsive styles, sanitized rendering, bundled distribution, independent-instance demo, Markdown download, executable scripts, and documentation. A GitHub Actions workflow is supplied but has not been run remotely.

**Locally verified on 2026-10-22, including inline-live extension:** checked JavaScript, production build, running demo, 98 passing unit/DOM tests, 98.97% line coverage, and 76 passing browser checks across five projects. Four non-Chromium performance cases are intentionally skipped. The original editor's 100 KB fixture measured 493.3 ms p95 across 30 edits; the 1 MB fixture preserved content. Inline-specific large-document performance is not yet qualified. Full environment and coverage details are in [README](./README.md).

**Still pending:** Phase 5 manual screen-reader/actual-browser qualification and approved baseline hardware; Phase 6 authenticated ASP.NET integration and real Android/iOS devices; exact support floors; owner-selected license and distribution review.

**Strikethrough follow-up:** The shared toolbar command now toggles markers instead of nesting them, preserves boundary whitespace, and handles nonblank lines individually. Post-fix validation passed checked JavaScript, the production build, 104 unit/DOM tests, and five targeted strikethrough browser checks. The earlier full browser/performance results above remain the recorded baseline, not a rerun after this fix.

Phases 5-6 must not be marked complete based only on emulation. Keep the original architecture as the high-level reference and update this plan when approved requirements change.
