# Cross-Platform Markdown Editor

## Architecture and Design Document

**Status:** Proposed\
**Version:** 1.0\
**Goal:** Build a reusable Markdown editor that can be embedded in plain
HTML, ASP.NET pages, and mobile applications that host web content
(Android WebView / iOS WKWebView).

------------------------------------------------------------------------

## 1. Overview

Build the editor as a framework-independent JavaScript library with a
small public API. Applications load the library's JavaScript and CSS,
create an editor in a DOM element, and read or update Markdown through
documented methods and events.

The editor should keep Markdown as the canonical document format.
Rendered HTML is a derived output and must never be treated as trusted
input.

### Design principles

-   **Portable:** No dependency on React, Angular, or a specific server
    framework.
-   **Embeddable:** Works inside an existing HTML element on any
    compatible web page.
-   **Mobile-friendly:** Responsive controls and touch-friendly
    interactions for WebViews.
-   **Extensible:** Features such as tables, images, mentions, and
    autosave can be added through extensions.
-   **Secure by default:** Sanitize rendered HTML and prevent unsafe
    links or script execution.
-   **Accessible:** Keyboard navigation, visible focus, labels, and
    appropriate ARIA attributes.
-   **Versionable:** Keep the public API small and document
    compatibility changes.

------------------------------------------------------------------------

## 2. Goals and non-goals

### Goals

1.  Provide Markdown source, visual/WYSIWYG, and preview modes (release
    scope can start with source + preview).
2.  Support common Markdown: headings, paragraphs, bold, italic,
    strikethrough, links, images, lists, blockquotes, code blocks, and
    tables.
3.  Expose a stable JavaScript API for creating, reading, updating, and
    destroying an editor instance.
4.  Emit change, focus, blur, and validation events.
5.  Allow applications to save content through their own APIs.
6.  Run without requiring the host application to use a particular UI
    framework.
7.  Work in modern browsers and supported Android/iOS WebViews.

### Non-goals for the first release

-   A complete collaborative editing system.
-   A built-in user/account system.
-   A built-in backend or database.
-   Perfect parity with every Markdown dialect.
-   Native Swift/Kotlin UI controls outside a WebView.

------------------------------------------------------------------------

## 3. High-level architecture

``` mermaid
flowchart TB
    Host[Host application<br/>HTML / ASP.NET / React / Angular]
    PublicAPI[MarkdownEditor public API]
    UI[Editor UI<br/>Toolbar / Source / Preview]
    Controller[Editor controller<br/>State / Commands / Events]
    Engine[Markdown engine<br/>Parse / Serialize]
    Security[HTML sanitizer<br/>URL and HTML policy]
    Adapter[Host integration adapter<br/>Save / Load callbacks]
    API[Application API<br/>Optional .NET backend]
    DB[(Application database<br/>Markdown source)]

    Host --> PublicAPI
    PublicAPI --> UI
    UI --> Controller
    Controller <--> Engine
    Engine --> Security
    Controller <--> Adapter
    Adapter -. optional . .-> API
    API --> DB
```

### Component responsibilities

  -----------------------------------------------------------------------
  Component                           Responsibility
  ----------------------------------- -----------------------------------
  Public API                          Stable methods for creating and
                                      controlling editor instances

  Editor UI                           Toolbar, editable source area,
                                      preview, status messages

  Controller                          Coordinates state, commands, mode
                                      changes, validation, and events

  Markdown engine                     Parses Markdown and, if supported,
                                      serializes visual edits back to
                                      Markdown

  Security layer                      Sanitizes rendered HTML and
                                      validates URL schemes

  Host adapter                        Optional integration callbacks for
                                      loading, saving, autosave, and
                                      application events

  Host application                    Owns authentication, persistence,
                                      permissions, and business rules
  -----------------------------------------------------------------------

**Important:** A source editor plus preview can use a Markdown parser
without requiring a full WYSIWYG editing engine. True WYSIWYG mode is a
larger feature and should be added only after choosing an engine that
reliably converts edits back to Markdown.

------------------------------------------------------------------------

## 4. Suggested project structure

``` text
markdown-editor/
├── src/
│   ├── core/
│   │   ├── editor.js          # Instance lifecycle and public API
│   │   ├── controller.js      # State and commands
│   │   ├── events.js          # Event dispatching
│   │   └── defaults.js        # Default options
│   ├── ui/
│   │   ├── shell.js           # Editor DOM structure
│   │   ├── toolbar.js         # Formatting actions
│   │   ├── source-view.js     # Markdown input
│   │   ├── preview.js         # Rendered preview
│   │   └── styles.css         # Responsive styles
│   ├── markdown/
│   │   ├── parser.js          # Markdown engine adapter
│   │   └── serializer.js      # Optional WYSIWYG-to-Markdown adapter
│   ├── security/
│   │   ├── sanitize.js        # HTML sanitization
│   │   └── urls.js             # Allowed URL schemes
│   ├── adapters/
│   │   └── host.js             # Optional host callbacks
│   └── index.js                # Package entry point
├── dist/
│   ├── markdown-editor.js
│   └── markdown-editor.css
├── demo/
│   └── index.html
├── tests/
│   ├── editor.test.js
│   ├── security.test.js
│   └── markdown.test.js
├── README.md
├── ARCHITECTURE.md
├── package.json
└── LICENSE
```

This is a suggested structure, not a requirement to create every file on
day one. Start with the smallest working source-and-preview editor and
split modules as the implementation grows.

------------------------------------------------------------------------

## 5. Public API design

### Create an instance

``` html
<link rel="stylesheet" href="/assets/markdown-editor.css">
<script src="/assets/markdown-editor.js"></script>

<div id="workorder-notes"></div>

<script>
  const editor = MarkdownEditor.create({
    element: "#workorder-notes",
    value: "# Work order notes\n\nAdd details here.",
    mode: "split",
    readOnly: false,
    placeholder: "Write notes in Markdown...",
    onChange: (markdown) => {
      console.log("Markdown changed:", markdown);
    }
  });
</script>
```

The exact global name and option names should be treated as the proposed
contract and confirmed during implementation.

### Proposed methods

  -----------------------------------------------------------------------
  Method                              Description
  ----------------------------------- -----------------------------------
  `getValue()`                        Return the Markdown source

  `setValue(markdown)`                Replace the Markdown source

  `getHTML()`                         Return sanitized rendered HTML

  `setMode(mode)`                     Switch between `source`, `preview`,
                                      and `split`

  `setReadOnly(readOnly)`             Enable or disable editing

  `focus()`                           Focus the editor

  `destroy()`                         Remove event handlers and editor
                                      DOM owned by the instance
  -----------------------------------------------------------------------

### Proposed options

  -----------------------------------------------------------------------
  Option            Type              Default           Description
  ----------------- ----------------- ----------------- -----------------
  `element`         CSS selector or   Required          Host element for
                    element                             the editor

  `value`           string            `""`              Initial Markdown

  `mode`            string            `"split"`         `source`,
                                                        `preview`, or
                                                        `split`

  `readOnly`        boolean           `false`           Whether editing
                                                        is disabled

  `placeholder`     string            `""`              Placeholder text

  `onChange`        function          `null`            Called with
                                                        updated Markdown

  `onFocus`         function          `null`            Called when
                                                        editor receives
                                                        focus

  `onBlur`          function          `null`            Called when
                                                        editor loses
                                                        focus
  -----------------------------------------------------------------------

Avoid exposing internal parser objects or DOM details in the public API;
doing so makes future engine changes harder.

------------------------------------------------------------------------

## 6. Modes and UI layout

### Source mode

-   Markdown text input.
-   Toolbar inserts Markdown syntax at the selection.
-   Suitable for technical users and exact Markdown editing.

### Preview mode

-   Read-only rendered content.
-   Useful for checking formatting before saving.
-   Output must pass through the sanitizer.

### Split mode

-   Source on one side and preview on the other on wider screens.
-   Stacked layout on narrow screens.
-   Preview updates as the user types, with a small debounce to avoid
    unnecessary rendering.

### Suggested visual design

-   Neutral background and subtle borders.
-   Compact toolbar with icon buttons and accessible tooltips.
-   Clear selected/active state for mode controls.
-   Minimum 40--44 CSS pixel touch targets where practical.
-   Responsive layout with no horizontal overflow on mobile.
-   Light and dark themes via CSS variables.
-   Respect reduced-motion and system color preferences.

Example wireframe:

``` text
┌─────────────────────────────────────────────────────────┐
│ Markdown Editor                Source | Split | Preview │
├─────────────────────────────────────────────────────────┤
│ B  I  H  Link  Image  • List  1. List  Quote  Code      │
├──────────────────────────┬──────────────────────────────┤
│ Markdown source          │ Live preview                 │
│                          │                              │
│ # Work order             │ Work order                   │
│ **Status:** Open         │ Status: Open                 │
│ - Check device           │ • Check device               │
│                          │                              │
├──────────────────────────┴──────────────────────────────┤
│ Markdown · Saved by host application                    │
└─────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

## 7. Cross-platform integration

### Plain HTML or ASP.NET

The host page includes the built JavaScript and CSS files and calls
`MarkdownEditor.create()`. The editor does not need to know whether the
page is served by ASP.NET, another backend, or a static web server.

``` html
<div id="notes"></div>
<script src="/assets/markdown-editor.js"></script>
<script>
  const notesEditor = MarkdownEditor.create({
    element: "#notes",
    value: "",
    mode: "split"
  });

  // On form submission:
  function getNotesMarkdown() {
    return notesEditor.getValue();
  }
</script>
```

### Android

Host the editor page or load the bundled JavaScript/CSS in an Android
WebView. Bridge data to Kotlin only when native functionality is needed.
Avoid exposing unrestricted JavaScript interfaces to untrusted content.

### iOS

Use `WKWebView` to load the editor page or bundled assets. Use message
handlers for communication with Swift when needed. Apply the same
content-security and origin restrictions as the web version.

### Flutter or React Native

Use a WebView package or build a platform-specific wrapper around the
editor. A web component is not automatically a native widget; keyboard
behavior, file access, selection, and lifecycle need testing on each
platform.

------------------------------------------------------------------------

## 8. Data flow and persistence

Recommended data flow:

1.  Host application loads existing Markdown from its API.
2.  Host initializes the editor with the Markdown string.
3.  User edits; the editor emits a change callback.
4.  Host application decides when to save (explicit save or debounced
    autosave).
5.  Host sends Markdown text to its authenticated API.
6.  Backend validates permissions and stores the Markdown as text.
7.  When reopened, the original Markdown is loaded into the editor.

### Suggested storage fields

  Field               Purpose
  ------------------- ------------------------------------------------------
  `Id`                Document or work-order note identifier
  `MarkdownContent`   Canonical Markdown text
  `UpdatedAtUtc`      Last update timestamp
  `UpdatedBy`         User or service identity, based on application rules
  `Version`           Optional concurrency/version number

Use the host application's existing database and API where possible. Do
not embed database credentials, API secrets, or authentication tokens in
the JavaScript bundle.

------------------------------------------------------------------------

## 9. Security requirements

Security is a core requirement because Markdown can contain links and
images, and some Markdown engines allow raw HTML.

1.  **Sanitize rendered HTML.** Use a maintained sanitizer with a
    conservative allowlist. Do not assume Markdown parsing alone
    prevents XSS.
2.  **Disable raw HTML by default** unless there is a documented
    requirement for it.
3.  **Validate link schemes.** Allow only intended schemes such as
    `https:`, `http:`, and possibly `mailto:`. Reject `javascript:` and
    other unsafe schemes.
4.  **Treat Markdown as untrusted input.** Content saved by one user may
    be opened by another user.
5.  **Use context-specific encoding.** When inserting values into HTML
    attributes or text, encode for that output context. Prefer DOM APIs
    and `textContent` instead of building HTML strings.
6.  **Avoid `eval` and inline event-handler attributes.**
7.  **Apply a Content Security Policy** appropriate to the host
    application.
8.  **Validate on the server too.** Client-side checks do not replace
    server-side authorization and validation.
9.  **Protect uploads.** If image uploads are supported, validate file
    type and size on the server and store files through a controlled
    upload service.
10. **Keep dependencies updated** and scan them for known
    vulnerabilities.

`getHTML()` should return sanitized HTML, and the host application
should still apply its own security rules before rendering or storing
that HTML.

------------------------------------------------------------------------

## 10. Performance and accessibility

-   Debounce preview rendering for large documents.
-   Avoid rebuilding the entire editor DOM on every keystroke.
-   Clean up listeners and observers in `destroy()`.
-   Support keyboard-only use and visible focus indicators.
-   Provide accessible names for icon-only toolbar buttons.
-   Ensure sufficient contrast and usable zoom on mobile.
-   Test long documents, large pasted text, and slow devices.
-   Handle virtual keyboards, orientation changes, and WebView resize
    behavior.

------------------------------------------------------------------------

## 11. Testing strategy

### Unit tests

-   Initial value and `setValue()` / `getValue()` round-trip.
-   Mode switching and read-only behavior.
-   Change callback behavior.
-   Empty, large, and Unicode content.
-   Parser output and supported Markdown syntax.
-   URL policy and HTML sanitization.

### Integration tests

-   Embed in a plain HTML page.
-   Embed in the existing ASP.NET application.
-   Load and save through the application's authenticated API.
-   Multiple editor instances on one page.
-   Repeated create/destroy cycles.

### Platform tests

-   Current supported desktop browsers.
-   Android WebView on representative devices.
-   iOS WKWebView on representative devices.
-   Soft keyboard, selection, copy/paste, rotation, and small-screen
    layouts.
-   Offline behavior if it is a requirement.

### Security test cases

Test payloads containing HTML tags, event-handler attributes,
`javascript:` URLs, malformed Markdown, and encoded input. Confirm that
they are displayed safely and never execute.

------------------------------------------------------------------------

## 12. Implementation roadmap

### Phase 1 --- Minimum viable editor

-   Create package/build setup.
-   Implement source input and preview.
-   Add Markdown parser and HTML sanitizer.
-   Implement `create`, `getValue`, `setValue`, `getHTML`, and
    `destroy`.
-   Add basic responsive styling.
-   Create a standalone demo HTML page.

### Phase 2 --- Usability

-   Add toolbar actions and keyboard shortcuts.
-   Add source, preview, and split modes.
-   Add themes, read-only mode, and accessibility improvements.
-   Add automated tests.

### Phase 3 --- Application integration

-   Integrate into an ASP.NET page.
-   Connect host-provided load/save callbacks.
-   Add error, saving, and saved states in the host application.
-   Verify authorization and security behavior.

### Phase 4 --- Mobile

-   Package assets for Android WebView and iOS WKWebView.
-   Test keyboard, selection, viewport, and file handling.
-   Add native bridges only when required.

### Phase 5 --- Optional advanced features

-   WYSIWYG editing.
-   Image upload.
-   Autosave and conflict detection.
-   Markdown extensions.
-   Collaborative editing, if needed.

------------------------------------------------------------------------

## 13. Acceptance criteria

The first release is ready when:

-   A developer can include the CSS and JavaScript in a plain HTML page
    and initialize the editor.
-   The editor supports source editing and a live preview.
-   `getValue()` returns the current Markdown string.
-   `setValue()` updates the source and preview.
-   `destroy()` removes the editor's event handlers and owned UI.
-   Multiple instances work independently.
-   Untrusted Markdown cannot execute scripts through the preview.
-   The layout works on desktop and mobile screen sizes.
-   A demo and API documentation are included.
-   Automated tests cover the core API and security controls.

------------------------------------------------------------------------

## 14. Technology decision

For the first release, use a **framework-independent JavaScript
package** with a Markdown parser and a separate HTML sanitizer. Keep the
parser and sanitizer behind small adapters so they can be replaced
later.

Start with **Markdown source + live preview**. Add WYSIWYG editing only
after selecting an editor engine with reliable Markdown import/export.
This keeps the initial component small, portable, and easier to secure.

### Decisions to confirm before implementation

-   Required browser support and minimum Android/iOS versions.
-   Whether raw HTML inside Markdown is allowed.
-   Whether the first release needs WYSIWYG or only source + preview.
-   Whether images are external URLs, uploads, or both.
-   Whether saving is handled by the host app or a shared .NET API.
