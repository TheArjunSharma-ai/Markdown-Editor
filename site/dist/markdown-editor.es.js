const nc = (
  /** @type {const} */
  [
    { id: "bold", label: "Bold", text: "B" },
    { id: "italic", label: "Italic", text: "I" },
    { id: "strike", label: "Strikethrough", text: "S" },
    { id: "heading", label: "Heading", text: "H" },
    { id: "link", label: "Insert link", text: "Link" },
    { id: "image", label: "Insert image", text: "Image" },
    { id: "bullet", label: "Bulleted list", text: "List" },
    { id: "ordered", label: "Numbered list", text: "1. List" },
    { id: "quote", label: "Blockquote", text: "Quote" },
    { id: "code", label: "Code block", text: "Code" },
    { id: "table", label: "Insert table", text: "Table" }
  ]
);
function ic(n) {
  return n.length > 4 && n.startsWith("~~") && n.endsWith("~~") && !n.slice(2, -2).includes("~~");
}
function gm(n, e, t) {
  const i = n.slice(e, t);
  if (i && !/[\r\n]/u.test(i) && e >= 2 && n.slice(e - 2, e) === "~~" && n.slice(t, t + 2) === "~~")
    return {
      value: n.slice(0, e - 2) + i + n.slice(t + 2),
      start: e - 2,
      end: t - 2
    };
  const r = (i || "text").split(/(\r\n|\r|\n)/u), s = r.filter((h) => h.trim());
  if (!s.length) return { value: n, start: e, end: t };
  const o = s.every((h) => ic(h.trim())), l = r.map((h) => {
    const f = h.trim();
    if (!f) return h;
    const d = o ? f.slice(2, -2) : ic(f) ? f : `~~${f}~~`, O = h.length - h.trimStart().length;
    return h.slice(0, O) + d + h.slice(O + f.length);
  }).join(""), u = /[\r\n]/u.test(i), a = l.length - l.trimStart().length, c = l.length - l.trimEnd().length;
  return {
    value: n.slice(0, e) + l + n.slice(t),
    start: u ? e : e + a + (o ? 0 : 2),
    end: u ? e + l.length : e + l.length - c - (o ? 0 : 2)
  };
}
function If(n, e, t, i) {
  if (i === "strike") return gm(n, e, t);
  const r = n.slice(e, t);
  let s = e, o = t, l, u = 0, a;
  if (["heading", "bullet", "ordered", "quote"].includes(i)) {
    s = e === 0 ? 0 : n.lastIndexOf(`
`, e - 1) + 1;
    const c = n.indexOf(`
`, t > e && n[t - 1] === `
` ? t - 1 : t);
    o = c === -1 ? n.length : c;
    const h = i === "heading" ? "# " : i === "bullet" ? "- " : i === "quote" ? "> " : "";
    l = n.slice(s, o).split(`
`).map((f, d) => `${i === "ordered" ? `${d + 1}. ` : h}${f}`).join(`
`), a = l.length;
  } else {
    const c = r || "text";
    switch (i) {
      case "bold":
        l = `**${c}**`, u = 2, a = c.length;
        break;
      case "italic":
        l = `*${c}*`, u = 1, a = c.length;
        break;
      case "link":
        l = `[${r || "link text"}](https://example.com)`, u = 1, a = (r || "link text").length;
        break;
      case "image":
        l = `![${r || "image description"}](https://example.com/image.png)`, u = 2, a = (r || "image description").length;
        break;
      case "code": {
        const h = c.match(/`+/g) || [], f = "`".repeat(Math.max(3, ...h.map((m) => m.length + 1))), d = s > 0 && n[s - 1] !== `
` ? `
` : "", O = o < n.length && n[o] !== `
` ? `
` : "";
        l = `${d}${f}
${c}
${f}${O}`, u = d.length + f.length + 1, a = c.length;
        break;
      }
      case "table":
        l = `${s > 0 && n[s - 1] !== `
` ? `
` : ""}| Column 1 | Column 2 |
| --- | --- |
| Value | Value |
`, a = l.length;
        break;
      default:
        throw new TypeError(`Unknown formatting command: ${i}`);
    }
  }
  return {
    value: n.slice(0, s) + l + n.slice(o),
    start: s + u,
    end: s + u + a
  };
}
function Bf(n) {
  if (n !== "source" && n !== "preview" && n !== "split")
    throw new TypeError("mode must be source, preview, or split");
}
function Ss(n, e) {
  if (typeof n != "string") throw new TypeError(`${e} must be a string`);
}
function Eu(n) {
  if (typeof n != "boolean") throw new TypeError("readOnly must be a boolean");
}
function qf(n) {
  if (!n || typeof n != "object") throw new TypeError("Editor options are required");
  const e = typeof n.element == "string" ? document.querySelector(n.element) : n.element;
  if (!(e instanceof HTMLElement)) throw new TypeError("element must identify an HTML element");
  const t = n.value === void 0 ? "" : n.value, i = n.mode === void 0 ? "split" : n.mode, r = n.readOnly === void 0 ? !1 : n.readOnly, s = n.placeholder === void 0 ? "" : n.placeholder, o = n.theme === void 0 ? "system" : n.theme, l = n.header === void 0 ? !0 : n.header, u = n.footer === void 0 ? !0 : n.footer, a = n.toolbar === void 0 ? !0 : n.toolbar;
  for (const [d, O] of Object.entries({ header: l, footer: u, toolbar: a }))
    if (typeof O != "boolean") throw new TypeError(`${d} must be a boolean`);
  const c = n.toolbarActions === void 0 ? nc.map((d) => d.id) : n.toolbarActions;
  if (!Array.isArray(c)) throw new TypeError("toolbarActions must be an array of action names");
  const h = /* @__PURE__ */ new Set(), f = Array.from(c, (d) => {
    const O = d === "strikethrough" ? "strike" : d, m = nc.find((g) => g.id === O);
    if (!m) throw new TypeError(`Unknown toolbar action: ${String(d)}`);
    if (h.has(O)) throw new TypeError(`Duplicate toolbar action: ${d}`);
    return h.add(O), m;
  });
  if (Ss(t, "value"), Ss(s, "placeholder"), Bf(i), Eu(r), !["system", "light", "dark"].includes(o)) throw new TypeError("Invalid theme");
  for (
    const d of
    /** @type {const} */
    ["onChange", "onFocus", "onBlur"]
  )
    if (n[d] !== void 0 && typeof n[d] != "function")
      throw new TypeError(`${d} must be a function`);
  return { ...n, element: e, value: t, mode: i, readOnly: r, placeholder: s, theme: o, header: l, footer: u, toolbar: a, toolbarCommands: f };
}
let bm = 0;
function xm(n) {
  const e = n.element.ownerDocument;
  function t(Q, y = "", A = "") {
    const C = e.createElement(Q);
    return C.className = y, C.textContent = A, C;
  }
  const i = `md-editor-${++bm}`, r = t("section", "md-editor");
  r.dataset.theme = n.theme, r.setAttribute("aria-label", "Markdown editor");
  const s = t("header", "md-editor__header");
  s.hidden = !n.header, s.append(t("strong", "", "Markdown Editor"));
  const o = t("div", "md-editor__modes");
  o.setAttribute("role", "group"), o.setAttribute("aria-label", "Editor mode");
  const l = (
    /** @type {Map<import('../core/defaults.js').Mode, HTMLButtonElement>} */
    /* @__PURE__ */ new Map()
  );
  for (
    const Q of
    /** @type {const} */
    ["source", "split", "preview"]
  ) {
    const y = t("button", "", Q[0].toUpperCase() + Q.slice(1));
    y.type = "button", y.dataset.mode = Q, l.set(Q, y), o.append(y);
  }
  s.append(o);
  const u = t("div", "md-editor__toolbar");
  u.hidden = !n.toolbar || n.toolbarCommands.length === 0, u.setAttribute("role", "group"), u.setAttribute("aria-label", "Formatting");
  const a = n.toolbarCommands.map((Q) => {
    const y = t("button", "", Q.text);
    return y.type = "button", y.setAttribute("aria-label", Q.label), y.title = Q.label, y.dataset.command = Q.id, u.append(y), y;
  }), c = t("div", "md-editor__body"), h = t("div", "md-editor__panel"), f = t("label", "md-editor__label", "Markdown source");
  f.htmlFor = `${i}-source`;
  const d = t("textarea", "md-editor__source");
  d.id = f.htmlFor, d.placeholder = n.placeholder, d.spellcheck = !1, h.append(f, d);
  const O = t("div", "md-editor__panel"), m = t("div", "md-editor__label", "Live preview");
  m.id = `${i}-preview-label`;
  const g = t("div", "md-editor__preview");
  g.tabIndex = 0, g.setAttribute("role", "region"), g.setAttribute("aria-labelledby", m.id), O.append(m, g), c.append(h, O);
  const b = t("footer", "md-editor__footer");
  b.hidden = !n.footer;
  const w = t("span"), S = t("span", "", "Preview ready");
  return S.setAttribute("role", "status"), S.setAttribute("aria-live", "polite"), b.append(w, S), r.append(s, u, c, b), { root: r, source: d, sourcePanel: h, preview: g, previewPanel: O, modeButtons: l, commandButtons: a, status: S, count: w };
}
const rc = {};
function km(n) {
  let e = rc[n];
  if (e)
    return e;
  e = rc[n] = [];
  for (let t = 0; t < 128; t++) {
    const i = String.fromCharCode(t);
    e.push(i);
  }
  for (let t = 0; t < n.length; t++) {
    const i = n.charCodeAt(t);
    e[i] = "%" + ("0" + i.toString(16).toUpperCase()).slice(-2);
  }
  return e;
}
function oi(n, e) {
  typeof e != "string" && (e = oi.defaultChars);
  const t = km(e);
  return n.replace(/(%[a-f0-9]{2})+/gi, function(i) {
    let r = "";
    for (let s = 0, o = i.length; s < o; s += 3) {
      const l = parseInt(i.slice(s + 1, s + 3), 16);
      if (l < 128) {
        r += t[l];
        continue;
      }
      if ((l & 224) === 192 && s + 3 < o) {
        const u = parseInt(i.slice(s + 4, s + 6), 16);
        if ((u & 192) === 128) {
          const a = l << 6 & 1984 | u & 63;
          a < 128 ? r += "��" : r += String.fromCharCode(a), s += 3;
          continue;
        }
      }
      if ((l & 240) === 224 && s + 6 < o) {
        const u = parseInt(i.slice(s + 4, s + 6), 16), a = parseInt(i.slice(s + 7, s + 9), 16);
        if ((u & 192) === 128 && (a & 192) === 128) {
          const c = l << 12 & 61440 | u << 6 & 4032 | a & 63;
          c < 2048 || c >= 55296 && c <= 57343 ? r += "���" : r += String.fromCharCode(c), s += 6;
          continue;
        }
      }
      if ((l & 248) === 240 && s + 9 < o) {
        const u = parseInt(i.slice(s + 4, s + 6), 16), a = parseInt(i.slice(s + 7, s + 9), 16), c = parseInt(i.slice(s + 10, s + 12), 16);
        if ((u & 192) === 128 && (a & 192) === 128 && (c & 192) === 128) {
          let h = l << 18 & 1835008 | u << 12 & 258048 | a << 6 & 4032 | c & 63;
          h < 65536 || h > 1114111 ? r += "����" : (h -= 65536, r += String.fromCharCode(55296 + (h >> 10), 56320 + (h & 1023))), s += 9;
          continue;
        }
      }
      r += "�";
    }
    return r;
  });
}
oi.defaultChars = ";/?:@&=+$,#";
oi.componentChars = "";
const sc = {};
function Sm(n) {
  let e = sc[n];
  if (e)
    return e;
  e = sc[n] = [];
  for (let t = 0; t < 128; t++) {
    const i = String.fromCharCode(t);
    /^[0-9a-z]$/i.test(i) ? e.push(i) : e.push("%" + ("0" + t.toString(16).toUpperCase()).slice(-2));
  }
  for (let t = 0; t < n.length; t++)
    e[n.charCodeAt(t)] = n[t];
  return e;
}
function Sr(n, e, t) {
  typeof e != "string" && (t = e, e = Sr.defaultChars), typeof t > "u" && (t = !0);
  const i = Sm(e);
  let r = "";
  for (let s = 0, o = n.length; s < o; s++) {
    const l = n.charCodeAt(s);
    if (t && l === 37 && s + 2 < o && /^[0-9a-f]{2}$/i.test(n.slice(s + 1, s + 3))) {
      r += n.slice(s, s + 3), s += 2;
      continue;
    }
    if (l < 128) {
      r += i[l];
      continue;
    }
    if (l >= 55296 && l <= 57343) {
      if (l >= 55296 && l <= 56319 && s + 1 < o) {
        const u = n.charCodeAt(s + 1);
        if (u >= 56320 && u <= 57343) {
          r += encodeURIComponent(n[s] + n[s + 1]), s++;
          continue;
        }
      }
      r += "%EF%BF%BD";
      continue;
    }
    r += encodeURIComponent(n[s]);
  }
  return r;
}
Sr.defaultChars = ";/?:@&=+$,-_.!~*'()#";
Sr.componentChars = "-_.!~*'()";
function Xu(n) {
  let e = "";
  return e += n.protocol || "", e += n.slashes ? "//" : "", e += n.auth ? n.auth + "@" : "", n.hostname && n.hostname.indexOf(":") !== -1 ? e += "[" + n.hostname + "]" : e += n.hostname || "", e += n.port ? ":" + n.port : "", e += n.pathname || "", e += n.search || "", e += n.hash || "", e;
}
function ys() {
  this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null;
}
const ym = /^([a-z0-9.+-]+:)/i, Qm = /:[0-9]*$/, wm = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, $m = ["<", ">", '"', "`", " ", "\r", `
`, "	"], Pm = ["{", "}", "|", "\\", "^", "`"].concat($m), vm = ["'"].concat(Pm), oc = ["%", "/", "?", ";", "#"].concat(vm), lc = ["/", "?", "#"], _m = 255, uc = /^[+a-z0-9A-Z_-]{0,63}$/, Am = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, ac = {
  javascript: !0,
  "javascript:": !0
}, cc = {
  http: !0,
  https: !0,
  ftp: !0,
  gopher: !0,
  file: !0,
  "http:": !0,
  "https:": !0,
  "ftp:": !0,
  "gopher:": !0,
  "file:": !0
};
function Zu(n, e) {
  if (n && n instanceof ys) return n;
  const t = new ys();
  return t.parse(n, e), t;
}
ys.prototype.parse = function(n, e) {
  let t, i, r, s = n;
  if (s = s.trim(), !e && n.split("#").length === 1) {
    const a = wm.exec(s);
    if (a)
      return this.pathname = a[1], a[2] && (this.search = a[2]), this;
  }
  let o = ym.exec(s);
  if (o && (o = o[0], t = o.toLowerCase(), this.protocol = o, s = s.substr(o.length)), (e || o || s.match(/^\/\/[^@\/]+@[^@\/]+/)) && (r = s.substr(0, 2) === "//", r && !(o && ac[o]) && (s = s.substr(2), this.slashes = !0)), !ac[o] && (r || o && !cc[o])) {
    let a = -1;
    for (let O = 0; O < lc.length; O++)
      i = s.indexOf(lc[O]), i !== -1 && (a === -1 || i < a) && (a = i);
    let c, h;
    a === -1 ? h = s.lastIndexOf("@") : h = s.lastIndexOf("@", a), h !== -1 && (c = s.slice(0, h), s = s.slice(h + 1), this.auth = c), a = -1;
    for (let O = 0; O < oc.length; O++)
      i = s.indexOf(oc[O]), i !== -1 && (a === -1 || i < a) && (a = i);
    a === -1 && (a = s.length), s[a - 1] === ":" && a--;
    const f = s.slice(0, a);
    s = s.slice(a), this.parseHost(f), this.hostname = this.hostname || "";
    const d = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!d) {
      const O = this.hostname.split(/\./);
      for (let m = 0, g = O.length; m < g; m++) {
        const b = O[m];
        if (b && !b.match(uc)) {
          let w = "";
          for (let S = 0, Q = b.length; S < Q; S++)
            b.charCodeAt(S) > 127 ? w += "x" : w += b[S];
          if (!w.match(uc)) {
            const S = O.slice(0, m), Q = O.slice(m + 1), y = b.match(Am);
            y && (S.push(y[1]), Q.unshift(y[2])), Q.length && (s = Q.join(".") + s), this.hostname = S.join(".");
            break;
          }
        }
      }
    }
    this.hostname.length > _m && (this.hostname = ""), d && (this.hostname = this.hostname.substr(1, this.hostname.length - 2));
  }
  const l = s.indexOf("#");
  l !== -1 && (this.hash = s.substr(l), s = s.slice(0, l));
  const u = s.indexOf("?");
  return u !== -1 && (this.search = s.substr(u), s = s.slice(0, u)), s && (this.pathname = s), cc[t] && this.hostname && !this.pathname && (this.pathname = ""), this;
};
ys.prototype.parseHost = function(n) {
  let e = Qm.exec(n);
  e && (e = e[0], e !== ":" && (this.port = e.substr(1)), n = n.substr(0, n.length - e.length)), n && (this.hostname = n);
};
const Cm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  decode: oi,
  encode: Sr,
  format: Xu,
  parse: Zu
}, Symbol.toStringTag, { value: "Module" })), Ff = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Yf = /[\0-\x1F\x7F-\x9F]/, Tm = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/, Du = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/, Wf = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/, Nf = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/, Em = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Any: Ff,
  Cc: Yf,
  Cf: Tm,
  P: Du,
  S: Wf,
  Z: Nf
}, Symbol.toStringTag, { value: "Module" })), Xm = new Uint16Array(
  // prettier-ignore
  'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((n) => n.charCodeAt(0))
), Zm = new Uint16Array(
  // prettier-ignore
  "Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((n) => n.charCodeAt(0))
);
var Mo;
const Dm = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]), Rm = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (Mo = String.fromCodePoint) !== null && Mo !== void 0 ? Mo : function(n) {
    let e = "";
    return n > 65535 && (n -= 65536, e += String.fromCharCode(n >>> 10 & 1023 | 55296), n = 56320 | n & 1023), e += String.fromCharCode(n), e;
  }
);
function Mm(n) {
  var e;
  return n >= 55296 && n <= 57343 || n > 1114111 ? 65533 : (e = Dm.get(n)) !== null && e !== void 0 ? e : n;
}
var ye;
(function(n) {
  n[n.NUM = 35] = "NUM", n[n.SEMI = 59] = "SEMI", n[n.EQUALS = 61] = "EQUALS", n[n.ZERO = 48] = "ZERO", n[n.NINE = 57] = "NINE", n[n.LOWER_A = 97] = "LOWER_A", n[n.LOWER_F = 102] = "LOWER_F", n[n.LOWER_X = 120] = "LOWER_X", n[n.LOWER_Z = 122] = "LOWER_Z", n[n.UPPER_A = 65] = "UPPER_A", n[n.UPPER_F = 70] = "UPPER_F", n[n.UPPER_Z = 90] = "UPPER_Z";
})(ye || (ye = {}));
const Lm = 32;
var On;
(function(n) {
  n[n.VALUE_LENGTH = 49152] = "VALUE_LENGTH", n[n.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", n[n.JUMP_TABLE = 127] = "JUMP_TABLE";
})(On || (On = {}));
function Tl(n) {
  return n >= ye.ZERO && n <= ye.NINE;
}
function jm(n) {
  return n >= ye.UPPER_A && n <= ye.UPPER_F || n >= ye.LOWER_A && n <= ye.LOWER_F;
}
function zm(n) {
  return n >= ye.UPPER_A && n <= ye.UPPER_Z || n >= ye.LOWER_A && n <= ye.LOWER_Z || Tl(n);
}
function Im(n) {
  return n === ye.EQUALS || zm(n);
}
var Se;
(function(n) {
  n[n.EntityStart = 0] = "EntityStart", n[n.NumericStart = 1] = "NumericStart", n[n.NumericDecimal = 2] = "NumericDecimal", n[n.NumericHex = 3] = "NumericHex", n[n.NamedEntity = 4] = "NamedEntity";
})(Se || (Se = {}));
var Nt;
(function(n) {
  n[n.Legacy = 0] = "Legacy", n[n.Strict = 1] = "Strict", n[n.Attribute = 2] = "Attribute";
})(Nt || (Nt = {}));
class Bm {
  constructor(e, t, i) {
    this.decodeTree = e, this.emitCodePoint = t, this.errors = i, this.state = Se.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = Nt.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(e) {
    this.decodeMode = e, this.state = Se.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(e, t) {
    switch (this.state) {
      case Se.EntityStart:
        return e.charCodeAt(t) === ye.NUM ? (this.state = Se.NumericStart, this.consumed += 1, this.stateNumericStart(e, t + 1)) : (this.state = Se.NamedEntity, this.stateNamedEntity(e, t));
      case Se.NumericStart:
        return this.stateNumericStart(e, t);
      case Se.NumericDecimal:
        return this.stateNumericDecimal(e, t);
      case Se.NumericHex:
        return this.stateNumericHex(e, t);
      case Se.NamedEntity:
        return this.stateNamedEntity(e, t);
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(e, t) {
    return t >= e.length ? -1 : (e.charCodeAt(t) | Lm) === ye.LOWER_X ? (this.state = Se.NumericHex, this.consumed += 1, this.stateNumericHex(e, t + 1)) : (this.state = Se.NumericDecimal, this.stateNumericDecimal(e, t));
  }
  addToNumericResult(e, t, i, r) {
    if (t !== i) {
      const s = i - t;
      this.result = this.result * Math.pow(r, s) + parseInt(e.substr(t, s), r), this.consumed += s;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(e, t) {
    const i = t;
    for (; t < e.length; ) {
      const r = e.charCodeAt(t);
      if (Tl(r) || jm(r))
        t += 1;
      else
        return this.addToNumericResult(e, i, t, 16), this.emitNumericEntity(r, 3);
    }
    return this.addToNumericResult(e, i, t, 16), -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(e, t) {
    const i = t;
    for (; t < e.length; ) {
      const r = e.charCodeAt(t);
      if (Tl(r))
        t += 1;
      else
        return this.addToNumericResult(e, i, t, 10), this.emitNumericEntity(r, 2);
    }
    return this.addToNumericResult(e, i, t, 10), -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(e, t) {
    var i;
    if (this.consumed <= t)
      return (i = this.errors) === null || i === void 0 || i.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
    if (e === ye.SEMI)
      this.consumed += 1;
    else if (this.decodeMode === Nt.Strict)
      return 0;
    return this.emitCodePoint(Mm(this.result), this.consumed), this.errors && (e !== ye.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(e, t) {
    const { decodeTree: i } = this;
    let r = i[this.treeIndex], s = (r & On.VALUE_LENGTH) >> 14;
    for (; t < e.length; t++, this.excess++) {
      const o = e.charCodeAt(t);
      if (this.treeIndex = qm(i, r, this.treeIndex + Math.max(1, s), o), this.treeIndex < 0)
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === Nt.Attribute && // We shouldn't have consumed any characters after the entity,
        (s === 0 || // And there should be no invalid characters.
        Im(o)) ? 0 : this.emitNotTerminatedNamedEntity();
      if (r = i[this.treeIndex], s = (r & On.VALUE_LENGTH) >> 14, s !== 0) {
        if (o === ye.SEMI)
          return this.emitNamedEntityData(this.treeIndex, s, this.consumed + this.excess);
        this.decodeMode !== Nt.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var e;
    const { result: t, decodeTree: i } = this, r = (i[t] & On.VALUE_LENGTH) >> 14;
    return this.emitNamedEntityData(t, r, this.consumed), (e = this.errors) === null || e === void 0 || e.missingSemicolonAfterCharacterReference(), this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(e, t, i) {
    const { decodeTree: r } = this;
    return this.emitCodePoint(t === 1 ? r[e] & ~On.VALUE_LENGTH : r[e + 1], i), t === 3 && this.emitCodePoint(r[e + 2], i), i;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var e;
    switch (this.state) {
      case Se.NamedEntity:
        return this.result !== 0 && (this.decodeMode !== Nt.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      // Otherwise, emit a numeric entity if we have one.
      case Se.NumericDecimal:
        return this.emitNumericEntity(0, 2);
      case Se.NumericHex:
        return this.emitNumericEntity(0, 3);
      case Se.NumericStart:
        return (e = this.errors) === null || e === void 0 || e.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
      case Se.EntityStart:
        return 0;
    }
  }
}
function Vf(n) {
  let e = "";
  const t = new Bm(n, (i) => e += Rm(i));
  return function(r, s) {
    let o = 0, l = 0;
    for (; (l = r.indexOf("&", l)) >= 0; ) {
      e += r.slice(o, l), t.startEntity(s);
      const a = t.write(
        r,
        // Skip the "&"
        l + 1
      );
      if (a < 0) {
        o = l + t.end();
        break;
      }
      o = l + a, l = a === 0 ? o + 1 : o;
    }
    const u = e + r.slice(o);
    return e = "", u;
  };
}
function qm(n, e, t, i) {
  const r = (e & On.BRANCH_LENGTH) >> 7, s = e & On.JUMP_TABLE;
  if (r === 0)
    return s !== 0 && i === s ? t : -1;
  if (s) {
    const u = i - s;
    return u < 0 || u >= r ? -1 : n[t + u] - 1;
  }
  let o = t, l = o + r - 1;
  for (; o <= l; ) {
    const u = o + l >>> 1, a = n[u];
    if (a < i)
      o = u + 1;
    else if (a > i)
      l = u - 1;
    else
      return n[u + r];
  }
  return -1;
}
const Uf = Vf(Xm);
Vf(Zm);
function Fm(n, e = Nt.Legacy) {
  return Uf(n, e);
}
function Ym(n) {
  return Uf(n, Nt.Strict);
}
function Wm(n) {
  return Object.prototype.toString.call(n);
}
function Ru(n) {
  return Wm(n) === "[object String]";
}
const Nm = Object.prototype.hasOwnProperty;
function Vm(n, e) {
  return Nm.call(n, e);
}
function Us(n) {
  return Array.prototype.slice.call(arguments, 1).forEach(function(t) {
    if (t) {
      if (typeof t != "object")
        throw new TypeError(t + "must be object");
      Object.keys(t).forEach(function(i) {
        n[i] = t[i];
      });
    }
  }), n;
}
function Um(n, e, t) {
  return [].concat(n.slice(0, e), t, n.slice(e + 1));
}
function Mu(n) {
  return !(n >= 55296 && n <= 57343 || n >= 64976 && n <= 65007 || (n & 65535) === 65535 || (n & 65535) === 65534 || n >= 0 && n <= 8 || n === 11 || n >= 14 && n <= 31 || n >= 127 && n <= 159 || n > 1114111);
}
function tr(n) {
  if (n > 65535) {
    n -= 65536;
    const e = 55296 + (n >> 10), t = 56320 + (n & 1023);
    return String.fromCharCode(e, t);
  }
  return String.fromCharCode(n);
}
const Gf = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, Gm = /&([a-z#][a-z0-9]{1,31});/gi, Hm = new RegExp(Gf.source + "|" + Gm.source, "gi"), Km = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function Jm(n, e) {
  if (e.charCodeAt(0) === 35 && Km.test(e)) {
    const i = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Mu(i) ? tr(i) : n;
  }
  const t = Fm(n);
  return t !== n ? t : n;
}
function eg(n) {
  return n.indexOf("\\") < 0 ? n : n.replace(Gf, "$1");
}
function li(n) {
  return n.indexOf("\\") < 0 && n.indexOf("&") < 0 ? n : n.replace(Hm, function(e, t, i) {
    return t || Jm(e, i);
  });
}
const tg = /[&<>"]/, ng = /[&<>"]/g, ig = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function rg(n) {
  return ig[n];
}
function mn(n) {
  return tg.test(n) ? n.replace(ng, rg) : n;
}
const sg = /[.?*+^$[\]\\(){}|-]/g;
function og(n) {
  return n.replace(sg, "\\$&");
}
function oe(n) {
  switch (n) {
    case 9:
    case 32:
      return !0;
  }
  return !1;
}
function nr(n) {
  if (n >= 8192 && n <= 8202)
    return !0;
  switch (n) {
    case 9:
    // \t
    case 10:
    // \n
    case 11:
    // \v
    case 12:
    // \f
    case 13:
    // \r
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return !0;
  }
  return !1;
}
function Hf(n) {
  return Du.test(n) || Wf.test(n);
}
function ir(n) {
  return Hf(tr(n));
}
function rr(n) {
  switch (n) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return !0;
    default:
      return !1;
  }
}
function Gs(n) {
  return n = n.trim().replace(/\s+/g, " "), "ẞ".toLowerCase() === "Ṿ" && (n = n.replace(/ẞ/g, "ß")), n.toLowerCase().toUpperCase();
}
function hc(n) {
  return n === 32 || n === 9 || n === 10 || n === 13;
}
function Hs(n) {
  let e = 0;
  for (; e < n.length && hc(n.charCodeAt(e)); e++)
    ;
  let t = n.length - 1;
  for (; t >= e && hc(n.charCodeAt(t)); t--)
    ;
  return n.slice(e, t + 1);
}
const lg = { mdurl: Cm, ucmicro: Em }, ug = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayReplaceAt: Um,
  asciiTrim: Hs,
  assign: Us,
  escapeHtml: mn,
  escapeRE: og,
  fromCodePoint: tr,
  has: Vm,
  isMdAsciiPunct: rr,
  isPunctChar: Hf,
  isPunctCharCode: ir,
  isSpace: oe,
  isString: Ru,
  isValidEntityCode: Mu,
  isWhiteSpace: nr,
  lib: lg,
  normalizeReference: Gs,
  unescapeAll: li,
  unescapeMd: eg
}, Symbol.toStringTag, { value: "Module" }));
function ag(n, e, t) {
  let i, r, s, o;
  const l = n.posMax, u = n.pos;
  for (n.pos = e + 1, i = 1; n.pos < l; ) {
    if (s = n.src.charCodeAt(n.pos), s === 93 && (i--, i === 0)) {
      r = !0;
      break;
    }
    if (o = n.pos, n.md.inline.skipToken(n), s === 91) {
      if (o === n.pos - 1)
        i++;
      else if (t)
        return n.pos = u, -1;
    }
  }
  let a = -1;
  return r && (a = n.pos), n.pos = u, a;
}
function cg(n, e, t) {
  let i, r = e;
  const s = {
    ok: !1,
    pos: 0,
    str: ""
  };
  if (n.charCodeAt(r) === 60) {
    for (r++; r < t; ) {
      if (i = n.charCodeAt(r), i === 10 || i === 60)
        return s;
      if (i === 62)
        return s.pos = r + 1, s.str = li(n.slice(e + 1, r)), s.ok = !0, s;
      if (i === 92 && r + 1 < t) {
        r += 2;
        continue;
      }
      r++;
    }
    return s;
  }
  let o = 0;
  for (; r < t && (i = n.charCodeAt(r), !(i === 32 || i < 32 || i === 127)); ) {
    if (i === 92 && r + 1 < t) {
      if (n.charCodeAt(r + 1) === 32) {
        r++;
        continue;
      }
      r += 2;
      continue;
    }
    if (i === 40 && (o++, o > 32))
      return s;
    if (i === 41) {
      if (o === 0)
        break;
      o--;
    }
    r++;
  }
  return e === r || o !== 0 || (s.str = li(n.slice(e, r)), s.pos = r, s.ok = !0), s;
}
function hg(n, e, t, i) {
  let r, s = e;
  const o = {
    // if `true`, this is a valid link title
    ok: !1,
    // if `true`, this link can be continued on the next line
    can_continue: !1,
    // if `ok`, it's the position of the first character after the closing marker
    pos: 0,
    // if `ok`, it's the unescaped title
    str: "",
    // expected closing marker character code
    marker: 0
  };
  if (i)
    o.str = i.str, o.marker = i.marker;
  else {
    if (s >= t)
      return o;
    let l = n.charCodeAt(s);
    if (l !== 34 && l !== 39 && l !== 40)
      return o;
    e++, s++, l === 40 && (l = 41), o.marker = l;
  }
  for (; s < t; ) {
    if (r = n.charCodeAt(s), r === o.marker)
      return o.pos = s + 1, o.str += li(n.slice(e, s)), o.ok = !0, o;
    if (r === 40 && o.marker === 41)
      return o;
    r === 92 && s + 1 < t && s++, s++;
  }
  return o.can_continue = !0, o.str += li(n.slice(e, s)), o;
}
const fg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  parseLinkDestination: cg,
  parseLinkLabel: ag,
  parseLinkTitle: hg
}, Symbol.toStringTag, { value: "Module" })), Mt = {};
Mt.code_inline = function(n, e, t, i, r) {
  const s = n[e];
  return "<code" + r.renderAttrs(s) + ">" + mn(s.content) + "</code>";
};
Mt.code_block = function(n, e, t, i, r) {
  const s = n[e];
  return "<pre" + r.renderAttrs(s) + "><code>" + mn(n[e].content) + `</code></pre>
`;
};
Mt.fence = function(n, e, t, i, r) {
  const s = n[e], o = s.info ? li(s.info).trim() : "";
  let l = "", u = "";
  if (o) {
    const c = o.split(/(\s+)/g);
    l = c[0], u = c.slice(2).join("");
  }
  let a;
  if (t.highlight ? a = t.highlight(s.content, l, u) || mn(s.content) : a = mn(s.content), a.indexOf("<pre") === 0)
    return a + `
`;
  if (o) {
    const c = s.attrIndex("class"), h = s.attrs ? s.attrs.slice() : [];
    c < 0 ? h.push(["class", t.langPrefix + l]) : (h[c] = h[c].slice(), h[c][1] += " " + t.langPrefix + l);
    const f = {
      attrs: h
    };
    return `<pre><code${r.renderAttrs(f)}>${a}</code></pre>
`;
  }
  return `<pre><code${r.renderAttrs(s)}>${a}</code></pre>
`;
};
Mt.image = function(n, e, t, i, r) {
  const s = n[e];
  return s.attrs[s.attrIndex("alt")][1] = r.renderInlineAsText(s.children, t, i), r.renderToken(n, e, t);
};
Mt.hardbreak = function(n, e, t) {
  return t.xhtmlOut ? `<br />
` : `<br>
`;
};
Mt.softbreak = function(n, e, t) {
  return t.breaks ? t.xhtmlOut ? `<br />
` : `<br>
` : `
`;
};
Mt.text = function(n, e) {
  return mn(n[e].content);
};
Mt.html_block = function(n, e) {
  return n[e].content;
};
Mt.html_inline = function(n, e) {
  return n[e].content;
};
function yi() {
  this.rules = Us({}, Mt);
}
yi.prototype.renderAttrs = function(e) {
  let t, i, r;
  if (!e.attrs)
    return "";
  for (r = "", t = 0, i = e.attrs.length; t < i; t++)
    r += " " + mn(e.attrs[t][0]) + '="' + mn(e.attrs[t][1]) + '"';
  return r;
};
yi.prototype.renderToken = function(e, t, i) {
  const r = e[t];
  let s = "";
  if (r.hidden)
    return "";
  r.block && r.nesting !== -1 && t && e[t - 1].hidden && (s += `
`), s += (r.nesting === -1 ? "</" : "<") + r.tag, s += this.renderAttrs(r), r.nesting === 0 && i.xhtmlOut && (s += " /");
  let o = !1;
  if (r.block && (o = !0, r.nesting === 1 && t + 1 < e.length)) {
    const l = e[t + 1];
    (l.type === "inline" || l.hidden || l.nesting === -1 && l.tag === r.tag) && (o = !1);
  }
  return s += o ? `>
` : ">", s;
};
yi.prototype.renderInline = function(n, e, t) {
  let i = "";
  const r = this.rules;
  for (let s = 0, o = n.length; s < o; s++) {
    const l = n[s].type;
    typeof r[l] < "u" ? i += r[l](n, s, e, t, this) : i += this.renderToken(n, s, e);
  }
  return i;
};
yi.prototype.renderInlineAsText = function(n, e, t) {
  let i = "";
  for (let r = 0, s = n.length; r < s; r++)
    switch (n[r].type) {
      case "text":
        i += n[r].content;
        break;
      case "image":
        i += this.renderInlineAsText(n[r].children, e, t);
        break;
      case "html_inline":
      case "html_block":
        i += n[r].content;
        break;
      case "softbreak":
      case "hardbreak":
        i += `
`;
        break;
    }
  return i;
};
yi.prototype.render = function(n, e, t) {
  let i = "";
  const r = this.rules;
  for (let s = 0, o = n.length; s < o; s++) {
    const l = n[s].type;
    l === "inline" ? i += this.renderInline(n[s].children, e, t) : typeof r[l] < "u" ? i += r[l](n, s, e, t, this) : i += this.renderToken(n, s, e, t);
  }
  return i;
};
function Ye() {
  this.__rules__ = [], this.__cache__ = null;
}
Ye.prototype.__find__ = function(n) {
  for (let e = 0; e < this.__rules__.length; e++)
    if (this.__rules__[e].name === n)
      return e;
  return -1;
};
Ye.prototype.__compile__ = function() {
  const n = this, e = [""];
  n.__rules__.forEach(function(t) {
    t.enabled && t.alt.forEach(function(i) {
      e.indexOf(i) < 0 && e.push(i);
    });
  }), n.__cache__ = {}, e.forEach(function(t) {
    n.__cache__[t] = [], n.__rules__.forEach(function(i) {
      i.enabled && (t && i.alt.indexOf(t) < 0 || n.__cache__[t].push(i.fn));
    });
  });
};
Ye.prototype.at = function(n, e, t) {
  const i = this.__find__(n), r = t || {};
  if (i === -1)
    throw new Error("Parser rule not found: " + n);
  this.__rules__[i].fn = e, this.__rules__[i].alt = r.alt || [], this.__cache__ = null;
};
Ye.prototype.before = function(n, e, t, i) {
  const r = this.__find__(n), s = i || {};
  if (r === -1)
    throw new Error("Parser rule not found: " + n);
  this.__rules__.splice(r, 0, {
    name: e,
    enabled: !0,
    fn: t,
    alt: s.alt || []
  }), this.__cache__ = null;
};
Ye.prototype.after = function(n, e, t, i) {
  const r = this.__find__(n), s = i || {};
  if (r === -1)
    throw new Error("Parser rule not found: " + n);
  this.__rules__.splice(r + 1, 0, {
    name: e,
    enabled: !0,
    fn: t,
    alt: s.alt || []
  }), this.__cache__ = null;
};
Ye.prototype.push = function(n, e, t) {
  const i = t || {};
  this.__rules__.push({
    name: n,
    enabled: !0,
    fn: e,
    alt: i.alt || []
  }), this.__cache__ = null;
};
Ye.prototype.enable = function(n, e) {
  Array.isArray(n) || (n = [n]);
  const t = [];
  return n.forEach(function(i) {
    const r = this.__find__(i);
    if (r < 0) {
      if (e)
        return;
      throw new Error("Rules manager: invalid rule name " + i);
    }
    this.__rules__[r].enabled = !0, t.push(i);
  }, this), this.__cache__ = null, t;
};
Ye.prototype.enableOnly = function(n, e) {
  Array.isArray(n) || (n = [n]), this.__rules__.forEach(function(t) {
    t.enabled = !1;
  }), this.enable(n, e);
};
Ye.prototype.disable = function(n, e) {
  Array.isArray(n) || (n = [n]);
  const t = [];
  return n.forEach(function(i) {
    const r = this.__find__(i);
    if (r < 0) {
      if (e)
        return;
      throw new Error("Rules manager: invalid rule name " + i);
    }
    this.__rules__[r].enabled = !1, t.push(i);
  }, this), this.__cache__ = null, t;
};
Ye.prototype.getRules = function(n) {
  return this.__cache__ === null && this.__compile__(), this.__cache__[n] || [];
};
function gt(n, e, t) {
  this.type = n, this.tag = e, this.attrs = null, this.map = null, this.nesting = t, this.level = 0, this.children = null, this.content = "", this.markup = "", this.info = "", this.meta = null, this.block = !1, this.hidden = !1;
}
gt.prototype.attrIndex = function(e) {
  if (!this.attrs)
    return -1;
  const t = this.attrs;
  for (let i = 0, r = t.length; i < r; i++)
    if (t[i][0] === e)
      return i;
  return -1;
};
gt.prototype.attrPush = function(e) {
  this.attrs ? this.attrs.push(e) : this.attrs = [e];
};
gt.prototype.attrSet = function(e, t) {
  const i = this.attrIndex(e), r = [e, t];
  i < 0 ? this.attrPush(r) : this.attrs[i] = r;
};
gt.prototype.attrGet = function(e) {
  const t = this.attrIndex(e);
  let i = null;
  return t >= 0 && (i = this.attrs[t][1]), i;
};
gt.prototype.attrJoin = function(e, t) {
  const i = this.attrIndex(e);
  i < 0 ? this.attrPush([e, t]) : this.attrs[i][1] = this.attrs[i][1] + " " + t;
};
function Kf(n, e, t) {
  this.src = n, this.env = t, this.tokens = [], this.inlineMode = !1, this.md = e;
}
Kf.prototype.Token = gt;
const dg = /\r\n?|\n/g, Og = /\0/g;
function pg(n) {
  let e;
  e = n.src.replace(dg, `
`), e = e.replace(Og, "�"), n.src = e;
}
function mg(n) {
  let e;
  n.inlineMode ? (e = new n.Token("inline", "", 0), e.content = n.src, e.map = [0, 1], e.children = [], n.tokens.push(e)) : n.md.block.parse(n.src, n.md, n.env, n.tokens);
}
function gg(n) {
  const e = n.tokens;
  for (let t = 0, i = e.length; t < i; t++) {
    const r = e[t];
    r.type === "inline" && n.md.inline.parse(r.content, n.md, n.env, r.children);
  }
}
function bg(n) {
  return /^<a[>\s]/i.test(n);
}
function xg(n) {
  return /^<\/a\s*>/i.test(n);
}
function kg(n) {
  const e = n.tokens;
  if (n.md.options.linkify)
    for (let t = 0, i = e.length; t < i; t++) {
      if (e[t].type !== "inline" || !n.md.linkify.pretest(e[t].content))
        continue;
      const r = e[t].children, s = [];
      let o = 0;
      for (let l = r.length - 1; l >= 0; l--) {
        const u = r[l];
        if (u.type === "link_close") {
          for (l--; r[l].level !== u.level && r[l].type !== "link_open"; )
            l--;
          continue;
        }
        if (u.type === "html_inline" && (bg(u.content) && o > 0 && o--, xg(u.content) && o++), !(o > 0) && u.type === "text" && n.md.linkify.test(u.content)) {
          const a = u.content;
          let c = n.md.linkify.match(a);
          const h = [];
          let f = u.level, d = 0;
          c.length > 0 && c[0].index === 0 && l > 0 && r[l - 1].type === "text_special" && (c = c.slice(1));
          for (let O = 0; O < c.length; O++) {
            const m = c[O].url, g = n.md.normalizeLink(m);
            if (!n.md.validateLink(g))
              continue;
            let b = c[O].text;
            c[O].schema ? c[O].schema === "mailto:" && !/^mailto:/i.test(b) ? b = n.md.normalizeLinkText("mailto:" + b).replace(/^mailto:/, "") : b = n.md.normalizeLinkText(b) : b = n.md.normalizeLinkText("http://" + b).replace(/^http:\/\//, "");
            const w = c[O].index;
            if (w > d) {
              const A = new n.Token("text", "", 0);
              A.content = a.slice(d, w), A.level = f, h.push(A);
            }
            const S = new n.Token("link_open", "a", 1);
            S.attrs = [["href", g]], S.level = f++, S.markup = "linkify", S.info = "auto", h.push(S);
            const Q = new n.Token("text", "", 0);
            Q.content = b, Q.level = f, h.push(Q);
            const y = new n.Token("link_close", "a", -1);
            y.level = --f, y.markup = "linkify", y.info = "auto", h.push(y), d = c[O].lastIndex;
          }
          if (d < a.length) {
            const O = new n.Token("text", "", 0);
            O.content = a.slice(d), O.level = f, h.push(O);
          }
          s.push({ index: l, nodes: h });
        }
      }
      if (s.length > 0) {
        let l = r.length;
        for (const h of s)
          l += h.nodes.length - 1;
        const u = new Array(l);
        let a = 0, c = 0;
        s.reverse();
        for (let h = 0; h < r.length; h++) {
          const f = s[a];
          if (f?.index === h) {
            for (const d of f.nodes)
              u[c++] = d;
            a++;
          } else
            u[c++] = r[h];
        }
        e[t].children = u;
      }
    }
}
const Jf = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/, Sg = /\((c|tm|r)\)/i, yg = /\((c|tm|r)\)/ig, Qg = {
  c: "©",
  r: "®",
  tm: "™"
};
function wg(n, e) {
  return Qg[e.toLowerCase()];
}
function $g(n) {
  let e = 0;
  for (let t = n.length - 1; t >= 0; t--) {
    const i = n[t];
    i.type === "text" && !e && (i.content = i.content.replace(yg, wg)), i.type === "link_open" && i.info === "auto" && e--, i.type === "link_close" && i.info === "auto" && e++;
  }
}
function Pg(n) {
  let e = 0;
  for (let t = n.length - 1; t >= 0; t--) {
    const i = n[t];
    i.type === "text" && !e && Jf.test(i.content) && (i.content = i.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1—").replace(/(^|\s)--(?=\s|$)/mg, "$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1–")), i.type === "link_open" && i.info === "auto" && e--, i.type === "link_close" && i.info === "auto" && e++;
  }
}
function vg(n) {
  let e;
  if (n.md.options.typographer)
    for (e = n.tokens.length - 1; e >= 0; e--)
      n.tokens[e].type === "inline" && (Sg.test(n.tokens[e].content) && $g(n.tokens[e].children), Jf.test(n.tokens[e].content) && Pg(n.tokens[e].children));
}
const _g = /['"]/, fc = /['"]/g, dc = "’", Ag = 1e3;
function Oc(n, e, t) {
  for (; n.length > t; ) {
    const i = n.pop();
    i.isSingleQuote ? e.single = i.prevSameQuoteIdx : e.double = i.prevSameQuoteIdx;
  }
}
function Yr(n, e, t, i) {
  n[e] || (n[e] = []), n[e].push({ pos: t, ch: i });
}
function Cg(n, e) {
  let t = "", i = 0;
  e.sort((r, s) => r.pos - s.pos);
  for (let r = 0; r < e.length; r++) {
    const s = e[r];
    t += n.slice(i, s.pos) + s.ch, i = s.pos + 1;
  }
  return t + n.slice(i);
}
function Tg(n, e) {
  let t;
  const i = [], r = { single: -1, double: -1 }, s = {};
  for (let o = 0; o < n.length; o++) {
    const l = n[o], u = n[o].level;
    for (t = i.length - 1; t >= 0 && !(i[t].level <= u); t--)
      ;
    if (Oc(i, r, t + 1), l.type !== "text")
      continue;
    const a = l.content;
    let c = 0;
    const h = a.length;
    e:
      for (; c < h; ) {
        fc.lastIndex = c;
        const f = fc.exec(a);
        if (!f)
          break;
        let d = !0, O = !0;
        c = f.index + 1;
        const m = f[0] === "'";
        let g = 32;
        if (f.index - 1 >= 0)
          g = a.charCodeAt(f.index - 1);
        else
          for (t = o - 1; t >= 0 && !(n[t].type === "softbreak" || n[t].type === "hardbreak"); t--)
            if (n[t].content) {
              g = n[t].content.charCodeAt(n[t].content.length - 1);
              break;
            }
        let b = 32;
        if (c < h)
          b = a.charCodeAt(c);
        else
          for (t = o + 1; t < n.length && !(n[t].type === "softbreak" || n[t].type === "hardbreak"); t++)
            if (n[t].content) {
              b = n[t].content.charCodeAt(0);
              break;
            }
        const w = rr(g) || ir(g), S = rr(b) || ir(b), Q = nr(g), y = nr(b);
        if (y ? d = !1 : S && (Q || w || (d = !1)), Q ? O = !1 : w && (y || S || (O = !1)), b === 34 && f[0] === '"' && g >= 48 && g <= 57 && (O = d = !1), d && O && (d = w, O = S), !d && !O) {
          m && Yr(s, o, f.index, dc);
          continue;
        }
        if (O && (t = m ? r.single : r.double, t >= 0 && i[t].level === u)) {
          const A = i[t];
          let C, z;
          m ? (C = e.md.options.quotes[2], z = e.md.options.quotes[3]) : (C = e.md.options.quotes[0], z = e.md.options.quotes[1]), Yr(s, o, f.index, z), Yr(s, A.tokenIdx, A.contentPos, C), Oc(i, r, t);
          continue e;
        }
        if (d) {
          if (i.length >= Ag)
            return;
          i.push({
            tokenIdx: o,
            contentPos: f.index,
            isSingleQuote: m,
            level: u,
            // stack index of the previous opener of the same quote type, -1 if none
            prevSameQuoteIdx: m ? r.single : r.double
          }), m ? r.single = i.length - 1 : r.double = i.length - 1;
        } else O && m && Yr(s, o, f.index, dc);
      }
  }
  Object.keys(s).forEach(function(o) {
    n[o].content = Cg(n[o].content, s[o]);
  });
}
function Eg(n) {
  if (n.md.options.typographer)
    for (let e = n.tokens.length - 1; e >= 0; e--)
      n.tokens[e].type !== "inline" || !_g.test(n.tokens[e].content) || Tg(n.tokens[e].children, n);
}
function Xg(n) {
  let e, t;
  const i = n.tokens, r = i.length;
  for (let s = 0; s < r; s++) {
    if (i[s].type !== "inline") continue;
    const o = i[s].children, l = o.length;
    for (e = 0; e < l; e++)
      o[e].type === "text_special" && (o[e].type = "text");
    for (e = t = 0; e < l; e++)
      o[e].type === "text" && e + 1 < l && o[e + 1].type === "text" ? o[e + 1].content = o[e].content + o[e + 1].content : (e !== t && (o[t] = o[e]), t++);
    e !== t && (o.length = t);
  }
}
const Lo = [
  ["normalize", pg],
  ["block", mg],
  ["inline", gg],
  ["linkify", kg],
  ["replacements", vg],
  ["smartquotes", Eg],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ["text_join", Xg]
];
function Lu() {
  this.ruler = new Ye();
  for (let n = 0; n < Lo.length; n++)
    this.ruler.push(Lo[n][0], Lo[n][1]);
}
Lu.prototype.process = function(n) {
  const e = this.ruler.getRules("");
  for (let t = 0, i = e.length; t < i; t++)
    e[t](n);
};
Lu.prototype.State = Kf;
function Lt(n, e, t, i) {
  this.src = n, this.md = e, this.env = t, this.tokens = i, this.bMarks = [], this.eMarks = [], this.tShift = [], this.sCount = [], this.bsCount = [], this.blkIndent = 0, this.line = 0, this.lineMax = 0, this.tight = !1, this.ddIndent = -1, this.listIndent = -1, this.parentType = "root", this.level = 0;
  const r = this.src;
  for (let s = 0, o = 0, l = 0, u = 0, a = r.length, c = !1; o < a; o++) {
    const h = r.charCodeAt(o);
    if (!c)
      if (oe(h)) {
        l++, h === 9 ? u += 4 - u % 4 : u++;
        continue;
      } else
        c = !0;
    (h === 10 || o === a - 1) && (h !== 10 && o++, this.bMarks.push(s), this.eMarks.push(o), this.tShift.push(l), this.sCount.push(u), this.bsCount.push(0), c = !1, l = 0, u = 0, s = o + 1);
  }
  this.bMarks.push(r.length), this.eMarks.push(r.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1;
}
Lt.prototype.push = function(n, e, t) {
  const i = new gt(n, e, t);
  return i.block = !0, t < 0 && this.level--, i.level = this.level, t > 0 && this.level++, this.tokens.push(i), i;
};
Lt.prototype.isEmpty = function(e) {
  return this.bMarks[e] + this.tShift[e] >= this.eMarks[e];
};
Lt.prototype.skipEmptyLines = function(e) {
  for (let t = this.lineMax; e < t && !(this.bMarks[e] + this.tShift[e] < this.eMarks[e]); e++)
    ;
  return e;
};
Lt.prototype.skipSpaces = function(e) {
  for (let t = this.src.length; e < t; e++) {
    const i = this.src.charCodeAt(e);
    if (!oe(i))
      break;
  }
  return e;
};
Lt.prototype.skipSpacesBack = function(e, t) {
  if (e <= t)
    return e;
  for (; e > t; )
    if (!oe(this.src.charCodeAt(--e)))
      return e + 1;
  return e;
};
Lt.prototype.skipChars = function(e, t) {
  for (let i = this.src.length; e < i && this.src.charCodeAt(e) === t; e++)
    ;
  return e;
};
Lt.prototype.skipCharsBack = function(e, t, i) {
  if (e <= i)
    return e;
  for (; e > i; )
    if (t !== this.src.charCodeAt(--e))
      return e + 1;
  return e;
};
Lt.prototype.getLines = function(e, t, i, r) {
  if (e >= t)
    return "";
  const s = new Array(t - e);
  for (let o = 0, l = e; l < t; l++, o++) {
    let u = 0;
    const a = this.bMarks[l];
    let c = a, h;
    for (l + 1 < t || r ? h = this.eMarks[l] + 1 : h = this.eMarks[l]; c < h && u < i; ) {
      const f = this.src.charCodeAt(c);
      if (oe(f))
        f === 9 ? u += 4 - (u + this.bsCount[l]) % 4 : u++;
      else if (c - a < this.tShift[l])
        u++;
      else
        break;
      c++;
    }
    u > i ? s[o] = new Array(u - i + 1).join(" ") + this.src.slice(c, h) : s[o] = this.src.slice(c, h);
  }
  return s.join("");
};
Lt.prototype.Token = gt;
const Zg = 65536;
function jo(n, e) {
  const t = n.bMarks[e] + n.tShift[e], i = n.eMarks[e];
  return n.src.slice(t, i);
}
function pc(n) {
  const e = [], t = n.length;
  let i = 0, r = n.charCodeAt(i), s = !1, o = 0, l = "";
  for (; i < t; )
    r === 124 && (s ? (l += n.substring(o, i - 1), o = i) : (e.push(l + n.substring(o, i)), l = "", o = i + 1)), s = r === 92, i++, r = n.charCodeAt(i);
  return e.push(l + n.substring(o)), e;
}
function Dg(n, e, t, i) {
  if (e + 2 > t)
    return !1;
  let r = e + 1;
  if (n.sCount[r] < n.blkIndent || n.sCount[r] - n.blkIndent >= 4)
    return !1;
  let s = n.bMarks[r] + n.tShift[r];
  if (s >= n.eMarks[r])
    return !1;
  const o = n.src.charCodeAt(s++);
  if (o !== 124 && o !== 45 && o !== 58 || s >= n.eMarks[r])
    return !1;
  const l = n.src.charCodeAt(s++);
  if (l !== 124 && l !== 45 && l !== 58 && !oe(l) || o === 45 && oe(l))
    return !1;
  for (; s < n.eMarks[r]; ) {
    const Q = n.src.charCodeAt(s);
    if (Q !== 124 && Q !== 45 && Q !== 58 && !oe(Q))
      return !1;
    s++;
  }
  let u = jo(n, e + 1), a = u.split("|");
  const c = [];
  for (let Q = 0; Q < a.length; Q++) {
    const y = a[Q].trim();
    if (!y) {
      if (Q === 0 || Q === a.length - 1)
        continue;
      return !1;
    }
    if (!/^:?-+:?$/.test(y))
      return !1;
    y.charCodeAt(y.length - 1) === 58 ? c.push(y.charCodeAt(0) === 58 ? "center" : "right") : y.charCodeAt(0) === 58 ? c.push("left") : c.push("");
  }
  if (u = jo(n, e).trim(), u.indexOf("|") === -1 || n.sCount[e] - n.blkIndent >= 4)
    return !1;
  a = pc(u), a.length && a[0] === "" && a.shift(), a.length && a[a.length - 1] === "" && a.pop();
  const h = a.length;
  if (h === 0 || h !== c.length)
    return !1;
  if (i)
    return !0;
  const f = n.parentType;
  n.parentType = "table";
  const d = n.md.block.ruler.getRules("blockquote"), O = n.push("table_open", "table", 1), m = [e, 0];
  O.map = m;
  const g = n.push("thead_open", "thead", 1);
  g.map = [e, e + 1];
  const b = n.push("tr_open", "tr", 1);
  b.map = [e, e + 1];
  for (let Q = 0; Q < a.length; Q++) {
    const y = n.push("th_open", "th", 1);
    c[Q] && (y.attrs = [["style", "text-align:" + c[Q]]]);
    const A = n.push("inline", "", 0);
    A.content = a[Q].trim(), A.children = [], n.push("th_close", "th", -1);
  }
  n.push("tr_close", "tr", -1), n.push("thead_close", "thead", -1);
  let w, S = 0;
  for (r = e + 2; r < t && !(n.sCount[r] < n.blkIndent); r++) {
    let Q = !1;
    for (let A = 0, C = d.length; A < C; A++)
      if (d[A](n, r, t, !0)) {
        Q = !0;
        break;
      }
    if (Q || (u = jo(n, r).trim(), !u) || n.sCount[r] - n.blkIndent >= 4 || (a = pc(u), a.length && a[0] === "" && a.shift(), a.length && a[a.length - 1] === "" && a.pop(), S += h - a.length, S > Zg))
      break;
    if (r === e + 2) {
      const A = n.push("tbody_open", "tbody", 1);
      A.map = w = [e + 2, 0];
    }
    const y = n.push("tr_open", "tr", 1);
    y.map = [r, r + 1];
    for (let A = 0; A < h; A++) {
      const C = n.push("td_open", "td", 1);
      c[A] && (C.attrs = [["style", "text-align:" + c[A]]]);
      const z = n.push("inline", "", 0);
      z.content = a[A] ? a[A].trim() : "", z.children = [], n.push("td_close", "td", -1);
    }
    n.push("tr_close", "tr", -1);
  }
  return w && (n.push("tbody_close", "tbody", -1), w[1] = r), n.push("table_close", "table", -1), m[1] = r, n.parentType = f, n.line = r, !0;
}
function Rg(n, e, t) {
  if (n.sCount[e] - n.blkIndent < 4)
    return !1;
  let i = e + 1, r = i;
  for (; i < t; ) {
    if (n.isEmpty(i)) {
      i++;
      continue;
    }
    if (n.sCount[i] - n.blkIndent >= 4) {
      i++, r = i;
      continue;
    }
    break;
  }
  n.line = r;
  const s = n.push("code_block", "code", 0);
  return s.content = n.getLines(e, r, 4 + n.blkIndent, !1) + `
`, s.map = [e, n.line], !0;
}
function Mg(n, e, t, i) {
  let r = n.bMarks[e] + n.tShift[e], s = n.eMarks[e];
  if (n.sCount[e] - n.blkIndent >= 4 || r + 3 > s)
    return !1;
  const o = n.src.charCodeAt(r);
  if (o !== 126 && o !== 96)
    return !1;
  let l = r;
  r = n.skipChars(r, o);
  let u = r - l;
  if (u < 3)
    return !1;
  const a = n.src.slice(l, r), c = n.src.slice(r, s);
  if (o === 96 && c.indexOf(String.fromCharCode(o)) >= 0)
    return !1;
  if (i)
    return !0;
  let h = e, f = !1;
  for (; h++, !(h >= t || (r = l = n.bMarks[h] + n.tShift[h], s = n.eMarks[h], r < s && n.sCount[h] < n.blkIndent)); )
    if (n.src.charCodeAt(r) === o && !(n.sCount[h] - n.blkIndent >= 4) && (r = n.skipChars(r, o), !(r - l < u) && (r = n.skipSpaces(r), !(r < s)))) {
      f = !0;
      break;
    }
  u = n.sCount[e], n.line = h + (f ? 1 : 0);
  const d = n.push("fence", "code", 0);
  return d.info = c, d.content = n.getLines(e + 1, h, u, !0), d.markup = a, d.map = [e, n.line], !0;
}
function Lg(n, e, t, i) {
  let r = n.bMarks[e] + n.tShift[e], s = n.eMarks[e];
  const o = n.lineMax;
  if (n.sCount[e] - n.blkIndent >= 4 || n.src.charCodeAt(r) !== 62)
    return !1;
  if (i)
    return !0;
  const l = [], u = [], a = [], c = [], h = n.md.block.ruler.getRules("blockquote"), f = n.parentType;
  n.parentType = "blockquote";
  let d = !1, O;
  for (O = e; O < t; O++) {
    const S = n.sCount[O] < n.blkIndent;
    if (r = n.bMarks[O] + n.tShift[O], s = n.eMarks[O], r >= s)
      break;
    if (n.src.charCodeAt(r++) === 62 && !S) {
      let y = n.sCount[O] + 1, A, C;
      n.src.charCodeAt(r) === 32 ? (r++, y++, C = !1, A = !0) : n.src.charCodeAt(r) === 9 ? (A = !0, (n.bsCount[O] + y) % 4 === 3 ? (r++, y++, C = !1) : C = !0) : A = !1;
      let z = y;
      for (l.push(n.bMarks[O]), n.bMarks[O] = r; r < s; ) {
        const X = n.src.charCodeAt(r);
        if (oe(X))
          X === 9 ? z += 4 - (z + n.bsCount[O] + (C ? 1 : 0)) % 4 : z++;
        else
          break;
        r++;
      }
      d = r >= s, u.push(n.bsCount[O]), n.bsCount[O] = n.sCount[O] + 1 + (A ? 1 : 0), a.push(n.sCount[O]), n.sCount[O] = z - y, c.push(n.tShift[O]), n.tShift[O] = r - n.bMarks[O];
      continue;
    }
    if (d)
      break;
    let Q = !1;
    for (let y = 0, A = h.length; y < A; y++)
      if (h[y](n, O, t, !0)) {
        Q = !0;
        break;
      }
    if (Q) {
      n.lineMax = O, n.blkIndent !== 0 && (l.push(n.bMarks[O]), u.push(n.bsCount[O]), c.push(n.tShift[O]), a.push(n.sCount[O]), n.sCount[O] -= n.blkIndent);
      break;
    }
    l.push(n.bMarks[O]), u.push(n.bsCount[O]), c.push(n.tShift[O]), a.push(n.sCount[O]), n.sCount[O] = -1;
  }
  const m = n.blkIndent;
  n.blkIndent = 0;
  const g = n.push("blockquote_open", "blockquote", 1);
  g.markup = ">";
  const b = [e, 0];
  g.map = b, n.md.block.tokenize(n, e, O);
  const w = n.push("blockquote_close", "blockquote", -1);
  w.markup = ">", n.lineMax = o, n.parentType = f, b[1] = n.line;
  for (let S = 0; S < c.length; S++)
    n.bMarks[S + e] = l[S], n.tShift[S + e] = c[S], n.sCount[S + e] = a[S], n.bsCount[S + e] = u[S];
  return n.blkIndent = m, !0;
}
function jg(n, e, t, i) {
  const r = n.eMarks[e];
  if (n.sCount[e] - n.blkIndent >= 4)
    return !1;
  let s = n.bMarks[e] + n.tShift[e];
  const o = n.src.charCodeAt(s++);
  if (o !== 42 && o !== 45 && o !== 95)
    return !1;
  let l = 1;
  for (; s < r; ) {
    const a = n.src.charCodeAt(s++);
    if (a !== o && !oe(a))
      return !1;
    a === o && l++;
  }
  if (l < 3)
    return !1;
  if (i)
    return !0;
  n.line = e + 1;
  const u = n.push("hr", "hr", 0);
  return u.map = [e, n.line], u.markup = Array(l + 1).join(String.fromCharCode(o)), !0;
}
function mc(n, e) {
  const t = n.eMarks[e];
  let i = n.bMarks[e] + n.tShift[e];
  const r = n.src.charCodeAt(i++);
  if (r !== 42 && r !== 45 && r !== 43)
    return -1;
  if (i < t) {
    const s = n.src.charCodeAt(i);
    if (!oe(s))
      return -1;
  }
  return i;
}
function gc(n, e) {
  const t = n.bMarks[e] + n.tShift[e], i = n.eMarks[e];
  let r = t;
  if (r + 1 >= i)
    return -1;
  let s = n.src.charCodeAt(r++);
  if (s < 48 || s > 57)
    return -1;
  for (; ; ) {
    if (r >= i)
      return -1;
    if (s = n.src.charCodeAt(r++), s >= 48 && s <= 57) {
      if (r - t >= 10)
        return -1;
      continue;
    }
    if (s === 41 || s === 46)
      break;
    return -1;
  }
  return r < i && (s = n.src.charCodeAt(r), !oe(s)) ? -1 : r;
}
function zg(n, e) {
  const t = n.level + 2;
  for (let i = e + 2, r = n.tokens.length - 2; i < r; i++)
    n.tokens[i].level === t && n.tokens[i].type === "paragraph_open" && (n.tokens[i + 2].hidden = !0, n.tokens[i].hidden = !0, i += 2);
}
function Ig(n, e, t, i) {
  let r, s, o, l, u = e, a = !0;
  if (n.sCount[u] - n.blkIndent >= 4 || n.listIndent >= 0 && n.sCount[u] - n.listIndent >= 4 && n.sCount[u] < n.blkIndent)
    return !1;
  let c = !1;
  i && n.parentType === "paragraph" && n.sCount[u] >= n.blkIndent && (c = !0);
  let h, f, d;
  if ((d = gc(n, u)) >= 0) {
    if (h = !0, o = n.bMarks[u] + n.tShift[u], f = Number(n.src.slice(o, d - 1)), c && f !== 1) return !1;
  } else if ((d = mc(n, u)) >= 0)
    h = !1;
  else
    return !1;
  if (c && n.skipSpaces(d) >= n.eMarks[u])
    return !1;
  if (i)
    return !0;
  const O = n.src.charCodeAt(d - 1), m = n.tokens.length;
  h ? (l = n.push("ordered_list_open", "ol", 1), f !== 1 && (l.attrs = [["start", f]])) : l = n.push("bullet_list_open", "ul", 1);
  const g = [u, 0];
  l.map = g, l.markup = String.fromCharCode(O);
  let b = !1;
  const w = n.md.block.ruler.getRules("list"), S = n.parentType;
  for (n.parentType = "list"; u < t; ) {
    s = d, r = n.eMarks[u];
    const Q = n.sCount[u] + d - (n.bMarks[u] + n.tShift[u]);
    let y = Q;
    for (; s < r; ) {
      const ee = n.src.charCodeAt(s);
      if (ee === 9)
        y += 4 - (y + n.bsCount[u]) % 4;
      else if (ee === 32)
        y++;
      else
        break;
      s++;
    }
    const A = s;
    let C;
    A >= r ? C = 1 : C = y - Q, C > 4 && (C = 1);
    const z = Q + C;
    l = n.push("list_item_open", "li", 1), l.markup = String.fromCharCode(O);
    const X = [u, 0];
    l.map = X, h && (l.info = n.src.slice(o, d - 1));
    const q = n.tight, R = n.tShift[u], M = n.sCount[u], W = n.listIndent;
    if (n.listIndent = n.blkIndent, n.blkIndent = z, n.tight = !0, n.tShift[u] = A - n.bMarks[u], n.sCount[u] = y, A >= r && n.isEmpty(u + 1) ? n.line = Math.min(n.line + 2, t) : n.md.block.tokenize(n, u, t, !0), (!n.tight || b) && (a = !1), b = n.line - u > 1 && n.isEmpty(n.line - 1), n.blkIndent = n.listIndent, n.listIndent = W, n.tShift[u] = R, n.sCount[u] = M, n.tight = q, l = n.push("list_item_close", "li", -1), l.markup = String.fromCharCode(O), u = n.line, X[1] = u, u >= t || n.sCount[u] < n.blkIndent || n.sCount[u] - n.blkIndent >= 4)
      break;
    let ne = !1;
    for (let ee = 0, We = w.length; ee < We; ee++)
      if (w[ee](n, u, t, !0)) {
        ne = !0;
        break;
      }
    if (ne)
      break;
    if (h) {
      if (d = gc(n, u), d < 0)
        break;
      o = n.bMarks[u] + n.tShift[u];
    } else if (d = mc(n, u), d < 0)
      break;
    if (O !== n.src.charCodeAt(d - 1))
      break;
  }
  return h ? l = n.push("ordered_list_close", "ol", -1) : l = n.push("bullet_list_close", "ul", -1), l.markup = String.fromCharCode(O), g[1] = u, n.line = u, n.parentType = S, a && zg(n, m), !0;
}
const zo = 999;
function Bg(n) {
  let e = n.length;
  for (let t = 0; t < n.length - 1; t++) {
    const i = n.charCodeAt(t);
    if (i < 55296 || i > 56319)
      continue;
    const r = n.charCodeAt(t + 1);
    r >= 56320 && r <= 57343 && (e--, t++);
  }
  return e;
}
function Ci(n, e) {
  return Math.min(n.eMarks[e] + 1, n.src.length);
}
function Wr(n, e) {
  const t = n.lineMax;
  if (e >= t || n.isEmpty(e))
    return -1;
  let i = !1;
  if (n.sCount[e] - n.blkIndent > 3 && (i = !0), n.sCount[e] < 0 && (i = !0), !i) {
    const r = n.md.block.ruler.getRules("reference"), s = n.parentType;
    n.parentType = "reference";
    let o = !1;
    for (let l = 0, u = r.length; l < u; l++)
      if (r[l](n, e, t, !0)) {
        o = !0;
        break;
      }
    if (n.parentType = s, o)
      return -1;
  }
  return n.bMarks[e] + n.tShift[e];
}
function qg(n, e, t, i) {
  const r = n.src;
  let s = n.bMarks[e] + n.tShift[e], o = e + 1;
  if (n.sCount[e] - n.blkIndent >= 4 || r.charCodeAt(s) !== 91)
    return !1;
  let l = Ci(n, e), u = "", a = -1, c = ++s;
  for (; s < l; ) {
    if (u.length + s - c > zo * 2)
      return !1;
    let Q = r.charCodeAt(s);
    if (Q === 91)
      return !1;
    if (Q === 93) {
      a = s;
      break;
    }
    if (Q === 92 && (Q = r.charCodeAt(++s)), Q === 10 && s < l) {
      const y = Wr(n, o);
      if (y < 0)
        return !1;
      u += r.slice(c, l), s = c = y, l = Ci(n, o++);
      continue;
    }
    s++;
  }
  if (a < 0 || r.charCodeAt(a + 1) !== 58 || (u += r.slice(c, a), u.length > zo && Bg(u) > zo))
    return !1;
  for (s = a + 2; s < l; ) {
    const Q = r.charCodeAt(s);
    if (Q === 10) {
      const y = Wr(n, o);
      if (y < 0)
        break;
      s = y, l = Ci(n, o++);
    } else if (oe(Q))
      s++;
    else
      break;
  }
  const h = n.md.helpers.parseLinkDestination(r, s, l);
  if (!h.ok)
    return !1;
  const f = n.md.normalizeLink(h.str);
  if (!n.md.validateLink(f))
    return !1;
  s = h.pos;
  const d = s, O = l, m = o;
  for (; s < l; ) {
    const Q = r.charCodeAt(s);
    if (Q === 10) {
      const y = Wr(n, o);
      if (y < 0)
        break;
      s = y, l = Ci(n, o++);
    } else if (oe(Q))
      s++;
    else
      break;
  }
  const g = s;
  let b = n.md.helpers.parseLinkTitle(r, s, l);
  for (; b.can_continue; ) {
    const Q = Wr(n, o);
    if (Q < 0) break;
    s = Q, l = Ci(n, o++), b = n.md.helpers.parseLinkTitle(r, s, l, b);
  }
  let w;
  for (g !== d && b.ok ? (w = b.str, s = b.pos) : (w = "", s = d, l = O, o = m); s < l; ) {
    const Q = r.charCodeAt(s);
    if (!oe(Q))
      break;
    s++;
  }
  if (s < l && r.charCodeAt(s) !== 10 && w)
    for (w = "", s = d, l = O, o = m; s < l; ) {
      const Q = r.charCodeAt(s);
      if (!oe(Q))
        break;
      s++;
    }
  if (s < l && r.charCodeAt(s) !== 10)
    return !1;
  const S = Gs(u);
  return S ? (i || (typeof n.env.references > "u" && (n.env.references = {}), typeof n.env.references[S] > "u" && (n.env.references[S] = { title: w, href: f }), n.line = o), !0) : !1;
}
const Fg = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], Yg = "[a-zA-Z_:][a-zA-Z0-9:._-]*", Wg = "[^\"'=<>`\\x00-\\x20]+", Ng = "'[^']*'", Vg = '"[^"]*"', Ug = "(?:" + Wg + "|" + Ng + "|" + Vg + ")", Gg = "(?:\\s+" + Yg + "(?:\\s*=\\s*" + Ug + ")?)", Hg = "<[A-Za-z][A-Za-z0-9\\-]*" + Gg + "*\\s*\\/?>", Kg = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>", ed = new RegExp("^(?:" + Hg + "|" + Kg + ")"), _n = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, !0],
  [/^<!--/, /-->/, !0],
  [/^<\?/, /\?>/, !0],
  [/^<![A-Za-z]/, />/, !0],
  [/^<!\[CDATA\[/, /\]\]>/, !0],
  [new RegExp("^</?(" + Fg.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, !0],
  [new RegExp(ed.source + "\\s*$"), /^$/, !1]
];
function Jg(n, e, t, i) {
  let r = n.bMarks[e] + n.tShift[e], s = n.eMarks[e];
  if (n.sCount[e] - n.blkIndent >= 4 || !n.md.options.html || n.src.charCodeAt(r) !== 60)
    return !1;
  let o = n.src.slice(r, s), l = 0;
  for (; l < _n.length && !_n[l][0].test(o); l++)
    ;
  if (l === _n.length)
    return !1;
  if (i)
    return _n[l][2];
  let u = e + 1;
  const a = _n[l][1].test("");
  if (!_n[l][1].test(o)) {
    for (; u < t && !(n.sCount[u] < n.blkIndent && (a || !n.isEmpty(u))); u++)
      if (r = n.bMarks[u] + n.tShift[u], s = n.eMarks[u], o = n.src.slice(r, s), _n[l][1].test(o)) {
        o.length !== 0 && u++;
        break;
      }
  }
  n.line = u;
  const c = n.push("html_block", "", 0);
  return c.map = [e, u], c.content = n.getLines(e, u, n.blkIndent, !0), !0;
}
function e1(n, e, t, i) {
  let r = n.bMarks[e] + n.tShift[e], s = n.eMarks[e];
  if (n.sCount[e] - n.blkIndent >= 4)
    return !1;
  let o = n.src.charCodeAt(r);
  if (o !== 35 || r >= s)
    return !1;
  let l = 1;
  for (o = n.src.charCodeAt(++r); o === 35 && r < s && l <= 6; )
    l++, o = n.src.charCodeAt(++r);
  if (l > 6 || r < s && !oe(o))
    return !1;
  if (i)
    return !0;
  s = n.skipSpacesBack(s, r);
  const u = n.skipCharsBack(s, 35, r);
  u > r && oe(n.src.charCodeAt(u - 1)) && (s = u), n.line = e + 1;
  const a = n.push("heading_open", "h" + String(l), 1);
  a.markup = "########".slice(0, l), a.map = [e, n.line];
  const c = n.push("inline", "", 0);
  c.content = Hs(n.src.slice(r, s)), c.map = [e, n.line], c.children = [];
  const h = n.push("heading_close", "h" + String(l), -1);
  return h.markup = "########".slice(0, l), !0;
}
function t1(n, e, t) {
  const i = n.md.block.ruler.getRules("paragraph");
  if (n.sCount[e] - n.blkIndent >= 4)
    return !1;
  const r = n.parentType;
  n.parentType = "paragraph";
  let s = 0, o, l = e + 1;
  for (; l < t && !n.isEmpty(l); l++) {
    if (n.sCount[l] - n.blkIndent > 3)
      continue;
    if (n.sCount[l] >= n.blkIndent) {
      let d = n.bMarks[l] + n.tShift[l];
      const O = n.eMarks[l];
      if (d < O && (o = n.src.charCodeAt(d), (o === 45 || o === 61) && (d = n.skipChars(d, o), d = n.skipSpaces(d), d >= O))) {
        s = o === 61 ? 1 : 2;
        break;
      }
    }
    if (n.sCount[l] < 0)
      continue;
    let f = !1;
    for (let d = 0, O = i.length; d < O; d++)
      if (i[d](n, l, t, !0)) {
        f = !0;
        break;
      }
    if (f)
      break;
  }
  if (!s)
    return n.parentType = r, !1;
  const u = Hs(n.getLines(e, l, n.blkIndent, !1));
  n.line = l + 1;
  const a = n.push("heading_open", "h" + String(s), 1);
  a.markup = String.fromCharCode(o), a.map = [e, n.line];
  const c = n.push("inline", "", 0);
  c.content = u, c.map = [e, n.line - 1], c.children = [];
  const h = n.push("heading_close", "h" + String(s), -1);
  return h.markup = String.fromCharCode(o), n.parentType = r, !0;
}
function n1(n, e, t) {
  const i = n.md.block.ruler.getRules("paragraph"), r = n.parentType;
  let s = e + 1;
  for (n.parentType = "paragraph"; s < t && !n.isEmpty(s); s++) {
    if (n.sCount[s] - n.blkIndent > 3 || n.sCount[s] < 0)
      continue;
    let a = !1;
    for (let c = 0, h = i.length; c < h; c++)
      if (i[c](n, s, t, !0)) {
        a = !0;
        break;
      }
    if (a)
      break;
  }
  const o = Hs(n.getLines(e, s, n.blkIndent, !1));
  n.line = s;
  const l = n.push("paragraph_open", "p", 1);
  l.map = [e, n.line];
  const u = n.push("inline", "", 0);
  return u.content = o, u.map = [e, n.line], u.children = [], n.push("paragraph_close", "p", -1), n.parentType = r, !0;
}
const Nr = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  ["table", Dg, ["paragraph", "reference"]],
  ["code", Rg],
  ["fence", Mg, ["paragraph", "reference", "blockquote", "list"]],
  ["blockquote", Lg, ["paragraph", "reference", "blockquote", "list"]],
  ["hr", jg, ["paragraph", "reference", "blockquote", "list"]],
  ["list", Ig, ["paragraph", "reference", "blockquote"]],
  ["reference", qg],
  ["html_block", Jg, ["paragraph", "reference", "blockquote"]],
  ["heading", e1, ["paragraph", "reference", "blockquote"]],
  ["lheading", t1],
  ["paragraph", n1]
];
function Ks() {
  this.ruler = new Ye();
  for (let n = 0; n < Nr.length; n++)
    this.ruler.push(Nr[n][0], Nr[n][1], { alt: (Nr[n][2] || []).slice() });
}
Ks.prototype.tokenize = function(n, e, t) {
  const i = this.ruler.getRules(""), r = i.length, s = n.md.options.maxNesting;
  let o = e, l = !1;
  for (; o < t && (n.line = o = n.skipEmptyLines(o), !(o >= t || n.sCount[o] < n.blkIndent)); ) {
    if (n.level >= s) {
      n.line = t;
      break;
    }
    const u = n.line;
    let a = !1;
    for (let c = 0; c < r; c++)
      if (a = i[c](n, o, t, !1), a) {
        if (u >= n.line)
          throw new Error("block rule didn't increment state.line");
        break;
      }
    if (!a) throw new Error("none of the block rules matched");
    n.tight = !l, n.isEmpty(n.line - 1) && (l = !0), o = n.line, o < t && n.isEmpty(o) && (l = !0, o++, n.line = o);
  }
};
Ks.prototype.parse = function(n, e, t, i) {
  if (!n)
    return;
  const r = new this.State(n, e, t, i);
  this.tokenize(r, r.line, r.lineMax);
};
Ks.prototype.State = Lt;
function yr(n, e, t, i) {
  this.src = n, this.env = t, this.md = e, this.tokens = i, this.tokens_meta = Array(i.length), this.pos = 0, this.posMax = this.src.length, this.level = 0, this.pending = "", this.pendingLevel = 0, this.cache = {}, this.delimiters = [], this._prev_delimiters = [], this.backticks = {}, this.backticksScanned = !1, this.skipHtmlSpecial = !1, this.linkLevel = 0;
}
yr.prototype.pushPending = function() {
  const n = new gt("text", "", 0);
  return n.content = this.pending, n.level = this.pendingLevel, this.tokens.push(n), this.pending = "", n;
};
yr.prototype.push = function(n, e, t) {
  this.pending && this.pushPending();
  const i = new gt(n, e, t);
  let r = null;
  return t < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), i.level = this.level, t > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], r = { delimiters: this.delimiters }), this.pendingLevel = this.level, this.tokens.push(i), this.tokens_meta.push(r), i;
};
yr.prototype.scanDelims = function(n, e) {
  const t = this.posMax, i = this.src.charCodeAt(n);
  let r;
  if (n === 0)
    r = 32;
  else if (n === 1)
    r = this.src.charCodeAt(0), (r & 63488) === 55296 && (r = 65533);
  else if (r = this.src.charCodeAt(n - 1), (r & 64512) === 56320) {
    const g = this.src.charCodeAt(n - 2);
    r = (g & 64512) === 55296 ? 65536 + (g - 55296 << 10) + (r - 56320) : 65533;
  } else (r & 64512) === 55296 && (r = 65533);
  let s = n;
  for (; s < t && this.src.charCodeAt(s) === i; )
    s++;
  const o = s - n;
  let l = s < t ? this.src.charCodeAt(s) : 32;
  if ((l & 64512) === 55296) {
    const g = this.src.charCodeAt(s + 1);
    l = (g & 64512) === 56320 ? 65536 + (l - 55296 << 10) + (g - 56320) : 65533;
  } else (l & 64512) === 56320 && (l = 65533);
  const u = rr(r) || ir(r), a = rr(l) || ir(l), c = nr(r), h = nr(l), f = !h && (!a || c || u), d = !c && (!u || h || a);
  return { can_open: f && (e || !d || u), can_close: d && (e || !f || a), length: o };
};
yr.prototype.Token = gt;
function i1(n) {
  switch (n) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return !0;
    default:
      return !1;
  }
}
function r1(n, e) {
  let t = n.pos;
  for (; t < n.posMax && !i1(n.src.charCodeAt(t)); )
    t++;
  return t === n.pos ? !1 : (e || (n.pending += n.src.slice(n.pos, t)), n.pos = t, !0);
}
function s1(n) {
  return n >= 65 && n <= 90 || n >= 97 && n <= 122;
}
function o1(n) {
  return n >= 65 && n <= 90 || n >= 97 && n <= 122 || n >= 48 && n <= 57 || n === 43 || n === 45 || n === 46;
}
function l1(n, e) {
  if (!n.md.options.linkify || n.linkLevel > 0) return !1;
  const t = n.pos, i = n.posMax;
  if (t + 3 > i || n.src.charCodeAt(t) !== 58 || n.src.charCodeAt(t + 1) !== 47 || n.src.charCodeAt(t + 2) !== 47) return !1;
  const r = t - Math.min(10, n.pending.length, t);
  let s = t;
  for (; s > r && o1(n.src.charCodeAt(s - 1)); )
    s--;
  if (s === t || !s1(n.src.charCodeAt(s))) return !1;
  const o = t - s, l = n.md.linkify.matchAtStart(n.src.slice(s));
  if (!l) return !1;
  let u = l.url;
  if (u.length <= o) return !1;
  let a = u.length;
  for (; a > 0 && u.charCodeAt(a - 1) === 42; )
    a--;
  a !== u.length && (u = u.slice(0, a));
  const c = n.md.normalizeLink(u);
  if (!n.md.validateLink(c)) return !1;
  if (!e) {
    n.pending = n.pending.slice(0, -o);
    const h = n.push("link_open", "a", 1);
    h.attrs = [["href", c]], h.markup = "linkify", h.info = "auto";
    const f = n.push("text", "", 0);
    f.content = n.md.normalizeLinkText(u);
    const d = n.push("link_close", "a", -1);
    d.markup = "linkify", d.info = "auto";
  }
  return n.pos += u.length - o, !0;
}
function u1(n, e) {
  let t = n.pos;
  if (n.src.charCodeAt(t) !== 10)
    return !1;
  const i = n.pending.length - 1, r = n.posMax;
  if (!e)
    if (i >= 0 && n.pending.charCodeAt(i) === 32)
      if (i >= 1 && n.pending.charCodeAt(i - 1) === 32) {
        let s = i - 1;
        for (; s >= 1 && n.pending.charCodeAt(s - 1) === 32; ) s--;
        n.pending = n.pending.slice(0, s), n.push("hardbreak", "br", 0);
      } else
        n.pending = n.pending.slice(0, -1), n.push("softbreak", "br", 0);
    else
      n.push("softbreak", "br", 0);
  for (t++; t < r && oe(n.src.charCodeAt(t)); )
    t++;
  return n.pos = t, !0;
}
const ju = [];
for (let n = 0; n < 256; n++)
  ju.push(0);
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(n) {
  ju[n.charCodeAt(0)] = 1;
});
function a1(n, e) {
  let t = n.pos;
  const i = n.posMax;
  if (n.src.charCodeAt(t) !== 92 || (t++, t >= i)) return !1;
  let r = n.src.charCodeAt(t);
  if (r === 10) {
    for (e || n.push("hardbreak", "br", 0), t++; t < i && (r = n.src.charCodeAt(t), !!oe(r)); )
      t++;
    return n.pos = t, !0;
  }
  if (r === 32) {
    if (!e) {
      const l = n.push("text_special", "", 0);
      l.content = "\\", l.markup = "\\", l.info = "escape";
    }
    return n.pos = t, !0;
  }
  let s = n.src[t];
  if (r >= 55296 && r <= 56319 && t + 1 < i) {
    const l = n.src.charCodeAt(t + 1);
    l >= 56320 && l <= 57343 && (s += n.src[t + 1], t++);
  }
  const o = "\\" + s;
  if (!e) {
    const l = n.push("text_special", "", 0);
    r < 256 && ju[r] !== 0 ? l.content = s : l.content = o, l.markup = o, l.info = "escape";
  }
  return n.pos = t + 1, !0;
}
function c1(n, e) {
  let t = n.pos;
  if (n.src.charCodeAt(t) !== 96)
    return !1;
  const r = t;
  t++;
  const s = n.posMax;
  for (; t < s && n.src.charCodeAt(t) === 96; )
    t++;
  const o = n.src.slice(r, t), l = o.length;
  if (n.backticksScanned && (n.backticks[l] || 0) <= r)
    return e || (n.pending += o), n.pos += l, !0;
  let u = t, a;
  for (; (a = n.src.indexOf("`", u)) !== -1; ) {
    for (u = a + 1; u < s && n.src.charCodeAt(u) === 96; )
      u++;
    const c = u - a;
    if (c === l) {
      if (!e) {
        const h = n.push("code_inline", "code", 0);
        h.markup = o, h.content = n.src.slice(t, a).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      return n.pos = u, !0;
    }
    n.backticks[c] = a;
  }
  return n.backticksScanned = !0, e || (n.pending += o), n.pos += l, !0;
}
function h1(n, e) {
  const t = n.pos, i = n.src.charCodeAt(t);
  if (e || i !== 126)
    return !1;
  const r = n.scanDelims(n.pos, !0);
  let s = r.length;
  const o = String.fromCharCode(i);
  if (s < 2)
    return !1;
  let l;
  s % 2 && (l = n.push("text", "", 0), l.content = o, s--);
  for (let u = 0; u < s; u += 2)
    l = n.push("text", "", 0), l.content = o + o, n.delimiters.push({
      marker: i,
      length: 0,
      // disable "rule of 3" length checks meant for emphasis
      token: n.tokens.length - 1,
      end: -1,
      open: r.can_open,
      close: r.can_close
    });
  return n.pos += r.length, !0;
}
function bc(n, e) {
  let t;
  const i = [], r = e.length;
  for (let s = 0; s < r; s++) {
    const o = e[s];
    if (o.marker !== 126 || o.end === -1)
      continue;
    const l = e[o.end];
    t = n.tokens[o.token], t.type = "s_open", t.tag = "s", t.nesting = 1, t.markup = "~~", t.content = "", t = n.tokens[l.token], t.type = "s_close", t.tag = "s", t.nesting = -1, t.markup = "~~", t.content = "", n.tokens[l.token - 1].type === "text" && n.tokens[l.token - 1].content === "~" && i.push(l.token - 1);
  }
  for (; i.length; ) {
    const s = i.pop();
    let o = s + 1;
    for (; o < n.tokens.length && n.tokens[o].type === "s_close"; )
      o++;
    o--, s !== o && (t = n.tokens[o], n.tokens[o] = n.tokens[s], n.tokens[s] = t);
  }
}
function f1(n) {
  const e = n.tokens_meta, t = n.tokens_meta.length;
  bc(n, n.delimiters);
  for (let i = 0; i < t; i++)
    e[i] && e[i].delimiters && bc(n, e[i].delimiters);
}
const td = {
  tokenize: h1,
  postProcess: f1
};
function d1(n, e) {
  const t = n.pos, i = n.src.charCodeAt(t);
  if (e || i !== 95 && i !== 42)
    return !1;
  const r = n.scanDelims(n.pos, i === 42);
  for (let s = 0; s < r.length; s++) {
    const o = n.push("text", "", 0);
    o.content = String.fromCharCode(i), n.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker: i,
      // Total length of these series of delimiters.
      //
      length: r.length,
      // A position of the token this delimiter corresponds to.
      //
      token: n.tokens.length - 1,
      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end: -1,
      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open: r.can_open,
      close: r.can_close
    });
  }
  return n.pos += r.length, !0;
}
function xc(n, e) {
  const t = e.length;
  for (let i = t - 1; i >= 0; i--) {
    const r = e[i];
    if (r.marker !== 95 && r.marker !== 42 || r.end === -1)
      continue;
    const s = e[r.end], o = i > 0 && e[i - 1].end === r.end + 1 && // check that first two markers match and adjacent
    e[i - 1].marker === r.marker && e[i - 1].token === r.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
    e[r.end + 1].token === s.token + 1, l = String.fromCharCode(r.marker), u = n.tokens[r.token];
    u.type = o ? "strong_open" : "em_open", u.tag = o ? "strong" : "em", u.nesting = 1, u.markup = o ? l + l : l, u.content = "";
    const a = n.tokens[s.token];
    a.type = o ? "strong_close" : "em_close", a.tag = o ? "strong" : "em", a.nesting = -1, a.markup = o ? l + l : l, a.content = "", o && (n.tokens[e[i - 1].token].content = "", n.tokens[e[r.end + 1].token].content = "", i--);
  }
}
function O1(n) {
  const e = n.tokens_meta, t = n.tokens_meta.length;
  xc(n, n.delimiters);
  for (let i = 0; i < t; i++)
    e[i] && e[i].delimiters && xc(n, e[i].delimiters);
}
const nd = {
  tokenize: d1,
  postProcess: O1
};
function p1(n, e) {
  let t, i, r, s, o = "", l = "", u = n.pos, a = !0;
  if (n.src.charCodeAt(n.pos) !== 91)
    return !1;
  const c = n.pos, h = n.posMax, f = n.pos + 1, d = n.md.helpers.parseLinkLabel(n, n.pos, !0);
  if (d < 0)
    return !1;
  let O = d + 1;
  if (O < h && n.src.charCodeAt(O) === 40) {
    for (a = !1, O++; O < h && (t = n.src.charCodeAt(O), !(!oe(t) && t !== 10)); O++)
      ;
    if (O >= h)
      return !1;
    if (u = O, r = n.md.helpers.parseLinkDestination(n.src, O, n.posMax), r.ok) {
      for (o = n.md.normalizeLink(r.str), n.md.validateLink(o) ? O = r.pos : o = "", u = O; O < h && (t = n.src.charCodeAt(O), !(!oe(t) && t !== 10)); O++)
        ;
      if (r = n.md.helpers.parseLinkTitle(n.src, O, n.posMax), O < h && u !== O && r.ok)
        for (l = r.str, O = r.pos; O < h && (t = n.src.charCodeAt(O), !(!oe(t) && t !== 10)); O++)
          ;
    }
    (O >= h || n.src.charCodeAt(O) !== 41) && (a = !0), O++;
  }
  if (a) {
    if (typeof n.env.references > "u")
      return !1;
    if (O < h && n.src.charCodeAt(O) === 91 ? (u = O + 1, O = n.md.helpers.parseLinkLabel(n, O), O >= 0 ? i = n.src.slice(u, O++) : O = d + 1) : O = d + 1, i || (i = n.src.slice(f, d)), s = n.env.references[Gs(i)], !s)
      return n.pos = c, !1;
    o = s.href, l = s.title;
  }
  if (!e) {
    n.pos = f, n.posMax = d;
    const m = n.push("link_open", "a", 1), g = [["href", o]];
    m.attrs = g, l && g.push(["title", l]), n.linkLevel++, n.md.inline.tokenize(n), n.linkLevel--, n.push("link_close", "a", -1);
  }
  return n.pos = O, n.posMax = h, !0;
}
function m1(n, e) {
  let t, i, r, s, o, l, u, a, c = "";
  const h = n.pos, f = n.posMax;
  if (n.src.charCodeAt(n.pos) !== 33 || n.src.charCodeAt(n.pos + 1) !== 91)
    return !1;
  const d = n.pos + 2, O = n.md.helpers.parseLinkLabel(n, n.pos + 1, !1);
  if (O < 0)
    return !1;
  if (s = O + 1, s < f && n.src.charCodeAt(s) === 40) {
    for (s++; s < f && (t = n.src.charCodeAt(s), !(!oe(t) && t !== 10)); s++)
      ;
    if (s >= f)
      return !1;
    for (a = s, l = n.md.helpers.parseLinkDestination(n.src, s, n.posMax), l.ok && (c = n.md.normalizeLink(l.str), n.md.validateLink(c) ? s = l.pos : c = ""), a = s; s < f && (t = n.src.charCodeAt(s), !(!oe(t) && t !== 10)); s++)
      ;
    if (l = n.md.helpers.parseLinkTitle(n.src, s, n.posMax), s < f && a !== s && l.ok)
      for (u = l.str, s = l.pos; s < f && (t = n.src.charCodeAt(s), !(!oe(t) && t !== 10)); s++)
        ;
    else
      u = "";
    if (s >= f || n.src.charCodeAt(s) !== 41)
      return n.pos = h, !1;
    s++;
  } else {
    if (typeof n.env.references > "u")
      return !1;
    if (s < f && n.src.charCodeAt(s) === 91 ? (a = s + 1, s = n.md.helpers.parseLinkLabel(n, s), s >= 0 ? r = n.src.slice(a, s++) : s = O + 1) : s = O + 1, r || (r = n.src.slice(d, O)), o = n.env.references[Gs(r)], !o)
      return n.pos = h, !1;
    c = o.href, u = o.title;
  }
  if (!e) {
    i = n.src.slice(d, O);
    const m = [];
    n.md.inline.parse(
      i,
      n.md,
      n.env,
      m
    );
    const g = n.push("image", "img", 0), b = [["src", c], ["alt", ""]];
    g.attrs = b, g.children = m, g.content = i, u && b.push(["title", u]);
  }
  return n.pos = s, n.posMax = f, !0;
}
const g1 = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/, b1 = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function x1(n, e) {
  let t = n.pos;
  if (n.src.charCodeAt(t) !== 60)
    return !1;
  const i = n.pos, r = n.posMax;
  for (; ; ) {
    if (++t >= r) return !1;
    const o = n.src.charCodeAt(t);
    if (o === 60) return !1;
    if (o === 62) break;
  }
  const s = n.src.slice(i + 1, t);
  if (b1.test(s)) {
    const o = n.md.normalizeLink(s);
    if (!n.md.validateLink(o))
      return !1;
    if (!e) {
      const l = n.push("link_open", "a", 1);
      l.attrs = [["href", o]], l.markup = "autolink", l.info = "auto";
      const u = n.push("text", "", 0);
      u.content = n.md.normalizeLinkText(s);
      const a = n.push("link_close", "a", -1);
      a.markup = "autolink", a.info = "auto";
    }
    return n.pos += s.length + 2, !0;
  }
  if (g1.test(s)) {
    const o = n.md.normalizeLink("mailto:" + s);
    if (!n.md.validateLink(o))
      return !1;
    if (!e) {
      const l = n.push("link_open", "a", 1);
      l.attrs = [["href", o]], l.markup = "autolink", l.info = "auto";
      const u = n.push("text", "", 0);
      u.content = n.md.normalizeLinkText(s);
      const a = n.push("link_close", "a", -1);
      a.markup = "autolink", a.info = "auto";
    }
    return n.pos += s.length + 2, !0;
  }
  return !1;
}
function k1(n) {
  return /^<a[>\s]/i.test(n);
}
function S1(n) {
  return /^<\/a\s*>/i.test(n);
}
function id(n) {
  const e = n | 32;
  return e >= 97 && e <= 122;
}
function y1(n, e) {
  const t = n.src;
  let i, r;
  if (t.startsWith("<!--", e)) {
    if (t.startsWith(">", e + 4))
      return e + 5;
    if (t.startsWith("->", e + 4))
      return e + 6;
    i = e + 4, r = "-->";
  } else if (t.startsWith("<![CDATA[", e))
    i = e + 9, r = "]]>";
  else if (t.charCodeAt(e + 1) === 63)
    i = e + 2, r = "?>";
  else if (id(t.charCodeAt(e + 2)))
    i = e + 3, r = ">";
  else
    return -1;
  if (n.skipHtmlSpecial)
    return -1;
  const s = t.indexOf(r, i);
  return s < 0 ? (n.skipHtmlSpecial = !0, -1) : s + r.length;
}
function Q1(n, e) {
  if (!n.md.options.html)
    return !1;
  const t = n.posMax, i = n.pos;
  if (n.src.charCodeAt(i) !== 60 || i + 2 >= t)
    return !1;
  let r;
  const s = n.src.charCodeAt(i + 1);
  if (s === 33 || s === 63)
    r = y1(n, i);
  else if (s === 47 || id(s)) {
    const o = n.src.slice(i).match(ed);
    r = o ? i + o[0].length : -1;
  } else
    return !1;
  if (r < 0)
    return !1;
  if (!e) {
    const o = n.push("html_inline", "", 0);
    o.content = n.src.slice(i, r), k1(o.content) && n.linkLevel++, S1(o.content) && n.linkLevel--;
  }
  return n.pos = r, !0;
}
const w1 = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i, $1 = /^&([a-z][a-z0-9]{1,31});/i;
function P1(n, e) {
  const t = n.pos, i = n.posMax;
  if (n.src.charCodeAt(t) !== 38 || t + 1 >= i) return !1;
  if (n.src.charCodeAt(t + 1) === 35) {
    const s = n.src.slice(t).match(w1);
    if (s) {
      if (!e) {
        const o = s[1][0].toLowerCase() === "x" ? parseInt(s[1].slice(1), 16) : parseInt(s[1], 10), l = n.push("text_special", "", 0);
        l.content = Mu(o) ? tr(o) : tr(65533), l.markup = s[0], l.info = "entity";
      }
      return n.pos += s[0].length, !0;
    }
  } else {
    const s = n.src.slice(t).match($1);
    if (s) {
      const o = Ym(s[0]);
      if (o !== s[0]) {
        if (!e) {
          const l = n.push("text_special", "", 0);
          l.content = o, l.markup = s[0], l.info = "entity";
        }
        return n.pos += s[0].length, !0;
      }
    }
  }
  return !1;
}
function kc(n) {
  const e = {}, t = n.length;
  if (!t) return;
  let i = 0, r = -2;
  const s = [];
  for (let o = 0; o < t; o++) {
    const l = n[o];
    if (s.push(0), (n[i].marker !== l.marker || r !== l.token - 1) && (i = o), r = l.token, l.length = l.length || 0, !l.close) continue;
    e.hasOwnProperty(l.marker) || (e[l.marker] = [-1, -1, -1, -1, -1, -1]);
    const u = e[l.marker][(l.open ? 3 : 0) + l.length % 3];
    let a = i - s[i] - 1, c = a;
    for (; a > u; a -= s[a] + 1) {
      const h = n[a];
      if (h.marker === l.marker && h.open && h.end < 0) {
        let f = !1;
        if ((h.close || l.open) && (h.length + l.length) % 3 === 0 && (h.length % 3 !== 0 || l.length % 3 !== 0) && (f = !0), !f) {
          const d = a > 0 && !n[a - 1].open ? s[a - 1] + 1 : 0;
          s[o] = o - a + d, s[a] = d, l.open = !1, h.end = o, h.close = !1, c = -1, r = -2;
          break;
        }
      }
    }
    c !== -1 && (e[l.marker][(l.open ? 3 : 0) + (l.length || 0) % 3] = c);
  }
}
function v1(n) {
  const e = n.tokens_meta, t = n.tokens_meta.length;
  kc(n.delimiters);
  for (let i = 0; i < t; i++)
    e[i] && e[i].delimiters && kc(e[i].delimiters);
}
function _1(n) {
  let e, t, i = 0;
  const r = n.tokens, s = n.tokens.length;
  for (e = t = 0; e < s; e++)
    r[e].nesting < 0 && i--, r[e].level = i, r[e].nesting > 0 && i++, r[e].type === "text" && e + 1 < s && r[e + 1].type === "text" ? r[e + 1].content = r[e].content + r[e + 1].content : (e !== t && (r[t] = r[e]), t++);
  e !== t && (r.length = t);
}
const Io = [
  ["text", r1],
  ["linkify", l1],
  ["newline", u1],
  ["escape", a1],
  ["backticks", c1],
  ["strikethrough", td.tokenize],
  ["emphasis", nd.tokenize],
  ["link", p1],
  ["image", m1],
  ["autolink", x1],
  ["html_inline", Q1],
  ["entity", P1]
], Bo = [
  ["balance_pairs", v1],
  ["strikethrough", td.postProcess],
  ["emphasis", nd.postProcess],
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  ["fragments_join", _1]
];
function Qr() {
  this.ruler = new Ye();
  for (let n = 0; n < Io.length; n++)
    this.ruler.push(Io[n][0], Io[n][1]);
  this.ruler2 = new Ye();
  for (let n = 0; n < Bo.length; n++)
    this.ruler2.push(Bo[n][0], Bo[n][1]);
}
Qr.prototype.skipToken = function(n) {
  const e = n.pos, t = this.ruler.getRules(""), i = t.length, r = n.md.options.maxNesting, s = n.cache;
  if (typeof s[e] < "u") {
    n.pos = s[e];
    return;
  }
  let o = !1;
  if (n.level < r) {
    for (let l = 0; l < i; l++)
      if (n.level++, o = t[l](n, !0), n.level--, o) {
        if (e >= n.pos)
          throw new Error("inline rule didn't increment state.pos");
        break;
      }
  } else
    n.pos = n.posMax;
  o || n.pos++, s[e] = n.pos;
};
Qr.prototype.tokenize = function(n) {
  const e = this.ruler.getRules(""), t = e.length, i = n.posMax, r = n.md.options.maxNesting;
  for (; n.pos < i; ) {
    const s = n.pos;
    let o = !1;
    if (n.level < r) {
      for (let l = 0; l < t; l++)
        if (o = e[l](n, !1), o) {
          if (s >= n.pos)
            throw new Error("inline rule didn't increment state.pos");
          break;
        }
    }
    if (o) {
      if (n.pos >= i)
        break;
      continue;
    }
    n.pending += n.src[n.pos++];
  }
  n.pending && n.pushPending();
};
Qr.prototype.parse = function(n, e, t, i) {
  const r = new this.State(n, e, t, i);
  this.tokenize(r);
  const s = this.ruler2.getRules(""), o = s.length;
  for (let l = 0; l < o; l++)
    s[l](r);
};
Qr.prototype.State = yr;
function A1(n) {
  const e = {};
  n = n || {}, e.src_Any = Ff.source, e.src_Cc = Yf.source, e.src_Z = Nf.source, e.src_P = Du.source, e.src_ZPCc = [e.src_Z, e.src_P, e.src_Cc].join("|"), e.src_ZCc = [e.src_Z, e.src_Cc].join("|");
  const t = "[><｜]";
  return e.src_pseudo_letter = `(?:(?!${t}|${e.src_ZPCc})${e.src_Any})`, e.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)", e.src_auth = `(?:(?:(?!${e.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`, e.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?", e.src_host_terminator = `(?=$|${t}|${e.src_ZPCc})(?!${n["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${e.src_ZPCc}))`, e.src_path = `(?:[/?#](?:(?!${e.src_ZCc}|${t}|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!${e.src_ZCc}|\\]).)*\\]|\\((?:(?!${e.src_ZCc}|[)]).)*\\)|\\{(?:(?!${e.src_ZCc}|[}]).)*\\}|\\"(?:(?!${e.src_ZCc}|["]).)+\\"|\\'(?:(?!${e.src_ZCc}|[']).)+\\'|\\'(?=${e.src_pseudo_letter}|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!${e.src_ZCc}|[.]|$)|` + (n["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + // allow `,,,` in paths
  `,(?!${e.src_ZCc}|$)|;(?!${e.src_ZCc}|$)|\\!+(?!${e.src_ZCc}|[!]|$)|\\?(?!${e.src_ZCc}|[?]|$))+|\\/)?`, e.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]{0,63}', e.src_xn = "xn--[a-z0-9\\-]{1,59}", e.src_domain_root = // Allow letters & digits (http://test1)
  "(?:" + e.src_xn + `|${e.src_pseudo_letter}{1,63})`, e.src_domain = "(?:" + e.src_xn + `|(?:${e.src_pseudo_letter})|(?:${e.src_pseudo_letter}(?:-|${e.src_pseudo_letter}){0,61}${e.src_pseudo_letter}))`, e.src_host = `(?:(?:(?:(?:${e.src_domain})\\.)*${e.src_domain}))`, e.tpl_host_fuzzy = "(?:" + e.src_ip4 + `|(?:(?:(?:${e.src_domain})\\.)+(?:%TLDS%)))`, e.tpl_host_no_ip_fuzzy = `(?:(?:(?:${e.src_domain})\\.)+(?:%TLDS%))`, e.src_host_strict = e.src_host + e.src_host_terminator, e.tpl_host_fuzzy_strict = e.tpl_host_fuzzy + e.src_host_terminator, e.src_host_port_strict = e.src_host + e.src_port + e.src_host_terminator, e.tpl_host_port_fuzzy_strict = e.tpl_host_fuzzy + e.src_port + e.src_host_terminator, e.tpl_host_port_no_ip_fuzzy_strict = e.tpl_host_no_ip_fuzzy + e.src_port + e.src_host_terminator, e.tpl_host_fuzzy_test = `localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:${e.src_ZPCc}|>|$))`, e.tpl_email_fuzzy = `(^|${t}|"|\\(|${e.src_ZCc})(${e.src_email_name}@${e.tpl_host_fuzzy_strict})`, e.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|｜]|${e.src_ZPCc}))((?![$+<=>^\`|｜])${e.tpl_host_port_fuzzy_strict}${e.src_path})`, e.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|｜]|${e.src_ZPCc}))((?![$+<=>^\`|｜])${e.tpl_host_port_no_ip_fuzzy_strict}${e.src_path})`, e;
}
function El(n) {
  return Array.prototype.slice.call(arguments, 1).forEach(function(t) {
    t && Object.keys(t).forEach(function(i) {
      n[i] = t[i];
    });
  }), n;
}
function Js(n) {
  return Object.prototype.toString.call(n);
}
function C1(n) {
  return Js(n) === "[object String]";
}
function T1(n) {
  return Js(n) === "[object Object]";
}
function E1(n) {
  return Js(n) === "[object RegExp]";
}
function Sc(n) {
  return Js(n) === "[object Function]";
}
function X1(n) {
  return n.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
const rd = {
  fuzzyLink: !0,
  fuzzyEmail: !0,
  fuzzyIP: !1
};
function Z1(n) {
  return Object.keys(n || {}).reduce(function(e, t) {
    return e || rd.hasOwnProperty(t);
  }, !1);
}
const D1 = {
  "http:": {
    validate: function(n, e, t) {
      const i = n.slice(e);
      return t.re.http || (t.re.http = new RegExp(
        `^\\/\\/${t.re.src_auth}${t.re.src_host_port_strict}${t.re.src_path}`,
        "i"
      )), t.re.http.test(i) ? i.match(t.re.http)[0].length : 0;
    }
  },
  "https:": "http:",
  "ftp:": "http:",
  "//": {
    validate: function(n, e, t) {
      const i = n.slice(e);
      return t.re.no_http || (t.re.no_http = new RegExp(
        "^" + t.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
        // with code comments
        `(?:localhost|(?:(?:${t.re.src_domain})\\.)+${t.re.src_domain_root})` + t.re.src_port + t.re.src_host_terminator + t.re.src_path,
        "i"
      )), t.re.no_http.test(i) ? e >= 3 && n[e - 3] === ":" || e >= 3 && n[e - 3] === "/" ? 0 : i.match(t.re.no_http)[0].length : 0;
    }
  },
  "mailto:": {
    validate: function(n, e, t) {
      const i = n.slice(e);
      return t.re.mailto || (t.re.mailto = new RegExp(
        `^${t.re.src_email_name}@${t.re.src_host_strict}`,
        "i"
      )), t.re.mailto.test(i) ? i.match(t.re.mailto)[0].length : 0;
    }
  }
}, R1 = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]", M1 = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
function L1(n) {
  return function(e, t) {
    const i = e.slice(t);
    return n.test(i) ? i.match(n)[0].length : 0;
  };
}
function yc() {
  return function(n, e) {
    e.normalize(n);
  };
}
function Qs(n) {
  const e = n.re = A1(n.__opts__), t = n.__tlds__.slice();
  n.onCompile(), n.__tlds_replaced__ || t.push(R1), t.push(e.src_xn), e.src_tlds = t.join("|");
  function i(l) {
    return l.replace("%TLDS%", e.src_tlds);
  }
  e.email_fuzzy = RegExp(i(e.tpl_email_fuzzy), "i"), e.email_fuzzy_global = RegExp(i(e.tpl_email_fuzzy), "ig"), e.link_fuzzy = RegExp(i(e.tpl_link_fuzzy), "i"), e.link_fuzzy_global = RegExp(i(e.tpl_link_fuzzy), "ig"), e.link_no_ip_fuzzy = RegExp(i(e.tpl_link_no_ip_fuzzy), "i"), e.link_no_ip_fuzzy_global = RegExp(i(e.tpl_link_no_ip_fuzzy), "ig"), e.host_fuzzy_test = RegExp(i(e.tpl_host_fuzzy_test), "i");
  const r = [];
  n.__compiled__ = {};
  function s(l, u) {
    throw new Error(`(LinkifyIt) Invalid schema "${l}": ${u}`);
  }
  Object.keys(n.__schemas__).forEach(function(l) {
    const u = n.__schemas__[l];
    if (u === null)
      return;
    const a = { validate: null, link: null };
    if (n.__compiled__[l] = a, T1(u)) {
      E1(u.validate) ? a.validate = L1(u.validate) : Sc(u.validate) ? a.validate = u.validate : s(l, u), Sc(u.normalize) ? a.normalize = u.normalize : u.normalize ? s(l, u) : a.normalize = yc();
      return;
    }
    if (C1(u)) {
      r.push(l);
      return;
    }
    s(l, u);
  }), r.forEach(function(l) {
    n.__compiled__[n.__schemas__[l]] && (n.__compiled__[l].validate = n.__compiled__[n.__schemas__[l]].validate, n.__compiled__[l].normalize = n.__compiled__[n.__schemas__[l]].normalize);
  }), n.__compiled__[""] = { validate: null, normalize: yc() };
  const o = Object.keys(n.__compiled__).filter(function(l) {
    return l.length > 0 && n.__compiled__[l];
  }).map(X1).join("|");
  n.re.schema_test = RegExp(`(^|(?!_)(?:[><｜]|${e.src_ZPCc}))(${o})`, "i"), n.re.schema_search = RegExp(`(^|(?!_)(?:[><｜]|${e.src_ZPCc}))(${o})`, "ig"), n.re.schema_at_start = RegExp(`^${n.re.schema_search.source}`, "i"), n.re.pretest = RegExp(
    `(${n.re.schema_test.source})|(${n.re.host_fuzzy_test.source})|@`,
    "i"
  );
}
function sd(n, e, t, i) {
  const r = n.slice(t, i);
  this.schema = e.toLowerCase(), this.index = t, this.lastIndex = i, this.raw = r, this.text = r, this.url = r;
}
function et(n, e) {
  if (!(this instanceof et))
    return new et(n, e);
  e || Z1(n) && (e = n, n = {}), this.__opts__ = El({}, rd, e), this.__schemas__ = El({}, D1, n), this.__compiled__ = {}, this.__tlds__ = M1, this.__tlds_replaced__ = !1, this.re = {}, Qs(this);
}
et.prototype.add = function(e, t) {
  return this.__schemas__[e] = t, Qs(this), this;
};
et.prototype.set = function(e) {
  return this.__opts__ = El(this.__opts__, e), this;
};
et.prototype.test = function(e) {
  if (!e.length)
    return !1;
  let t, i;
  if (this.re.schema_test.test(e)) {
    for (i = this.re.schema_search, i.lastIndex = 0; (t = i.exec(e)) !== null; )
      if (this.testSchemaAt(e, t[2], i.lastIndex))
        return !0;
  }
  return !!(this.__opts__.fuzzyLink && this.__compiled__["http:"] && e.search(this.re.host_fuzzy_test) >= 0 && e.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy) !== null || this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && e.indexOf("@") >= 0 && e.match(this.re.email_fuzzy) !== null);
};
et.prototype.pretest = function(e) {
  return this.re.pretest.test(e);
};
et.prototype.testSchemaAt = function(e, t, i) {
  return this.__compiled__[t.toLowerCase()] ? this.__compiled__[t.toLowerCase()].validate(e, i, this) : 0;
};
et.prototype.match = function(e) {
  const t = [], i = [], r = [], s = [];
  let o, l, u;
  function a(f, d) {
    return f ? d ? f.index !== d.index ? f.index < d.index ? f : d : f.lastIndex >= d.lastIndex ? f : d : f : d;
  }
  if (!e.length)
    return null;
  if (this.re.schema_test.test(e))
    for (u = this.re.schema_search, u.lastIndex = 0; (o = u.exec(e)) !== null; )
      l = this.testSchemaAt(e, o[2], u.lastIndex), l && i.push({
        schema: o[2],
        index: o.index + o[1].length,
        lastIndex: o.index + o[0].length + l
      });
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"])
    for (u = this.__opts__.fuzzyIP ? this.re.link_fuzzy_global : this.re.link_no_ip_fuzzy_global, u.lastIndex = 0; (o = u.exec(e)) !== null; )
      r.push({
        schema: "",
        index: o.index + o[1].length,
        lastIndex: o.index + o[0].length
      });
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"])
    for (u = this.re.email_fuzzy_global, u.lastIndex = 0; (o = u.exec(e)) !== null; )
      s.push({
        schema: "mailto:",
        index: o.index + o[1].length,
        lastIndex: o.index + o[0].length
      });
  const c = [0, 0, 0];
  let h = 0;
  for (; ; ) {
    const f = [
      i[c[0]],
      s[c[1]],
      r[c[2]]
    ], d = a(a(f[0], f[1]), f[2]);
    if (!d)
      break;
    if (d === f[0] ? c[0]++ : d === f[1] ? c[1]++ : c[2]++, d.index < h)
      continue;
    const O = new sd(e, d.schema, d.index, d.lastIndex);
    this.__compiled__[O.schema].normalize(O, this), t.push(O), h = d.lastIndex;
  }
  return t.length ? t : null;
};
et.prototype.matchAtStart = function(e) {
  if (!e.length) return null;
  const t = this.re.schema_at_start.exec(e);
  if (!t) return null;
  const i = this.testSchemaAt(e, t[2], t[0].length);
  if (!i) return null;
  const r = new sd(e, t[2], t.index + t[1].length, t.index + t[0].length + i);
  return this.__compiled__[r.schema].normalize(r, this), r;
};
et.prototype.tlds = function(e, t) {
  return e = Array.isArray(e) ? e : [e], t ? (this.__tlds__ = this.__tlds__.concat(e).sort().filter(function(i, r, s) {
    return i !== s[r - 1];
  }).reverse(), Qs(this), this) : (this.__tlds__ = e.slice(), this.__tlds_replaced__ = !0, Qs(this), this);
};
et.prototype.normalize = function(e) {
  e.schema || (e.url = `http://${e.url}`), e.schema === "mailto:" && !/^mailto:/i.test(e.url) && (e.url = `mailto:${e.url}`);
};
et.prototype.onCompile = function() {
};
const Kn = 2147483647, At = 36, zu = 1, sr = 26, j1 = 38, z1 = 700, od = 72, ld = 128, ud = "-", I1 = /^xn--/, B1 = /[^\0-\x7F]/, q1 = /[\x2E\u3002\uFF0E\uFF61]/g, F1 = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
}, qo = At - zu, Ct = Math.floor, Fo = String.fromCharCode;
function an(n) {
  throw new RangeError(F1[n]);
}
function Y1(n, e) {
  const t = [];
  let i = n.length;
  for (; i--; )
    t[i] = e(n[i]);
  return t;
}
function ad(n, e) {
  const t = n.split("@");
  let i = "";
  t.length > 1 && (i = t[0] + "@", n = t[1]), n = n.replace(q1, ".");
  const r = n.split("."), s = Y1(r, e).join(".");
  return i + s;
}
function cd(n) {
  const e = [];
  let t = 0;
  const i = n.length;
  for (; t < i; ) {
    const r = n.charCodeAt(t++);
    if (r >= 55296 && r <= 56319 && t < i) {
      const s = n.charCodeAt(t++);
      (s & 64512) == 56320 ? e.push(((r & 1023) << 10) + (s & 1023) + 65536) : (e.push(r), t--);
    } else
      e.push(r);
  }
  return e;
}
const W1 = (n) => String.fromCodePoint(...n), N1 = function(n) {
  return n >= 48 && n < 58 ? 26 + (n - 48) : n >= 65 && n < 91 ? n - 65 : n >= 97 && n < 123 ? n - 97 : At;
}, Qc = function(n, e) {
  return n + 22 + 75 * (n < 26) - ((e != 0) << 5);
}, hd = function(n, e, t) {
  let i = 0;
  for (n = t ? Ct(n / z1) : n >> 1, n += Ct(n / e); n > qo * sr >> 1; i += At)
    n = Ct(n / qo);
  return Ct(i + (qo + 1) * n / (n + j1));
}, fd = function(n) {
  const e = [], t = n.length;
  let i = 0, r = ld, s = od, o = n.lastIndexOf(ud);
  o < 0 && (o = 0);
  for (let l = 0; l < o; ++l)
    n.charCodeAt(l) >= 128 && an("not-basic"), e.push(n.charCodeAt(l));
  for (let l = o > 0 ? o + 1 : 0; l < t; ) {
    const u = i;
    for (let c = 1, h = At; ; h += At) {
      l >= t && an("invalid-input");
      const f = N1(n.charCodeAt(l++));
      f >= At && an("invalid-input"), f > Ct((Kn - i) / c) && an("overflow"), i += f * c;
      const d = h <= s ? zu : h >= s + sr ? sr : h - s;
      if (f < d)
        break;
      const O = At - d;
      c > Ct(Kn / O) && an("overflow"), c *= O;
    }
    const a = e.length + 1;
    s = hd(i - u, a, u == 0), Ct(i / a) > Kn - r && an("overflow"), r += Ct(i / a), i %= a, e.splice(i++, 0, r);
  }
  return String.fromCodePoint(...e);
}, dd = function(n) {
  const e = [];
  n = cd(n);
  const t = n.length;
  let i = ld, r = 0, s = od;
  for (const u of n)
    u < 128 && e.push(Fo(u));
  const o = e.length;
  let l = o;
  for (o && e.push(ud); l < t; ) {
    let u = Kn;
    for (const c of n)
      c >= i && c < u && (u = c);
    const a = l + 1;
    u - i > Ct((Kn - r) / a) && an("overflow"), r += (u - i) * a, i = u;
    for (const c of n)
      if (c < i && ++r > Kn && an("overflow"), c === i) {
        let h = r;
        for (let f = At; ; f += At) {
          const d = f <= s ? zu : f >= s + sr ? sr : f - s;
          if (h < d)
            break;
          const O = h - d, m = At - d;
          e.push(
            Fo(Qc(d + O % m, 0))
          ), h = Ct(O / m);
        }
        e.push(Fo(Qc(h, 0))), s = hd(r, a, l === o), r = 0, ++l;
      }
    ++r, ++i;
  }
  return e.join("");
}, V1 = function(n) {
  return ad(n, function(e) {
    return I1.test(e) ? fd(e.slice(4).toLowerCase()) : e;
  });
}, U1 = function(n) {
  return ad(n, function(e) {
    return B1.test(e) ? "xn--" + dd(e) : e;
  });
}, Od = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  version: "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  ucs2: {
    decode: cd,
    encode: W1
  },
  decode: fd,
  encode: dd,
  toASCII: U1,
  toUnicode: V1
}, G1 = {
  options: {
    // Enable HTML tags in source
    html: !1,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !1,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 100
  },
  components: {
    core: {},
    block: {},
    inline: {}
  }
}, H1 = {
  options: {
    // Enable HTML tags in source
    html: !1,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !1,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "text"
      ],
      rules2: [
        "balance_pairs",
        "fragments_join"
      ]
    }
  }
}, K1 = {
  options: {
    // Enable HTML tags in source
    html: !0,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !0,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "html_inline",
        "image",
        "link",
        "newline",
        "text"
      ],
      rules2: [
        "balance_pairs",
        "emphasis",
        "fragments_join"
      ]
    }
  }
}, J1 = {
  default: G1,
  zero: H1,
  commonmark: K1
}, eb = /^(vbscript|javascript|file|data):/, tb = /^data:image\/(gif|png|jpeg|webp);/;
function nb(n) {
  const e = n.trim().toLowerCase();
  return eb.test(e) ? tb.test(e) : !0;
}
const pd = ["http:", "https:", "mailto:"];
function ib(n) {
  const e = Zu(n, !0);
  if (e.hostname && (!e.protocol || pd.indexOf(e.protocol) >= 0))
    try {
      e.hostname = Od.toASCII(e.hostname);
    } catch {
    }
  return Sr(Xu(e));
}
function rb(n) {
  const e = Zu(n, !0);
  if (e.hostname && (!e.protocol || pd.indexOf(e.protocol) >= 0))
    try {
      e.hostname = Od.toUnicode(e.hostname);
    } catch {
    }
  return oi(Xu(e), oi.defaultChars + "%");
}
function ct(n, e) {
  if (!(this instanceof ct))
    return new ct(n, e);
  e || Ru(n) || (e = n || {}, n = "default"), this.inline = new Qr(), this.block = new Ks(), this.core = new Lu(), this.renderer = new yi(), this.linkify = new et(), this.validateLink = nb, this.normalizeLink = ib, this.normalizeLinkText = rb, this.utils = ug, this.helpers = Us({}, fg), this.options = {}, this.configure(n), e && this.set(e);
}
ct.prototype.set = function(n) {
  return Us(this.options, n), this;
};
ct.prototype.configure = function(n) {
  const e = this;
  if (Ru(n)) {
    const t = n;
    if (n = J1[t], !n)
      throw new Error('Wrong `markdown-it` preset "' + t + '", check name');
  }
  if (!n)
    throw new Error("Wrong `markdown-it` preset, can't be empty");
  return n.options && e.set(n.options), n.components && Object.keys(n.components).forEach(function(t) {
    n.components[t].rules && e[t].ruler.enableOnly(n.components[t].rules), n.components[t].rules2 && e[t].ruler2.enableOnly(n.components[t].rules2);
  }), this;
};
ct.prototype.enable = function(n, e) {
  let t = [];
  Array.isArray(n) || (n = [n]), ["core", "block", "inline"].forEach(function(r) {
    t = t.concat(this[r].ruler.enable(n, !0));
  }, this), t = t.concat(this.inline.ruler2.enable(n, !0));
  const i = n.filter(function(r) {
    return t.indexOf(r) < 0;
  });
  if (i.length && !e)
    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + i);
  return this;
};
ct.prototype.disable = function(n, e) {
  let t = [];
  Array.isArray(n) || (n = [n]), ["core", "block", "inline"].forEach(function(r) {
    t = t.concat(this[r].ruler.disable(n, !0));
  }, this), t = t.concat(this.inline.ruler2.disable(n, !0));
  const i = n.filter(function(r) {
    return t.indexOf(r) < 0;
  });
  if (i.length && !e)
    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + i);
  return this;
};
ct.prototype.use = function(n) {
  const e = [this].concat(Array.prototype.slice.call(arguments, 1));
  return n.apply(n, e), this;
};
ct.prototype.parse = function(n, e) {
  if (typeof n != "string")
    throw new Error("Input data should be a String");
  const t = new this.core.State(n, this, e);
  return this.core.process(t), t.tokens;
};
ct.prototype.render = function(n, e) {
  return e = e || {}, this.renderer.render(this.parse(n, e), this.options, e);
};
ct.prototype.parseInline = function(n, e) {
  const t = new this.core.State(n, this, e);
  return t.inlineMode = !0, this.core.process(t), t.tokens;
};
ct.prototype.renderInline = function(n, e) {
  return e = e || {}, this.renderer.render(this.parseInline(n, e), this.options, e);
};
function md(n, e = "link") {
  const t = n.trim();
  if (!t || /[\u0000-\u0020\u007f\\]/u.test(t) || t.startsWith("//")) return !1;
  try {
    const i = new URL(t, "https://markdown-editor.invalid/");
    return i.protocol === "https:" || i.protocol === "http:" || e === "link" && i.protocol === "mailto:";
  } catch {
    return !1;
  }
}
function wc(n, e) {
  (e == null || e > n.length) && (e = n.length);
  for (var t = 0, i = Array(e); t < e; t++) i[t] = n[t];
  return i;
}
function sb(n) {
  if (Array.isArray(n)) return n;
}
function ob(n, e) {
  var t = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
  if (t != null) {
    var i, r, s, o, l = [], u = !0, a = !1;
    try {
      if (s = (t = t.call(n)).next, e !== 0) for (; !(u = (i = s.call(t)).done) && (l.push(i.value), l.length !== e); u = !0) ;
    } catch (c) {
      a = !0, r = c;
    } finally {
      try {
        if (!u && t.return != null && (o = t.return(), Object(o) !== o)) return;
      } finally {
        if (a) throw r;
      }
    }
    return l;
  }
}
function lb() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ub(n, e) {
  return sb(n) || ob(n, e) || ab(n, e) || lb();
}
function ab(n, e) {
  if (n) {
    if (typeof n == "string") return wc(n, e);
    var t = {}.toString.call(n).slice(8, -1);
    return t === "Object" && n.constructor && (t = n.constructor.name), t === "Map" || t === "Set" ? Array.from(n) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? wc(n, e) : void 0;
  }
}
const gd = Object.entries, $c = Object.setPrototypeOf, cb = Object.isFrozen, bd = Object.getPrototypeOf, xd = Object.getOwnPropertyDescriptor;
let Qe = Object.freeze, _e = Object.seal, Wn = Object.create, kd = typeof Reflect < "u" && Reflect, Xl = kd.apply, Zl = kd.construct;
Qe || (Qe = function(e) {
  return e;
});
_e || (_e = function(e) {
  return e;
});
Xl || (Xl = function(e, t) {
  for (var i = arguments.length, r = new Array(i > 2 ? i - 2 : 0), s = 2; s < i; s++) r[s - 2] = arguments[s];
  return e.apply(t, r);
});
Zl || (Zl = function(e) {
  for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) i[r - 1] = arguments[r];
  return new e(...i);
});
const qt = ce(Array.prototype.forEach), hb = ce(Array.prototype.lastIndexOf), Pc = ce(Array.prototype.pop), Ti = ce(Array.prototype.push), fb = ce(Array.prototype.slice), db = ce(Array.prototype.splice), Jn = Array.isArray, Yo = Sd(Set), Wo = ce(Set.prototype.add), Ei = ce(Set.prototype.has), Cn = ce(String.prototype.toLowerCase), No = ce(String.prototype.toString), vc = ce(String.prototype.match), Xi = ce(String.prototype.replace), _c = ce(String.prototype.indexOf), Ob = ce(String.prototype.trim), pb = ce(Number.prototype.toString), mb = ce(Boolean.prototype.toString), Ac = typeof BigInt > "u" ? null : ce(BigInt.prototype.toString), Cc = typeof Symbol > "u" ? null : ce(Symbol.prototype.toString), Be = ce(Object.prototype.hasOwnProperty), Zi = ce(Object.prototype.toString), $e = ce(RegExp.prototype.test), Ft = Sd(TypeError);
function ce(n) {
  return function(e) {
    e instanceof RegExp && (e.lastIndex = 0);
    for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++) i[r - 1] = arguments[r];
    return Xl(n, e, i);
  };
}
function Sd(n) {
  return function() {
    for (var e = arguments.length, t = new Array(e), i = 0; i < e; i++) t[i] = arguments[i];
    return Zl(n, t);
  };
}
function G(n, e) {
  let t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Cn;
  if ($c && $c(n, null), !Jn(e)) return n;
  let i = e.length;
  for (; i--; ) {
    let r = e[i];
    if (typeof r == "string") {
      const s = t(r);
      s !== r && (cb(e) || (e[i] = s), r = s);
    }
    n[r] = !0;
  }
  return n;
}
function gb(n) {
  for (let e = 0; e < n.length; e++) Be(n, e) || (n[e] = null);
  return n;
}
function Ge(n) {
  const e = Wn(null);
  for (const i of gd(n)) {
    var t = ub(i, 2);
    const r = t[0], s = t[1];
    Be(n, r) && (Jn(s) ? e[r] = gb(s) : s && typeof s == "object" && s.constructor === Object ? e[r] = Ge(s) : e[r] = s);
  }
  return e;
}
function bb(n) {
  switch (typeof n) {
    case "string":
      return n;
    case "number":
      return pb(n);
    case "boolean":
      return mb(n);
    case "bigint":
      return Ac ? Ac(n) : "0";
    case "symbol":
      return Cc ? Cc(n) : "Symbol()";
    case "undefined":
      return Zi(n);
    case "function":
    case "object": {
      if (n === null) return Zi(n);
      const e = n, t = st(e, "toString");
      if (typeof t == "function") {
        const i = t(e);
        return typeof i == "string" ? i : Zi(i);
      }
      return Zi(n);
    }
    default:
      return Zi(n);
  }
}
function st(n, e) {
  for (; n !== null; ) {
    const i = xd(n, e);
    if (i) {
      if (i.get) return ce(i.get);
      if (typeof i.value == "function") return ce(i.value);
    }
    n = bd(n);
  }
  function t() {
    return null;
  }
  return t;
}
function xb(n, e) {
  for (; n !== null; ) {
    const t = xd(n, e);
    if (t) return t.get ? ce(t.get) : null;
    n = bd(n);
  }
  return null;
}
function kb(n) {
  try {
    return $e(n, ""), !0;
  } catch {
    return !1;
  }
}
const Tc = Qe([
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "bdi",
  "bdo",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "content",
  "data",
  "datalist",
  "dd",
  "decorator",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meter",
  "nav",
  "nobr",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "search",
  "section",
  "select",
  "shadow",
  "slot",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
]), Vo = Qe([
  "svg",
  "a",
  "altglyph",
  "altglyphdef",
  "altglyphitem",
  "animatecolor",
  "animatemotion",
  "animatetransform",
  "circle",
  "clippath",
  "defs",
  "desc",
  "ellipse",
  "enterkeyhint",
  "exportparts",
  "filter",
  "font",
  "g",
  "glyph",
  "glyphref",
  "hkern",
  "image",
  "inputmode",
  "line",
  "lineargradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "part",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialgradient",
  "rect",
  "stop",
  "style",
  "switch",
  "symbol",
  "text",
  "textpath",
  "title",
  "tref",
  "tspan",
  "view",
  "vkern"
]), Uo = Qe([
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence"
]), Sb = Qe([
  "animate",
  "color-profile",
  "cursor",
  "discard",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "foreignobject",
  "hatch",
  "hatchpath",
  "mesh",
  "meshgradient",
  "meshpatch",
  "meshrow",
  "missing-glyph",
  "script",
  "set",
  "solidcolor",
  "unknown",
  "use"
]), Go = Qe([
  "math",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mi",
  "mlabeledtr",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mspace",
  "msqrt",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "mprescripts"
]), yb = Qe([
  "maction",
  "maligngroup",
  "malignmark",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "mstack",
  "msline",
  "msrow",
  "semantics",
  "annotation",
  "annotation-xml",
  "mprescripts",
  "none"
]), Ec = Qe(["#text"]), Xc = Qe([
  "accept",
  "action",
  "align",
  "alt",
  "autocapitalize",
  "autocomplete",
  "autopictureinpicture",
  "autoplay",
  "background",
  "bgcolor",
  "border",
  "capture",
  "cellpadding",
  "cellspacing",
  "checked",
  "cite",
  "class",
  "clear",
  "color",
  "cols",
  "colspan",
  "command",
  "commandfor",
  "controls",
  "controlslist",
  "coords",
  "crossorigin",
  "datetime",
  "decoding",
  "default",
  "dir",
  "disabled",
  "disablepictureinpicture",
  "disableremoteplayback",
  "download",
  "draggable",
  "enctype",
  "enterkeyhint",
  "exportparts",
  "face",
  "for",
  "headers",
  "height",
  "hidden",
  "high",
  "href",
  "hreflang",
  "id",
  "inert",
  "inputmode",
  "integrity",
  "ismap",
  "kind",
  "label",
  "lang",
  "list",
  "loading",
  "loop",
  "low",
  "max",
  "maxlength",
  "media",
  "method",
  "min",
  "minlength",
  "multiple",
  "muted",
  "name",
  "nonce",
  "noshade",
  "novalidate",
  "nowrap",
  "open",
  "optimum",
  "part",
  "pattern",
  "placeholder",
  "playsinline",
  "popover",
  "popovertarget",
  "popovertargetaction",
  "poster",
  "preload",
  "pubdate",
  "radiogroup",
  "readonly",
  "rel",
  "required",
  "rev",
  "reversed",
  "role",
  "rows",
  "rowspan",
  "spellcheck",
  "scope",
  "selected",
  "shape",
  "size",
  "sizes",
  "slot",
  "span",
  "srclang",
  "start",
  "src",
  "srcset",
  "step",
  "style",
  "summary",
  "tabindex",
  "title",
  "translate",
  "type",
  "usemap",
  "valign",
  "value",
  "width",
  "wrap",
  "xmlns"
]), Ho = Qe([
  "accent-height",
  "accumulate",
  "additive",
  "alignment-baseline",
  "amplitude",
  "ascent",
  "attributename",
  "attributetype",
  "azimuth",
  "basefrequency",
  "baseline-shift",
  "begin",
  "bias",
  "by",
  "class",
  "clip",
  "clippathunits",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cx",
  "cy",
  "d",
  "dx",
  "dy",
  "diffuseconstant",
  "direction",
  "display",
  "divisor",
  "dominant-baseline",
  "dur",
  "edgemode",
  "elevation",
  "end",
  "exponent",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "filterunits",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "fx",
  "fy",
  "g1",
  "g2",
  "glyph-name",
  "glyphref",
  "gradientunits",
  "gradienttransform",
  "height",
  "href",
  "id",
  "image-rendering",
  "in",
  "in2",
  "intercept",
  "k",
  "k1",
  "k2",
  "k3",
  "k4",
  "kerning",
  "keypoints",
  "keysplines",
  "keytimes",
  "lang",
  "lengthadjust",
  "letter-spacing",
  "kernelmatrix",
  "kernelunitlength",
  "lighting-color",
  "local",
  "marker-end",
  "marker-mid",
  "marker-start",
  "markerheight",
  "markerunits",
  "markerwidth",
  "maskcontentunits",
  "maskunits",
  "max",
  "mask",
  "mask-type",
  "media",
  "method",
  "mode",
  "min",
  "name",
  "numoctaves",
  "offset",
  "operator",
  "opacity",
  "order",
  "orient",
  "orientation",
  "origin",
  "overflow",
  "paint-order",
  "path",
  "pathlength",
  "patterncontentunits",
  "patterntransform",
  "patternunits",
  "pointer-events",
  "points",
  "preservealpha",
  "preserveaspectratio",
  "primitiveunits",
  "r",
  "rx",
  "ry",
  "radius",
  "refx",
  "refy",
  "repeatcount",
  "repeatdur",
  "restart",
  "result",
  "rotate",
  "scale",
  "seed",
  "shape-rendering",
  "slope",
  "specularconstant",
  "specularexponent",
  "spreadmethod",
  "startoffset",
  "stddeviation",
  "stitchtiles",
  "stop-color",
  "stop-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke",
  "stroke-width",
  "style",
  "surfacescale",
  "systemlanguage",
  "tabindex",
  "tablevalues",
  "targetx",
  "targety",
  "transform",
  "transform-origin",
  "text-anchor",
  "text-decoration",
  "text-orientation",
  "text-rendering",
  "textlength",
  "type",
  "u1",
  "u2",
  "unicode",
  "values",
  "vector-effect",
  "viewbox",
  "visibility",
  "version",
  "vert-adv-y",
  "vert-origin-x",
  "vert-origin-y",
  "width",
  "word-spacing",
  "wrap",
  "writing-mode",
  "xchannelselector",
  "ychannelselector",
  "x",
  "x1",
  "x2",
  "xmlns",
  "y",
  "y1",
  "y2",
  "z",
  "zoomandpan"
]), Zc = Qe([
  "accent",
  "accentunder",
  "align",
  "bevelled",
  "close",
  "columnalign",
  "columnlines",
  "columnspacing",
  "columnspan",
  "denomalign",
  "depth",
  "dir",
  "display",
  "displaystyle",
  "encoding",
  "fence",
  "frame",
  "height",
  "href",
  "id",
  "largeop",
  "length",
  "linethickness",
  "lquote",
  "lspace",
  "mathbackground",
  "mathcolor",
  "mathsize",
  "mathvariant",
  "maxsize",
  "minsize",
  "movablelimits",
  "notation",
  "numalign",
  "open",
  "rowalign",
  "rowlines",
  "rowspacing",
  "rowspan",
  "rspace",
  "rquote",
  "scriptlevel",
  "scriptminsize",
  "scriptsizemultiplier",
  "selection",
  "separator",
  "separators",
  "stretchy",
  "subscriptshift",
  "supscriptshift",
  "symmetric",
  "voffset",
  "width",
  "xmlns"
]), Vr = Qe([
  "xlink:href",
  "xml:id",
  "xlink:title",
  "xml:space",
  "xmlns:xlink"
]), Qb = _e(/{{[\w\W]*|^[\w\W]*}}/g), wb = _e(/<%[\w\W]*|^[\w\W]*%>/g), $b = _e(/\${[\w\W]*/g), Pb = _e(/^data-[\-\w.\u00B7-\uFFFF]+$/), vb = _e(/^aria-[\-\w]+$/), Dc = _e(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), _b = _e(/^(?:\w+script|data):/i), Ab = _e(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), Cb = _e(/^html$/i), Tb = _e(/^[a-z][.\w]*(-[.\w]+)+$/i), Ko = _e(/<[/\w!]/g), Rc = _e(/<[/\w]/g), Eb = _e(/<\/no(script|embed|frames)/i), Mc = _e(/\/>/i), me = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  entityNode: 6,
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12
}, Xb = Qe(G({}, [
  "style",
  "script",
  "xmp",
  "iframe",
  "noembed",
  "noframes",
  "plaintext",
  "noscript"
])), Zb = function() {
  return typeof window > "u" ? null : window;
}, Db = function(e, t) {
  if (typeof e != "object" || typeof e.createPolicy != "function") return null;
  let i = null;
  const r = "data-tt-policy-suffix";
  t && t.hasAttribute(r) && (i = t.getAttribute(r));
  const s = "dompurify" + (i ? "#" + i : "");
  try {
    return e.createPolicy(s, {
      createHTML(o) {
        return o;
      },
      createScriptURL(o) {
        return o;
      }
    });
  } catch {
    return console.warn("TrustedTypes policy " + s + " could not be created."), null;
  }
}, Lc = function() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
}, ln = function(e, t, i, r) {
  return Be(e, t) && Jn(e[t]) ? G(r.base ? Ge(r.base) : {}, e[t], r.transform) : i;
}, Jo = function(e, t, i) {
  const r = Be(e, t) ? e[t] : void 0;
  return r && typeof r == "object" ? Ge(r) : i();
};
function yd() {
  let n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Zb();
  const e = (_) => yd(_);
  if (e.version = "3.4.17", e.removed = [], !n || !n.document || n.document.nodeType !== me.document || !n.Element)
    return e.isSupported = !1, e;
  let t = n.document;
  const i = t, r = i.currentScript;
  n.DocumentFragment;
  const s = n.HTMLTemplateElement, o = n.Node, l = n.Element, u = n.NodeFilter;
  n.NamedNodeMap === void 0 && (n.NamedNodeMap || n.MozNamedAttrMap), n.HTMLFormElement;
  const a = n.DOMParser, c = n.trustedTypes, h = l.prototype, f = st(h, "cloneNode"), d = st(h, "remove"), O = st(h, "removeAttributeNode"), m = st(h, "nextSibling"), g = st(h, "childNodes"), b = st(h, "parentNode"), w = st(h, "shadowRoot"), S = st(h, "attributes"), Q = o && o.prototype ? st(o.prototype, "nodeType") : null, y = o && o.prototype ? st(o.prototype, "nodeName") : null, A = o && o.prototype ? st(o.prototype, "ownerDocument") : null, C = function(p) {
    return Q ? Q(p) : p.nodeType;
  }, z = function(p) {
    return y ? y(p) : p.nodeName;
  }, X = xb(h, "namespaceURI"), q = function(p) {
    return X ? X(p) : p.namespaceURI;
  };
  if (typeof s == "function") {
    const _ = t.createElement("template");
    _.content && _.content.ownerDocument && (t = _.content.ownerDocument);
  }
  let R, M = "", W, ne = !1, ee = 0;
  const We = function() {
    if (ee > 0) throw Ft('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
  }, it = function(p) {
    We(), ee++;
    try {
      return R.createHTML(p);
    } finally {
      ee--;
    }
  }, Ln = function(p) {
    We(), ee++;
    try {
      return R.createScriptURL(p);
    } finally {
      ee--;
    }
  }, zt = function() {
    return ne || (W = Db(c, r), ne = !0), W;
  }, Qn = t, Ne = Qn.implementation, Xe = Qn.createNodeIterator, rt = Qn.createDocumentFragment, It = Qn.getElementsByTagName, nn = i.importNode;
  let te = Lc();
  e.isSupported = typeof gd == "function" && typeof b == "function" && Ne && Ne.createHTMLDocument !== void 0;
  const Dr = Qb, Yp = wb, Wp = $b, Np = Pb, Vp = vb, Up = _b, va = Ab, Gp = Tb;
  let _a = Dc, ue = null;
  const po = G({}, [
    ...Tc,
    ...Vo,
    ...Uo,
    ...Go,
    ...Ec
  ]);
  let ae = null;
  const mo = G({}, [
    ...Xc,
    ...Ho,
    ...Zc,
    ...Vr
  ]);
  let kt = Object.seal(Wn(null, {
    tagNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeNameCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: !1
    }
  })), Pi = null, Aa = null;
  const rn = Object.seal(Wn(null, {
    tagCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    },
    attributeCheck: {
      writable: !0,
      configurable: !1,
      enumerable: !0,
      value: null
    }
  }));
  let Ca = !0, go = !0, Ta = !1, bo = !0, Bt = !1, wn = !0, $n = !1, xo = !1, Rr = null, Mr = null, ko = !1, jn = !1, Lr = !1, jr = !1, Ea = !0, Xa = !1;
  const Za = "user-content-";
  let So = !0, yo = !1, Pn = null, zn = {}, vn = null;
  const Da = G({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "selectedcontent",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp"
  ]);
  let Ra = null;
  const Ma = G({}, [
    "audio",
    "video",
    "img",
    "source",
    "image",
    "track"
  ]);
  let La = null;
  const ja = G({}, [
    "alt",
    "class",
    "for",
    "id",
    "label",
    "name",
    "pattern",
    "placeholder",
    "role",
    "summary",
    "title",
    "value",
    "style",
    "xmlns"
  ]), zr = "http://www.w3.org/1998/Math/MathML", Ir = "http://www.w3.org/2000/svg", St = "http://www.w3.org/1999/xhtml";
  let In = St, Qo = !1, wo = null;
  const Hp = G({}, [
    zr,
    Ir,
    St
  ], No), za = Qe([
    "mi",
    "mo",
    "mn",
    "ms",
    "mtext"
  ]);
  let $o = G({}, za);
  const Ia = Qe(["annotation-xml"]);
  let Po = G({}, Ia);
  const Kp = G({}, [
    "title",
    "style",
    "font",
    "a",
    "script"
  ]);
  let vi = null;
  const Jp = ["application/xhtml+xml", "text/html"], em = "text/html";
  let de = null, Bn = null;
  const tm = t.createElement("form"), Ba = function(p) {
    return p instanceof RegExp || p instanceof Function;
  }, vo = function() {
    let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (Bn && Bn === p) return;
    (!p || typeof p != "object") && (p = {}), p = Ge(p), vi = Jp.indexOf(p.PARSER_MEDIA_TYPE) === -1 ? em : p.PARSER_MEDIA_TYPE, de = vi === "application/xhtml+xml" ? No : Cn, ue = ln(p, "ALLOWED_TAGS", po, { transform: de }), ae = ln(p, "ALLOWED_ATTR", mo, { transform: de }), wo = ln(p, "ALLOWED_NAMESPACES", Hp, { transform: No }), La = ln(p, "ADD_URI_SAFE_ATTR", ja, {
      transform: de,
      base: ja
    }), Ra = ln(p, "ADD_DATA_URI_TAGS", Ma, {
      transform: de,
      base: Ma
    }), vn = ln(p, "FORBID_CONTENTS", Da, { transform: de }), Pi = ln(p, "FORBID_TAGS", Ge({}), { transform: de }), Aa = ln(p, "FORBID_ATTR", Ge({}), { transform: de }), zn = Be(p, "USE_PROFILES") ? p.USE_PROFILES && typeof p.USE_PROFILES == "object" ? Ge(p.USE_PROFILES) : p.USE_PROFILES : !1, Ca = p.ALLOW_ARIA_ATTR !== !1, go = p.ALLOW_DATA_ATTR !== !1, Ta = p.ALLOW_UNKNOWN_PROTOCOLS || !1, bo = p.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Bt = p.SAFE_FOR_TEMPLATES || !1, wn = p.SAFE_FOR_XML !== !1, $n = p.WHOLE_DOCUMENT || !1, jn = p.RETURN_DOM || !1, Lr = p.RETURN_DOM_FRAGMENT || !1, jr = p.RETURN_TRUSTED_TYPE || !1, ko = p.FORCE_BODY || !1, Ea = p.SANITIZE_DOM !== !1, Xa = p.SANITIZE_NAMED_PROPS || !1, So = p.KEEP_CONTENT !== !1, yo = p.IN_PLACE || !1, _a = kb(p.ALLOWED_URI_REGEXP) ? p.ALLOWED_URI_REGEXP : Dc, In = typeof p.NAMESPACE == "string" ? p.NAMESPACE : St, $o = Jo(p, "MATHML_TEXT_INTEGRATION_POINTS", () => G({}, za)), Po = Jo(p, "HTML_INTEGRATION_POINTS", () => G({}, Ia));
    const k = Jo(p, "CUSTOM_ELEMENT_HANDLING", () => Wn(null));
    if (kt = Wn(null), Be(k, "tagNameCheck") && Ba(k.tagNameCheck) && (kt.tagNameCheck = k.tagNameCheck), Be(k, "attributeNameCheck") && Ba(k.attributeNameCheck) && (kt.attributeNameCheck = k.attributeNameCheck), Be(k, "allowCustomizedBuiltInElements") && typeof k.allowCustomizedBuiltInElements == "boolean" && (kt.allowCustomizedBuiltInElements = k.allowCustomizedBuiltInElements), _e(kt), Bt && (go = !1), Lr && (jn = !0), zn && (ue = G({}, Ec), ae = Wn(null), zn.html === !0 && (G(ue, Tc), G(ae, Xc)), zn.svg === !0 && (G(ue, Vo), G(ae, Ho), G(ae, Vr)), zn.svgFilters === !0 && (G(ue, Uo), G(ae, Ho), G(ae, Vr)), zn.mathMl === !0 && (G(ue, Go), G(ae, Zc), G(ae, Vr))), rn.tagCheck = null, rn.attributeCheck = null, Be(p, "ADD_TAGS") && (typeof p.ADD_TAGS == "function" ? rn.tagCheck = p.ADD_TAGS : Jn(p.ADD_TAGS) && (ue === po && (ue = Ge(ue)), G(ue, p.ADD_TAGS, de))), Be(p, "ADD_ATTR") && (typeof p.ADD_ATTR == "function" ? rn.attributeCheck = p.ADD_ATTR : Jn(p.ADD_ATTR) && (ae === mo && (ae = Ge(ae)), G(ae, p.ADD_ATTR, de))), Be(p, "ADD_FORBID_CONTENTS") && Jn(p.ADD_FORBID_CONTENTS) && (vn === Da && (vn = Ge(vn)), G(vn, p.ADD_FORBID_CONTENTS, de)), So && (ue["#text"] = !0), $n && G(ue, [
      "html",
      "head",
      "body"
    ]), ue.table && (G(ue, ["tbody"]), delete Pi.tbody), p.TRUSTED_TYPES_POLICY) {
      if (typeof p.TRUSTED_TYPES_POLICY.createHTML != "function") throw Ft('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof p.TRUSTED_TYPES_POLICY.createScriptURL != "function") throw Ft('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      const $ = R;
      R = p.TRUSTED_TYPES_POLICY;
      try {
        M = it("");
      } catch (P) {
        throw R = $, P;
      }
    } else p.TRUSTED_TYPES_POLICY === null ? (R = void 0, M = "") : (R === void 0 && (R = zt()), R && typeof M == "string" && (M = it("")));
    Qe && Qe(p), Bn = p;
  }, qa = G({}, [
    ...Vo,
    ...Uo,
    ...Sb
  ]), Fa = G({}, [...Go, ...yb]), nm = function(p, k, $) {
    return k.namespaceURI === St ? p === "svg" : k.namespaceURI === zr ? p === "svg" && ($ === "annotation-xml" || $o[$]) : !!qa[p];
  }, im = function(p, k, $) {
    return k.namespaceURI === St ? p === "math" : k.namespaceURI === Ir ? p === "math" && Po[$] : !!Fa[p];
  }, rm = function(p, k, $) {
    return k.namespaceURI === Ir && !Po[$] || k.namespaceURI === zr && !$o[$] ? !1 : !Fa[p] && (Kp[p] || !qa[p]);
  }, sm = function(p) {
    const k = q(p), $ = Cn(z(p)), P = b(p);
    let L, B;
    return P && C(P) === me.element ? (L = { namespaceURI: q(P) }, B = Cn(z(P))) : (L = { namespaceURI: In }, B = "template"), wo[k] ? k === Ir ? nm($, L, B) : k === zr ? im($, L, B) : k === St ? rm($, L, B) : !!(vi === "application/xhtml+xml" && wo[k]) : !1;
  }, sn = function(p) {
    Ti(e.removed, { element: p });
    try {
      b(p).removeChild(p);
    } catch {
      if (d(p), !b(p)) throw Ft("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
    }
  }, Ya = function(p, k, $) {
    try {
      O(p, k);
    } catch {
      try {
        p.removeAttribute($);
      } catch {
      }
    }
  }, _o = function(p) {
    Co(p);
    const k = g(p);
    k && qt(fb(k), (P) => {
      try {
        d(P);
      } catch {
      }
    });
    const $ = C(p) === me.element ? S(p) : null;
    if ($) for (let P = $.length - 1; P >= 0; --P) {
      const L = $[P], B = L && L.name;
      typeof B == "string" && Ya(p, L, B);
    }
  }, qn = function(p, k, $) {
    if (!$) try {
      $ = k.getAttributeNode(p);
    } catch {
      $ = null;
    }
    Ti(e.removed, {
      attribute: $ || null,
      from: k
    });
    try {
      $ ? O(k, $) : k.removeAttribute(p);
    } catch {
      try {
        k.removeAttribute(p);
      } catch {
      }
    }
    if (p === "is")
      if (jn || Lr) try {
        sn(k);
      } catch {
      }
      else try {
        k.setAttribute(p, "");
      } catch {
      }
  }, Wa = function(p) {
    const k = S(p);
    if (k)
      for (let $ = k.length - 1; $ >= 0; --$) {
        const P = k[$], L = P && P.name;
        typeof L != "string" || ae[de(L)] || Ya(p, P, L);
      }
  }, Ao = function(p, k) {
    let $ = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
    const P = [p];
    for (; P.length > 0; ) {
      const L = P.pop();
      if (k(L) === !1) continue;
      if ($ && C(L) === me.element) {
        const Y = w(L);
        on(Y) && P.push(Y);
      }
      const B = g(L);
      if (B) for (let Y = B.length - 1; Y >= 0; --Y) P.push(B[Y]);
    }
  }, Co = function(p) {
    Ao(p, (k) => {
      C(k) === me.element && Wa(k);
    });
  }, To = function(p) {
    const k = [];
    return Ao(p, ($) => {
      k.push($);
    }, !0), k;
  }, om = function(p, k) {
    const $ = Yo();
    qt(To(p), (P) => {
      C(P) === me.element && Wo($, P);
    }), qt(k, (P) => {
      C(P) === me.element && !Ei($, P) && Wa(P);
    });
  }, Na = function(p, k) {
    let $ = !1;
    return qt(e.removed, (P) => {
      P.element && ($ = $ || P.element === p, Co(P.element));
    }), om(p, k), $;
  }, lm = 8, um = function(p, k) {
    const $ = Pn;
    let P = null;
    const L = () => (P || (P = Yo(), qt(k, (B) => {
      Wo(P, B);
    })), P);
    for (let B = 0; ; B++) {
      const Y = To(p), be = [p];
      let yt = !1;
      if (qt(Y, (Ze) => {
        C(Ze) === me.documentFragment ? Ti(be, Ze) : !yt && !Ei($, Ze) && (yt = Ei(L(), Ze));
      }), !yt) return;
      if (B >= lm) throw Ft("the tree kept changing during in-place sanitization; refusing to return it");
      qt(be, (Ze, je) => {
        am(Ze, je > 0, p, L());
      });
    }
  }, am = function(p, k, $, P) {
    const L = Eo(p);
    let B;
    for (; B = L.nextNode(); )
      !Ei(P, B) || Ei(Pn, B) || (k && ft(te.uponSanitizeShadowNode, B, null), Zo(B, $), Do(B, $), on(B.content) && Ai(B.content));
  }, cm = function(p) {
    Pn && Wo(Pn, p);
  }, Va = function(p, k) {
    return wn ? p === "patchsrc" ? !0 : p === "for" && k !== "label" && k !== "output" : !1;
  }, hm = function(p) {
    wn && Ao(p, (k) => {
      const $ = C(k);
      if ($ === me.processingInstruction || $ === me.comment && $e(Rc, k.data)) {
        try {
          d(k);
        } catch {
        }
        return !1;
      }
      if ($ === me.element) {
        const P = k, L = de(z(k));
        try {
          P.hasAttribute && P.hasAttribute("patchsrc") && P.removeAttribute("patchsrc"), P.hasAttribute && P.hasAttribute("for") && Va("for", L) && P.removeAttribute("for");
        } catch {
        }
      }
      return !0;
    });
  }, Ua = function(p) {
    let k = null, $ = null;
    if (ko) p = "<remove></remove>" + p;
    else {
      const B = vc(p, /^[\r\n\t ]+/);
      $ = B && B[0];
    }
    vi === "application/xhtml+xml" && In === St && (p = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + p + "</body></html>");
    const P = R ? it(p) : p;
    if (In === St) try {
      k = new a().parseFromString(P, vi);
    } catch {
    }
    if (!k || !k.documentElement) {
      k = Ne.createDocument(In, "template", null);
      try {
        k.documentElement.innerHTML = Qo ? M : P;
      } catch {
      }
    }
    const L = k.body || k.documentElement;
    return p && $ && L.insertBefore(t.createTextNode($), L.childNodes[0] || null), In === St ? It.call(k, $n ? "html" : "body")[0] : $n ? k.documentElement : L;
  }, Eo = function(p) {
    const k = A ? A(p) : p.ownerDocument;
    return Xe.call(k || p, p, u.SHOW_ELEMENT | u.SHOW_COMMENT | u.SHOW_TEXT | u.SHOW_PROCESSING_INSTRUCTION | u.SHOW_CDATA_SECTION, null);
  }, Br = function(p) {
    return p = Xi(p, Dr, " "), p = Xi(p, Yp, " "), p = Xi(p, Wp, " "), p;
  }, Xo = function(p) {
    var k;
    Ga(p);
    const $ = (k = p.querySelectorAll) === null || k === void 0 ? void 0 : k.call(p, "template");
    $ && qt($, (P) => {
      on(P.content) && Xo(P.content);
    });
  }, Ga = function(p) {
    p.normalize();
    const k = A ? A(p) : p.ownerDocument, $ = Xe.call(k || p, p, u.SHOW_TEXT | u.SHOW_COMMENT | u.SHOW_CDATA_SECTION | u.SHOW_PROCESSING_INSTRUCTION, null);
    let P = $.nextNode();
    for (; P; )
      P.data = Br(P.data), P = $.nextNode();
  }, qr = function(p) {
    const k = y ? y(p) : null;
    return typeof k != "string" || de(k) !== "form" ? !1 : typeof p.nodeName != "string" || typeof p.textContent != "string" || typeof p.removeChild != "function" || p.attributes !== S(p) || typeof p.removeAttribute != "function" || typeof p.removeAttributeNode != "function" || typeof p.getAttributeNode != "function" || typeof p.setAttribute != "function" || typeof p.namespaceURI != "string" || typeof p.insertBefore != "function" || typeof p.hasChildNodes != "function" || p.nodeType !== Q(p) || p.childNodes !== g(p);
  }, on = function(p) {
    if (!Q || typeof p != "object" || p === null) return !1;
    try {
      return Q(p) === me.documentFragment;
    } catch {
      return !1;
    }
  }, _i = function(p) {
    if (!Q || typeof p != "object" || p === null) return !1;
    try {
      return typeof Q(p) == "number";
    } catch {
      return !1;
    }
  };
  function ft(_, p, k) {
    _.length !== 0 && qt(_, ($) => {
      $.call(e, p, k, Bn);
    });
  }
  const fm = function(p, k) {
    return !!(wn && p.hasChildNodes() && !_i(p.firstElementChild) && $e(Ko, p.textContent) && $e(Ko, p.innerHTML) || wn && Xb[k] && C(p) === me.element && q(p) === St && (_i(p.firstElementChild) || typeof p.textContent == "string" && $e(Ko, p.textContent)) || p.nodeType === me.processingInstruction || wn && p.nodeType === me.comment && $e(Rc, p.data));
  }, Fr = function(p, k) {
    if (p instanceof RegExp) return $e(p, k);
    if (p instanceof Function) {
      for (var $ = arguments.length, P = new Array($ > 2 ? $ - 2 : 0), L = 2; L < $; L++) P[L - 2] = arguments[L];
      return !!p(k, ...P);
    }
    return !1;
  }, dm = function(p, k, $) {
    if (!Pi[k] && Ja(k) && Fr(kt.tagNameCheck, k)) return !1;
    if (So && !vn[k] && !vn[Cn(k)]) {
      const P = b(p), L = g(p);
      if (L && P) {
        const B = L.length;
        for (let Y = B - 1; Y >= 0; --Y) {
          const be = p === $ ? f(L[Y], !0) : L[Y];
          P.insertBefore(be, m(p));
        }
      }
    }
    return sn(p), !0;
  }, Ha = function(p, k, $, P) {
    return p.length === 0 ? k : k === $ || k === P ? Ge(k) : k;
  }, Fn = function(p, k) {
    return p === k || b(p) !== null ? !1 : (yo && Co(p), !0);
  }, Zo = function(p, k) {
    if (cm(p), ft(te.beforeSanitizeElements, p, null), Fn(p, k)) return !0;
    if (qr(p))
      return sn(p), !0;
    const $ = de(z(p));
    if (ue = Ha(te.uponSanitizeElement, ue, po, Rr), ft(te.uponSanitizeElement, p, {
      tagName: $,
      allowedTags: ue
    }), Fn(p, k)) return !0;
    if (fm(p, $))
      return sn(p), !0;
    if (Pi[$] || !(rn.tagCheck instanceof Function && rn.tagCheck($)) && !ue[$]) {
      const P = dm(p, $, k);
      return P === !1 && (ft(te.afterSanitizeElements, p, null), Fn(p, k)) ? !0 : P;
    }
    if (C(p) === me.element && !sm(p) || ($ === "noscript" || $ === "noembed" || $ === "noframes") && $e(Eb, p.innerHTML))
      return sn(p), !0;
    if (Bt && p.nodeType === me.text) {
      const P = Br(p.textContent);
      p.textContent !== P && (Ti(e.removed, { element: p.cloneNode() }), p.textContent = P);
    }
    return ft(te.afterSanitizeElements, p, null), Fn(p, k);
  }, Ka = function(p, k, $) {
    if (Aa[k] || Va(k, p) || Ea && (k === "id" || k === "name") && ($ in t || $ in tm)) return !1;
    const P = ae[k] || rn.attributeCheck instanceof Function && rn.attributeCheck(k, p);
    return go && $e(Np, k) || Ca && $e(Vp, k) ? !0 : P ? La[k] || $e(_a, Xi($, va, "")) || (k === "src" || k === "xlink:href" || k === "href") && p !== "script" && _c($, "data:") === 0 && Ra[p] || Ta && !$e(Up, Xi($, va, "")) ? !0 : !$ : Ja(p) && Fr(kt.tagNameCheck, p) && Fr(kt.attributeNameCheck, k, p) || k === "is" && kt.allowCustomizedBuiltInElements && Fr(kt.tagNameCheck, $);
  }, Om = G({}, [
    "annotation-xml",
    "color-profile",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "missing-glyph"
  ]), Ja = function(p) {
    return !Om[Cn(p)] && $e(Gp, p);
  }, pm = function(p, k, $, P) {
    if (R && typeof c == "object" && typeof c.getAttributeType == "function" && !$) switch (c.getAttributeType(p, k)) {
      case "TrustedHTML":
        return it(P);
      case "TrustedScriptURL":
        return Ln(P);
    }
    return P;
  }, mm = function(p, k, $, P) {
    try {
      return $ ? p.setAttributeNS($, k, P) : p.setAttribute(k, P), qr(p) ? (sn(p), !1) : !0;
    } catch {
      return qn(k, p), !1;
    }
  }, ec = function(p, k) {
    return wn && $e(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, k) ? !0 : Cn(p) === "attributename" && vc(k, "href") !== null;
  }, Do = function(p, k) {
    if (ft(te.beforeSanitizeAttributes, p, null), Fn(p, k)) return;
    const $ = p.attributes;
    if (!$ || qr(p)) return;
    ae = Ha(te.uponSanitizeAttribute, ae, mo, Mr);
    const P = {
      attrName: "",
      attrValue: "",
      keepAttr: !0,
      allowedAttributes: ae,
      forceKeepAttr: void 0
    };
    let L = $.length;
    const B = de(p.nodeName);
    for (; L--; ) {
      const Y = $[L], be = Y.name, yt = Y.namespaceURI, Ze = Y.value, je = de(be), Yn = Ze;
      let ze = be === "value" ? Yn : Ob(Yn), tc = !1;
      if (P.attrName = je, P.attrValue = ze, P.keepAttr = !0, P.forceKeepAttr = void 0, ft(te.uponSanitizeAttribute, p, P), ze = P.attrValue, Xa && (je === "id" || je === "name") && _c(ze, Za) !== 0 && (qn(be, p, Y), ze = Za + ze, tc = !0), ec(be, ze)) {
        qn(be, p, Y);
        continue;
      }
      if (!P.forceKeepAttr) {
        if (!P.keepAttr) {
          qn(be, p, Y);
          continue;
        }
        if (!bo && $e(Mc, ze)) {
          qn(be, p, Y);
          continue;
        }
        if (Bt && (ze = Br(ze)), !Ka(B, je, ze)) {
          qn(be, p, Y);
          continue;
        }
        ze = pm(B, je, yt, ze), ze !== Yn && mm(p, be, yt, ze) && tc && Pc(e.removed);
      }
    }
    ft(te.afterSanitizeAttributes, p, null), Fn(p, k);
  }, Ai = function(p) {
    let k = null;
    const $ = Eo(p);
    for (ft(te.beforeSanitizeShadowDOM, p, null); k = $.nextNode(); )
      if (ft(te.uponSanitizeShadowNode, k, null), Zo(k, p), Do(k, p), on(k.content) && Ai(k.content), C(k) === me.element) {
        const P = w(k);
        on(P) && (Ro(P), Ai(P));
      }
    Bt && Ga(p), ft(te.afterSanitizeShadowDOM, p, null);
  }, Ro = function(p) {
    const k = [{
      node: p,
      shadow: null
    }];
    for (; k.length > 0; ) {
      const $ = k.pop();
      if ($.shadow) {
        Ai($.shadow);
        continue;
      }
      const P = $.node, L = C(P) === me.element, B = g(P);
      if (B) for (let Y = B.length - 1; Y >= 0; --Y) k.push({
        node: B[Y],
        shadow: null
      });
      if (L) {
        const Y = y ? y(P) : null;
        if (typeof Y == "string" && de(Y) === "template") {
          const be = P.content;
          on(be) && k.push({
            node: be,
            shadow: null
          });
        }
      }
      if (L) {
        const Y = w(P);
        on(Y) && k.push({
          node: null,
          shadow: Y
        }, {
          node: Y,
          shadow: null
        });
      }
    }
  };
  return e.sanitize = function(_) {
    let p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, k = null, $ = null, P = null, L = null;
    if (Qo = !_, Qo && (_ = "<!-->"), typeof _ != "string" && !_i(_) && (_ = bb(_), typeof _ != "string"))
      throw Ft("dirty is not a string, aborting");
    if (!e.isSupported) return _;
    xo ? (ue = Rr, ae = Mr) : vo(p), (te.uponSanitizeElement.length > 0 || te.uponSanitizeAttribute.length > 0) && (ue = Ge(ue)), te.uponSanitizeAttribute.length > 0 && (ae = Ge(ae)), e.removed = [];
    const B = yo && typeof _ != "string" && _i(_);
    let Y = [];
    const be = Pn;
    if (B) {
      hm(_);
      const je = z(_);
      if (typeof je == "string") {
        const Yn = de(je);
        if (!ue[Yn] || Pi[Yn])
          throw _o(_), Ft("root node is forbidden and cannot be sanitized in-place");
      }
      if (qr(_))
        throw _o(_), Ft("root node is clobbered and cannot be sanitized in-place");
      Y = To(_), Pn = Yo();
    } else if (_i(_))
      k = Ua("<!---->"), $ = k.ownerDocument.importNode(_, !0), $.nodeType === me.element && $.nodeName === "BODY" || $.nodeName === "HTML" ? k = $ : k.appendChild($), Ro(k);
    else {
      if (!jn && !Bt && !$n && _.indexOf("<") === -1) return R && jr ? it(_) : _;
      if (k = Ua(_), !k) return jn ? null : jr ? M : "";
    }
    k && ko && sn(k.firstChild);
    const yt = B ? _ : k;
    try {
      B && Ro(_);
      const je = Eo(yt);
      for (; P = je.nextNode(); )
        Zo(P, yt), Do(P, yt), on(P.content) && Ai(P.content);
      B && um(_, Y);
    } catch (je) {
      throw B && (_o(_), Na(_, Y)), je;
    } finally {
      Pn = be;
    }
    if (B) {
      if (Na(_, Y)) throw Ft("a node selected for removal could not be safely returned; refusing to sanitize in place");
      return Bt && Xo(_), _;
    }
    if (jn) {
      if (Bt && Xo(k), Lr)
        for (L = rt.call(k.ownerDocument); k.firstChild; ) L.appendChild(k.firstChild);
      else L = k;
      return (ae.shadowroot || ae.shadowrootmode) && (L = nn.call(i, L, !0)), L;
    }
    let Ze = $n ? k.outerHTML : k.innerHTML;
    return $n && ue["!doctype"] && k.ownerDocument && k.ownerDocument.doctype && k.ownerDocument.doctype.name && $e(Cb, k.ownerDocument.doctype.name) && (Ze = "<!DOCTYPE " + k.ownerDocument.doctype.name + `>
` + Ze), Bt && (Ze = Br(Ze)), R && jr ? it(Ze) : Ze;
  }, e.setConfig = function() {
    let _ = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    vo(_), xo = !0, Rr = ue, Mr = ae;
  }, e.clearConfig = function() {
    Bn = null, xo = !1, Rr = null, Mr = null, R = W, M = "";
  }, e.isValidAttribute = function(_, p, k) {
    Bn || vo({});
    const $ = de(_), P = de(p);
    return typeof k == "string" && (ec(p, k) || !bo && $e(Mc, k)) ? !1 : Ka($, P, k);
  }, e.addHook = function(_, p) {
    typeof p == "function" && Be(te, _) && Ti(te[_], p);
  }, e.removeHook = function(_, p) {
    if (Be(te, _)) {
      if (p !== void 0) {
        const k = hb(te[_], p);
        return k === -1 ? void 0 : db(te[_], k, 1)[0];
      }
      return Pc(te[_]);
    }
  }, e.removeHooks = function(_) {
    Be(te, _) && (te[_] = []);
  }, e.removeAllHooks = function() {
    te = Lc();
  }, e;
}
var Rb = yd();
const Iu = Rb(window);
Iu.addHook("uponSanitizeAttribute", (n, e) => {
  (e.attrName === "href" || e.attrName === "src") && (e.keepAttr = md(e.attrValue, n.nodeName === "IMG" ? "image" : "link"));
});
Iu.addHook("afterSanitizeAttributes", (n) => {
  n.nodeName === "IMG" && n.setAttribute("referrerpolicy", "no-referrer");
});
function Mb(n) {
  return Iu.sanitize(n, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "s",
      "a",
      "img",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "start"],
    ALLOW_DATA_ATTR: !1,
    ALLOW_ARIA_ATTR: !1
  });
}
const Qd = new ct({ html: !1, linkify: !1, typographer: !1 });
Qd.validateLink = (n) => md(n);
function eo(n) {
  return Mb(Qd.render(n));
}
function Lb(n, e) {
  let t = n.value, i = n.mode, r = n.readOnly, s = !1, o = !1, l;
  const u = [];
  function a(S, Q, y) {
    S.addEventListener(Q, y), u.push(() => S.removeEventListener(Q, y));
  }
  function c() {
    clearTimeout(l), l = void 0;
  }
  function h() {
    c();
    try {
      const S = eo(t);
      return e.preview.innerHTML = S, e.status.textContent = "Preview ready", S;
    } catch (S) {
      throw e.preview.replaceChildren(), e.status.textContent = "Unable to render preview. Check the document and try again.", S;
    }
  }
  function f() {
    c(), s || (l = setTimeout(h, 150));
  }
  function d() {
    e.count.textContent = `${t.length.toLocaleString()} characters`;
  }
  function O() {
    e.root.dataset.mode = i, e.sourcePanel.hidden = i === "preview", e.previewPanel.hidden = i === "source", e.source.readOnly = r;
    for (const [S, Q] of e.modeButtons) Q.setAttribute("aria-pressed", String(S === i));
    for (const S of e.commandButtons) S.disabled = r || i === "preview";
  }
  function m(S) {
    if (o || r || i === "preview" || s) return;
    const Q = If(t, e.source.selectionStart, e.source.selectionEnd, S);
    g(Q.value), !o && (e.source.focus(), e.source.setSelectionRange(Q.start, Q.end));
  }
  function g(S) {
    const Q = t !== S;
    t = S, e.source.value = t, d(), h(), Q && n.onChange?.(t);
  }
  e.source.value = t, d(), O(), h(), a(e.source, "input", () => {
    if (r || o) return;
    const S = e.source.value;
    S !== t && (t = S, d(), f(), n.onChange?.(t));
  }), a(e.source, "compositionstart", () => {
    s = !0, c();
  }), a(e.source, "compositionend", () => {
    s = !1, f();
  }), a(e.source, "keydown", (S) => {
    if (!(!(S instanceof KeyboardEvent) || S.isComposing || s || r) && (S.ctrlKey || S.metaKey) && !S.altKey && !S.shiftKey) {
      const Q = S.key.toLowerCase();
      (Q === "b" || Q === "i") && (S.preventDefault(), m(Q === "b" ? "bold" : "italic"));
    }
  });
  for (const S of e.commandButtons)
    a(S, "click", () => m(S.dataset.command || ""));
  for (const [S, Q] of e.modeButtons) a(Q, "click", () => w(S));
  let b = !1;
  a(e.root, "focusin", () => {
    b || (b = !0, n.onFocus?.());
  }), a(e.root, "focusout", () => {
    queueMicrotask(() => {
      !o && b && !e.root.contains(e.root.ownerDocument.activeElement) && (b = !1, n.onBlur?.());
    });
  });
  function w(S) {
    i = S, O();
  }
  return {
    getValue: () => t,
    setValue: g,
    getHTML: h,
    setMode: w,
    /** @param {boolean} next */
    setReadOnly(S) {
      r = S, O();
    },
    focus() {
      (i === "preview" ? e.preview : e.source).focus();
    },
    destroy() {
      o = !0, c(), u.forEach((S) => S());
    }
  };
}
const Bu = /* @__PURE__ */ new WeakSet();
function wd(n) {
  if (Bu.has(n)) throw new Error("An editor is already attached to this element");
}
function $d(n) {
  Bu.add(n);
}
function Pd(n) {
  Bu.delete(n);
}
function jb(n) {
  const e = qf(n), t = e.element;
  wd(t);
  const i = xm(e), r = Lb(e, i);
  $d(t), t.append(i.root);
  let s = !1;
  function o() {
    if (s) throw new Error("Markdown editor has been destroyed");
  }
  return {
    getValue() {
      return o(), r.getValue();
    },
    /** @param {string} value */
    setValue(l) {
      o(), Ss(l, "value"), r.setValue(l);
    },
    getHTML() {
      return o(), r.getHTML();
    },
    /** @param {import('./defaults.js').Mode} mode */
    setMode(l) {
      o(), Bf(l), r.setMode(l);
    },
    /** @param {boolean} readOnly */
    setReadOnly(l) {
      o(), Eu(l), r.setReadOnly(l);
    },
    focus() {
      o(), r.focus();
    },
    destroy() {
      s || (s = !0, r.destroy(), i.root.remove(), Pd(t));
    }
  };
}
let Dl = [], vd = [];
(() => {
  let n = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,1n,9,16,o,,x,1i,3,,i,,7,a,2,t,3,1k,,,7,2,2,2,3,9,,a,2,q,,2,3,1k,,,5,4,2,2,3,3,,u,2,3,,b,3,1k,,,8,,3,,3,k,2,m,6,,3,1k,,,7,2,2,2,3,7,3,a,2,u,,1n,5,3,3,,4,9,,14,5,1j,,,7,,3,,4,7,2,b,2,t,3,1k,,,7,,3,,4,7,2,b,2,f,,c,4,1j,2,,7,,3,,4,9,,a,2,t,3,1y,,4,6,,,,8,i,2,1p,,,8,c,8,2q,,,a,b,7,21,2,r,,,,,,4,2,1d,k,,2,5,b,,10,9,,2u,b,,6,n,4,4,3,g,4,d,,,3,6,,f,,jj,3,qa,4,s,3,t,2,u,2,1s,w,9,,19,3,,,39,2,y,,3a,c,4,c,63,5,1l,a,,,,,2,o,2,,1c,1a,2,c,k,5,1b,h,12,9,c,3,u,d,1k,e,1c,k,48,3,,l,4,,6,,2,3,5i,1s,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,n,5,4,,2b,2,1e,i,q,i,d,,12,8,p,d,18,4,1b,e,10,,1v,e,c,,8,2,1a,,1f,,,3,2,2,5,2,,,15,5,5,2,6k,8,,2,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,1t,5,8t,2,25,6,1y,b,1d,4,3e,3,1h,f,15,,2,2,a,4,19,b,7,,1p,3,10,e,g,2,18,,c,3,1c,e,8,4,,2,2k,c,6,,2,,4d,c,l,4,1j,2,,7,2,2,2,3,9,,a,2,2,7,3,5,1v,9,,,2,,,4,,5,,,e,2,2a,i,n,,29,k,6j,7,2,9,r,2,2a,h,2y,d,2t,3,2,a,74,f,6t,6,,2,2,4,,,,2,3x,7,2,7,3,,s,a,14,7,,4,8,,9,b,1a,g,5i,8,5j,8,,8,2a,m,,e,3e,6,3,,,2,,7,,,1u,5,,2,,5,9n,4,9,2,,,1c,7,3,5,n,,44l,,6,f,8ug,i,1xc,5,1n,7,t4,,,1j,7,4,29,,b,2,f57,2,3mp,1a,2,n,f2,5,3,6,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,2s,,4g,7,af,,1p,4,e4,4,72,2,6r,,2,,7,2,5,,d6,7,31,7,240,5".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < n.length; e++)
    (e % 2 ? vd : Dl).push(t = t + n[e]);
})();
function zb(n) {
  if (n < 768) return !1;
  for (let e = 0, t = Dl.length; ; ) {
    let i = e + t >> 1;
    if (n < Dl[i]) t = i;
    else if (n >= vd[i]) e = i + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function jc(n) {
  return n >= 127462 && n <= 127487;
}
const zc = 8205;
function Ib(n, e, t = !0, i = !0) {
  return (t ? _d : Bb)(n, e, i);
}
function _d(n, e, t) {
  if (e == n.length) return e;
  e && Ad(n.charCodeAt(e)) && Cd(n.charCodeAt(e - 1)) && e--;
  let i = el(n, e);
  for (e += Ic(i); e < n.length; ) {
    let r = el(n, e);
    if (i == zc || r == zc || t && zb(r))
      e += Ic(r), i = r;
    else if (jc(r)) {
      let s = 0, o = e - 2;
      for (; o >= 0 && jc(el(n, o)); )
        s++, o -= 2;
      if (s % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Bb(n, e, t) {
  for (; e > 1; ) {
    let i = _d(n, e - 2, t);
    if (i < e) return i;
    e--;
  }
  return 0;
}
function el(n, e) {
  let t = n.charCodeAt(e);
  if (!Cd(t) || e + 1 == n.length) return t;
  let i = n.charCodeAt(e + 1);
  return Ad(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function Ad(n) {
  return n >= 56320 && n < 57344;
}
function Cd(n) {
  return n >= 55296 && n < 56320;
}
function Ic(n) {
  return n < 65536 ? 1 : 2;
}
class U {
  /**
  Get the line description around the given position.
  */
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(e, t, i) {
    [e, t] = ui(this, e, t);
    let r = [];
    return this.decompose(
      0,
      e,
      r,
      2
      /* Open.To */
    ), i.length && i.decompose(
      0,
      i.length,
      r,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      r,
      1
      /* Open.From */
    ), vt.from(r, this.length - (t - e) + i.length);
  }
  /**
  Append another document to this one.
  */
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(e, t = this.length) {
    [e, t] = ui(this, e, t);
    let i = [];
    return this.decompose(e, t, i, 0), vt.from(i, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), r = new Wi(this), s = new Wi(e);
    for (let o = t, l = t; ; ) {
      if (r.next(o), s.next(o), o = 0, r.lineBreak != s.lineBreak || r.done != s.done || r.value != s.value)
        return !1;
      if (l += r.value.length, r.done || l >= i)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new Wi(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new Td(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let i;
    if (e == null)
      i = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let r = this.line(e).from;
      i = this.iterRange(r, Math.max(r, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new Ed(i);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? U.empty : e.length <= 32 ? new Oe(e) : vt.from(Oe.split(e, []));
  }
}
class Oe extends U {
  constructor(e, t = qb(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, i, r) {
    for (let s = 0; ; s++) {
      let o = this.text[s], l = r + o.length;
      if ((t ? i : l) >= e)
        return new Fb(r, l, i, o);
      r = l + 1, i++;
    }
  }
  decompose(e, t, i, r) {
    let s = e <= 0 && t >= this.length ? this : new Oe(Bc(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (r & 1) {
      let o = i.pop(), l = ds(s.text, o.text.slice(), 0, s.length);
      if (l.length <= 32)
        i.push(new Oe(l, o.length + s.length));
      else {
        let u = l.length >> 1;
        i.push(new Oe(l.slice(0, u)), new Oe(l.slice(u)));
      }
    } else
      i.push(s);
  }
  replace(e, t, i) {
    if (!(i instanceof Oe))
      return super.replace(e, t, i);
    [e, t] = ui(this, e, t);
    let r = ds(this.text, ds(i.text, Bc(this.text, 0, e)), t), s = this.length + i.length - (t - e);
    return r.length <= 32 ? new Oe(r, s) : vt.from(Oe.split(r, []), s);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = ui(this, e, t);
    let r = "";
    for (let s = 0, o = 0; s <= t && o < this.text.length; o++) {
      let l = this.text[o], u = s + l.length;
      s > e && o && (r += i), e < u && t > s && (r += l.slice(Math.max(0, e - s), t - s)), s = u + 1;
    }
    return r;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let i = [], r = -1;
    for (let s of e)
      i.push(s), r += s.length + 1, i.length == 32 && (t.push(new Oe(i, r)), i = [], r = -1);
    return r > -1 && t.push(new Oe(i, r)), t;
  }
}
class vt extends U {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let i of e)
      this.lines += i.lines;
  }
  lineInner(e, t, i, r) {
    for (let s = 0; ; s++) {
      let o = this.children[s], l = r + o.length, u = i + o.lines - 1;
      if ((t ? u : l) >= e)
        return o.lineInner(e, t, i, r);
      r = l + 1, i = u + 1;
    }
  }
  decompose(e, t, i, r) {
    for (let s = 0, o = 0; o <= t && s < this.children.length; s++) {
      let l = this.children[s], u = o + l.length;
      if (e <= u && t >= o) {
        let a = r & ((o <= e ? 1 : 0) | (u >= t ? 2 : 0));
        o >= e && u <= t && !a ? i.push(l) : l.decompose(e - o, t - o, i, a);
      }
      o = u + 1;
    }
  }
  replace(e, t, i) {
    if ([e, t] = ui(this, e, t), i.lines < this.lines)
      for (let r = 0, s = 0; r < this.children.length; r++) {
        let o = this.children[r], l = s + o.length;
        if (e >= s && t <= l) {
          let u = o.replace(e - s, t - s, i), a = this.lines - o.lines + u.lines;
          if (u.lines < a >> 4 && u.lines > a >> 6) {
            let c = this.children.slice();
            return c[r] = u, new vt(c, this.length - (t - e) + i.length);
          }
          return super.replace(s, l, u);
        }
        s = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = ui(this, e, t);
    let r = "";
    for (let s = 0, o = 0; s < this.children.length && o <= t; s++) {
      let l = this.children[s], u = o + l.length;
      o > e && s && (r += i), e < u && t > o && (r += l.sliceString(e - o, t - o, i)), o = u + 1;
    }
    return r;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof vt))
      return 0;
    let i = 0, [r, s, o, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; r += t, s += t) {
      if (r == o || s == l)
        return i;
      let u = this.children[r], a = e.children[s];
      if (u != a)
        return i + u.scanIdentical(a, t);
      i += u.length + 1;
    }
  }
  static from(e, t = e.reduce((i, r) => i + r.length + 1, -1)) {
    let i = 0;
    for (let d of e)
      i += d.lines;
    if (i < 32) {
      let d = [];
      for (let O of e)
        O.flatten(d);
      return new Oe(d, t);
    }
    let r = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), s = r << 1, o = r >> 1, l = [], u = 0, a = -1, c = [];
    function h(d) {
      let O;
      if (d.lines > s && d instanceof vt)
        for (let m of d.children)
          h(m);
      else d.lines > o && (u > o || !u) ? (f(), l.push(d)) : d instanceof Oe && u && (O = c[c.length - 1]) instanceof Oe && d.lines + O.lines <= 32 ? (u += d.lines, a += d.length + 1, c[c.length - 1] = new Oe(O.text.concat(d.text), O.length + 1 + d.length)) : (u + d.lines > r && f(), u += d.lines, a += d.length + 1, c.push(d));
    }
    function f() {
      u != 0 && (l.push(c.length == 1 ? c[0] : vt.from(c, a)), a = -1, u = c.length = 0);
    }
    for (let d of e)
      h(d);
    return f(), l.length == 1 ? l[0] : new vt(l, t);
  }
}
U.empty = /* @__PURE__ */ new Oe([""], 0);
function qb(n) {
  let e = -1;
  for (let t of n)
    e += t.length + 1;
  return e;
}
function ds(n, e, t = 0, i = 1e9) {
  for (let r = 0, s = 0, o = !0; s < n.length && r <= i; s++) {
    let l = n[s], u = r + l.length;
    u >= t && (u > i && (l = l.slice(0, i - r)), r < t && (l = l.slice(t - r)), o ? (e[e.length - 1] += l, o = !1) : e.push(l)), r = u + 1;
  }
  return e;
}
function Bc(n, e, t) {
  return ds(n, [""], e, t);
}
class Wi {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof Oe ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, r = this.nodes[i], s = this.offsets[i], o = s >> 1, l = r instanceof Oe ? r.text.length : r.children.length;
      if (o == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((s & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (r instanceof Oe) {
        let u = r.text[o + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, u.length > Math.max(0, e))
          return this.value = e == 0 ? u : t > 0 ? u.slice(e) : u.slice(0, u.length - e), this;
        e -= u.length;
      } else {
        let u = r.children[o + (t < 0 ? -1 : 0)];
        e > u.length ? (e -= u.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(u), this.offsets.push(t > 0 ? 1 : (u instanceof Oe ? u.text.length : u.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class Td {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new Wi(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let i = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > i && (e = i), i -= e;
    let { value: r } = this.cursor.next(e);
    return this.pos += (r.length + e) * t, this.value = r.length <= i ? r : t < 0 ? r.slice(r.length - i) : r.slice(0, i), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class Ed {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: i, value: r } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = r, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (U.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Wi.prototype[Symbol.iterator] = Td.prototype[Symbol.iterator] = Ed.prototype[Symbol.iterator] = function() {
  return this;
});
let Fb = class {
  /**
  @internal
  */
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.number = i, this.text = r;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
};
function ui(n, e, t) {
  return e = Math.max(0, Math.min(n.length, e)), [e, Math.max(e, Math.min(n.length, t))];
}
function Ce(n, e, t = !0, i = !0) {
  return Ib(n, e, t, i);
}
function Yb(n) {
  return n >= 56320 && n < 57344;
}
function Wb(n) {
  return n >= 55296 && n < 56320;
}
function Nb(n, e) {
  let t = n.charCodeAt(e);
  if (!Wb(t) || e + 1 == n.length)
    return t;
  let i = n.charCodeAt(e + 1);
  return Yb(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function Vb(n) {
  return n < 65536 ? 1 : 2;
}
const Rl = /\r\n?|\n/;
var Re = /* @__PURE__ */ (function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
})(Re || (Re = {}));
class Dt {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(e) {
    this.sections = e;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t + 1];
      e += i < 0 ? this.sections[t] : i;
    }
    return e;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(e) {
    for (let t = 0, i = 0, r = 0; t < this.sections.length; ) {
      let s = this.sections[t++], o = this.sections[t++];
      o < 0 ? (e(i, r, s), r += s) : r += o, i += s;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(e, t = !1) {
    Ml(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], r = this.sections[t++];
      r < 0 ? e.push(i, r) : e.push(r, i);
    }
    return new Dt(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : Xd(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Ll(this, e, t);
  }
  mapPos(e, t = -1, i = Re.Simple) {
    let r = 0, s = 0;
    for (let o = 0; o < this.sections.length; ) {
      let l = this.sections[o++], u = this.sections[o++], a = r + l;
      if (u < 0) {
        if (a > e)
          return s + (e - r);
        s += l;
      } else {
        if (i != Re.Simple && a >= e && (i == Re.TrackDel && r < e && a > e || i == Re.TrackBefore && r < e || i == Re.TrackAfter && a > e))
          return null;
        if (a > e || a == e && t < 0 && !l)
          return e == r || t < 0 ? s : s + u;
        s += u;
      }
      r = a;
    }
    if (e > r)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${r}`);
    return s;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(e, t = e) {
    for (let i = 0, r = 0; i < this.sections.length && r <= t; ) {
      let s = this.sections[i++], o = this.sections[i++], l = r + s;
      if (o >= 0 && r <= t && l >= e)
        return r < e && l > t ? "cover" : !0;
      r = l;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], r = this.sections[t++];
      e += (e ? " " : "") + i + (r >= 0 ? ":" + r : "");
    }
    return e;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new Dt(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new Dt(e);
  }
}
class xe extends Dt {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Ml(this, (t, i, r, s, o) => e = e.replace(r, r + (i - t), o), !1), e;
  }
  mapDesc(e, t = !1) {
    return Ll(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), i = [];
    for (let r = 0, s = 0; r < t.length; r += 2) {
      let o = t[r], l = t[r + 1];
      if (l >= 0) {
        t[r] = l, t[r + 1] = o;
        let u = r >> 1;
        for (; i.length < u; )
          i.push(U.empty);
        i.push(o ? e.slice(s, s + o) : U.empty);
      }
      s += o;
    }
    return new xe(t, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : Xd(this, e, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(e, t = !1) {
    return e.empty ? this : Ll(this, e, t, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(e, t = !1) {
    Ml(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return Dt.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], i = [], r = [], s = new or(this);
    e: for (let o = 0, l = 0; ; ) {
      let u = o == e.length ? 1e9 : e[o++];
      for (; l < u || l == u && s.len == 0; ) {
        if (s.done)
          break e;
        let c = Math.min(s.len, u - l);
        Ae(r, c, -1);
        let h = s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0;
        Ae(t, c, h), h > 0 && pn(i, t, s.text), s.forward(c), l += c;
      }
      let a = e[o++];
      for (; l < a; ) {
        if (s.done)
          break e;
        let c = Math.min(s.len, a - l);
        Ae(t, c, -1), Ae(r, c, s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0), s.forward(c), l += c;
      }
    }
    return {
      changes: new xe(t, i),
      filtered: Dt.create(r)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t], r = this.sections[t + 1];
      r < 0 ? e.push(i) : r == 0 ? e.push([i]) : e.push([i].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, i) {
    let r = [], s = [], o = 0, l = null;
    function u(c = !1) {
      if (!c && !r.length)
        return;
      o < t && Ae(r, t - o, -1);
      let h = new xe(r, s);
      l = l ? l.compose(h.map(l)) : h, r = [], s = [], o = 0;
    }
    function a(c) {
      if (Array.isArray(c))
        for (let h of c)
          a(h);
      else if (c instanceof xe) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        u(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: h, to: f = h, insert: d } = c;
        if (h > f || h < 0 || f > t)
          throw new RangeError(`Invalid change range ${h} to ${f} (in doc of length ${t})`);
        let O = d ? typeof d == "string" ? U.of(d.split(i || Rl)) : d : U.empty, m = O.length;
        if (h == f && m == 0)
          return;
        h < o && u(), h > o && Ae(r, h - o, -1), Ae(r, f - h, m), pn(s, r, O), o = f;
      }
    }
    return a(e), u(!l), l;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new xe(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], i = [];
    for (let r = 0; r < e.length; r++) {
      let s = e[r];
      if (typeof s == "number")
        t.push(s, -1);
      else {
        if (!Array.isArray(s) || typeof s[0] != "number" || s.some((o, l) => l && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (s.length == 1)
          t.push(s[0], 0);
        else {
          for (; i.length < r; )
            i.push(U.empty);
          i[r] = U.of(s.slice(1)), t.push(s[0], i[r].length);
        }
      }
    }
    return new xe(t, i);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new xe(e, t);
  }
}
function Ae(n, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let r = n.length - 2;
  r >= 0 && t <= 0 && t == n[r + 1] ? n[r] += e : r >= 0 && e == 0 && n[r] == 0 ? n[r + 1] += t : i ? (n[r] += e, n[r + 1] += t) : n.push(e, t);
}
function pn(n, e, t) {
  if (t.length == 0)
    return;
  let i = e.length - 2 >> 1;
  if (i < n.length)
    n[n.length - 1] = n[n.length - 1].append(t);
  else {
    for (; n.length < i; )
      n.push(U.empty);
    n.push(t);
  }
}
function Ml(n, e, t) {
  let i = n.inserted;
  for (let r = 0, s = 0, o = 0; o < n.sections.length; ) {
    let l = n.sections[o++], u = n.sections[o++];
    if (u < 0)
      r += l, s += l;
    else {
      let a = r, c = s, h = U.empty;
      for (; a += l, c += u, u && i && (h = h.append(i[o - 2 >> 1])), !(t || o == n.sections.length || n.sections[o + 1] < 0); )
        l = n.sections[o++], u = n.sections[o++];
      e(r, a, s, c, h), r = a, s = c;
    }
  }
}
function Ll(n, e, t, i = !1) {
  let r = [], s = i ? [] : null, o = new or(n), l = new or(e);
  for (let u = -1; ; ) {
    if (o.done && l.len || l.done && o.len)
      throw new Error("Mismatched change set lengths");
    if (o.ins == -1 && l.ins == -1) {
      let a = Math.min(o.len, l.len);
      Ae(r, a, -1), o.forward(a), l.forward(a);
    } else if (l.ins >= 0 && (o.ins < 0 || u == o.i || o.off == 0 && (l.len < o.len || l.len == o.len && !t))) {
      let a = l.len;
      for (Ae(r, l.ins, -1); a; ) {
        let c = Math.min(o.len, a);
        o.ins >= 0 && u < o.i && o.len <= c && (Ae(r, 0, o.ins), s && pn(s, r, o.text), u = o.i), o.forward(c), a -= c;
      }
      l.next();
    } else if (o.ins >= 0) {
      let a = 0, c = o.len;
      for (; c; )
        if (l.ins == -1) {
          let h = Math.min(c, l.len);
          a += h, c -= h, l.forward(h);
        } else if (l.ins == 0 && l.len < c)
          c -= l.len, l.next();
        else
          break;
      Ae(r, a, u < o.i ? o.ins : 0), s && u < o.i && pn(s, r, o.text), u = o.i, o.forward(o.len - c);
    } else {
      if (o.done && l.done)
        return s ? xe.createSet(r, s) : Dt.create(r);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function Xd(n, e, t = !1) {
  let i = [], r = t ? [] : null, s = new or(n), o = new or(e);
  for (let l = !1; ; ) {
    if (s.done && o.done)
      return r ? xe.createSet(i, r) : Dt.create(i);
    if (s.ins == 0)
      Ae(i, s.len, 0, l), s.next();
    else if (o.len == 0 && !o.done)
      Ae(i, 0, o.ins, l), r && pn(r, i, o.text), o.next();
    else {
      if (s.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let u = Math.min(s.len2, o.len), a = i.length;
        if (s.ins == -1) {
          let c = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          Ae(i, u, c, l), r && c && pn(r, i, o.text);
        } else o.ins == -1 ? (Ae(i, s.off ? 0 : s.len, u, l), r && pn(r, i, s.textBit(u))) : (Ae(i, s.off ? 0 : s.len, o.off ? 0 : o.ins, l), r && !o.off && pn(r, i, o.text));
        l = (s.ins > u || o.ins >= 0 && o.len > u) && (l || i.length > a), s.forward2(u), o.forward(u);
      }
    }
  }
}
class or {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? U.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, i = this.i - 2 >> 1;
    return i >= t.length && !e ? U.empty : t[i].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class fn {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.flags = i, this.goalColumn = r;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  A flag that, when set, makes some selection-extending commands
  treat the range's head and anchor as exchangeable, so that for
  example Shift-ArrowUp will make the lower side of the selection
  the anchor, even if that was the head before. Used to implement
  MacOS-style undirectional selections.
  */
  get undirectional() {
    return (this.flags & 64) > 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let e = this.flags & 7;
    return e == 7 ? null : e;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(e, t = -1) {
    let i, r;
    return this.empty ? i = r = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), r = e.mapPos(this.to, -1)), i == this.from && r == this.to ? this : new fn(i, r, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, i = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return v.range(e, t, void 0, void 0, i);
    let r = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return v.range(this.anchor, r, void 0, void 0, i);
  }
  /**
  Compare this range to another range.
  */
  eq(e, t = !1) {
    return this.anchor == e.anchor && this.head == e.head && this.goalColumn == e.goalColumn && (!t || !this.empty || this.assoc == e.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return v.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, i, r) {
    return new fn(e, t, i, r);
  }
}
class v {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : v.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(e, t = !1) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(e.ranges[i], t))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new v([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return v.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, v.create(i, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new v(e.ranges.map((t) => fn.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new v([v.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, r = 0; r < e.length; r++) {
      let s = e[r];
      if (s.empty ? s.from <= i : s.from < i)
        return v.normalized(e.slice(), t);
      i = s.to;
    }
    return new v(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, i, r) {
    return fn.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)), r);
  }
  /**
  Create a selection range.
  */
  static range(e, t, i, r, s) {
    let o = r == null ? 7 : Math.min(6, r);
    return !s && e != t && (s = t < e ? 1 : -1), s && (o |= s < 0 ? 8 : 16), t < e ? fn.create(t, e, o | 32, i) : fn.create(e, t, o, i);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return fn.create(e, t, 64, void 0);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let i = e[t];
    e.sort((r, s) => r.from - s.from), t = e.indexOf(i);
    for (let r = 1; r < e.length; r++) {
      let s = e[r], o = e[r - 1];
      if (s.empty ? s.from <= o.to : s.from < o.to) {
        let l = o.from, u = Math.max(s.to, o.to);
        r <= t && t--, e.splice(--r, 2, s.anchor > s.head ? v.range(u, l) : v.range(l, u));
      }
    }
    return new v(e, t);
  }
}
function Zd(n, e) {
  for (let t of n.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let qu = 0;
class I {
  constructor(e, t, i, r, s) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = r, this.id = qu++, this.default = e([]), this.extensions = typeof s == "function" ? s(this) : s;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(e = {}) {
    return new I(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : Fu), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Os([], this, 0, e);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Os(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Os(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function Fu(n, e) {
  return n == e || n.length == e.length && n.every((t, i) => t === e[i]);
}
class Os {
  constructor(e, t, i, r) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = r, this.id = qu++;
  }
  dynamicSlot(e) {
    var t;
    let i = this.value, r = this.facet.compareInput, s = this.id, o = e[s] >> 1, l = this.type == 2, u = !1, a = !1, c = [];
    for (let h of this.dependencies)
      h == "doc" ? u = !0 : h == "selection" ? a = !0 : (((t = e[h.id]) !== null && t !== void 0 ? t : 1) & 1) == 0 && c.push(e[h.id]);
    return {
      create(h) {
        return h.values[o] = i(h), 1;
      },
      update(h, f) {
        if (u && f.docChanged || a && (f.docChanged || f.selection) || jl(h, c)) {
          let d = i(h);
          if (l ? !qc(d, h.values[o], r) : !r(d, h.values[o]))
            return h.values[o] = d, 1;
        }
        return 0;
      },
      reconfigure: (h, f) => {
        let d, O = f.config.address[s];
        if (O != null) {
          let m = $s(f, O);
          if (this.dependencies.every((g) => g instanceof I ? f.facet(g) === h.facet(g) : g instanceof jt ? f.field(g, !1) == h.field(g, !1) : !0) || (l ? qc(d = i(h), m, r) : r(d = i(h), m)))
            return h.values[o] = m, 0;
        } else
          d = i(h);
        return h.values[o] = d, 1;
      }
    };
  }
  get extension() {
    return this;
  }
}
function qc(n, e, t) {
  if (n.length != e.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!t(n[i], e[i]))
      return !1;
  return !0;
}
function jl(n, e) {
  let t = !1;
  for (let i of e)
    Ni(n, i) & 1 && (t = !0);
  return t;
}
function Ub(n, e, t) {
  let i = t.map((u) => n[u.id]), r = t.map((u) => u.type), s = i.filter((u) => !(u & 1)), o = n[e.id] >> 1;
  function l(u) {
    let a = [];
    for (let c = 0; c < i.length; c++) {
      let h = $s(u, i[c]);
      if (r[c] == 2)
        for (let f of h)
          a.push(f);
      else
        a.push(h);
    }
    return e.combine(a);
  }
  return {
    create(u) {
      for (let a of i)
        Ni(u, a);
      return u.values[o] = l(u), 1;
    },
    update(u, a) {
      if (!jl(u, s))
        return 0;
      let c = l(u);
      return e.compare(c, u.values[o]) ? 0 : (u.values[o] = c, 1);
    },
    reconfigure(u, a) {
      let c = jl(u, i), h = a.config.facets[e.id], f = a.facet(e);
      if (h && !c && Fu(t, h))
        return u.values[o] = f, 0;
      let d = l(u);
      return e.compare(d, f) ? (u.values[o] = f, 0) : (u.values[o] = d, 1);
    }
  };
}
const Ur = /* @__PURE__ */ I.define({ static: !0 });
class jt {
  constructor(e, t, i, r, s) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = r, this.spec = s, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new jt(qu++, e.create, e.update, e.compare || ((i, r) => i === r), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Ur).find((i) => i.field == this);
    return (t?.create || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (i) => (i.values[t] = this.create(i), 1),
      update: (i, r) => {
        let s = i.values[t], o = this.updateF(s, r);
        return this.compareF(s, o) ? 0 : (i.values[t] = o, 1);
      },
      reconfigure: (i, r) => {
        let s = i.facet(Ur), o = r.facet(Ur), l;
        return (l = s.find((u) => u.field == this)) && l != o.find((u) => u.field == this) ? (i.values[t] = l.create(i), 1) : r.config.address[this.id] != null ? (i.values[t] = r.field(this), 0) : (i.values[t] = this.create(i), 1);
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, Ur.of({ field: this, create: e })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const En = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function Di(n) {
  return (e) => new Dd(e, n);
}
const to = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ Di(En.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ Di(En.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ Di(En.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ Di(En.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ Di(En.lowest)
};
class Dd {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class wr {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new zl(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return wr.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class zl {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class ws {
  constructor(e, t, i, r, s, o) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = i, this.address = r, this.staticValues = s, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, i) {
    let r = [], s = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let f of Gb(e, t, o))
      f instanceof jt ? r.push(f) : (s[f.facet.id] || (s[f.facet.id] = [])).push(f);
    let l = /* @__PURE__ */ Object.create(null), u = [], a = [];
    for (let f of r)
      l[f.id] = a.length << 1, a.push((d) => f.slot(d));
    let c = i?.config.facets;
    for (let f in s) {
      let d = s[f], O = d[0].facet, m = c && c[f] || [];
      if (d.every(
        (g) => g.type == 0
        /* Provider.Static */
      ))
        if (l[O.id] = u.length << 1 | 1, Fu(m, d))
          u.push(i.facet(O));
        else {
          let g = O.combine(d.map((b) => b.value));
          u.push(i && O.compare(g, i.facet(O)) ? i.facet(O) : g);
        }
      else {
        for (let g of d)
          g.type == 0 ? (l[g.id] = u.length << 1 | 1, u.push(g.value)) : (l[g.id] = a.length << 1, a.push((b) => g.dynamicSlot(b)));
        l[O.id] = a.length << 1, a.push((g) => Ub(g, O, d));
      }
    }
    let h = a.map((f) => f(l));
    return new ws(e, o, h, l, u, s);
  }
}
function Gb(n, e, t) {
  let i = [[], [], [], [], []], r = /* @__PURE__ */ new Map();
  function s(o, l) {
    let u = r.get(o);
    if (u != null) {
      if (u <= l)
        return;
      let a = i[u].indexOf(o);
      a > -1 && i[u].splice(a, 1), o instanceof zl && t.delete(o.compartment);
    }
    if (r.set(o, l), Array.isArray(o))
      for (let a of o)
        s(a, l);
    else if (o instanceof zl) {
      if (t.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let a = e.get(o.compartment) || o.inner;
      t.set(o.compartment, a), s(a, l);
    } else if (o instanceof Dd)
      s(o.inner, o.prec);
    else if (o instanceof jt)
      i[l].push(o), o.provides && s(o.provides, l);
    else if (o instanceof Os)
      i[l].push(o), o.facet.extensions && s(o.facet.extensions, En.default);
    else {
      let a = o.extension;
      if (!a)
        throw new Error(`Unrecognized extension value in extension set (${o}).`);
      if (a == o)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      s(a, l);
    }
  }
  return s(n, En.default), i.reduce((o, l) => o.concat(l));
}
function Ni(n, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, i = n.status[t];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  n.status[t] = 4;
  let r = n.computeSlot(n, n.config.dynamicSlots[t]);
  return n.status[t] = 2 | r;
}
function $s(n, e) {
  return e & 1 ? n.config.staticValues[e >> 1] : n.values[e >> 1];
}
const Rd = /* @__PURE__ */ I.define(), Il = /* @__PURE__ */ I.define({
  combine: (n) => n.some((e) => e),
  static: !0
}), Md = /* @__PURE__ */ I.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), Ld = /* @__PURE__ */ I.define(), jd = /* @__PURE__ */ I.define(), zd = /* @__PURE__ */ I.define(), Id = /* @__PURE__ */ I.define({
  combine: (n) => n.length ? n[0] : !1
});
class en {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new Hb();
  }
}
class Hb {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new en(this, e);
  }
}
class Kb {
  /**
  @internal
  */
  constructor(e) {
    this.map = e;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(e) {
    return new le(this, e);
  }
}
class le {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new le(this.type, t);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(e) {
    return this.type == e;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(e = {}) {
    return new Kb(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let i = [];
    for (let r of e) {
      let s = r.map(t);
      s && i.push(s);
    }
    return i;
  }
}
le.reconfigure = /* @__PURE__ */ le.define();
le.appendConfig = /* @__PURE__ */ le.define();
class ge {
  constructor(e, t, i, r, s, o) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = r, this.annotations = s, this.scrollIntoView = o, this._doc = null, this._state = null, i && Zd(i, t.newLength), s.some((l) => l.type == ge.time) || (this.annotations = s.concat(ge.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, i, r, s, o) {
    return new ge(e, t, i, r, s, o);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(e) {
    let t = this.annotation(ge.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
ge.time = /* @__PURE__ */ en.define();
ge.userEvent = /* @__PURE__ */ en.define();
ge.addToHistory = /* @__PURE__ */ en.define();
ge.remote = /* @__PURE__ */ en.define();
function Jb(n, e) {
  let t = [];
  for (let i = 0, r = 0; ; ) {
    let s, o;
    if (i < n.length && (r == e.length || e[r] >= n[i]))
      s = n[i++], o = n[i++];
    else if (r < e.length)
      s = e[r++], o = e[r++];
    else
      return t;
    !t.length || t[t.length - 1] < s ? t.push(s, o) : t[t.length - 1] < o && (t[t.length - 1] = o);
  }
}
function Bd(n, e, t) {
  var i;
  let r, s, o;
  return t ? (r = e.changes, s = xe.empty(e.changes.length), o = n.changes.compose(e.changes)) : (r = e.changes.map(n.changes), s = n.changes.mapDesc(e.changes, !0), o = n.changes.compose(r)), {
    changes: o,
    selection: e.selection ? e.selection.map(s) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(r),
    effects: le.mapEffects(n.effects, r).concat(le.mapEffects(e.effects, s)),
    annotations: n.annotations.length ? n.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: n.scrollIntoView || e.scrollIntoView
  };
}
function Bl(n, e, t) {
  let i = e.selection, r = ei(e.annotations);
  return e.userEvent && (r = r.concat(ge.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof xe ? e.changes : xe.of(e.changes || [], t, n.facet(Md)),
    selection: i && (i instanceof v ? i : v.single(i.anchor, i.head)),
    effects: ei(e.effects),
    annotations: r,
    scrollIntoView: !!e.scrollIntoView
  };
}
function qd(n, e, t) {
  let i = Bl(n, e.length ? e[0] : {}, n.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let s = 1; s < e.length; s++) {
    e[s].filter === !1 && (t = !1);
    let o = !!e[s].sequential;
    i = Bd(i, Bl(n, e[s], o ? i.changes.newLength : n.doc.length), o);
  }
  let r = ge.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return t2(t ? e2(r) : r);
}
function e2(n) {
  let e = n.startState, t = !0;
  for (let r of e.facet(Ld)) {
    let s = r(n);
    if (s === !1) {
      t = !1;
      break;
    }
    Array.isArray(s) && (t = t === !0 ? s : Jb(t, s));
  }
  if (t !== !0) {
    let r, s;
    if (t === !1)
      s = n.changes.invertedDesc, r = xe.empty(e.doc.length);
    else {
      let o = n.changes.filter(t);
      r = o.changes, s = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    n = ge.create(e, r, n.selection && n.selection.map(s), le.mapEffects(n.effects, s), n.annotations, n.scrollIntoView);
  }
  let i = e.facet(jd);
  for (let r = i.length - 1; r >= 0; r--) {
    let s = i[r](n);
    s instanceof ge ? n = s : Array.isArray(s) && s.length == 1 && s[0] instanceof ge ? n = s[0] : n = qd(e, ei(s), !1);
  }
  return n;
}
function t2(n) {
  let e = n.startState, t = e.facet(zd), i = n;
  for (let r = t.length - 1; r >= 0; r--) {
    let s = t[r](n);
    s && Object.keys(s).length && (i = Bd(i, Bl(e, s, n.changes.newLength), !0));
  }
  return i == n ? n : ge.create(e, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const n2 = [];
function ei(n) {
  return n == null ? n2 : Array.isArray(n) ? n : [n];
}
var Ut = /* @__PURE__ */ (function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
})(Ut || (Ut = {}));
const i2 = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let ql;
try {
  ql = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function r2(n) {
  if (ql)
    return ql.test(n);
  for (let e = 0; e < n.length; e++) {
    let t = n[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || i2.test(t)))
      return !0;
  }
  return !1;
}
function s2(n) {
  return (e) => {
    if (!/\S/.test(e))
      return Ut.Space;
    if (r2(e))
      return Ut.Word;
    for (let t = 0; t < n.length; t++)
      if (e.indexOf(n[t]) > -1)
        return Ut.Word;
    return Ut.Other;
  };
}
class H {
  constructor(e, t, i, r, s, o) {
    this.config = e, this.doc = t, this.selection = i, this.values = r, this.status = e.statusTemplate.slice(), this.computeSlot = s, o && (o._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      Ni(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return Ni(this, i), $s(this, i);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...e) {
    return qd(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: r } = t;
    for (let l of e.effects)
      l.is(wr.reconfigure) ? (t && (r = /* @__PURE__ */ new Map(), t.compartments.forEach((u, a) => r.set(a, u)), t = null), r.set(l.value.compartment, l.value.extension)) : l.is(le.reconfigure) ? (t = null, i = l.value) : l.is(le.appendConfig) && (t = null, i = ei(i).concat(l.value));
    let s;
    t ? s = e.startState.values.slice() : (t = ws.resolve(i, r, this), s = new H(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (u, a) => a.reconfigure(u, this), null).values);
    let o = e.startState.facet(Il) ? e.newSelection : e.newSelection.asSingle();
    new H(t, e.newDoc, o, s, (l, u) => u.update(l, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: v.cursor(t.from + e.length, -1)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(e) {
    let t = this.selection, i = e(t.ranges[0]), r = this.changes(i.changes), s = [i.range], o = ei(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let u = e(t.ranges[l]), a = this.changes(u.changes), c = a.map(r);
      for (let f = 0; f < l; f++)
        s[f] = s[f].map(c);
      let h = r.mapDesc(a, !0);
      s.push(u.range.map(h)), r = r.compose(c), o = le.mapEffects(o, c).concat(le.mapEffects(ei(u.effects), h));
    }
    return {
      changes: r,
      selection: v.create(s, t.mainIndex),
      effects: o
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof xe ? e : xe.of(e, this.doc.length, this.facet(H.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return U.of(e.split(this.facet(H.lineSeparator) || Rl));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (Ni(this, t), $s(this, t));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let i in e) {
        let r = e[i];
        r instanceof jt && this.config.address[r.id] != null && (t[i] = r.spec.toJSON(this.field(e[i]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, i) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let r = [];
    if (i) {
      for (let s in i)
        if (Object.prototype.hasOwnProperty.call(e, s)) {
          let o = i[s], l = e[s];
          r.push(o.init((u) => o.spec.fromJSON(l, u)));
        }
    }
    return H.create({
      doc: e.doc,
      selection: v.fromJSON(e.selection),
      extensions: t.extensions ? r.concat([t.extensions]) : r
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = ws.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof U ? e.doc : U.of((e.doc || "").split(t.staticFacet(H.lineSeparator) || Rl)), r = e.selection ? e.selection instanceof v ? e.selection : v.single(e.selection.anchor, e.selection.head) : v.single(0);
    return Zd(r, i.length), t.staticFacet(Il) || (r = r.asSingle()), new H(t, i, r, t.dynamicSlots.map(() => null), (s, o) => o.create(s), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(H.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(H.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(Id);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(e, ...t) {
    for (let i of this.facet(H.phrases))
      if (Object.prototype.hasOwnProperty.call(i, e)) {
        e = i[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (i, r) => {
      if (r == "$")
        return "$";
      let s = +(r || 1);
      return !s || s > t.length ? i : t[s - 1];
    })), e;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(e, t, i = -1) {
    let r = [];
    for (let s of this.facet(Rd))
      for (let o of s(this, t, i))
        Object.prototype.hasOwnProperty.call(o, e) && r.push(o[e]);
    return r;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(e) {
    let t = this.languageDataAt("wordChars", e);
    return s2(t.length ? t[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: i, length: r } = this.doc.lineAt(e), s = this.charCategorizer(e), o = e - i, l = e - i;
    for (; o > 0; ) {
      let u = Ce(t, o, !1);
      if (s(t.slice(u, o)) != Ut.Word)
        break;
      o = u;
    }
    for (; l < r; ) {
      let u = Ce(t, l);
      if (s(t.slice(l, u)) != Ut.Word)
        break;
      l = u;
    }
    return o == l ? null : v.range(o + i, l + i);
  }
}
H.allowMultipleSelections = Il;
H.tabSize = /* @__PURE__ */ I.define({
  combine: (n) => n.length ? n[0] : 4
});
H.lineSeparator = Md;
H.readOnly = Id;
H.phrases = /* @__PURE__ */ I.define({
  compare(n, e) {
    let t = Object.keys(n), i = Object.keys(e);
    return t.length == i.length && t.every((r) => n[r] == e[r]);
  }
});
H.languageData = Rd;
H.changeFilter = Ld;
H.transactionFilter = jd;
H.transactionExtender = zd;
wr.reconfigure = /* @__PURE__ */ le.define();
function o2(n, e, t = {}) {
  let i = {};
  for (let r of n)
    for (let s of Object.keys(r)) {
      let o = r[s], l = i[s];
      if (l === void 0)
        i[s] = o;
      else if (!(l === o || o === void 0)) if (Object.hasOwnProperty.call(t, s))
        i[s] = t[s](l, o);
      else
        throw new Error("Config merge conflict for field " + s);
    }
  for (let r in e)
    i[r] === void 0 && (i[r] = e[r]);
  return i;
}
class gn {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(e) {
    return this == e;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(e, t = e) {
    return Fl.create(e, t, this);
  }
}
gn.prototype.startSide = gn.prototype.endSide = 0;
gn.prototype.point = !1;
gn.prototype.mapMode = Re.TrackDel;
function Yu(n, e) {
  return n == e || n.constructor == e.constructor && n.eq(e);
}
let Fl = class Fd {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new Fd(e, t, i);
  }
};
function Yl(n, e) {
  return n.from - e.from || n.value.startSide - e.value.startSide;
}
class Wu {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = r;
  }
  get length() {
    return Nn(this.to);
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, i, r = 0) {
    let s = i ? this.to : this.from;
    for (let o = r, l = s.length; ; ) {
      if (o == l)
        return o;
      let u = o + l >> 1, a = s[u] - e || (i ? this.value[u].endSide : this.value[u].startSide) - t;
      if (u == o)
        return a >= 0 ? o : l;
      a >= 0 ? l = u : o = u + 1;
    }
  }
  between(e, t, i, r) {
    for (let s = this.findIndex(t, -1e9, !0), o = this.findIndex(i, 1e9, !1, s); s < o; s++)
      if (r(this.from[s] + e, this.to[s] + e, this.value[s]) === !1)
        return !1;
  }
  map(e, t, i, r, s) {
    let o = [], l = [], u = [], a = -1, c = -1;
    e: for (let h = 0; h < this.value.length; h++) {
      let f = this.value[h], d = this.from[h] + e, O = this.to[h] + e, m, g;
      if (d == O) {
        let b = t.mapPos(d, f.startSide, f.mapMode);
        if (b == null || (m = g = b, f.startSide != f.endSide && (g = t.mapPos(d, f.endSide), g < m)))
          continue;
      } else if (m = t.mapPos(d, f.startSide), g = t.mapPos(O, f.endSide), m > g || m == g && f.startSide > 0 && f.endSide <= 0)
        continue;
      if (!((g - m || f.endSide - f.startSide) < 0))
        if (a < 0 && (a = m), f.point && (c = Math.max(c, g - m)), (m - i || f.startSide - r) >= 0)
          o.push(f), l.push(m - a), u.push(g - a), i = g, r = f.endSide;
        else {
          if (m == g)
            for (let b = o.length; b > 0; b--) {
              if ((m - (u[b - 1] + a) || f.startSide - o[b - 1].endSide) >= 0) {
                o.splice(b, 0, f), l.splice(b, 0, m - a), u.splice(b, 0, g - a);
                continue e;
              }
              if ((m - (l[b - 1] + a) || f.endSide - o[b - 1].startSide) > 0)
                break;
            }
          s(m, g, f);
        }
    }
    return { mapped: o.length ? new Wu(l, u, o, c) : null, pos: a };
  }
}
class ie {
  constructor(e, t, i, r) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = r;
  }
  /**
  @internal
  */
  static create(e, t, i, r) {
    return new ie(e, t, i, r);
  }
  /**
  @internal
  */
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  /**
  @internal
  */
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(e) {
    let { add: t = [], sort: i = !1, filterFrom: r = 0, filterTo: s = this.length } = e, o = e.filter;
    if (t.length == 0 && !o)
      return this;
    if (i && (t = t.slice().sort(Yl)), this.isEmpty)
      return t.length ? ie.of(t) : this;
    let l = new Yd(this, null, -1).goto(0), u = 0, a = [], c = new Vi();
    for (; l.value || u < t.length; )
      if (u < t.length && (l.from - t[u].from || l.startSide - t[u].value.startSide) >= 0) {
        let h = t[u++];
        c.addInner(h.from, h.to, h.value, !1) || a.push(h);
      } else l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (u == t.length || this.chunkEnd(l.chunkIndex) < t[u].from) && (!o || r > this.chunkEnd(l.chunkIndex) || s < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!o || r > l.to || s < l.from || o(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value, !1) || a.push(Fl.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !a.length ? ie.empty : this.nextLayer.update({ add: a, filter: o, filterFrom: r, filterTo: s }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], r = -1, s, o = (u, a, c) => {
      s || (s = new Vi()), s.addRange(u, a, c, !1);
    };
    for (let u = 0; u < this.chunk.length; u++) {
      let a = this.chunkPos[u], c = this.chunk[u], h = e.touchesRange(a, a + c.length);
      if (h === !1)
        r = Math.max(r, c.maxPoint), t.push(c), i.push(e.mapPos(a));
      else if (h === !0) {
        let [f, d] = t.length ? [Nn(i) + Nn(t).length, Nn(Nn(t).value).endSide] : [-1, -1], { mapped: O, pos: m } = c.map(a, e, f, d, o);
        O && (r = Math.max(r, O.maxPoint), t.push(O), i.push(m));
      }
    }
    let l = this.nextLayer.map(e);
    return s && (l = s.finishInner(l)), t.length == 0 ? l : new ie(i, t, l || ie.empty, r);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, i) {
    if (!this.isEmpty) {
      for (let r = 0; r < this.chunk.length; r++) {
        let s = this.chunkPos[r], o = this.chunk[r];
        if (t >= s && e <= s + o.length && o.between(s, e - s, t - s, i) === !1)
          return;
      }
      this.nextLayer.between(e, t, i);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return lr.from([this]).goto(e);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(e, t = 0) {
    return lr.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, i, r, s = -1) {
    let o = e.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= s), l = t.filter((h) => h.maxPoint > 0 || !h.isEmpty && h.maxPoint >= s), u = Fc(o, l, i), a = new Ri(o, u, s), c = new Ri(l, u, s);
    i.iterGaps((h, f, d) => Yc(a, h, c, f, d, r)), i.empty && i.length == 0 && Yc(a, 0, c, 0, 0, r);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, i = 0, r) {
    r == null && (r = 999999999);
    let s = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), o = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (s.length != o.length)
      return !1;
    if (!s.length)
      return !0;
    let l = Fc(s, o), u = new Ri(s, l, 0).goto(i), a = new Ri(o, l, 0).goto(i);
    for (; ; ) {
      if (u.to != a.to || !Wl(u.active, a.active) || u.point && (!a.point || !Yu(u.point, a.point)))
        return !1;
      if (u.to > r)
        return !0;
      u.next(), a.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(e, t, i, r, s = -1) {
    let o = new Ri(e, null, s).goto(t), l = t, u = o.openStart;
    for (; ; ) {
      let a = Math.min(o.to, i);
      if (o.point) {
        let c = o.activeForPoint(o.to), h = o.pointFrom < t ? c.length + 1 : o.point.startSide < 0 ? c.length : Math.min(c.length, u);
        r.point(l, a, o.point, c, h, o.pointRank), u = Math.min(o.openEnd(a), c.length);
      } else a > l && (r.span(l, a, o.active, u), u = o.openEnd(a));
      if (o.to > i)
        return u + (o.point && o.to > i ? 1 : 0);
      l = o.to, o.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(e, t = !1) {
    let i = new Vi();
    for (let r of e instanceof Fl ? [e] : t ? l2(e) : e)
      i.add(r.from, r.to, r.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return ie.empty;
    let t = Nn(e);
    for (let i = e.length - 2; i >= 0; i--)
      for (let r = e[i]; r != ie.empty; r = r.nextLayer)
        t = new ie(r.chunkPos, r.chunk, t, Math.max(r.maxPoint, t.maxPoint));
    return t;
  }
}
ie.empty = /* @__PURE__ */ new ie([], [], null, -1);
function Nn(n) {
  return n[n.length - 1];
}
function l2(n) {
  if (n.length > 1)
    for (let e = n[0], t = 1; t < n.length; t++) {
      let i = n[t];
      if (Yl(e, i) > 0)
        return n.slice().sort(Yl);
      e = i;
    }
  return n;
}
ie.empty.nextLayer = ie.empty;
class Vi {
  finishChunk(e) {
    this.chunks.push(new Wu(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(e, t, i) {
    this.addRange(e, t, i, !0);
  }
  /**
  @internal
  */
  addRange(e, t, i, r) {
    this.addInner(e, t, i, r) || (this.nextLayer || (this.nextLayer = new Vi())).addRange(e, t, i, r);
  }
  /**
  @internal
  */
  addInner(e, t, i, r) {
    let s = e - this.lastTo || i.startSide - this.last.endSide;
    if (r && s <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return s < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = i, this.lastFrom = e, this.lastTo = t, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let i = t.value.length - 1;
    return this.last = t.value[i], this.lastFrom = t.from[i] + e, this.lastTo = t.to[i] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(ie.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = ie.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function Fc(n, e, t) {
  let i = /* @__PURE__ */ new Map();
  for (let s of n)
    for (let o = 0; o < s.chunk.length; o++)
      s.chunk[o].maxPoint <= 0 && i.set(s.chunk[o], s.chunkPos[o]);
  let r = /* @__PURE__ */ new Set();
  for (let s of e)
    for (let o = 0; o < s.chunk.length; o++) {
      let l = i.get(s.chunk[o]);
      l != null && (t ? t.mapPos(l) : l) == s.chunkPos[o] && !t?.touchesRange(l, l + s.chunk[o].length) && r.add(s.chunk[o]);
    }
  return r;
}
class Yd {
  constructor(e, t, i, r = 0) {
    this.layer = e, this.skip = t, this.minPoint = i, this.rank = r;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let r = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(r) || this.layer.chunkEnd(this.chunkIndex) < e || r.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let r = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!i || this.rangeIndex < r) && this.setRangeIndex(r);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], i = e + t.from[this.rangeIndex];
        if (this.from = i, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class lr {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let r = [];
    for (let s = 0; s < e.length; s++)
      for (let o = e[s]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && r.push(new Yd(o, t, i, s));
    return r.length == 1 ? r[0] : new lr(r);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      tl(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      tl(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), tl(this.heap, 0);
    }
  }
}
function tl(n, e) {
  for (let t = n[e]; ; ) {
    let i = (e << 1) + 1;
    if (i >= n.length)
      break;
    let r = n[i];
    if (i + 1 < n.length && r.compare(n[i + 1]) >= 0 && (r = n[i + 1], i++), t.compare(r) < 0)
      break;
    n[i] = t, n[e] = r, e = i;
  }
}
class Ri {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = lr.from(e, t, i);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    Gr(this.active, e), Gr(this.activeTo, e), Gr(this.activeRank, e), this.minActive = Wc(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: r, rank: s } = this.cursor;
    for (; t < this.activeRank.length && (s - this.activeRank[t] || r - this.activeTo[t]) > 0; )
      t++;
    Hr(this.active, t, i), Hr(this.activeTo, t, r), Hr(this.activeRank, t, s), e && Hr(e, t, this.cursor.from), this.minActive = Wc(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let r = this.minActive;
      if (r > -1 && (this.activeTo[r] - this.cursor.from || this.active[r].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[r] > e) {
          this.to = this.activeTo[r], this.endSide = this.active[r].endSide;
          break;
        }
        this.removeActive(r), i && Gr(i, r);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let s = this.cursor.value;
          if (!s.point)
            this.addActive(i), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = s, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = s.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      this.openStart = 0;
      for (let r = i.length - 1; r >= 0 && i[r] < e; r--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > e || this.activeTo[i] == e && this.active[i].endSide >= this.point.endSide) && t.push(this.active[i]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > e; i--)
      t++;
    return t;
  }
}
function Yc(n, e, t, i, r, s) {
  n.goto(e), t.goto(i);
  let o = i + r, l = i, u = i - e, a = !!s.boundChange;
  for (let c = !1; ; ) {
    let h = n.to + u - t.to, f = h || n.endSide - t.endSide, d = f < 0 ? n.to + u : t.to, O = Math.min(d, o);
    if (n.point || t.point ? (n.point && t.point && Yu(n.point, t.point) && Wl(n.activeForPoint(n.to), t.activeForPoint(t.to)) || s.comparePoint(l, O, n.point, t.point), c = !1) : (c && (s.boundChange(l), c = !1), O > l && !Wl(n.active, t.active) && s.compareRange(l, O, n.active, t.active), a && O < o && (h || n.openEnd(d) != t.openEnd(d)) && (c = !0)), d > o)
      break;
    l = d, f <= 0 && n.next(), f >= 0 && t.next();
  }
}
function Wl(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (n[t] != e[t] && !Yu(n[t], e[t]))
      return !1;
  return !0;
}
function Gr(n, e) {
  for (let t = e, i = n.length - 1; t < i; t++)
    n[t] = n[t + 1];
  n.pop();
}
function Hr(n, e, t) {
  for (let i = n.length - 1; i >= e; i--)
    n[i + 1] = n[i];
  n[e] = t;
}
function Wc(n, e) {
  let t = -1, i = 1e9;
  for (let r = 0; r < e.length; r++)
    (e[r] - i || n[r].endSide - n[t].endSide) < 0 && (t = r, i = e[r]);
  return t;
}
function Kt(n, e, t = n.length) {
  let i = 0;
  for (let r = 0; r < t && r < n.length; )
    n.charCodeAt(r) == 9 ? (i += e - i % e, r++) : (i++, r = Ce(n, r));
  return i;
}
function u2(n, e, t, i) {
  for (let r = 0, s = 0; ; ) {
    if (s >= e)
      return r;
    if (r == n.length)
      break;
    s += n.charCodeAt(r) == 9 ? t - s % t : 1, r = Ce(n, r);
  }
  return n.length;
}
const Nl = "ͼ", Nc = typeof Symbol > "u" ? "__" + Nl : Symbol.for(Nl), Vl = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), Vc = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class ai {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: i } = t || {};
    function r(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function s(o, l, u, a) {
      let c = [], h = /^@(\w+)\b/.exec(o[0]), f = h && h[1] == "keyframes";
      if (h && l == null) return u.push(o[0] + ";");
      for (let d in l) {
        let O = l[d];
        if (/&/.test(d))
          s(
            d.split(/,\s*/).map((m) => o.map((g) => m.replace(/&/, g))).reduce((m, g) => m.concat(g)),
            O,
            u
          );
        else if (O && typeof O == "object") {
          if (!h) throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          s(r(d), O, c, f);
        } else O != null && c.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ": " + O + ";");
      }
      (c.length || f) && u.push((i && !h && !a ? o.map(i) : o).join(", ") + " {" + c.join(" ") + "}");
    }
    for (let o in e) s(r(o), e[o], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let e = Vc[Nc] || 1;
    return Vc[Nc] = e + 1, Nl + e.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(e, t, i) {
    let r = e[Vl], s = i && i.nonce;
    r ? s && r.setNonce(s) : r = new a2(e, s), r.mount(Array.isArray(t) ? t : [t], e);
  }
}
let Uc = /* @__PURE__ */ new Map();
class a2 {
  constructor(e, t) {
    let i = e.ownerDocument || e, r = i.defaultView;
    if (!e.head && e.adoptedStyleSheets && r.CSSStyleSheet) {
      let s = Uc.get(i);
      if (s) return e[Vl] = s;
      this.sheet = new r.CSSStyleSheet(), Uc.set(i, this);
    } else
      this.styleTag = i.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[Vl] = this;
  }
  mount(e, t) {
    let i = this.sheet, r = 0, s = 0, o = !1;
    for (let l = 0; l < e.length; l++) {
      let u = e[l], a = this.modules.indexOf(u);
      if (a < s && a > -1 && (this.modules.splice(a, 1), o = !0, s--, a = -1), a == -1) {
        if (this.modules.splice(s++, 0, u), o = !0, i) for (let c = 0; c < u.rules.length; c++)
          i.insertRule(u.rules[c], r++);
      } else {
        for (; s < a; ) r += this.modules[s++].rules.length;
        r += u.rules.length, s++;
      }
    }
    if (i)
      t.adoptedStyleSheets.indexOf(this.sheet) < 0 && (t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
    else {
      if (o) {
        let u = "";
        for (let a = 0; a < this.modules.length; a++)
          u += this.modules[a].getRules() + `
`;
        this.styleTag.textContent = u;
      }
      let l = t.head || t;
      this.styleTag.parentNode != l && l.insertBefore(this.styleTag, l.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var bn = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, ur = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, c2 = typeof navigator < "u" && /Mac/.test(navigator.platform), h2 = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var ve = 0; ve < 10; ve++) bn[48 + ve] = bn[96 + ve] = String(ve);
for (var ve = 1; ve <= 24; ve++) bn[ve + 111] = "F" + ve;
for (var ve = 65; ve <= 90; ve++)
  bn[ve] = String.fromCharCode(ve + 32), ur[ve] = String.fromCharCode(ve);
for (var nl in bn) ur.hasOwnProperty(nl) || (ur[nl] = bn[nl]);
function f2(n) {
  var e = c2 && n.metaKey && n.shiftKey && !n.ctrlKey && !n.altKey || h2 && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? ur : bn)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
let De = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Ul = typeof document < "u" ? document : { documentElement: { style: {} } };
const Gl = /* @__PURE__ */ /Edge\/(\d+)/.exec(De.userAgent), Wd = /* @__PURE__ */ /MSIE \d/.test(De.userAgent), Hl = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(De.userAgent), no = !!(Wd || Hl || Gl), Gc = !no && /* @__PURE__ */ /gecko\/(\d+)/i.test(De.userAgent), il = !no && /* @__PURE__ */ /Chrome\/(\d+)/.exec(De.userAgent), Hc = "webkitFontSmoothing" in Ul.documentElement.style, Kl = !no && /* @__PURE__ */ /Apple Computer/.test(De.vendor), Kc = Kl && (/* @__PURE__ */ /Mobile\/\w+/.test(De.userAgent) || De.maxTouchPoints > 2);
var Z = {
  mac: Kc || /* @__PURE__ */ /Mac/.test(De.platform),
  windows: /* @__PURE__ */ /Win/.test(De.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(De.platform),
  ie: no,
  ie_version: Wd ? Ul.documentMode || 6 : Hl ? +Hl[1] : Gl ? +Gl[1] : 0,
  gecko: Gc,
  gecko_version: Gc ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(De.userAgent) || [0, 0])[1] : 0,
  chrome: !!il,
  chrome_version: il ? +il[1] : 0,
  ios: Kc,
  android: /* @__PURE__ */ /Android\b/.test(De.userAgent),
  webkit: Hc,
  webkit_version: Hc ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(De.userAgent) || [0, 0])[1] : 0,
  safari: Kl,
  safari_version: Kl ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(De.userAgent) || [0, 0])[1] : 0,
  tabSize: Ul.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function Nu(n, e) {
  for (let t in n)
    t == "class" && e.class ? e.class += " " + n.class : t == "style" && e.style ? e.style += ";" + n.style : e[t] = n[t];
  return e;
}
const Ps = /* @__PURE__ */ Object.create(null);
function Vu(n, e, t) {
  if (n == e)
    return !0;
  n || (n = Ps), e || (e = Ps);
  let i = Object.keys(n), r = Object.keys(e);
  if (i.length - 0 != r.length - 0)
    return !1;
  for (let s of i)
    if (s != t && (r.indexOf(s) == -1 || n[s] !== e[s]))
      return !1;
  return !0;
}
function d2(n, e) {
  for (let t = n.attributes.length - 1; t >= 0; t--) {
    let i = n.attributes[t].name;
    e[i] == null && n.removeAttribute(i);
  }
  for (let t in e) {
    let i = e[t];
    t == "style" ? n.style.cssText = i : n.getAttribute(t) != i && n.setAttribute(t, i);
  }
}
function Jc(n, e, t) {
  let i = !1;
  if (e)
    for (let r in e)
      t && r in t || (i = !0, r == "style" ? n.style.cssText = "" : n.removeAttribute(r));
  if (t)
    for (let r in t)
      e && e[r] == t[r] || (i = !0, r == "style" ? n.style.cssText = t[r] : n.setAttribute(r, t[r]));
  return i;
}
function O2(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < n.attributes.length; t++) {
    let i = n.attributes[t];
    e[i.name] = i.value;
  }
  return e;
}
class tn {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(e) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(e, t, i) {
    return !1;
  }
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(e) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(e, t, i) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(e) {
  }
}
var at = /* @__PURE__ */ (function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
})(at || (at = {}));
class K extends gn {
  constructor(e, t, i, r) {
    super(), this.startSide = e, this.endSide = t, this.widget = i, this.spec = r;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(e) {
    return new $r(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), i = !!e.block;
    return t += i && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Dn(e, t, t, i, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, i, r;
    if (e.isBlockGap)
      i = -5e8, r = 4e8;
    else {
      let { start: s, end: o } = Nd(e, t);
      i = (s ? t ? -3e8 : -1 : 5e8) - 1, r = (o ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Dn(e, i, r, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new Pr(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return ie.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
K.none = ie.empty;
class $r extends K {
  constructor(e) {
    let { start: t, end: i } = Nd(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? Nu(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || Ps;
  }
  eq(e) {
    return this == e || e instanceof $r && this.tagName == e.tagName && Vu(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
$r.prototype.point = !1;
class Pr extends K {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Pr && this.spec.class == e.spec.class && Vu(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Pr.prototype.mapMode = Re.TrackBefore;
Pr.prototype.point = !0;
class Dn extends K {
  constructor(e, t, i, r, s, o) {
    super(t, i, s, e), this.block = r, this.isReplace = o, this.mapMode = r ? t <= 0 ? Re.TrackBefore : Re.TrackAfter : Re.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? at.WidgetRange : this.startSide <= 0 ? at.WidgetBefore : at.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Dn && p2(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Dn.prototype.point = !0;
function Nd(n, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = n;
  return t == null && (t = n.inclusive), i == null && (i = n.inclusive), { start: t ?? e, end: i ?? e };
}
function p2(n, e) {
  return n == e || !!(n && e && n.compare(e));
}
function ti(n, e, t, i = 0) {
  let r = t.length - 1;
  r >= 0 && t[r] + i >= n ? t[r] = Math.max(t[r], e) : t.push(n, e);
}
class ar extends gn {
  constructor(e, t, i) {
    super(), this.tagName = e, this.attributes = t, this.rank = i;
  }
  eq(e) {
    return e == this || e instanceof ar && this.tagName == e.tagName && Vu(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new ar(e.tagName, e.attributes || Ps, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return ie.of(e, t);
  }
}
ar.prototype.startSide = ar.prototype.endSide = -1;
const we = (n) => n.nodeType == 1, ci = (n) => n.nodeType == 3;
function cr(n) {
  let e;
  return n.nodeType == 11 ? e = n.getSelection ? n : n.ownerDocument : e = n, e.getSelection();
}
function Jl(n, e) {
  return e ? n == e || n.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Ui(n, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Jl(n, e.anchorNode);
  } catch {
    return !1;
  }
}
function Gi(n) {
  return ci(n) ? fr(n, 0, n.nodeValue.length).getClientRects() : we(n) ? n.getClientRects() : [];
}
function Hi(n, e, t, i) {
  return t ? eh(n, e, t, i, -1) || eh(n, e, t, i, 1) : !1;
}
function xn(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}
function vs(n) {
  return we(n) && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
function eh(n, e, t, i, r) {
  for (; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (r < 0 ? 0 : Jt(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let s = n.parentNode;
      if (!s || !we(s))
        return !1;
      e = xn(n) + (r < 0 ? 0 : 1), n = s;
    } else if (we(n)) {
      if (n = n.childNodes[e + (r < 0 ? -1 : 0)], we(n) && (n.nodeName == "IMG" || n.nodeName == "BR" || n.contentEditable == "false"))
        return !1;
      e = r < 0 ? Jt(n) : 0;
    } else
      return !1;
  }
}
function Jt(n) {
  return ci(n) ? n.nodeValue.length : n.childNodes.length;
}
function hr(n, e) {
  let { left: t, right: i } = n;
  if (t == i)
    return n;
  let r = e ? t : i;
  return { left: r, right: r, top: n.top, bottom: n.bottom };
}
function m2(n) {
  let e = n.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: n.innerWidth,
    top: 0,
    bottom: n.innerHeight
  };
}
function Vd(n, e) {
  let t = e.width / n.offsetWidth, i = e.height / n.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - n.offsetWidth) < 1) && (t = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(e.height - n.offsetHeight) < 1) && (i = 1), { scaleX: t, scaleY: i };
}
function g2(n, e, t, i, r, s, o, l) {
  let u = n.ownerDocument, a = u.defaultView || window;
  for (let c = n, h = !1; c && !h; )
    if (we(c)) {
      let f, d = c == u.body, O = 1, m = 1, g = !0, b = !0;
      if (d)
        f = m2(a);
      else {
        let Q = getComputedStyle(c);
        if (/^(fixed|sticky)$/.test(Q.position) && (h = !0), (c.scrollHeight <= c.clientHeight || !/auto|scroll/.test(Q.overflowY)) && (b = !1), (c.scrollWidth <= c.clientWidth || !/auto|scroll/.test(Q.overflowX)) && (g = !1), !g && !b) {
          c = c.assignedSlot || c.parentNode;
          continue;
        }
        let y = c.getBoundingClientRect();
        ({ scaleX: O, scaleY: m } = Vd(c, y)), f = {
          left: y.left,
          right: y.left + c.clientWidth * O,
          top: y.top,
          bottom: y.top + c.clientHeight * m
        };
      }
      let w = 0, S = 0;
      if (b) if (r == "nearest")
        e.top < f.top + o ? (S = e.top - (f.top + o), t > 0 && e.bottom > f.bottom + S && (S = e.bottom - f.bottom + o)) : e.bottom > f.bottom - o && (S = e.bottom - f.bottom + o, t < 0 && e.top - S < f.top && (S = e.top - (f.top + o)));
      else {
        let Q = e.bottom - e.top, y = f.bottom - f.top;
        S = (r == "center" && Q <= y ? e.top + Q / 2 - y / 2 : r == "start" || r == "center" && t < 0 ? e.top - o : e.bottom - y + o) - f.top;
      }
      if (g && (i == "nearest" ? e.left < f.left + s ? (w = e.left - (f.left + s), t > 0 && e.right > f.right + w && (w = e.right - f.right + s)) : e.right > f.right - s && (w = e.right - f.right + s, t < 0 && e.left < f.left + w && (w = e.left - (f.left + s))) : w = (i == "center" ? e.left + (e.right - e.left) / 2 - (f.right - f.left) / 2 : i == "start" == l ? e.left - s : e.right - (f.right - f.left) + s) - f.left), w || S)
        if (d)
          a.scrollBy(w, S);
        else {
          let Q = 0, y = 0;
          if (S) {
            let A = c.scrollTop;
            c.scrollTop += S / m, y = (c.scrollTop - A) * m;
          }
          if (w) {
            let A = c.scrollLeft;
            c.scrollLeft += w / O, Q = (c.scrollLeft - A) * O;
          }
          e = {
            left: e.left - Q,
            top: e.top - y,
            right: e.right - Q,
            bottom: e.bottom - y
          }, Q && Math.abs(Q - w) < 1 && (i = "nearest"), y && Math.abs(y - S) < 1 && (r = "nearest");
        }
      if (d)
        break;
      (e.top < f.top || e.bottom > f.bottom || e.left < f.left || e.right > f.right) && (e = {
        left: Math.max(e.left, f.left),
        right: Math.min(e.right, f.right),
        top: Math.max(e.top, f.top),
        bottom: Math.min(e.bottom, f.bottom)
      }), c = c.assignedSlot || c.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
function Ud(n, e = !0) {
  let t = n.ownerDocument, i = null, r = null;
  for (let s = n.parentNode; s && !(s == t.body || (!e || i) && r); )
    if (we(s))
      !r && s.scrollHeight > s.clientHeight && /scroll|auto/.test(getComputedStyle(s).overflowY) && (r = s), e && !i && s.scrollWidth > s.clientWidth && /scroll|auto/.test(getComputedStyle(s).overflowX) && (i = s), s = s.assignedSlot || s.parentNode;
    else if (s.nodeType == 11)
      s = s.host;
    else
      break;
  return { x: i, y: r };
}
class b2 {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: i } = e;
    this.set(t, Math.min(e.anchorOffset, t ? Jt(t) : 0), i, Math.min(e.focusOffset, i ? Jt(i) : 0));
  }
  set(e, t, i, r) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = r;
  }
}
function Gd(n) {
  let e = [];
  for (let t = n; t; t = t.nodeType == 11 ? t.host : t.parentNode)
    we(t) && e.push({ node: t, left: t.scrollLeft, top: t.scrollTop });
  return e;
}
function Hd(n, e = !0) {
  for (let { node: t, left: i, top: r } of n)
    e && t.scrollTop != r && (t.scrollTop = r), t.scrollLeft != i && (t.scrollLeft = i);
}
let Tn = null;
Z.safari && Z.safari_version >= 26 && (Tn = !1);
function Kd(n) {
  if (n.setActive)
    return n.setActive();
  if (Tn)
    return n.focus(Tn);
  let e = Gd(n);
  n.focus(Tn == null ? {
    get preventScroll() {
      return Tn = { preventScroll: !0 }, !0;
    }
  } : void 0), Tn || (Tn = !1, Hd(e));
}
let th;
function fr(n, e, t = e) {
  let i = th || (th = document.createRange());
  return i.setEnd(n, t), i.setStart(n, e), i;
}
function ni(n, e, t, i) {
  let r = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  i && ({ altKey: r.altKey, ctrlKey: r.ctrlKey, shiftKey: r.shiftKey, metaKey: r.metaKey } = i);
  let s = new KeyboardEvent("keydown", r);
  s.synthetic = !0, n.dispatchEvent(s);
  let o = new KeyboardEvent("keyup", r);
  return o.synthetic = !0, n.dispatchEvent(o), s.defaultPrevented || o.defaultPrevented;
}
function x2(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function k2(n, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (i = Math.min(i, Jt(t)); ; )
    if (i) {
      if (!we(t))
        return !1;
      let r = t.childNodes[i - 1];
      r.contentEditable == "false" ? i-- : (t = r, i = Jt(t));
    } else {
      if (t == n)
        return !0;
      i = xn(t), t = t.parentNode;
    }
}
function Jd(n) {
  return n instanceof Window ? n.pageYOffset > Math.max(0, n.document.documentElement.scrollHeight - n.innerHeight - 4) : n.scrollTop > Math.max(1, n.scrollHeight - n.clientHeight - 4);
}
function e0(n, e) {
  for (let t = n, i = e; ; ) {
    if (ci(t) && i > 0)
      return { node: t, offset: i };
    if (we(t) && i > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i - 1], i = Jt(t);
    } else if (t.parentNode && !vs(t))
      i = xn(t), t = t.parentNode;
    else
      return null;
  }
}
function t0(n, e) {
  for (let t = n, i = e; ; ) {
    if (ci(t) && i < t.nodeValue.length)
      return { node: t, offset: i };
    if (we(t) && i < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i], i = 0;
    } else if (t.parentNode && !vs(t))
      i = xn(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Ot {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new Ot(e.parentNode, xn(e), t);
  }
  static after(e, t) {
    return new Ot(e.parentNode, xn(e) + 1, t);
  }
}
var pe = /* @__PURE__ */ (function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
})(pe || (pe = {}));
const hi = pe.LTR, Uu = pe.RTL;
function n0(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    e.push(1 << +n[t]);
  return e;
}
const S2 = /* @__PURE__ */ n0("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), y2 = /* @__PURE__ */ n0("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), eu = /* @__PURE__ */ Object.create(null), Qt = [];
for (let n of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ n.charCodeAt(0), t = /* @__PURE__ */ n.charCodeAt(1);
  eu[e] = t, eu[t] = -e;
}
function i0(n) {
  return n <= 247 ? S2[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? y2[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8204 ? 256 : 64336 <= n && n <= 65023 ? 4 : 1;
}
const Q2 = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Tt {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? Uu : hi;
  }
  /**
  @internal
  */
  constructor(e, t, i) {
    this.from = e, this.to = t, this.level = i;
  }
  /**
  @internal
  */
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(e, t) {
    return e == (this.dir == t);
  }
  /**
  @internal
  */
  static find(e, t, i, r) {
    let s = -1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      if (l.from <= t && l.to >= t) {
        if (l.level == i)
          return o;
        (s < 0 || (r != 0 ? r < 0 ? l.from < t : l.to > t : e[s].level > l.level)) && (s = o);
      }
    }
    if (s < 0)
      throw new RangeError("Index out of range");
    return s;
  }
}
function r0(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++) {
    let i = n[t], r = e[t];
    if (i.from != r.from || i.to != r.to || i.direction != r.direction || !r0(i.inner, r.inner))
      return !1;
  }
  return !0;
}
const re = [];
function w2(n, e, t, i, r) {
  for (let s = 0; s <= i.length; s++) {
    let o = s ? i[s - 1].to : e, l = s < i.length ? i[s].from : t, u = s ? 256 : r;
    for (let a = o, c = u, h = u; a < l; a++) {
      let f = i0(n.charCodeAt(a));
      f == 512 ? f = c : f == 8 && h == 4 && (f = 16), re[a] = f == 4 ? 2 : f, f & 7 && (h = f), c = f;
    }
    for (let a = o, c = u, h = u; a < l; a++) {
      let f = re[a];
      if (f == 128)
        a < l - 1 && c == re[a + 1] && c & 24 ? f = re[a] = c : re[a] = 256;
      else if (f == 64) {
        let d = a + 1;
        for (; d < l && re[d] == 64; )
          d++;
        let O = a && c == 8 || d < t && re[d] == 8 ? h == 1 ? 1 : 8 : 256;
        for (let m = a; m < d; m++)
          re[m] = O;
        a = d - 1;
      } else f == 8 && h == 1 && (re[a] = 1);
      c = f, f & 7 && (h = f);
    }
  }
}
function $2(n, e, t, i, r) {
  let s = r == 1 ? 2 : 1;
  for (let o = 0, l = 0, u = 0; o <= i.length; o++) {
    let a = o ? i[o - 1].to : e, c = o < i.length ? i[o].from : t;
    for (let h = a, f, d, O; h < c; h++)
      if (d = eu[f = n.charCodeAt(h)])
        if (d < 0) {
          for (let m = l - 3; m >= 0; m -= 3)
            if (Qt[m + 1] == -d) {
              let g = Qt[m + 2], b = g & 2 ? r : g & 4 ? g & 1 ? s : r : 0;
              b && (re[h] = re[Qt[m]] = b), l = m;
              break;
            }
        } else {
          if (Qt.length == 189)
            break;
          Qt[l++] = h, Qt[l++] = f, Qt[l++] = u;
        }
      else if ((O = re[h]) == 2 || O == 1) {
        let m = O == r;
        u = m ? 0 : 1;
        for (let g = l - 3; g >= 0; g -= 3) {
          let b = Qt[g + 2];
          if (b & 2)
            break;
          if (m)
            Qt[g + 2] |= 2;
          else {
            if (b & 4)
              break;
            Qt[g + 2] |= 4;
          }
        }
      }
  }
}
function P2(n, e, t, i) {
  for (let r = 0, s = i; r <= t.length; r++) {
    let o = r ? t[r - 1].to : n, l = r < t.length ? t[r].from : e;
    for (let u = o; u < l; ) {
      let a = re[u];
      if (a == 256) {
        let c = u + 1;
        for (; ; )
          if (c == l) {
            if (r == t.length)
              break;
            c = t[r++].to, l = r < t.length ? t[r].from : e;
          } else if (re[c] == 256)
            c++;
          else
            break;
        let h = s == 1, f = (c < e ? re[c] : i) == 1, d = h == f ? h ? 1 : 2 : i;
        for (let O = c, m = r, g = m ? t[m - 1].to : n; O > u; )
          O == g && (O = t[--m].from, g = m ? t[m - 1].to : n), re[--O] = d;
        u = c;
      } else
        s = a, u++;
    }
  }
}
function tu(n, e, t, i, r, s, o) {
  let l = i % 2 ? 2 : 1;
  if (i % 2 == r % 2)
    for (let u = e, a = 0; u < t; ) {
      let c = !0, h = !1;
      if (a == s.length || u < s[a].from) {
        let m = re[u];
        m != l && (c = !1, h = m == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, O = u;
      e: for (; ; )
        if (a < s.length && O == s[a].from) {
          if (h)
            break e;
          let m = s[a];
          if (!c)
            for (let g = m.to, b = a + 1; ; ) {
              if (g == t)
                break e;
              if (b < s.length && s[b].from == g)
                g = s[b++].to;
              else {
                if (re[g] == l)
                  break e;
                break;
              }
            }
          if (a++, f)
            f.push(m);
          else {
            m.from > u && o.push(new Tt(u, m.from, d));
            let g = m.direction == hi != !(d % 2);
            nu(n, g ? i + 1 : i, r, m.inner, m.from, m.to, o), u = m.to;
          }
          O = m.to;
        } else {
          if (O == t || (c ? re[O] != l : re[O] == l))
            break;
          O++;
        }
      f ? tu(n, u, O, i + 1, r, f, o) : u < O && o.push(new Tt(u, O, d)), u = O;
    }
  else
    for (let u = t, a = s.length; u > e; ) {
      let c = !0, h = !1;
      if (!a || u > s[a - 1].to) {
        let m = re[u - 1];
        m != l && (c = !1, h = m == 16);
      }
      let f = !c && l == 1 ? [] : null, d = c ? i : i + 1, O = u;
      e: for (; ; )
        if (a && O == s[a - 1].to) {
          if (h)
            break e;
          let m = s[--a];
          if (!c)
            for (let g = m.from, b = a; ; ) {
              if (g == e)
                break e;
              if (b && s[b - 1].to == g)
                g = s[--b].from;
              else {
                if (re[g - 1] == l)
                  break e;
                break;
              }
            }
          if (f)
            f.push(m);
          else {
            m.to < u && o.push(new Tt(m.to, u, d));
            let g = m.direction == hi != !(d % 2);
            nu(n, g ? i + 1 : i, r, m.inner, m.from, m.to, o), u = m.from;
          }
          O = m.from;
        } else {
          if (O == e || (c ? re[O - 1] != l : re[O - 1] == l))
            break;
          O--;
        }
      f ? tu(n, O, u, i + 1, r, f, o) : O < u && o.push(new Tt(O, u, d)), u = O;
    }
}
function nu(n, e, t, i, r, s, o) {
  let l = e % 2 ? 2 : 1;
  w2(n, r, s, i, l), $2(n, r, s, i, l), P2(r, s, i, l), tu(n, r, s, e, t, i, o);
}
function v2(n, e, t) {
  if (!n)
    return [new Tt(0, 0, e == Uu ? 1 : 0)];
  if (e == hi && !t.length && !Q2.test(n))
    return s0(n.length);
  if (t.length)
    for (; n.length > re.length; )
      re[re.length] = 256;
  let i = [], r = e == hi ? 0 : 1;
  return nu(n, r, r, t, 0, n.length, i), i;
}
function s0(n) {
  return [new Tt(0, n, 0)];
}
let o0 = "";
function _2(n, e, t, i, r) {
  var s;
  if (!n.length)
    return null;
  let o = i.head - n.from, l;
  if (i.head == n.from && i.assoc < 0) {
    if (!r)
      return null;
    o = e[l = 0].side(!1, t);
  } else if (i.head == n.to && i.assoc > 0) {
    if (r)
      return null;
    o = e[l = e.length - 1].side(!0, t);
  } else
    l = Tt.find(e, o, (s = i.bidiLevel) !== null && s !== void 0 ? s : -1, i.assoc);
  let u = e[l], a = u.side(r, t);
  if (o == a) {
    let f = l += r ? 1 : -1;
    if (f < 0 || f >= e.length)
      return null;
    u = e[l = f], o = u.side(!r, t), a = u.side(r, t);
  }
  let c = Ce(n.text, o, u.forward(r, t));
  (c < u.from || c > u.to) && (c = a), o0 = n.text.slice(Math.min(o, c), Math.max(o, c));
  let h = l == (r ? e.length - 1 : 0) ? null : e[l + (r ? 1 : -1)];
  if (c == a) {
    if (!h)
      return r ? v.cursor(n.to, 1) : v.cursor(n.from, -1);
    if (h.level + (r ? 0 : 1) < u.level)
      return v.cursor(h.side(!r, t) + n.from, h.forward(r, t) ? 1 : -1, h.level);
  }
  return v.cursor(c + n.from, u.forward(r, t) ? -1 : 1, u.level);
}
function A2(n, e, t) {
  for (let i = e; i < t; i++) {
    let r = i0(n.charCodeAt(i));
    if (r == 1)
      return hi;
    if (r == 2 || r == 4)
      return Uu;
  }
}
const l0 = /* @__PURE__ */ I.define(), u0 = /* @__PURE__ */ I.define(), a0 = /* @__PURE__ */ I.define(), c0 = /* @__PURE__ */ I.define(), iu = /* @__PURE__ */ I.define(), h0 = /* @__PURE__ */ I.define(), f0 = /* @__PURE__ */ I.define(), Gu = /* @__PURE__ */ I.define(), Hu = /* @__PURE__ */ I.define(), d0 = /* @__PURE__ */ I.define({
  combine: (n) => n.some((e) => e)
}), C2 = /* @__PURE__ */ I.define({
  combine: (n) => n.some((e) => e)
}), O0 = /* @__PURE__ */ I.define();
class ii {
  constructor(e, t, i, r, s, o = !1) {
    this.range = e, this.y = t, this.x = i, this.yMargin = r, this.xMargin = s, this.isSnapshot = o;
  }
  map(e) {
    return e.empty ? this : new ii(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new ii(v.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Kr = /* @__PURE__ */ le.define({ map: (n, e) => n.map(e) }), p0 = /* @__PURE__ */ le.define();
function Et(n, e, t) {
  let i = n.facet(c0);
  i.length ? i[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const Vt = /* @__PURE__ */ I.define({ combine: (n) => n.length ? n[0] : !0 });
let T2 = 0;
const Un = /* @__PURE__ */ I.define({
  combine(n) {
    return n.filter((e, t) => {
      for (let i = 0; i < t; i++)
        if (n[i].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class kn {
  constructor(e, t, i, r, s) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.domEventObservers = r, this.baseExtensions = s(this), this.extension = this.baseExtensions.concat(Un.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(Un.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: i, eventObservers: r, provide: s, decorations: o } = t || {};
    return new kn(T2++, e, i, r, (l) => {
      let u = [];
      return o && u.push(io.of((a) => {
        let c = a.plugin(l);
        return c ? o(c) : K.none;
      })), s && u.push(s(l)), u;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return kn.define((i, r) => new e(i, r), t);
  }
}
class rl {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  get plugin() {
    return this.spec && this.spec.plugin;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (i) {
            if (Et(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.plugin.create(e, this.spec.arg);
      } catch (t) {
        Et(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Et(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const m0 = /* @__PURE__ */ I.define(), Ku = /* @__PURE__ */ I.define(), io = /* @__PURE__ */ I.define(), g0 = /* @__PURE__ */ I.define(), Ju = /* @__PURE__ */ I.define(), vr = /* @__PURE__ */ I.define(), b0 = /* @__PURE__ */ I.define();
function nh(n, e) {
  let t = n.state.facet(b0);
  if (!t.length)
    return t;
  let i = t.map((s) => s instanceof Function ? s(n) : s), r = [];
  return ie.spans(i, e.from, e.to, {
    point() {
    },
    span(s, o, l, u) {
      let a = s - e.from, c = o - e.from, h = r;
      for (let f = l.length - 1; f >= 0; f--, u--) {
        let d = l[f].spec.bidiIsolate, O;
        if (u > 0 && h.length && (O = h[h.length - 1]).to == a && O.direction == d)
          O.to = c, h = O.inner;
        else {
          let m = { from: a, to: c, direction: d, inner: [] };
          h.push(m), h = m.inner;
        }
      }
    }
  }), x0(e.text, r);
}
function x0(n, e) {
  for (let t of e) {
    if (t.direction == null) {
      for (let i = t.from, r = 0; i < t.to; r++) {
        let s = r < t.inner.length ? t.inner[r] : null, o = A2(n, i, s ? s.from : t.to);
        if (o) {
          t.direction = o;
          break;
        }
        if (!s)
          break;
        i = s.to;
      }
      t.direction == null && (t.direction = pe.LTR);
    }
    x0(n, t.inner);
  }
  return e;
}
const k0 = /* @__PURE__ */ I.define();
function S0(n) {
  let e = 0, t = 0, i = 0, r = 0;
  for (let s of n.state.facet(k0)) {
    let o = s(n);
    o && (o.left != null && (e = Math.max(e, o.left)), o.right != null && (t = Math.max(t, o.right)), o.top != null && (i = Math.max(i, o.top)), o.bottom != null && (r = Math.max(r, o.bottom)));
  }
  return { left: e, right: t, top: i, bottom: r };
}
const qi = /* @__PURE__ */ I.define();
class ot {
  constructor(e, t, i, r) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = r;
  }
  join(e) {
    return new ot(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, i = this;
    for (; t > 0; t--) {
      let r = e[t - 1];
      if (!(r.fromA > i.toA)) {
        if (r.toA < i.fromA)
          break;
        i = i.join(r), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, i), e;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let i = [];
    for (let r = 0, s = 0, o = 0; ; ) {
      let l = r < e.length ? e[r].fromB : 1e9, u = s < t.length ? t[s] : 1e9, a = Math.min(l, u);
      if (a == 1e9)
        break;
      let c = a + o, h = a, f = c;
      for (; ; )
        if (s < t.length && t[s] <= h) {
          let d = t[s + 1];
          s += 2, h = Math.max(h, d);
          for (let O = r; O < e.length && e[O].fromB <= h; O++)
            o = e[O].toA - e[O].toB;
          f = Math.max(f, d + o);
        } else if (r < e.length && e[r].fromB <= h) {
          let d = e[r++];
          h = Math.max(h, d.toB), f = Math.max(f, d.toA), o = d.toA - d.toB;
        } else
          break;
      i.push(new ot(c, f, a, h));
    }
    return i;
  }
}
class _s {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = xe.empty(this.startState.doc.length);
    for (let s of i)
      this.changes = this.changes.compose(s.changes);
    let r = [];
    this.changes.iterChangedRanges((s, o, l, u) => r.push(new ot(s, o, l, u))), this.changedRanges = r;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new _s(e, t, i);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Returns true when
  [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
  and the viewport change is not just the result of mapping it in
  response to document changes.
  */
  get viewportMoved() {
    return (this.flags & 8) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 18) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
const E2 = [];
class fe {
  constructor(e, t, i = 0) {
    this.dom = e, this.length = t, this.flags = i, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return E2;
  }
  isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  isComposite() {
    return !1;
  }
  isLine() {
    return !1;
  }
  isText() {
    return !1;
  }
  isBlock() {
    return !1;
  }
  get domAttrs() {
    return null;
  }
  sync(e) {
    if (this.flags |= 2, this.flags & 4) {
      this.flags &= -5;
      let t = this.domAttrs;
      t && d2(this.dom, t);
    }
  }
  toString() {
    return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
  }
  destroy() {
    this.parent = null;
  }
  setDOM(e) {
    this.dom = e, e.cmTile = this;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e, t = this.posAtStart) {
    let i = t;
    for (let r of this.children) {
      if (r == e)
        return i;
      i += r.length + r.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  covers(e) {
    return !0;
  }
  coordsIn(e, t, i) {
    return null;
  }
  domPosFor(e, t) {
    let i = xn(this.dom), r = this.length ? e > 0 : t > 0;
    return new Ot(this.parent.dom, i + (r ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof so)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class ro extends fe {
  constructor(e) {
    super(e, 0), this._children = [];
  }
  isComposite() {
    return !0;
  }
  get children() {
    return this._children;
  }
  get lastChild() {
    return this.children.length ? this.children[this.children.length - 1] : null;
  }
  append(e) {
    this.children.push(e), e.parent = this;
  }
  sync(e) {
    if (this.flags & 2)
      return;
    super.sync(e);
    let t = this.dom, i = null, r, s = e?.node == t ? e : null, o = 0;
    for (let l of this.children) {
      if (l.sync(e), o += l.length + l.breakAfter, r = i ? i.nextSibling : t.firstChild, s && r != l.dom && (s.written = !0), l.dom.parentNode == t)
        for (; r && r != l.dom; )
          r = ih(r);
      else
        t.insertBefore(l.dom, r);
      i = l.dom;
    }
    for (r = i ? i.nextSibling : t.firstChild, s && r && (s.written = !0); r; )
      r = ih(r);
    this.length = o;
  }
}
function ih(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class so extends ro {
  constructor(e, t) {
    super(t), this.view = e;
  }
  owns(e) {
    for (; e; e = e.parent)
      if (e == this)
        return !0;
    return !1;
  }
  isBlock() {
    return !0;
  }
  nearest(e) {
    for (; ; ) {
      if (!e)
        return null;
      let t = fe.get(e);
      if (t && this.owns(t))
        return t;
      e = e.parentNode;
    }
  }
  blockTiles(e) {
    for (let t = [], i = this, r = 0, s = 0; ; )
      if (r == i.children.length) {
        if (!t.length)
          return;
        i = i.parent, i.breakAfter && s++, r = t.pop();
      } else {
        let o = i.children[r++];
        if (o instanceof Gt)
          t.push(r), i = o, r = 0;
        else {
          let l = s + o.length, u = e(o, s);
          if (u !== void 0)
            return u;
          s = l + o.breakAfter;
        }
      }
  }
  // Find the block at the given position. If side < -1, make sure to
  // stay before block widgets at that position, if side > 1, after
  // such widgets (used for selection drawing, which needs to be able
  // to get coordinates for positions that aren't valid cursor positions).
  resolveBlock(e, t) {
    let i, r = -1, s, o = -1;
    if (this.blockTiles((l, u) => {
      let a = u + l.length;
      if (e >= u && e <= a) {
        if (l.isWidget() && t >= -1 && t <= 1) {
          if (l.flags & 32)
            return !0;
          l.flags & 16 && (i = void 0);
        }
        (u < e || e == a && (t < -1 ? l.length : l.covers(1))) && (!i || !l.isWidget() && i.isWidget()) && (i = l, r = e - u), (a > e || e == u && (t > 1 ? l.length : l.covers(-1))) && (!s || !l.isWidget() && s.isWidget()) && (s = l, o = e - u);
      }
    }), !i && !s)
      throw new Error("No tile at position " + e);
    return i && t < 0 || !s ? { tile: i, offset: r } : { tile: s, offset: o };
  }
}
class Gt extends ro {
  constructor(e, t) {
    super(e), this.wrapper = t;
  }
  isBlock() {
    return !0;
  }
  covers(e) {
    return this.children.length ? e < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1) : !1;
  }
  get domAttrs() {
    return this.wrapper.attributes;
  }
  static of(e, t) {
    let i = new Gt(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class fi extends ro {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, i) {
    let r = new fi(t || document.createElement("div"), e);
    return (!t || !i) && (r.flags |= 4), r;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  // Side -2/2 is handled specially, in that it allows the position
  // returned to be before (-2) or after (2) widgets that would always
  // be after/before a cursor position.
  resolveInline(e, t, i = !1) {
    let r = null, s = -1, o = null, l = -1;
    function u(c, h) {
      for (let f = 0, d = 0; f < c.children.length && d <= h; f++) {
        let O = c.children[f], m = d + O.length;
        m >= h && (O.isComposite() ? u(O, h - d) : (!o || i && o.isHidden && (t > 0 && !(o.flags & 32) || i && Z2(o, O))) && (m > h || O.flags & 32 && t <= 1) ? (o = O, l = h - d) : (d < h || O.flags & 16 && !(i && O.isHidden) && t >= -1) && (r = O, s = h - d)), d = m;
      }
    }
    u(this, e);
    let a = (t < 0 ? r : o) || r || o;
    return a ? { tile: a, offset: a == r ? s : l } : null;
  }
  coordsIn(e, t, i) {
    let r = this.resolveInline(e, t, !0);
    return r ? r.tile.coordsIn(Math.max(0, r.offset), t, i) : X2(this);
  }
  domIn(e, t) {
    let i = this.resolveInline(e, t);
    if (i) {
      let { tile: r, offset: s } = i;
      if (this.dom.contains(r.dom))
        return r.isText() ? new Ot(r.dom, Math.min(r.dom.nodeValue.length, s)) : r.domPosFor(s, r.flags & 16 ? 1 : r.flags & 32 ? -1 : t);
      let o = i.tile.parent, l = !1;
      for (let u of o.children) {
        if (l)
          return new Ot(u.dom, 0);
        u == i.tile && (l = !0);
      }
    }
    return new Ot(this.dom, 0);
  }
}
function X2(n) {
  let e = n.dom.lastChild;
  if (!e)
    return n.dom.getBoundingClientRect();
  let t = Gi(e);
  return t[t.length - 1] || null;
}
function Z2(n, e) {
  let t = n.coordsIn(0, 1), i = e.coordsIn(0, 1);
  return t && i && i.top < t.bottom;
}
class qe extends ro {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let i = new qe(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class Zn extends fe {
  constructor(e, t) {
    super(e, t.length), this.text = t;
  }
  sync(e) {
    this.flags & 2 || (super.sync(e), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text));
  }
  isText() {
    return !0;
  }
  toString() {
    return JSON.stringify(this.text);
  }
  coordsIn(e, t, i) {
    let r = this.dom.nodeValue.length;
    e > r && (e = r);
    let s = e, o = e, l = 0;
    e == 0 && t < 0 || e == r && t >= 0 ? Z.chrome || Z.gecko || (e ? (s--, l = 1) : o < r && (o++, l = -1)) : t < 0 ? s-- : o < r && o++;
    let u = fr(this.dom, s, o).getClientRects();
    if (!u.length)
      return null;
    let a = u[(l ? l < 0 : t >= 0) ? 0 : u.length - 1];
    return Z.safari && !l && a.width == 0 && (a = Array.prototype.find.call(u, (c) => c.width) || a), i == null ? a : hr(a, (l ? l > 0 : t < 0) == i);
  }
  static of(e, t) {
    let i = new Zn(t || document.createTextNode(e), e);
    return t || (i.flags |= 2), i;
  }
}
class Rn extends fe {
  constructor(e, t, i, r) {
    super(e, t, r), this.widget = i;
  }
  isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  covers(e) {
    return this.flags & 48 ? !1 : (this.flags & (e < 0 ? 64 : 128)) > 0;
  }
  coordsIn(e, t) {
    return this.coordsInWidget(e, t, !1);
  }
  coordsInWidget(e, t, i) {
    let r = this.widget.coordsAt(this.dom, e, t);
    if (r)
      return r;
    if (i)
      return hr(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let s = this.dom.getClientRects(), o = null;
      if (!s.length)
        return null;
      let l = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let u = l ? s.length - 1 : 0; o = s[u], !(e > 0 ? u == 0 : u == s.length - 1 || o.top < o.bottom); u += l ? -1 : 1)
        ;
      return hr(o, !l);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return U.empty;
    let { root: e } = this;
    if (!e)
      return U.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, i, r, s) {
    return s || (s = e.toDOM(t), e.editable || (s.contentEditable = "false")), new Rn(s, i, e, r);
  }
}
class As extends fe {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return U.empty;
  }
  coordsIn(e, t, i) {
    let r = this.dom.getBoundingClientRect();
    return i == null ? r : hr(r, t > 0 == i);
  }
}
class D2 {
  constructor(e) {
    this.index = 0, this.beforeBreak = !1, this.parents = [], this.tile = e;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(e, t, i) {
    let { tile: r, index: s, beforeBreak: o, parents: l } = this;
    for (; e || t > 0; )
      if (r.isComposite())
        if (o) {
          if (!e)
            break;
          i && i.break(), e--, o = !1;
        } else if (s == r.children.length) {
          if (!e && !l.length)
            break;
          i && i.leave(r), o = !!r.breakAfter, { tile: r, index: s } = l.pop(), s++;
        } else {
          let u = r.children[s], a = u.breakAfter;
          (t > 0 ? u.length <= e : u.length < e) && (!i || i.skip(u, 0, u.length) !== !1 || !u.isComposite) ? (o = !!a, s++, e -= u.length) : (l.push({ tile: r, index: s }), r = u, s = 0, i && u.isComposite() && i.enter(u));
        }
      else {
        let u = r.length;
        if (s < u && e) {
          let a = Math.min(e, u - s);
          i && i.skip(r, s, s + a), e -= a, s += a;
        }
        if (s == u)
          o = !!r.breakAfter, { tile: r, index: s } = l.pop(), s++;
        else if (!e)
          break;
      }
    return this.tile = r, this.index = s, this.beforeBreak = o, this;
  }
  get root() {
    return this.parents.length ? this.parents[0].tile : this.tile;
  }
}
class R2 {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.wrapper = i, this.rank = r;
  }
}
class M2 {
  constructor(e, t, i) {
    this.cache = e, this.root = t, this.blockWrappers = i, this.curLine = null, this.lastBlock = null, this.afterWidget = null, this.pos = 0, this.wrappers = [], this.wrapperPos = 0;
  }
  addText(e, t, i, r) {
    var s;
    this.flushBuffer();
    let o = this.ensureMarks(t, i), l = o.lastChild;
    if (l && l.isText() && !(l.flags & 8) && l.length + e.length < 512) {
      this.cache.reused.set(
        l,
        2
        /* Reused.DOM */
      );
      let u = o.children[o.children.length - 1] = new Zn(l.dom, l.text + e);
      u.parent = o;
    } else
      o.append(r || Zn.of(e, (s = this.cache.find(Zn)) === null || s === void 0 ? void 0 : s.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let i = this.curLine;
    i.dom != t.line.dom && (i.setDOM(this.cache.reused.has(t.line) ? sl(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let r = i;
    for (let l = t.marks.length - 1; l >= 0; l--) {
      let u = t.marks[l], a = r.lastChild;
      if (a instanceof qe && a.mark.eq(u.mark))
        a.dom != u.dom && a.setDOM(sl(u.dom)), r = a;
      else {
        let { dom: c } = u;
        this.cache.reused.get(u) && fe.get(u.dom) && (c = sl(u.dom));
        let h = qe.of(u.mark, c);
        r.append(h), r = h;
      }
      this.cache.reused.set(
        u,
        2
        /* Reused.DOM */
      );
    }
    let s = fe.get(e.text);
    s && this.cache.reused.set(
      s,
      2
      /* Reused.DOM */
    );
    let o = new Zn(e.text, e.text.nodeValue);
    o.flags |= 8, this.pos = e.range.toB, r.append(o);
  }
  addInlineWidget(e, t, i) {
    let r = this.afterWidget && e.flags & 48 && (this.afterWidget.flags & 48) == (e.flags & 48);
    r || this.flushBuffer();
    let s = this.ensureMarks(t, i);
    !r && !(e.flags & 16) && s.append(this.getBuffer(1)), s.append(e), this.pos += e.length, this.afterWidget = e;
  }
  addMark(e, t, i) {
    this.flushBuffer(), this.ensureMarks(t, i).append(e), this.pos += e.length, this.afterWidget = null;
  }
  addBlockWidget(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  continueWidget(e) {
    let t = this.afterWidget || this.lastBlock;
    t.length += e, this.pos += e;
  }
  addLineStart(e, t) {
    var i;
    e || (e = y0);
    let r = fi.start(e, t || ((i = this.cache.find(fi)) === null || i === void 0 ? void 0 : i.dom), !!t);
    this.getBlockPos().append(this.lastBlock = this.curLine = r);
  }
  addLine(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  addBreak() {
    this.lastBlock.flags |= 1, this.endLine(), this.pos++;
  }
  addLineStartIfNotCovered(e) {
    this.blockPosCovered() || this.addLineStart(e);
  }
  ensureLine(e) {
    this.curLine || this.addLineStart(e);
  }
  ensureMarks(e, t) {
    var i;
    let r = this.curLine;
    for (let s = e.length - 1; s >= 0; s--) {
      let o = e[s], l;
      if (t > 0 && (l = r.lastChild) && l instanceof qe && l.mark.eq(o))
        r = l, t--;
      else {
        let u = qe.of(o, (i = this.cache.find(qe, (a) => a.mark.eq(o))) === null || i === void 0 ? void 0 : i.dom);
        r.append(u), r = u, t = 0;
      }
    }
    return r;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !rh(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(Z.ios && rh(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        ol,
        0,
        32
        /* TileFlag.After */
      ) || new Rn(
        ol.toDOM(),
        0,
        ol,
        32
        /* TileFlag.After */
      )), this.curLine = this.afterWidget = null;
    }
  }
  updateBlockWrappers() {
    this.wrapperPos > this.pos + 1e4 && (this.blockWrappers.goto(this.pos), this.wrappers.length = 0);
    for (let e = this.wrappers.length - 1; e >= 0; e--)
      this.wrappers[e].to < this.pos && this.wrappers.splice(e, 1);
    for (let e = this.blockWrappers; e.value && e.from <= this.pos; e.next())
      if (e.to >= this.pos) {
        let t = e.rank * 102 + e.value.rank, i = new R2(e.from, e.to, e.value, t), r = this.wrappers.length;
        for (; r > 0 && (this.wrappers[r - 1].rank - i.rank || this.wrappers[r - 1].to - i.to) < 0; )
          r--;
        this.wrappers.splice(r, 0, i);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var e;
    this.updateBlockWrappers();
    let t = this.root;
    for (let i of this.wrappers) {
      let r = t.lastChild;
      if (i.from < this.pos && r instanceof Gt && r.wrapper.eq(i.wrapper))
        t = r;
      else {
        let s = Gt.of(i.wrapper, (e = this.cache.find(Gt, (o) => o.wrapper.eq(i.wrapper))) === null || e === void 0 ? void 0 : e.dom);
        t.append(s), t = s;
      }
    }
    return t;
  }
  blockPosCovered() {
    let e = this.lastBlock;
    return e != null && !e.breakAfter && (!e.isWidget() || (e.flags & 160) > 0);
  }
  getBuffer(e) {
    let t = 2 | (e < 0 ? 16 : 32), i = this.cache.find(
      As,
      void 0,
      1
      /* Reused.Full */
    );
    return i && (i.flags = t), i || new As(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class L2 {
  constructor(e) {
    this.skipCount = 0, this.text = "", this.textOff = 0, this.cursor = e.iter();
  }
  skip(e) {
    this.textOff + e <= this.text.length ? this.textOff += e : (this.skipCount += e - (this.text.length - this.textOff), this.text = "", this.textOff = 0);
  }
  next(e) {
    if (this.textOff == this.text.length) {
      let { value: r, lineBreak: s, done: o } = this.cursor.next(this.skipCount);
      if (this.skipCount = 0, o)
        throw new Error("Ran out of text content when drawing inline views");
      this.text = r;
      let l = this.textOff = Math.min(e, r.length);
      return s ? null : r.slice(0, l);
    }
    let t = Math.min(this.text.length, this.textOff + e), i = this.text.slice(this.textOff, t);
    return this.textOff = t, i;
  }
}
const Cs = [Rn, fi, Zn, qe, As, Gt, so];
for (let n = 0; n < Cs.length; n++)
  Cs[n].bucket = n;
class j2 {
  constructor(e) {
    this.view = e, this.buckets = Cs.map(() => []), this.index = Cs.map(() => 0), this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(e) {
    let t = e.constructor.bucket, i = this.buckets[t];
    i.length < 6 ? i.push(e) : i[
      this.index[t] = (this.index[t] + 1) % 6
      /* C.Bucket */
    ] = e;
  }
  find(e, t, i = 2) {
    let r = e.bucket, s = this.buckets[r], o = this.index[r];
    for (let l = 0; l < s.length; l++) {
      let u = (l + o) % s.length, a = s[u];
      if ((!t || t(a)) && !this.reused.has(a))
        return s.splice(u, 1), u < o && this.index[r]--, this.reused.set(a, i), a;
    }
    return null;
  }
  findWidget(e, t, i) {
    let r = this.buckets[0];
    if (r.length)
      for (let s = 0, o = 0; ; s++) {
        if (s == r.length) {
          if (o)
            return null;
          o = 1, s = 0;
        }
        let l = r[s];
        if (!this.reused.has(l) && (o == 0 ? l.widget.compare(e) : l.widget.constructor == e.constructor && e.updateDOM(l.dom, this.view, l.widget)))
          return r.splice(s, 1), s < this.index[0] && this.index[0]--, l.widget == e && l.length == t && (l.flags & 497) == i ? (this.reused.set(
            l,
            1
            /* Reused.Full */
          ), l) : (this.reused.set(
            l,
            2
            /* Reused.DOM */
          ), new Rn(l.dom, t, e, l.flags & -498 | i));
      }
  }
  reuse(e) {
    return this.reused.set(
      e,
      1
      /* Reused.Full */
    ), e;
  }
  maybeReuse(e, t = 2) {
    if (!this.reused.has(e))
      return this.reused.set(e, t), e.dom;
  }
  clear() {
    for (let e = 0; e < this.buckets.length; e++)
      this.buckets[e].length = this.index[e] = 0;
  }
}
class z2 {
  constructor(e, t, i, r, s) {
    this.view = e, this.decorations = r, this.disallowBlockEffectsFor = s, this.openWidget = !1, this.openMarks = 0, this.cache = new j2(e), this.text = new L2(e.state.doc), this.builder = new M2(this.cache, new so(e, e.contentDOM), ie.iter(i)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new D2(t), this.reuseWalker = {
      skip: (o, l, u) => {
        if (this.cache.add(o), o.isComposite())
          return !1;
      },
      enter: (o) => this.cache.add(o),
      leave: () => {
      },
      break: () => {
      }
    };
  }
  run(e, t) {
    let i = t && this.getCompositionContext(t.text);
    for (let r = 0, s = 0, o = 0; ; ) {
      let l = o < e.length ? e[o++] : null, u = l ? l.fromA : this.old.root.length;
      if (u > r) {
        let a = u - r;
        this.preserve(a, !o, !l), r = u, s += a;
      }
      if (!l)
        break;
      t && l.fromA <= t.range.fromA && l.toA >= t.range.toA ? (this.forward(l.fromA, t.range.fromA, t.range.fromA < t.range.toA ? 1 : -1), this.emit(s, t.range.fromB), this.builder.flushBuffer(), this.cache.clear(), this.builder.addComposition(t, i), this.text.skip(t.range.toB - t.range.fromB), this.forward(t.range.fromA, l.toA), this.emit(t.range.toB, l.toB)) : (this.forward(l.fromA, l.toA), this.emit(s, l.toB)), s = l.toB, r = l.toA;
    }
    return this.builder.curLine && this.builder.endLine(), this.builder.root;
  }
  preserve(e, t, i) {
    let r = q2(this.old), s = this.openMarks;
    this.old.advance(e, i ? 1 : -1, {
      skip: (o, l, u) => {
        if (o.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(u - l);
          else {
            let a = u > 0 || l < o.length ? Rn.of(o.widget, this.view, u - l, o.flags & 496, this.cache.maybeReuse(o)) : this.cache.reuse(o);
            a.flags & 256 ? (a.flags &= -2, this.builder.addBlockWidget(a)) : (this.builder.ensureLine(null), this.builder.addInlineWidget(a, r, s), s = r.length);
          }
        else if (o.isText())
          this.builder.ensureLine(null), !l && u == o.length && !this.cache.reused.has(o) ? this.builder.addText(o.text, r, s, this.cache.reuse(o)) : (this.cache.add(o), this.builder.addText(o.text.slice(l, u), r, s)), s = r.length;
        else if (o.isLine())
          o.flags &= -2, this.cache.reused.set(
            o,
            1
            /* Reused.Full */
          ), this.builder.addLine(o);
        else if (o instanceof As)
          this.cache.add(o);
        else if (o instanceof qe)
          this.builder.ensureLine(null), this.builder.addMark(o, r, s), this.cache.reused.set(
            o,
            1
            /* Reused.Full */
          ), s = r.length;
        else
          return !1;
        this.openWidget = !1;
      },
      enter: (o) => {
        o.isLine() ? this.builder.addLineStart(o.attrs, this.cache.maybeReuse(o)) : (this.cache.add(o), o instanceof qe && r.unshift(o.mark)), this.openWidget = !1;
      },
      leave: (o) => {
        o.isLine() ? r.length && (r.length = s = 0) : o instanceof qe && (r.shift(), s = Math.min(s, r.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let i = null, r = this.builder, s = -1, o = ie.spans(this.decorations, e, t, {
      point: (l, u, a, c, h, f) => {
        if (a instanceof Dn) {
          if (this.disallowBlockEffectsFor[f]) {
            if (a.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (u > this.view.state.doc.lineAt(l).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (s = c.length, h > c.length)
            r.continueWidget(u - l);
          else {
            let d = a.widget || (a.block ? di.block : di.inline), O = I2(a), m = this.cache.findWidget(d, u - l, O) || Rn.of(d, this.view, u - l, O);
            a.block ? (a.startSide > 0 && r.addLineStartIfNotCovered(i), r.addBlockWidget(m)) : (r.ensureLine(i), r.addInlineWidget(m, c, h));
          }
          i = null;
        } else
          i = B2(i, a);
        u > l && this.text.skip(u - l);
      },
      span: (l, u, a, c) => {
        for (let h = l; h < u; ) {
          let f = this.text.next(Math.min(512, u - h));
          f == null ? (r.addLineStartIfNotCovered(i), r.addBreak(), h++) : (r.ensureLine(i), r.addText(f, a, h == l ? c : a.length), h += f.length), i = null;
        }
        s = a.length;
      }
    });
    s > -1 && (this.openWidget = o > s), this.openWidget || r.addLineStartIfNotCovered(i), this.openMarks = o;
  }
  forward(e, t, i = 1) {
    t - e <= 10 ? this.old.advance(t - e, i, this.reuseWalker) : (this.old.advance(5, -1, this.reuseWalker), this.old.advance(t - e - 10, -1), this.old.advance(5, i, this.reuseWalker));
  }
  getCompositionContext(e) {
    let t = [], i = null;
    for (let r = e.parentNode; ; r = r.parentNode) {
      let s = fe.get(r);
      if (r == this.view.contentDOM)
        break;
      s instanceof qe ? t.push(s) : s?.isLine() ? i = s : s instanceof Gt || (r.nodeName == "DIV" && !i ? i = new fi(r, y0) : i || t.push(qe.of(new $r({ tagName: r.nodeName.toLowerCase(), attributes: O2(r) }), r)));
    }
    return i ? { line: i, marks: t } : null;
  }
}
function rh(n, e) {
  let t = (i) => {
    for (let r of i.children)
      if ((e ? r.isText() : r.length) || t(r))
        return !0;
    return !1;
  };
  return t(n);
}
function I2(n) {
  let e = n.isReplace ? (n.startSide < 0 ? 64 : 0) | (n.endSide > 0 ? 128 : 0) : n.startSide > 0 ? 32 : 16;
  return n.block && (e |= 256), e;
}
const y0 = { class: "cm-line" };
function B2(n, e) {
  let t = e.spec.attributes, i = e.spec.class;
  return !t && !i || (n || (n = { class: "cm-line" }), t && Nu(t, n), i && (n.class += " " + i)), n;
}
function q2(n) {
  let e = [];
  for (let t = n.parents.length; t > 1; t--) {
    let i = t == n.parents.length ? n.tile : n.parents[t].tile;
    i instanceof qe && e.push(i.mark);
  }
  return e;
}
function sl(n) {
  let e = fe.get(n);
  return e && e.setDOM(n.cloneNode()), n;
}
class di extends tn {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
di.inline = /* @__PURE__ */ new di("span");
di.block = /* @__PURE__ */ new di("div");
const ol = /* @__PURE__ */ new class extends tn {
  toDOM() {
    return document.createElement("br");
  }
  get isHidden() {
    return !0;
  }
  get editable() {
    return !0;
  }
}();
class sh {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = K.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new so(e, e.contentDOM), this.updateInner([new ot(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let i = e.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: c, toA: h }) => h < this.minWidthFrom || c > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let r = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? r = this.domChanged.newSel.head : !K2(e.changes, this.hasComposition) && !e.selectionSet && (r = e.state.selection.main.head));
    let s = r > -1 ? Y2(this.view, e.changes, r) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: c, to: h } = this.hasComposition;
      i = new ot(c, h, e.changes.mapPos(c, -1), e.changes.mapPos(h, 1)).addToSet(i.slice());
    }
    this.hasComposition = s ? { from: s.range.fromB, to: s.range.toB } : null, (Z.ie || Z.chrome) && !s && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let o = this.decorations, l = this.blockWrappers;
    this.updateDeco();
    let u = V2(o, this.decorations, e.changes);
    u.length && (i = ot.extendWithRanges(i, u));
    let a = G2(l, this.blockWrappers, e.changes);
    return a.length && (i = ot.extendWithRanges(i, a)), s && !i.some((c) => c.fromA <= s.range.fromA && c.toA >= s.range.toA) && (i = s.range.addToSet(i.slice())), this.tile.flags & 2 && i.length == 0 ? !1 : (this.updateInner(i, s), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: i } = this.view;
    i.ignore(() => {
      if (t || e.length) {
        let o = this.tile, l = new z2(this.view, o, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && fe.get(t.text) && l.cache.reused.set(
          fe.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = l.run(e, t), ru(o, l.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let s = Z.chrome || Z.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(s), s && (s.written || i.selectionRange.focusNode != s.node || !this.tile.dom.contains(s.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let r = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let s of this.tile.children)
        s.isWidget() && s.widget instanceof ll && r.push(s.dom);
    i.updateGaps(r);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(p0) && (this.editContextFormatting = i.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: i } = this.tile, r = this.view.root.activeElement, s = r == i, o = !s && !(this.view.state.facet(Vt) || i.tabIndex > -1) && Ui(i, this.view.observer.selectionRange) && !(r && i.contains(r));
    if (!(s || t || o))
      return;
    let l = this.forceSelection;
    this.forceSelection = !1;
    let u = this.view.state.selection.main, a, c;
    if (u.empty ? c = a = this.inlineDOMNearPos(u.anchor, u.assoc || 1) : (c = this.inlineDOMNearPos(u.head, u.head == u.from ? 1 : -1), a = this.inlineDOMNearPos(u.anchor, u.anchor == u.from ? 1 : -1)), Z.gecko && u.empty && !this.hasComposition && F2(a)) {
      let f = document.createTextNode("");
      this.view.observer.ignore(() => a.node.insertBefore(f, a.node.childNodes[a.offset] || null)), a = c = new Ot(f, 0), l = !0;
    }
    let h = this.view.observer.selectionRange;
    (l || !h.focusNode || (!Hi(a.node, a.offset, h.anchorNode, h.anchorOffset) || !Hi(c.node, c.offset, h.focusNode, h.focusOffset)) && !this.suppressWidgetCursorChange(h, u)) && (this.view.observer.ignore(() => {
      Z.android && Z.chrome && i.contains(h.focusNode) && H2(h.focusNode, i) && (i.blur(), i.focus({ preventScroll: !0 }));
      let f = cr(this.view.root);
      if (f) if (u.empty) {
        if (Z.gecko) {
          let d = W2(a.node, a.offset);
          if (d && d != 3) {
            let O = (d == 1 ? e0 : t0)(a.node, a.offset);
            O && (a = new Ot(O.node, O.offset));
          }
        }
        f.collapse(a.node, a.offset), u.bidiLevel != null && f.caretBidiLevel !== void 0 && (f.caretBidiLevel = u.bidiLevel);
      } else if (f.extend) {
        f.collapse(a.node, a.offset);
        try {
          f.extend(c.node, c.offset);
        } catch {
        }
      } else {
        let d = document.createRange();
        u.anchor > u.head && ([a, c] = [c, a]), d.setEnd(c.node, c.offset), d.setStart(a.node, a.offset), f.removeAllRanges(), f.addRange(d);
      }
      o && this.view.root.activeElement == i && (i.blur(), r && r.focus());
    }), this.view.observer.setSelectionRange(a, c)), this.impreciseAnchor = a.precise ? null : new Ot(h.anchorNode, h.anchorOffset), this.impreciseHead = c.precise ? null : new Ot(h.focusNode, h.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Hi(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, i = cr(e.root), { anchorNode: r, anchorOffset: s } = e.observer.selectionRange;
    if (!i || !t.empty || !t.assoc || !i.modify)
      return;
    let o = this.lineAt(t.head, t.assoc);
    if (!o)
      return;
    let l = o.posAtStart;
    if (t.head == l || t.head == l + o.length)
      return;
    let u = this.coordsAt(t.head, -1), a = this.coordsAt(t.head, 1);
    if (!u || !a || u.bottom > a.top)
      return;
    let c = this.domAtPos(t.head + t.assoc, t.assoc);
    i.collapse(c.node, c.offset), i.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let h = e.observer.selectionRange;
    e.docView.posFromDOM(h.anchorNode, h.anchorOffset) != t.from && i.collapse(r, s);
  }
  posFromDOM(e, t) {
    let i = this.tile.nearest(e);
    if (!i)
      return this.tile.dom.compareDocumentPosition(e) & 2 ? 0 : this.view.state.doc.length;
    let r = i.posAtStart;
    if (i.isComposite()) {
      let s;
      if (e == i.dom)
        s = i.dom.childNodes[t];
      else {
        let o = Jt(e) == 0 ? 0 : t == 0 ? -1 : 1;
        for (; ; ) {
          let l = e.parentNode;
          if (l == i.dom)
            break;
          o == 0 && l.firstChild != l.lastChild && (e == l.firstChild ? o = -1 : o = 1), e = l;
        }
        o < 0 ? s = e : s = e.nextSibling;
      }
      if (s == i.dom.firstChild)
        return r;
      for (; s && !fe.get(s); )
        s = s.nextSibling;
      if (!s)
        return r + i.length;
      for (let o = 0, l = r; ; o++) {
        let u = i.children[o];
        if (u.dom == s)
          return l;
        l += u.length + u.breakAfter;
      }
    } else return i.isText() ? e == i.dom ? r + t : r + (t ? i.length : 0) : r;
  }
  domAtPos(e, t) {
    let { tile: i, offset: r } = this.tile.resolveBlock(e, t);
    return i.isWidget() ? i.domPosFor(r, t) : i.domIn(r, t);
  }
  inlineDOMNearPos(e, t) {
    let i, r = -1, s = !1, o, l = -1, u = !1;
    return this.tile.blockTiles((a, c) => {
      if (a.isWidget()) {
        if (a.flags & 32 && c >= e)
          return !0;
        a.flags & 16 && (s = !0);
      } else {
        let h = c + a.length;
        if (c <= e && (i = a, r = e - c, s = h < e), h >= e && !o && (o = a, l = e - c, u = c > e), c > e && o)
          return !0;
      }
    }), !i && !o ? this.domAtPos(e, t) : (s && o ? i = null : u && i && (o = null), i && t < 0 || !o ? i.domIn(r, t) : o.domIn(l, t));
  }
  // Get the coord of the element at the given side of the given
  // position. If rtl is given, flatten it using that text direction.
  coordsAt(e, t, i) {
    let { tile: r, offset: s } = this.tile.resolveBlock(e, t);
    return r.isWidget() ? r.widget instanceof ll ? null : r.coordsInWidget(s, t, !0) : r.coordsIn(s, t, i);
  }
  lineAt(e, t) {
    let { tile: i } = this.tile.resolveBlock(e, t);
    return i.isLine() ? i : null;
  }
  coordsForChar(e) {
    let { tile: t, offset: i } = this.tile.resolveBlock(e, 1);
    if (!t.isLine())
      return null;
    function r(s, o) {
      if (s.isComposite())
        for (let l of s.children) {
          if (l.length >= o) {
            let u = r(l, o);
            if (u)
              return u;
          }
          if (o -= l.length, o < 0)
            break;
        }
      else if (s.isText() && o < s.length) {
        let l = Ce(s.text, o);
        if (l == o)
          return null;
        let u = fr(s.dom, o, l).getClientRects();
        for (let a = 0; a < u.length; a++) {
          let c = u[a];
          if (a == u.length - 1 || c.top < c.bottom && c.left < c.right)
            return c;
        }
      }
      return null;
    }
    return r(t, i);
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: i, to: r } = e, s = this.view.contentDOM.clientWidth, o = s > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, u = this.view.textDirection == pe.LTR, a = 0, c = (h, f, d) => {
      for (let O = 0; O < h.children.length && !(f > r); O++) {
        let m = h.children[O], g = f + m.length, b = m.dom.getBoundingClientRect(), { height: w } = b;
        if (d && !O && (a += b.top - d.top), m instanceof Gt)
          g > i && c(m, f, b);
        else if (f >= i && (a > 0 && t.push(-a), t.push(w + a), a = 0, o)) {
          let S = m.dom.lastChild, Q = S ? Gi(S) : [];
          if (Q.length) {
            let y = Q[Q.length - 1], A = u ? y.right - b.left : b.right - y.left;
            A > l && (l = A, this.minWidth = s, this.minWidthFrom = f, this.minWidthTo = g);
          }
        }
        d && O == h.children.length - 1 && (a += d.bottom - b.bottom), f = g + m.breakAfter;
      }
    };
    return c(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? pe.RTL : pe.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((o) => {
      if (o.isLine() && o.children.length && o.length <= 20) {
        let l = 0, u;
        for (let a of o.children) {
          if (!a.isText() || /[^ -~]/.test(a.text))
            return;
          let c = Gi(a.dom);
          if (c.length != 1)
            return;
          l += c[0].width, u = c[0].height;
        }
        if (l)
          return {
            lineHeight: o.dom.getBoundingClientRect().height,
            charWidth: l / o.length,
            textHeight: u
          };
      }
    });
    if (e)
      return e;
    let t = document.createElement("div"), i, r, s;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.tile.dom.appendChild(t);
      let o = Gi(t.firstChild)[0];
      i = t.getBoundingClientRect().height, r = o && o.width ? o.width / 27 : 7, s = o && o.height ? o.height : i, t.remove();
    }), { lineHeight: i, charWidth: r, textHeight: s };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, r = 0; ; r++) {
      let s = r == t.viewports.length ? null : t.viewports[r], o = s ? s.from - 1 : this.view.state.doc.length;
      if (o > i) {
        let l = (t.lineBlockAt(o).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
        e.push(K.replace({
          widget: new ll(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!s)
        break;
      i = s.to + 1;
    }
    return K.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(io).map((s) => (this.dynamicDecorationMap[e++] = typeof s == "function") ? s(this.view) : s), i = !1, r = this.view.state.facet(Ju).map((s, o) => {
      let l = typeof s == "function";
      return l && (i = !0), l ? s(this.view) : s;
    });
    for (r.length && (this.dynamicDecorationMap[e++] = i, t.push(ie.join(r))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(g0).map((s) => typeof s == "function" ? s(this.view) : s);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let a = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = a.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let a of this.view.state.facet(O0))
      try {
        if (a(this.view, e.range, e))
          return !0;
      } catch (c) {
        Et(this.view.state, c, "scroll handler");
      }
    let { range: t } = e, i = this.coordsAt(t.head, t.assoc || (t.head > t.anchor ? -1 : 1)), r;
    if (!i)
      return;
    !t.empty && (r = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, r.left),
      top: Math.min(i.top, r.top),
      right: Math.max(i.right, r.right),
      bottom: Math.max(i.bottom, r.bottom)
    });
    let s = S0(this.view), o = {
      left: i.left - s.left,
      top: i.top - s.top,
      right: i.right + s.right,
      bottom: i.bottom + s.bottom
    }, { offsetWidth: l, offsetHeight: u } = this.view.scrollDOM;
    if (g2(this.view.scrollDOM, o, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, l), -l), Math.max(Math.min(e.yMargin, u), -u), this.view.textDirection == pe.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (i.top > window.visualViewport.offsetTop + window.visualViewport.height || i.bottom < window.visualViewport.offsetTop)) {
      let a = this.view.docView.lineAt(t.head, 1);
      if (a) {
        let c = Gd(a.dom);
        a.dom.scrollIntoView({ block: "nearest" }), Hd(c, !1);
      }
    }
  }
  lineHasWidget(e) {
    let t = (i) => i.isWidget() || i.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    ru(this.tile);
  }
}
function ru(n, e) {
  let t = e?.get(n);
  if (t != 1) {
    t == null && n.destroy();
    for (let i of n.children)
      ru(i, e);
  }
}
function F2(n) {
  return we(n.node) && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
function Q0(n, e) {
  let t = n.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let i = e0(t.focusNode, t.focusOffset), r = t0(t.focusNode, t.focusOffset), s = i || r;
  if (r && i && r.node != i.node) {
    let l = fe.get(r.node);
    if (!l || l.isText() && l.text != r.node.nodeValue)
      s = r;
    else if (n.docView.lastCompositionAfterCursor) {
      let u = fe.get(i.node);
      !u || u.isText() && u.text != i.node.nodeValue || (s = r);
    }
  }
  if (n.docView.lastCompositionAfterCursor = s != i, !s)
    return null;
  let o = e - s.offset;
  return { from: o, to: o + s.node.nodeValue.length, node: s.node };
}
function Y2(n, e, t) {
  let i = Q0(n, t);
  if (!i)
    return null;
  let { node: r, from: s, to: o } = i, l = r.nodeValue;
  if (/[\n\r]/.test(l) || n.state.doc.sliceString(i.from, i.to) != l)
    return null;
  let u = e.invertedDesc;
  return { range: new ot(u.mapPos(s), u.mapPos(o), s, o), text: r };
}
function W2(n, e) {
  return we(n) ? (e && n.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < n.childNodes.length && n.childNodes[e].contentEditable == "false" ? 2 : 0) : 0;
}
let N2 = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ti(e, t, this.changes);
  }
  comparePoint(e, t) {
    ti(e, t, this.changes);
  }
  boundChange(e) {
    ti(e, e, this.changes);
  }
};
function V2(n, e, t) {
  let i = new N2();
  return ie.compare(n, e, t, i), i.changes;
}
class U2 {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ti(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    ti(e, e, this.changes);
  }
}
function G2(n, e, t) {
  let i = new U2();
  return ie.compare(n, e, t, i), i.changes;
}
function H2(n, e) {
  for (let t = n; t && t != e; t = t.assignedSlot || t.parentNode)
    if (we(t) && t.contentEditable == "false")
      return !0;
  return !1;
}
function K2(n, e) {
  let t = !1;
  return e && n.iterChangedRanges((i, r) => {
    i < e.to && r > e.from && (t = !0);
  }), t;
}
class ll extends tn {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return e.className = "cm-gap", this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
function J2(n, e, t = 1) {
  let i = n.charCategorizer(e), r = n.doc.lineAt(e), s = e - r.from;
  if (r.length == 0)
    return v.cursor(e);
  s == 0 ? t = 1 : s == r.length && (t = -1);
  let o = s, l = s;
  t < 0 ? o = Ce(r.text, s, !1) : l = Ce(r.text, s);
  let u = i(r.text.slice(o, l));
  for (; o > 0; ) {
    let a = Ce(r.text, o, !1);
    if (i(r.text.slice(a, o)) != u)
      break;
    o = a;
  }
  for (; l < r.length; ) {
    let a = Ce(r.text, l);
    if (i(r.text.slice(l, a)) != u)
      break;
    l = a;
  }
  return v.undirectionalRange(o + r.from, l + r.from);
}
function ex(n, e, t, i, r) {
  let s = Math.round((i - e.left) * n.defaultCharacterWidth);
  if (n.lineWrapping && t.height > n.defaultLineHeight * 1.5) {
    let l = n.viewState.heightOracle.textHeight, u = Math.floor((r - t.top - (n.defaultLineHeight - l) * 0.5) / l);
    s += u * n.viewState.heightOracle.lineLength;
  }
  let o = n.state.sliceDoc(t.from, t.to);
  return t.from + u2(o, s, n.state.tabSize);
}
function tx(n, e, t) {
  let i = n.lineBlockAt(e);
  if (Array.isArray(i.type)) {
    let r;
    for (let s of i.type) {
      if (s.from > e)
        break;
      if (!(s.to < e)) {
        if (s.from < e && s.to > e)
          return s;
        (!r || s.type == at.Text && (r.type != s.type || (t < 0 ? s.from < e : s.to > e))) && (r = s);
      }
    }
    return r || i;
  }
  return i;
}
function nx(n, e, t, i) {
  let r = tx(n, e.head, e.assoc || -1), s = !i || r.type != at.Text || !(n.lineWrapping || r.widgetLineBreaks) ? null : n.coordsAtPos(e.assoc < 0 && e.head > r.from ? e.head - 1 : e.head);
  if (s) {
    let o = n.dom.getBoundingClientRect(), l = n.textDirectionAt(r.from), u = n.posAndSideAtCoords({
      x: t == (l == pe.LTR) ? o.right - 1 : o.left + 1,
      y: (s.top + s.bottom) / 2
    });
    if (u)
      return v.cursor(u.pos, u.assoc);
  }
  return v.cursor(t ? r.to : r.from, t ? 1 : -1);
}
function oh(n, e, t, i) {
  let r = n.state.doc.lineAt(e.head), s = n.bidiSpans(r), o = n.textDirectionAt(r.from);
  for (let l = e, u = null; ; ) {
    let a = _2(r, s, o, l, t), c = o0;
    if (!a) {
      if (r.number == (t ? n.state.doc.lines : 1))
        return l;
      c = `
`, r = n.state.doc.line(r.number + (t ? 1 : -1)), s = n.bidiSpans(r), a = t ? v.cursor(r.from, -1) : v.cursor(r.to, 1);
    }
    if (u) {
      if (!u(c))
        return l;
    } else {
      if (!i)
        return a;
      u = i(c);
    }
    l = a;
  }
}
function ix(n, e, t) {
  let i = n.state.charCategorizer(e), r = i(t);
  return (s) => {
    let o = i(s);
    return r == Ut.Space && (r = o), r == o;
  };
}
function rx(n, e, t, i) {
  let r = e.head, s = t ? 1 : -1;
  if (r == (t ? n.state.doc.length : 0))
    return v.cursor(r, e.assoc);
  let o = e.goalColumn, l, u = n.contentDOM.getBoundingClientRect(), a = n.coordsAtPos(r, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), c = n.documentTop;
  if (a)
    o == null && (o = a.left - u.left), l = s < 0 ? a.top : a.bottom;
  else {
    let O = n.viewState.lineBlockAt(r);
    o == null && (o = Math.min(u.right - u.left, n.defaultCharacterWidth * (r - O.from))), l = (s < 0 ? O.top : O.bottom) + c;
  }
  let h = u.left + o, f = n.viewState.heightOracle.textHeight >> 1, d = i ?? f;
  for (let O = 0; ; O += f) {
    let m = l + (d + O) * s, g = su(n, { x: h, y: m }, !1, s);
    if (t ? m > u.bottom : m < u.top)
      return v.cursor(g.pos, g.assoc);
    let b = n.coordsAtPos(g.pos, g.assoc), w = b ? (b.top + b.bottom) / 2 : 0;
    if (!b || (t ? w > l : w < l))
      return v.cursor(g.pos, g.assoc, void 0, o);
  }
}
function Ki(n, e, t) {
  for (; ; ) {
    let i = 0;
    for (let r of n)
      r.between(e - 1, e + 1, (s, o, l) => {
        if (e > s && e < o) {
          let u = i || t || (e - s < o - e ? -1 : 1);
          e = u < 0 ? s : o, i = u;
        }
      });
    if (!i)
      return e;
  }
}
function w0(n, e) {
  let t = null;
  for (let i = 0; i < e.ranges.length; i++) {
    let r = e.ranges[i], s = null;
    if (r.empty) {
      let o = Ki(n, r.from, 0);
      o != r.from && (s = v.cursor(o, -1));
    } else {
      let o = Ki(n, r.from, -1), l = Ki(n, r.to, 1);
      (o != r.from || l != r.to) && (r.undirectional ? s = v.undirectionalRange(r.from, r.to) : s = v.range(r.from == r.anchor ? o : l, r.from == r.head ? o : l));
    }
    s && (t || (t = e.ranges.slice()), t[i] = s);
  }
  return t ? v.create(t, e.mainIndex) : e;
}
function ul(n, e, t) {
  let i = Ki(n.state.facet(vr).map((r) => r(n)), t.from, e.head > t.from ? -1 : 1);
  return i == t.from ? t : v.cursor(i, i < t.from ? 1 : -1);
}
class _t {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function su(n, e, t, i) {
  let r = n.contentDOM.getBoundingClientRect(), s = r.top + n.viewState.paddingTop, { x: o, y: l } = e, u = l - s, a;
  for (; ; ) {
    if (u < 0)
      return new _t(0, 1);
    if (u > n.viewState.docHeight)
      return new _t(n.state.doc.length, -1);
    if (a = n.elementAtHeight(u), i == null)
      break;
    if (a.type == at.Text) {
      if (i < 0 ? a.to < n.viewport.from : a.from > n.viewport.to)
        break;
      let f = n.docView.coordsAt(i < 0 ? a.from : a.to, i > 0 ? -1 : 1);
      if (f && (i < 0 ? f.top <= u + s : f.bottom >= u + s))
        break;
    }
    let h = n.viewState.heightOracle.textHeight / 2;
    u = i > 0 ? a.bottom + h : a.top - h;
  }
  if (n.viewport.from >= a.to || n.viewport.to <= a.from) {
    if (t)
      return null;
    if (a.type == at.Text) {
      let h = ex(n, r, a, o, l);
      return new _t(h, h == a.from ? 1 : -1);
    }
  }
  if (a.type != at.Text)
    return u < (a.top + a.bottom) / 2 ? new _t(a.from, 1) : new _t(a.to, -1);
  let c = n.docView.lineAt(a.from, 2);
  return (!c || c.length != a.length) && (c = n.docView.lineAt(a.from, -2)), new sx(n, o, l, n.textDirectionAt(a.from)).scanTile(c, a.from);
}
class sx {
  constructor(e, t, i, r) {
    this.view = e, this.x = t, this.y = i, this.baseDir = r, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: i, spans: r } = this.bidiSpansAt(e);
    return r[Tt.find(r, e - i.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: i, spans: r } = this.bidiSpansAt(e);
    return r[Tt.find(r, e - i.from, -1, t)].dir;
  }
  // Used to short-circuit bidi tests for content with a uniform direction
  bidiIn(e, t) {
    let { spans: i, line: r } = this.bidiSpansAt(e);
    return i.length > 1 || i.length && (i[0].level != this.baseDir || i[0].to + r.from < t);
  }
  // Scan through the rectangles for the content of a tile with inline
  // content, looking for one that overlaps the queried position
  // vertically and is closest horizontally. The caller is responsible
  // for dividing its content into N pieces, and pass an array with
  // N+1 positions (including the position after the last piece). For
  // a text tile, these will be character clusters, for a composite
  // tile, these will be child tiles.
  scan(e, t, i = !1) {
    let r = 0, s = e.length - 1, o = /* @__PURE__ */ new Set(), l = this.bidiIn(e[0], e[s]), u, a, c = -1, h = 1e9, f;
    e: for (; r < s; ) {
      let O = s - r, m = r + s >> 1;
      t: if (o.has(m)) {
        for (let w = 1; w < O; w++) {
          let S = m + w;
          if (S >= s && (S -= O), !o.has(S)) {
            m = S;
            break t;
          }
        }
        break e;
      }
      o.add(m);
      let g = t(m), b = 0;
      if (g)
        for (let w = 0; w < g.length; w++) {
          let S = g[w];
          if (!(S.width == 0 && g.length > 1))
            if (S.bottom < this.y)
              (!u || u.bottom < S.bottom) && (u = S), b = 1;
            else if (S.top > this.y)
              (!a || a.top > S.top) && (a = S), b = -1;
            else {
              let Q = S.left > this.x ? this.x - S.left : S.right < this.x ? this.x - S.right : 0, y = Math.abs(Q);
              y < h && (c = m, h = y, f = S), Q && (b = Q < 0 == (this.baseDir == pe.LTR) ? -1 : 1);
            }
        }
      b == -1 && (!l || this.baseDirAt(e[m], 1)) ? s = m : b == 1 && (!l || this.baseDirAt(e[m + 1], -1)) && (r = m + 1);
    }
    if (!f) {
      if (!a && !u)
        return { i: 0, after: !1 };
      let O = u && (!a || this.y - u.bottom < a.top - this.y) ? u : a;
      return this.y = (O.top + O.bottom) / 2, this.scan(e, t, !0);
    }
    if (h && !i) {
      let { top: O, bottom: m } = f;
      if (u && u.bottom > (O + O + m) / 3)
        return this.y = u.bottom - 1, this.scan(e, t, !0);
      if (a && a.top < (O + m + m) / 3)
        return this.y = a.top + 1, this.scan(e, t, !0);
    }
    let d = (l ? this.dirAt(e[c], 1) : this.baseDir) == pe.LTR;
    return {
      i: c,
      // Test whether x is closes to the start or end of this element
      after: this.x > (f.left + f.right) / 2 == d
    };
  }
  scanText(e, t) {
    let i = [];
    for (let s = 0; s < e.length; s = Ce(e.text, s))
      i.push(t + s);
    i.push(t + e.length);
    let r = this.scan(i, (s) => {
      let o = i[s] - t, l = i[s + 1] - t;
      return fr(e.dom, o, l).getClientRects();
    });
    return r.after ? new _t(i[r.i + 1], -1) : new _t(i[r.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new _t(t, 1);
    if (e.children.length == 1) {
      let l = e.children[0];
      if (l.isText())
        return this.scanText(l, t);
      if (l.isComposite())
        return this.scanTile(l, t);
    }
    let i = [t];
    for (let l = 0, u = t; l < e.children.length; l++)
      i.push(u += e.children[l].length);
    let r = this.scan(i, (l) => {
      let u = e.children[l];
      return u.flags & 48 ? null : (we(u.dom) ? u.dom : fr(u.dom, 0, u.length)).getClientRects();
    }), s = e.children[r.i], o = i[r.i];
    return s.isText() ? this.scanText(s, o) : s.isComposite() ? this.scanTile(s, o) : r.after ? new _t(i[r.i + 1], -1) : new _t(o, 1);
  }
}
const Vn = "￿";
class ox {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(H.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Vn;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let r = e; ; ) {
      this.findPointBefore(i, r);
      let s = this.text.length;
      this.readNode(r);
      let o = fe.get(r), l = r.nextSibling;
      if (l == t) {
        o?.breakAfter && !l && i != this.view.contentDOM && this.lineBreak();
        break;
      }
      let u = fe.get(l);
      (o && u ? o.breakAfter : (o ? o.breakAfter : vs(r)) || vs(l) && (r.nodeName != "BR" || o?.isWidget()) && this.text.length > s) && !ux(l, t) && this.lineBreak(), r = l;
    }
    return this.findPointBefore(i, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let i of this.points)
      i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
    for (let i = 0, r = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let s = -1, o = 1, l;
      if (this.lineSeparator ? (s = t.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (l = r.exec(t)) && (s = l.index, o = l[0].length), this.append(t.slice(i, s < 0 ? t.length : s)), s < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let u of this.points)
          u.node == e && u.pos > this.text.length && (u.pos -= o - 1);
      i = s + o;
    }
  }
  readNode(e) {
    let t = fe.get(e), i = t && t.overrideDOMText;
    if (i != null) {
      this.findPointInside(e, i.length);
      for (let r = i.iter(); !r.next().done; )
        r.lineBreak ? this.lineBreak() : this.append(r.value);
    } else ci(e) ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : we(e) && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let i of this.points)
      i.node == e && e.childNodes[i.offset] == t && (i.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let i of this.points)
      (ci(e) ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + (lx(e, i.node, i.offset) ? t : 0));
  }
}
function lx(n, e, t) {
  for (; ; ) {
    if (!e || t < Jt(e))
      return !1;
    if (e == n)
      return !0;
    t = xn(e) + 1, e = e.parentNode;
  }
}
function ux(n, e) {
  let t;
  for (; !(n == e || !n); n = n.nextSibling) {
    let i = fe.get(n);
    if (!i?.isWidget())
      return !1;
    i && (t || (t = [])).push(i);
  }
  if (t)
    for (let i of t) {
      let r = i.overrideDOMText;
      if (r?.length)
        return !1;
    }
  return !0;
}
class lh {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class ax {
  constructor(e, t, i, r) {
    this.typeOver = r, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: s, impreciseAnchor: o } = e.docView, l = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = $0(e.docView.tile, t, i, 0))) {
      let u = s || o ? [] : hx(e), a = new ox(u, e);
      a.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = a.text, this.newSel = fx(u, this.bounds.from);
    } else {
      let u = e.observer.selectionRange, a = s && s.node == u.focusNode && s.offset == u.focusOffset || !Jl(e.contentDOM, u.focusNode) ? l.main.head : e.docView.posFromDOM(u.focusNode, u.focusOffset), c = o && o.node == u.anchorNode && o.offset == u.anchorOffset || !Jl(e.contentDOM, u.anchorNode) ? l.main.anchor : e.docView.posFromDOM(u.anchorNode, u.anchorOffset), h = e.viewport;
      if ((Z.ios || Z.chrome) && a != c && Math.min(a, c) <= l.main.from && Math.max(a, c) >= l.main.to && (h.from > 0 || h.to < e.state.doc.length)) {
        let f = Math.min(a, c), d = Math.max(a, c), O = h.from - f, m = h.to - d;
        (O == 0 || O == 1 || f == 0) && (m == 0 || m == -1 || d == e.state.doc.length) && (a = 0, c = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && l.ranges.length > 1)
        this.newSel = l.replaceRange(v.range(c, a));
      else if (e.lineWrapping && c == a && !(l.main.empty && l.main.head == a) && e.inputState.lastTouchTime > Date.now() - 100) {
        let f = e.coordsAtPos(a, -1), d = 0;
        f && (d = e.inputState.lastTouchY <= f.bottom ? -1 : 1), this.newSel = v.create([v.cursor(a, d)]);
      } else
        this.newSel = v.single(c, a);
    }
  }
}
function $0(n, e, t, i) {
  if (n.isComposite()) {
    let r = -1, s = -1, o = -1, l = -1;
    for (let u = 0, a = i, c = i; u < n.children.length; u++) {
      let h = n.children[u], f = a + h.length;
      if (a < e && f > t)
        return $0(h, e, t, a);
      if (f >= e && r == -1 && (r = u, s = a), a > t && h.dom.parentNode == n.dom) {
        o = u, l = c;
        break;
      }
      c = f, a = f + h.breakAfter;
    }
    return {
      from: s,
      to: l < 0 ? i + n.length : l,
      startDOM: (r ? n.children[r - 1].dom.nextSibling : null) || n.dom.firstChild,
      endDOM: o < n.children.length && o >= 0 ? n.children[o].dom : null
    };
  } else return n.isText() ? { from: i, to: i + n.length, startDOM: n.dom, endDOM: n.dom.nextSibling } : null;
}
function P0(n, e) {
  let t, { newSel: i } = e, { state: r } = n, s = r.selection.main, o = n.inputState.lastKeyTime > Date.now() - 100 ? n.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: l, to: u } = e.bounds, a = s.from, c = null;
    (o === 8 || Z.android && e.text.length < u - l) && (a = s.to, c = "end");
    let h = r.doc.sliceString(l, u, Vn), f, d;
    !s.empty && s.from >= l && s.to <= u && (e.typeOver || h != e.text) && h.slice(0, s.from - l) == e.text.slice(0, s.from - l) && h.slice(s.to - l) == e.text.slice(f = e.text.length - (h.length - (s.to - l))) ? t = {
      from: s.from,
      to: s.to,
      insert: U.of(e.text.slice(s.from - l, f).split(Vn))
    } : (d = v0(h, e.text, a - l, c)) && (Z.chrome && o == 13 && d.toB == d.from + 2 && e.text.slice(d.from, d.toB) == Vn + Vn && d.toB--, t = {
      from: l + d.from,
      to: l + d.toA,
      insert: U.of(e.text.slice(d.from, d.toB).split(Vn))
    });
  } else i && (!n.hasFocus && r.facet(Vt) || ou(i, s)) && (i = null);
  if (!t && !i)
    return !1;
  if ((Z.mac || Z.android) && t && t.from == t.to && t.from == s.head - 1 && /^\. ?$/.test(t.insert.toString()) && n.contentDOM.getAttribute("autocorrect") == "off" ? (i && t.insert.length == 2 && (i = v.single(i.main.anchor - 1, i.main.head - 1)), t = { from: t.from, to: t.to, insert: U.of([t.insert.toString().replace(".", " ")]) }) : r.doc.lineAt(s.from).to < s.to && n.docView.lineHasWidget(s.to) && n.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: s.from,
    to: s.to,
    insert: r.toText(n.inputState.insertingText)
  } : Z.chrome && t && t.from == t.to && t.from == s.head && t.insert.toString() == `
 ` && n.lineWrapping && (i && (i = v.single(i.main.anchor - 1, i.main.head - 1)), t = { from: s.from, to: s.to, insert: U.of([" "]) }), t)
    return ea(n, t, i, o);
  if (i && !ou(i, s)) {
    let l = !1, u = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (l = !0), u = n.inputState.lastSelectionOrigin, u == "select.pointer" && (i = w0(r.facet(vr).map((a) => a(n)), i))), n.dispatch({ selection: i, scrollIntoView: l, userEvent: u }), !0;
  } else
    return !1;
}
function ea(n, e, t, i = -1) {
  if (Z.ios && n.inputState.flushIOSKey(e))
    return !0;
  let r = n.state.selection.main;
  if (Z.android && (e.to == r.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == r.from || e.from == r.from - 1 && n.state.sliceDoc(e.from, r.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && ni(n.contentDOM, "Enter", 13) || (e.from == r.from - 1 && e.to == r.to && e.insert.length == 0 || i == 8 && e.insert.length < e.to - e.from && e.to > r.head) && ni(n.contentDOM, "Backspace", 8) || e.from == r.from && e.to == r.to + 1 && e.insert.length == 0 && ni(n.contentDOM, "Delete", 46)))
    return !0;
  let s = e.insert.toString();
  n.inputState.composing >= 0 && n.inputState.composing++;
  let o, l = () => o || (o = cx(n, e, t));
  return n.state.facet(h0).some((u) => u(n, e.from, e.to, s, l)) || n.dispatch(l()), !0;
}
function cx(n, e, t) {
  let i, r = n.state, s = r.selection.main, o = -1;
  if (e.from == e.to && e.from < s.from || e.from > s.to) {
    let u = e.from < s.from ? -1 : 1, a = u < 0 ? s.from : s.to, c = Ki(r.facet(vr).map((h) => h(n)), a, u);
    e.from == c && (o = c);
  }
  if (o > -1)
    i = {
      changes: e,
      selection: v.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= s.from && e.to <= s.to && e.to - e.from >= (s.to - s.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && n.inputState.composing < 0) {
    let u = s.from < e.from ? r.sliceDoc(s.from, e.from) : "", a = s.to > e.to ? r.sliceDoc(e.to, s.to) : "";
    i = r.replaceSelection(n.state.toText(u + e.insert.sliceString(0, void 0, n.state.lineBreak) + a));
  } else {
    let u = r.changes(e), a = t && t.main.to <= u.newLength ? t.main : void 0;
    if (r.selection.ranges.length > 1 && (n.inputState.composing >= 0 || n.inputState.compositionPendingChange) && e.to <= s.to + 10 && e.to >= s.to - 10) {
      let c = n.state.sliceDoc(e.from, e.to), h, f = t && Q0(n, t.main.head);
      if (f) {
        let O = e.insert.length - (e.to - e.from);
        h = { from: f.from, to: f.to - O };
      } else
        h = n.state.doc.lineAt(s.head);
      let d = s.to - e.to;
      i = r.changeByRange((O) => {
        if (O.from == s.from && O.to == s.to)
          return { changes: u, range: a || O.map(u) };
        let m = O.to - d, g = m - c.length;
        if (n.state.sliceDoc(g, m) != c || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        m >= h.from && g <= h.to)
          return { range: O };
        let b = r.changes({ from: g, to: m, insert: e.insert }), w = O.to - s.to;
        return {
          changes: b,
          range: a ? v.range(Math.max(0, a.anchor + w), Math.max(0, a.head + w)) : O.map(b)
        };
      });
    } else
      i = {
        changes: u,
        selection: a && r.selection.replaceRange(a)
      };
  }
  let l = "input.type";
  return (n.composing || n.inputState.compositionPendingChange && n.inputState.compositionEndedAt > Date.now() - 50) && (n.inputState.compositionPendingChange = !1, l += ".compose", n.inputState.compositionFirstChange && (l += ".start", n.inputState.compositionFirstChange = !1)), r.update(i, { userEvent: l, scrollIntoView: !0 });
}
function v0(n, e, t, i) {
  let r = Math.min(n.length, e.length), s = 0;
  for (; s < r && n.charCodeAt(s) == e.charCodeAt(s); )
    s++;
  if (s == r && n.length == e.length)
    return null;
  let o = n.length, l = e.length;
  for (; o > 0 && l > 0 && n.charCodeAt(o - 1) == e.charCodeAt(l - 1); )
    o--, l--;
  if (i == "end") {
    let u = Math.max(0, s - Math.min(o, l));
    t -= o + u - s;
  }
  if (o < s && n.length < e.length) {
    let u = t <= s && t >= o ? s - t : 0;
    s -= u, l = s + (l - o), o = s;
  } else if (l < s) {
    let u = t <= s && t >= l ? s - t : 0;
    s -= u, o = s + (o - l), l = s;
  }
  return { from: s, toA: o, toB: l };
}
function hx(n) {
  let e = [];
  if (n.root.activeElement != n.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: r, focusOffset: s } = n.observer.selectionRange;
  return t && (e.push(new lh(t, i)), (r != t || s != i) && e.push(new lh(r, s))), e;
}
function fx(n, e) {
  if (n.length == 0)
    return null;
  let t = n[0].pos, i = n.length == 2 ? n[1].pos : t;
  return t < 0 || i < 0 ? null : t == i ? v.create([v.cursor(i + e, -1)]) : v.single(t + e, i + e);
}
function ou(n, e) {
  return e.head == n.main.head && e.anchor == n.main.anchor;
}
class dx {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, Z.safari && e.contentDOM.addEventListener("input", () => null), Z.gecko && Ax(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !yx(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
  }
  runHandlers(e, t) {
    let i = this.handlers[e];
    if (i) {
      for (let r of i.observers)
        r(this.view, t);
      for (let r of i.handlers) {
        if (t.defaultPrevented)
          break;
        if (r(this.view, t)) {
          t.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(e) {
    let t = px(e), i = this.handlers, r = this.view.contentDOM;
    for (let s in t)
      if (s != "scroll") {
        let o = !t[s].handlers.length, l = i[s];
        l && o != !l.handlers.length && (r.removeEventListener(s, this.handleEvent), l = null), l || r.addEventListener(s, this.handleEvent, { passive: o });
      }
    for (let s in i)
      s != "scroll" && !t[s] && r.removeEventListener(s, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && A0.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), Z.android && Z.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (Z.ios && !e.synthetic && !e.altKey && !e.metaKey && (_0.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || mx.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      t.shiftKey && Z.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && Ox(this.view.win) && (t.shiftKey = !1);
      let i = this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t };
      return setTimeout(() => {
        this.pendingIOSKey == i && this.flushIOSKey();
      }, 50), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || this.view.observer.pendingRecords().length || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, ni(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : Z.safari && !Z.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.view.observer.update(e), this.mouseSelection && this.mouseSelection.update(e), this.draggedContent && e.docChanged && (this.draggedContent = this.draggedContent.map(e.changes)), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function Ox(n) {
  return n.visualViewport ? n.visualViewport.height * n.visualViewport.scale / n.document.documentElement.clientHeight < 0.85 : !1;
}
function uh(n, e) {
  return (t, i) => {
    try {
      return e.call(n, i, t);
    } catch (r) {
      Et(t.state, r);
    }
  };
}
function px(n) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    return e[i] || (e[i] = { observers: [], handlers: [] });
  }
  for (let i of n) {
    let r = i.spec, s = r && r.plugin.domEventHandlers, o = r && r.plugin.domEventObservers;
    if (s)
      for (let l in s) {
        let u = s[l];
        u && t(l).handlers.push(uh(i.value, u));
      }
    if (o)
      for (let l in o) {
        let u = o[l];
        u && t(l).observers.push(uh(i.value, u));
      }
  }
  for (let i in mt)
    t(i).handlers.push(mt[i]);
  for (let i in Le)
    t(i).observers.push(Le[i]);
  return e;
}
const _0 = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], mx = "dthko", A0 = [16, 17, 18, 20, 91, 92, 224, 225], Jr = 6;
function es(n) {
  return Math.max(0, n) * 0.7 + 8;
}
function gx(n, e) {
  return Math.max(Math.abs(n.clientX - e.clientX), Math.abs(n.clientY - e.clientY));
}
class bx {
  constructor(e, t, i, r) {
    this.view = e, this.startEvent = t, this.style = i, this.mustSelect = r, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = Ud(e.contentDOM), this.atoms = e.state.facet(vr).map((o) => o(e));
    let s = e.contentDOM.ownerDocument;
    s.addEventListener("mousemove", this.move = this.move.bind(this)), s.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(H.allowMultipleSelections) && xx(e, t), this.dragging = Sx(e, t) && E0(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && gx(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, i = 0, r = 0, s = 0, o = this.view.win.innerWidth, l = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: r, right: o } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: s, bottom: l } = this.scrollParents.y.getBoundingClientRect());
    let u = S0(this.view);
    e.clientX - u.left <= r + Jr ? t = -es(r - e.clientX) : e.clientX + u.right >= o - Jr && (t = es(e.clientX - o)), e.clientY - u.top <= s + Jr ? i = -es(s - e.clientY) : e.clientY + u.bottom >= l - Jr && (i = es(e.clientY - l)), this.setScrollSpeed(t, i);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(e, t) {
    this.scrollSpeed = { x: e, y: t }, e || t ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: e, y: t } = this.scrollSpeed;
    e && this.scrollParents.x && (this.scrollParents.x.scrollLeft += e, e = 0), t && this.scrollParents.y && (this.scrollParents.y.scrollTop += t, t = 0), (e || t) && this.view.win.scrollBy(e, t), this.dragging === !1 && this.select(this.lastEvent);
  }
  select(e) {
    let { view: t } = this, i = w0(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !i.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function xx(n, e) {
  let t = n.state.facet(l0);
  return t.length ? t[0](e) : Z.mac ? e.metaKey : e.ctrlKey;
}
function kx(n, e) {
  let t = n.state.facet(u0);
  return t.length ? t[0](e) : Z.mac ? !e.altKey : !e.ctrlKey;
}
function Sx(n, e) {
  let { main: t } = n.state.selection;
  if (t.empty)
    return !1;
  let i = cr(n.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let r = i.getRangeAt(0).getClientRects();
  for (let s = 0; s < r.length; s++) {
    let o = r[s];
    if (o.left <= e.clientX && o.right >= e.clientX && o.top <= e.clientY && o.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function yx(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != n.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = fe.get(t)) && i.isWidget() && !i.isHidden && i.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const mt = /* @__PURE__ */ Object.create(null), Le = /* @__PURE__ */ Object.create(null), C0 = Z.ie && Z.ie_version < 15 || Z.ios && Z.webkit_version < 604;
function Qx(n) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    n.focus(), t.remove(), T0(n, t.value);
  }, 50);
}
function oo(n, e, t) {
  for (let i of n.facet(e))
    t = i(t, n);
  return t;
}
function T0(n, e) {
  e = oo(n.state, Gu, e);
  let { state: t } = n, i, r = 1, s = t.toText(e), o = s.lines == t.selection.ranges.length;
  if (lu != null && t.selection.ranges.every((u) => u.empty) && lu == s.toString()) {
    let u = -1;
    i = t.changeByRange((a) => {
      let c = t.doc.lineAt(a.from);
      if (c.from == u)
        return { range: a };
      u = c.from;
      let h = t.toText((o ? s.line(r++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: h },
        range: v.cursor(a.from + h.length, -1)
      };
    });
  } else o ? i = t.changeByRange((u) => {
    let a = s.line(r++);
    return {
      changes: { from: u.from, to: u.to, insert: a.text },
      range: v.cursor(u.from + a.length, -1)
    };
  }) : i = t.replaceSelection(s);
  n.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
Le.scroll = (n) => {
  let e = n.inputState;
  e.lastScrollTop = n.scrollDOM.scrollTop, e.lastScrollLeft = n.scrollDOM.scrollLeft, Z.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
Le.wheel = Le.mousewheel = (n) => {
  n.inputState.lastWheelEvent = Date.now();
};
mt.keydown = (n, e) => (n.inputState.setSelectionOrigin("select"), e.keyCode == 27 && n.inputState.tabFocusMode != 0 && (n.inputState.tabFocusMode = Date.now() + 2e3), !1);
Le.touchstart = (n, e) => {
  let t = n.inputState, i = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), i && (t.lastTouchX = i.clientX, t.lastTouchY = i.clientY), t.setSelectionOrigin("select.pointer");
};
Le.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
Le.touchend = (n, e) => {
  n.inputState.touchActive = !1;
};
mt.mousedown = (n, e) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let i of n.state.facet(a0))
    if (t = i(n, e), t)
      break;
  if (!t && e.button == 0 && (t = $x(n, e)), t) {
    let i = !n.hasFocus;
    n.inputState.startMouseSelection(new bx(n, e, t, i)), i && n.observer.ignore(() => {
      Kd(n.contentDOM);
      let s = n.root.activeElement;
      s && !s.contains(n.contentDOM) && s.blur();
    });
    let r = n.inputState.mouseSelection;
    if (r)
      return r.start(e), r.dragging === !1;
  } else
    n.inputState.setSelectionOrigin("select.pointer");
  return !1;
};
function ah(n, e, t, i) {
  if (i == 1)
    return v.cursor(e, t);
  if (i == 2)
    return J2(n.state, e, t);
  {
    let r = n.docView.lineAt(e, t), s = n.state.doc.lineAt(r ? r.posAtEnd : e), o = r ? r.posAtStart : s.from, l = r ? r.posAtEnd : s.to;
    return l < n.state.doc.length && l == s.to && l++, v.undirectionalRange(o, l);
  }
}
const wx = Z.ie && Z.ie_version <= 11;
let ch = null, hh = 0, fh = 0;
function E0(n) {
  if (!wx)
    return n.detail;
  let e = ch, t = fh;
  return ch = n, fh = Date.now(), hh = !e || t > Date.now() - 400 && Math.abs(e.clientX - n.clientX) < 2 && Math.abs(e.clientY - n.clientY) < 2 ? (hh + 1) % 3 : 1;
}
function $x(n, e) {
  let t = n.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), i = E0(e), r = n.state.selection;
  return {
    update(s) {
      s.docChanged && (t.pos = s.changes.mapPos(t.pos), r = r.map(s.changes));
    },
    get(s, o, l) {
      let u = n.posAndSideAtCoords({ x: s.clientX, y: s.clientY }, !1), a, c = ah(n, u.pos, u.assoc, i);
      if (t.pos != u.pos && !o) {
        let h = ah(n, t.pos, t.assoc, i), f = Math.min(h.from, c.from), d = Math.max(h.to, c.to);
        c = f < c.from ? v.range(f, d, c.assoc) : v.range(d, f, c.assoc);
      }
      return o ? r.replaceRange(r.main.extend(c.from, c.to, c.assoc)) : l && i == 1 && r.ranges.length > 1 && (a = Px(r, u.pos)) ? a : l ? r.addRange(c) : v.create([c]);
    }
  };
}
function Px(n, e) {
  for (let t = 0; t < n.ranges.length; t++) {
    let { from: i, to: r } = n.ranges[t];
    if (i <= e && r >= e)
      return v.create(n.ranges.slice(0, t).concat(n.ranges.slice(t + 1)), n.mainIndex == t ? 0 : n.mainIndex - (n.mainIndex > t ? 1 : 0));
  }
  return null;
}
mt.dragstart = (n, e) => {
  let { selection: { main: t } } = n.state;
  if (e.target.draggable) {
    let r = n.docView.tile.nearest(e.target);
    if (r && r.isWidget()) {
      let s = r.posAtStart, o = s + r.length;
      (s >= t.to || o <= t.from) && (t = v.undirectionalRange(s, o));
    }
  }
  let { inputState: i } = n;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", oo(n.state, Hu, n.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
mt.dragend = (n) => (n.inputState.draggedContent = null, !1);
function dh(n, e, t, i) {
  if (t = oo(n.state, Gu, t), !t)
    return;
  let r = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: s } = n.inputState, o = i && s && kx(n, e) ? { from: s.from, to: s.to } : null, l = { from: r, insert: t }, u = n.state.changes(o ? [o, l] : l);
  n.focus(), n.dispatch({
    changes: u,
    selection: { anchor: u.mapPos(r, -1), head: u.mapPos(r, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  }), n.inputState.draggedContent = null;
}
mt.drop = (n, e) => {
  if (!e.dataTransfer)
    return !1;
  if (n.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let i = Array(t.length), r = 0, s = () => {
      ++r == t.length && dh(n, e, i.filter((o) => o != null).join(n.state.lineBreak), !1);
    };
    for (let o = 0; o < t.length; o++) {
      let l = new FileReader();
      l.onerror = s, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[o] = l.result), s();
      }, l.readAsText(t[o]);
    }
    return !0;
  } else {
    let i = e.dataTransfer.getData("Text");
    if (i)
      return dh(n, e, i, !0), !0;
  }
  return !1;
};
mt.paste = (n, e) => {
  if (n.state.readOnly)
    return !0;
  n.observer.flush();
  let t = C0 ? null : e.clipboardData;
  return t ? (T0(n, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (Qx(n), !1);
};
function vx(n, e) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function _x(n) {
  let e = [], t = [], i = !1;
  for (let r of n.selection.ranges)
    r.empty || (e.push(n.sliceDoc(r.from, r.to)), t.push(r));
  if (!e.length) {
    let r = -1;
    for (let { from: s } of n.selection.ranges) {
      let o = n.doc.lineAt(s);
      o.number > r && (e.push(o.text), t.push({ from: o.from, to: Math.min(n.doc.length, o.to + 1) })), r = o.number;
    }
    i = !0;
  }
  return { text: oo(n, Hu, e.join(n.lineBreak)), ranges: t, linewise: i };
}
let lu = null;
mt.copy = mt.cut = (n, e) => {
  if (!Ui(n.contentDOM, n.observer.selectionRange))
    return !1;
  let { text: t, ranges: i, linewise: r } = _x(n.state);
  if (!t && !r)
    return !1;
  lu = r ? t : null, e.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let s = C0 ? null : e.clipboardData;
  return s ? (s.clearData(), s.setData("text/plain", t), !0) : (vx(n, t), !1);
};
const X0 = /* @__PURE__ */ en.define();
function Z0(n, e) {
  let t = [];
  for (let i of n.facet(f0)) {
    let r = i(n, e);
    r && t.push(r);
  }
  return t.length ? n.update({ effects: t, annotations: X0.of(!0) }) : null;
}
function D0(n) {
  setTimeout(() => {
    let e = n.hasFocus;
    if (e != n.inputState.notifiedFocused) {
      let t = Z0(n.state, e);
      t ? n.dispatch(t) : n.update([]);
    }
  }, 10);
}
Le.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), D0(n);
};
Le.blur = (n) => {
  n.observer.clearSelectionRange(), D0(n);
};
Le.compositionstart = Le.compositionupdate = (n, e) => {
  if (!n.observer.editContext && (n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0)) {
    let { main: t } = n.state.selection;
    !t.empty && n.lineBlockAt(t.from).from != n.lineBlockAt(t.to).from && !n.state.readOnly && n.dispatch({
      changes: n.state.selection.ranges.filter((i) => !i.empty).map((i) => ({ from: i.from, to: i.to })),
      userEvent: "input"
    }), n.inputState.composing = 0;
  }
};
Le.compositionend = (n) => {
  n.observer.editContext || (n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionPendingKey = !0, n.inputState.compositionPendingChange = n.observer.pendingRecords().length > 0, n.inputState.compositionFirstChange = null, Z.chrome && Z.android ? n.observer.flushSoon() : n.inputState.compositionPendingChange ? Promise.resolve().then(() => n.observer.flush()) : setTimeout(() => {
    n.inputState.composing < 0 && n.docView.hasComposition && n.update([]);
  }, 50));
};
Le.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
mt.beforeinput = (n, e) => {
  var t, i;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (n.inputState.insertingText = e.data, n.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && n.observer.editContext) {
    let s = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), o = e.getTargetRanges();
    if (s && o.length) {
      let l = o[0], u = n.posAtDOM(l.startContainer, l.startOffset), a = n.posAtDOM(l.endContainer, l.endOffset);
      return ea(n, { from: u, to: a, insert: n.state.toText(s) }, null), !0;
    }
  }
  let r;
  if (Z.chrome && Z.android && (r = _0.find((s) => s.inputType == e.inputType)) && (n.observer.delayAndroidKey(r.key, r.keyCode), r.key == "Backspace" || r.key == "Delete")) {
    let s = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var o;
      (((o = window.visualViewport) === null || o === void 0 ? void 0 : o.height) || 0) > s + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
  return Z.ios && e.inputType == "deleteContentForward" && n.observer.flushSoon(), Z.safari && e.inputType == "insertText" && n.inputState.composing >= 0 && setTimeout(() => Le.compositionend(n, e), 20), !1;
};
const Oh = /* @__PURE__ */ new Set();
function Ax(n) {
  Oh.has(n) || (Oh.add(n), n.addEventListener("copy", () => {
  }), n.addEventListener("cut", () => {
  }));
}
const ph = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let Oi = !1;
function mh() {
  Oi = !1;
}
class Cx {
  constructor(e) {
    this.lineWrapping = e, this.doc = U.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let i = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (i += Math.max(0, Math.ceil((t - e - i * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * i;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / Math.max(1, this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return ph.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let i = 0; i < e.length; i++) {
      let r = e[i];
      r < 0 ? i++ : this.heightSamples[Math.floor(r * 10)] || (t = !0, this.heightSamples[Math.floor(r * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, i, r, s, o) {
    let l = ph.indexOf(e) > -1, u = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != l;
    if (this.lineWrapping = l, this.lineHeight = t, this.charWidth = i, this.textHeight = r, this.lineLength = s, u) {
      this.heightSamples = {};
      for (let a = 0; a < o.length; a++) {
        let c = o[a];
        c < 0 ? a++ : this.heightSamples[Math.floor(c * 10)] = !0;
      }
    }
    return u;
  }
}
class Tx {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class dt {
  /**
  @internal
  */
  constructor(e, t, i, r, s) {
    this.from = e, this.length = t, this.top = i, this.height = r, this._content = s;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? at.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof Dn ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(e) {
    let t = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(e._content) ? e._content : [e]);
    return new dt(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var se = /* @__PURE__ */ (function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
})(se || (se = {}));
const ps = 1e-3;
class Me {
  constructor(e, t, i = 2) {
    this.length = e, this.height = t, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > ps && (Oi = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, i) {
    return Me.of(i);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, i, r) {
    let s = this, o = i.doc;
    for (let l = r.length - 1; l >= 0; l--) {
      let { fromA: u, toA: a, fromB: c, toB: h } = r[l], f = s.lineAt(u, se.ByPosNoHeight, i.setDoc(t), 0, 0), d = f.to >= a ? f : s.lineAt(a, se.ByPosNoHeight, i, 0, 0);
      for (h += d.to - a, a = d.to; l > 0 && f.from <= r[l - 1].toA; )
        u = r[l - 1].fromA, c = r[l - 1].fromB, l--, u < f.from && (f = s.lineAt(u, se.ByPosNoHeight, i, 0, 0));
      c += f.from - u, u = f.from;
      let O = ta.build(i.setDoc(o), e, c, h);
      s = Ts(s, s.replace(u, a, O));
    }
    return s.updateHeight(i, 0);
  }
  static empty() {
    return new He(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, i = e.length, r = 0, s = 0;
    for (; ; )
      if (t == i)
        if (r > s * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), i += 1 + l.break, r -= l.size;
        } else if (s > r * 2) {
          let l = e[i];
          l.break ? e.splice(i, 1, l.left, null, l.right) : e.splice(i, 1, l.left, l.right), i += 2 + l.break, s -= l.size;
        } else
          break;
      else if (r < s) {
        let l = e[t++];
        l && (r += l.size);
      } else {
        let l = e[--i];
        l && (s += l.size);
      }
    let o = !1;
    return e[t - 1] == null ? (o = !0, t--) : e[t] == null && (o = !0, i++), new Xx(Me.of(e.slice(0, t)), o, Me.of(e.slice(i)));
  }
}
function Ts(n, e) {
  return n == e ? n : (n.constructor != e.constructor && (Oi = !0), e);
}
Me.prototype.size = 1;
const Ex = /* @__PURE__ */ K.replace({});
class R0 extends Me {
  constructor(e, t, i) {
    super(e, t), this.deco = i, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new dt(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, i, r) {
    return this.spaceAbove && e < i + this.spaceAbove ? new dt(r, 0, i, this.spaceAbove, Ex) : this.mainBlock(i, r);
  }
  lineAt(e, t, i, r, s) {
    let o = this.mainBlock(r, s);
    return this.spaceAbove ? this.blockAt(0, i, r, s).join(o) : o;
  }
  forEachLine(e, t, i, r, s, o) {
    e <= s + this.length && t >= s && o(this.lineAt(0, se.ByPos, i, r, s));
  }
  setMeasuredHeight(e) {
    let t = e.heights[e.index++];
    t < 0 ? (this.spaceAbove = -t, t = e.heights[e.index++]) : this.spaceAbove = 0, this.setHeight(t);
  }
  updateHeight(e, t = 0, i = !1, r) {
    return r && r.from <= t && r.more && this.setMeasuredHeight(r), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class He extends R0 {
  constructor(e, t, i) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = i;
  }
  mainBlock(e, t) {
    return new dt(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, i) {
    let r = i[0];
    return i.length == 1 && (r instanceof He || r instanceof Pe && r.flags & 4) && Math.abs(this.length - r.length) < 10 ? (r instanceof Pe ? r = new He(r.length, this.height, this.spaceAbove) : r.height = this.height, this.outdated || (r.outdated = !1), r) : Me.of(i);
  }
  updateHeight(e, t = 0, i = !1, r) {
    return r && r.from <= t && r.more ? this.setMeasuredHeight(r) : (i || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class Pe extends Me {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let i = e.doc.lineAt(t).number, r = e.doc.lineAt(t + this.length).number, s = r - i + 1, o, l = 0;
    if (e.lineWrapping) {
      let u = Math.min(this.height, e.lineHeight * s);
      o = u / s, this.length > s + 1 && (l = (this.height - u) / (this.length - s - 1));
    } else
      o = this.height / s;
    return { firstLine: i, lastLine: r, perLine: o, perChar: l };
  }
  blockAt(e, t, i, r) {
    let { firstLine: s, lastLine: o, perLine: l, perChar: u } = this.heightMetrics(t, r);
    if (t.lineWrapping) {
      let a = r + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - i) / this.height)) * this.length)), c = t.doc.lineAt(a), h = l + c.length * u, f = Math.max(i, e - h / 2);
      return new dt(c.from, c.length, f, h, 0);
    } else {
      let a = Math.max(0, Math.min(o - s, Math.floor((e - i) / l))), { from: c, length: h } = t.doc.line(s + a);
      return new dt(c, h, i + l * a, l, 0);
    }
  }
  lineAt(e, t, i, r, s) {
    if (t == se.ByHeight)
      return this.blockAt(e, i, r, s);
    if (t == se.ByPosNoHeight) {
      let { from: d, to: O } = i.doc.lineAt(e);
      return new dt(d, O - d, 0, 0, 0);
    }
    let { firstLine: o, perLine: l, perChar: u } = this.heightMetrics(i, s), a = i.doc.lineAt(e), c = l + a.length * u, h = a.number - o, f = r + l * h + u * (a.from - s - h);
    return new dt(a.from, a.length, Math.max(r, Math.min(f, r + this.height - c)), c, 0);
  }
  forEachLine(e, t, i, r, s, o) {
    e = Math.max(e, s), t = Math.min(t, s + this.length);
    let { firstLine: l, perLine: u, perChar: a } = this.heightMetrics(i, s);
    for (let c = e, h = r; c <= t; ) {
      let f = i.doc.lineAt(c);
      if (c == e) {
        let O = f.number - l;
        h += u * O + a * (e - s - O);
      }
      let d = u + a * f.length;
      o(new dt(f.from, f.length, h, d, 0)), h += d, c = f.to + 1;
    }
  }
  replace(e, t, i) {
    let r = this.length - t;
    if (r > 0) {
      let s = i[i.length - 1];
      s instanceof Pe ? i[i.length - 1] = new Pe(s.length + r) : i.push(null, new Pe(r - 1));
    }
    if (e > 0) {
      let s = i[0];
      s instanceof Pe ? i[0] = new Pe(e + s.length) : i.unshift(new Pe(e - 1), null);
    }
    return Me.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new Pe(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new Pe(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, r) {
    let s = t + this.length;
    if (r && r.from <= t + this.length && r.more) {
      let o = [], l = Math.max(t, r.from), u = -1;
      for (r.from > t && o.push(new Pe(r.from - t - 1).updateHeight(e, t)); l <= s && r.more; ) {
        let c = e.doc.lineAt(l).length;
        o.length && o.push(null);
        let h = r.heights[r.index++], f = 0;
        h < 0 && (f = -h, h = r.heights[r.index++]), u == -1 ? u = h : Math.abs(h - u) >= ps && (u = -2);
        let d = new He(c, h, f);
        d.outdated = !1, o.push(d), l += c + 1;
      }
      l <= s && o.push(null, new Pe(s - l).updateHeight(e, l));
      let a = Me.of(o);
      return (u < 0 || Math.abs(a.height - this.height) >= ps || Math.abs(u - this.heightMetrics(e, t).perLine) >= ps) && (Oi = !0), Ts(this, a);
    } else (i || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Xx extends Me {
  constructor(e, t, i) {
    super(e.length + (t ? 1 : 0) + i.length, e.height + i.height, (t ? 1 : 0) | (e.outdated || i.outdated ? 2 : 0)), this.left = e, this.right = i, this.size = e.size + i.size;
  }
  // Returns 1 if there is a line break between this.left and
  // this.right, 0 otherwise.
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, i, r) {
    let s = i + this.left.height;
    return e < s ? this.left.blockAt(e, t, i, r) : this.right.blockAt(e, t, s, r + this.left.length + this.break);
  }
  lineAt(e, t, i, r, s) {
    let o = r + this.left.height, l = s + this.left.length + this.break, u = t == se.ByHeight ? e < o : e < l, a = u ? this.left.lineAt(e, t, i, r, s) : this.right.lineAt(e, t, i, o, l);
    if (this.break || (u ? a.to < l : a.from > l))
      return a;
    let c = t == se.ByPosNoHeight ? se.ByPosNoHeight : se.ByPos;
    return u ? a.join(this.right.lineAt(l, c, i, o, l)) : this.left.lineAt(l, c, i, r, s).join(a);
  }
  forEachLine(e, t, i, r, s, o) {
    let l = r + this.left.height, u = s + this.left.length + this.break;
    if (this.break)
      e < u && this.left.forEachLine(e, t, i, r, s, o), t >= u && this.right.forEachLine(e, t, i, l, u, o);
    else {
      let a = this.lineAt(u, se.ByPos, i, r, s);
      e < a.from && this.left.forEachLine(e, Math.min(t, a.from - 1), i, r, s, o), a.to >= e && a.from <= t && o(a), t > a.to && this.right.forEachLine(Math.max(e, a.to + 1), t, i, l, u, o);
    }
  }
  replace(e, t, i) {
    let r = this.left.length + this.break;
    if (t < r)
      return this.balanced(this.left.replace(e, t, i), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - r, t - r, i));
    let s = [];
    e > 0 && this.decomposeLeft(e, s);
    let o = s.length;
    for (let l of i)
      s.push(l);
    if (e > 0 && gh(s, o - 1), t < this.length) {
      let l = s.length;
      this.decomposeRight(t, s), gh(s, l);
    }
    return Me.of(s);
  }
  decomposeLeft(e, t) {
    let i = this.left.length;
    if (e <= i)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (i++, e >= i && t.push(null)), e > i && this.right.decomposeLeft(e - i, t);
  }
  decomposeRight(e, t) {
    let i = this.left.length, r = i + this.break;
    if (e >= r)
      return this.right.decomposeRight(e - r, t);
    e < i && this.left.decomposeRight(e, t), this.break && e < r && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? Me.of(this.break ? [e, null, t] : [e, t]) : (this.left = Ts(this.left, e), this.right = Ts(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, r) {
    let { left: s, right: o } = this, l = t + s.length + this.break, u = null;
    return r && r.from <= t + s.length && r.more ? u = s = s.updateHeight(e, t, i, r) : s.updateHeight(e, t, i), r && r.from <= l + o.length && r.more ? u = o = o.updateHeight(e, l, i, r) : o.updateHeight(e, l, i), u ? this.balanced(s, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function gh(n, e) {
  let t, i;
  n[e] == null && (t = n[e - 1]) instanceof Pe && (i = n[e + 1]) instanceof Pe && n.splice(e - 1, 3, new Pe(t.length + 1 + i.length));
}
const Zx = 5;
class ta {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), r = this.nodes[this.nodes.length - 1];
      r instanceof He ? r.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new He(i - this.pos, -1, 0)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let r = i.widget ? i.widget.estimatedHeight : 0, s = i.widget ? i.widget.lineBreaks : 0;
      r < 0 && (r = this.oracle.lineHeight);
      let o = t - e;
      i.block ? this.addBlock(new R0(o, r, i)) : (o || s || r >= Zx) && this.addLineDeco(r, s, o);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new He(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new Pe(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof He)
      return e;
    let t = new He(0, -1, 0);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, i) {
    let r = this.ensureLine();
    r.length += i, r.collapsed += i, r.widgetHeight = Math.max(r.widgetHeight, e), r.breaks += t, this.writtenTo = this.pos = this.pos + i;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof He) && !this.isCovered ? this.nodes.push(new He(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let r of this.nodes)
      r instanceof He && r.updateHeight(this.oracle, i), i += r ? r.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, i, r) {
    let s = new ta(i, e);
    return ie.spans(t, i, r, s, 0), s.finish(i);
  }
}
function Dx(n, e, t) {
  let i = new Rx();
  return ie.compare(n, e, t, i, 0), i.changes;
}
class Rx {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, r) {
    (e < t || i && i.heightRelevant || r && r.heightRelevant) && ti(e, t, this.changes, 5);
  }
}
function Mx(n, e) {
  let t = n.getBoundingClientRect(), i = n.ownerDocument, r = i.defaultView || window, s = Math.max(0, t.left), o = Math.min(r.innerWidth, t.right), l = Math.max(0, t.top), u = Math.min(r.innerHeight, t.bottom);
  for (let a = n.parentNode; a && a != i.body; )
    if (we(a)) {
      let c = window.getComputedStyle(a);
      if ((a.scrollHeight > a.clientHeight || a.scrollWidth > a.clientWidth) && c.overflow != "visible") {
        let h = a.getBoundingClientRect();
        s = Math.max(s, h.left), o = Math.min(o, h.right), l = Math.max(l, h.top), u = Math.min(a == n.parentNode ? r.innerHeight : u, h.bottom);
      }
      a = c.position == "absolute" || c.position == "fixed" ? a.offsetParent : a.parentNode;
    } else if (a.nodeType == 11)
      a = a.host;
    else
      break;
  return {
    left: s - t.left,
    right: Math.max(s, o) - t.left,
    top: l - (t.top + e),
    bottom: Math.max(l, u) - (t.top + e)
  };
}
function Lx(n) {
  let e = n.getBoundingClientRect(), t = n.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function jx(n, e) {
  let t = n.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class al {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.size = i, this.displaySize = r;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++) {
      let r = e[i], s = t[i];
      if (r.from != s.from || r.to != s.to || r.size != s.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return K.replace({
      widget: new zx(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class zx extends tn {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class bh {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = uu, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = pe.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let i = t.facet(Ku).some((r) => typeof r != "function" && r.class == "cm-lineWrapping");
    this.heightOracle = new Cx(i), this.stateDeco = xh(t), this.heightMap = Me.empty().applyChanges(this.stateDeco, U.empty, this.heightOracle.setDoc(t.doc), [new ot(0, 0, 0, t.doc.length)]);
    for (let r = 0; r < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); r++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = K.set(this.lineGaps.map((r) => r.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let r = i ? t.head : t.anchor;
      if (!e.some(({ from: s, to: o }) => r >= s && r <= o)) {
        let { from: s, to: o } = this.lineBlockAt(r);
        e.push(new ts(s, o));
      }
    }
    return this.viewports = e.sort((i, r) => i.from - r.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? uu : Es.get(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(Fi(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = xh(this.state);
    let r = e.changedRanges, s = ot.extendWithRanges(r, Dx(i, this.stateDeco, e ? e.changes : xe.empty(this.state.doc.length))), o = this.heightMap.height, l = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    mh(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), s), (this.heightMap.height != o || Oi) && (e.flags |= 2), l ? (this.scrollAnchorPos = e.changes.mapPos(l.from, -1), this.scrollAnchorHeight = l.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = o);
    let u = s.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < u.from || t.range.head > u.to) || !this.viewportIsAppropriate(u)) && (u = this.getViewport(0, t));
    let a = u.from != this.viewport.from || u.to != this.viewport.to;
    this.viewport = u, e.flags |= this.updateForViewport(), (a || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(C2) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, i = window.getComputedStyle(t), r = this.heightOracle, s = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? pe.RTL : pe.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(s) || this.mustMeasureContent === "refresh", l = t.getBoundingClientRect(), u = o || this.mustMeasureContent || this.contentDOMHeight != l.height;
    this.contentDOMHeight = l.height, this.mustMeasureContent = !1;
    let a = 0, c = 0;
    if (l.width && l.height) {
      let { scaleX: y, scaleY: A } = Vd(t, l);
      (y > 5e-3 && Math.abs(this.scaleX - y) > 5e-3 || A > 5e-3 && Math.abs(this.scaleY - A) > 5e-3) && (this.scaleX = y, this.scaleY = A, a |= 16, o = u = !0);
    }
    let h = (parseInt(i.paddingTop) || 0) * this.scaleY, f = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != h || this.paddingBottom != f) && (this.paddingTop = h, this.paddingBottom = f, a |= 18), this.editorWidth != e.scrollDOM.clientWidth && (r.lineWrapping && (u = !0), this.editorWidth = e.scrollDOM.clientWidth, a |= 16);
    let d = Ud(this.view.contentDOM, !1).y;
    d != this.scrollParent && (this.scrollParent = d, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let O = this.getScrollOffset();
    this.scrollOffset != O && (this.scrollAnchorHeight = -1, this.scrollOffset = O), this.scrolledToBottom = Jd(this.scrollParent || e.win);
    let m = (this.printing ? jx : Mx)(t, this.paddingTop), g = m.top - this.pixelViewport.top, b = m.bottom - this.pixelViewport.bottom;
    this.pixelViewport = m;
    let w = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (w != this.inView && (this.inView = w, w && (u = !0)), !this.inView && !this.scrollTarget && !Lx(e.dom))
      return 0;
    let S = l.width;
    if ((this.contentDOMWidth != S || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = l.width, this.editorHeight = e.scrollDOM.clientHeight, a |= 16), u) {
      let y = e.docView.measureVisibleLineHeights(this.viewport);
      if (r.mustRefreshForHeights(y) && (o = !0), o || r.lineWrapping && Math.abs(S - this.contentDOMWidth) > r.charWidth) {
        let { lineHeight: A, charWidth: C, textHeight: z } = e.docView.measureTextSize();
        o = A > 0 && r.refresh(s, A, C, z, Math.max(5, S / C), y), o && (e.docView.minWidth = 0, a |= 16);
      }
      g > 0 && b > 0 ? c = Math.max(g, b) : g < 0 && b < 0 && (c = Math.min(g, b)), mh();
      for (let A of this.viewports) {
        let C = A.from == this.viewport.from ? y : e.docView.measureVisibleLineHeights(A);
        this.heightMap = (o ? Me.empty().applyChanges(this.stateDeco, U.empty, this.heightOracle, [new ot(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(r, 0, o, new Tx(A.from, C));
      }
      Oi && (a |= 2);
    }
    let Q = !this.viewportIsAppropriate(this.viewport, c) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return Q && (a & 2 && (a |= this.updateScaler()), this.viewport = this.getViewport(c, this.scrollTarget), a |= this.updateForViewport()), (a & 2 || Q) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps, e)), a |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), a;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), r = this.heightMap, s = this.heightOracle, { visibleTop: o, visibleBottom: l } = this, u = new ts(r.lineAt(o - i * 1e3, se.ByHeight, s, 0, 0).from, r.lineAt(l + (1 - i) * 1e3, se.ByHeight, s, 0, 0).to);
    if (t) {
      let { head: a } = t.range;
      if (a < u.from || a > u.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), h = r.lineAt(a, se.ByPos, s, 0, 0), f;
        t.y == "center" ? f = (h.top + h.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && a < u.from ? f = h.top : f = h.bottom - c, u = new ts(r.lineAt(f - 1e3 / 2, se.ByHeight, s, 0, 0).from, r.lineAt(f + c + 1e3 / 2, se.ByHeight, s, 0, 0).to);
      }
    }
    return u;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), r = t.mapPos(e.to, 1);
    return new ts(this.heightMap.lineAt(i, se.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(r, se.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: r } = this.heightMap.lineAt(e, se.ByPos, this.heightOracle, 0, 0), { bottom: s } = this.heightMap.lineAt(t, se.ByPos, this.heightOracle, 0, 0), { visibleTop: o, visibleBottom: l } = this;
    return (e == 0 || r <= o - Math.max(10, Math.min(
      -i,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || s >= l + Math.max(10, Math.min(
      i,
      250
      /* VP.MaxCoverMargin */
    ))) && r > o - 2 * 1e3 && s < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let i = [];
    for (let r of e)
      t.touchesRange(r.from, r.to) || i.push(new al(t.mapPos(r.from), t.mapPos(r.to), r.size, r.displaySize));
    return i;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let i = this.heightOracle.lineWrapping, r = i ? 1e4 : 2e3, s = r >> 1, o = r << 1;
    if (this.defaultTextDirection != pe.LTR && !i)
      return [];
    let l = [], u = (c, h, f, d) => {
      if (h - c < s)
        return;
      let O = this.state.selection.main, m = [O.from];
      O.empty || m.push(O.to);
      for (let b of m)
        if (b > c && b < h) {
          u(c, b - 10, f, d), u(b + 10, h, f, d);
          return;
        }
      let g = Bx(e, (b) => b.from >= f.from && b.to <= f.to && Math.abs(b.from - c) < s && Math.abs(b.to - h) < s && !m.some((w) => b.from < w && b.to > w));
      if (!g) {
        if (h < f.to && t && i && t.visibleRanges.some((S) => S.from <= h && S.to >= h)) {
          let S = t.moveToLineBoundary(v.cursor(h), !1, !0).head;
          S > c && (h = S);
        }
        let b = this.gapSize(f, c, h, d), w = i || b < 2e6 ? b : 2e6;
        g = new al(c, h, b, w);
      }
      l.push(g);
    }, a = (c) => {
      if (c.length < o || c.type != at.Text)
        return;
      let h = Ix(c.from, c.to, this.stateDeco);
      if (h.total < o)
        return;
      let f = this.scrollTarget ? this.scrollTarget.range.head : null, d, O;
      if (i) {
        let m = r / this.heightOracle.lineLength * this.heightOracle.lineHeight, g, b;
        if (f != null) {
          let w = is(h, f), S = ((this.visibleBottom - this.visibleTop) / 2 + m) / c.height;
          g = w - S, b = w + S;
        } else
          g = (this.visibleTop - c.top - m) / c.height, b = (this.visibleBottom - c.top + m) / c.height;
        d = ns(h, g), O = ns(h, b);
      } else {
        let m = h.total * this.heightOracle.charWidth, g = r * this.heightOracle.charWidth, b = 0;
        if (m > 2e6)
          for (let A of e)
            A.from >= c.from && A.from < c.to && A.size != A.displaySize && A.from * this.heightOracle.charWidth + b < this.pixelViewport.left && (b = A.size - A.displaySize);
        let w = this.pixelViewport.left + b, S = this.pixelViewport.right + b, Q, y;
        if (f != null) {
          let A = is(h, f), C = ((S - w) / 2 + g) / m;
          Q = A - C, y = A + C;
        } else
          Q = (w - g) / m, y = (S + g) / m;
        d = ns(h, Q), O = ns(h, y);
      }
      d > c.from && u(c.from, d, c, h), O < c.to && u(O, c.to, c, h);
    };
    for (let c of this.viewportLines)
      Array.isArray(c.type) ? c.type.forEach(a) : a(c);
    return l;
  }
  gapSize(e, t, i, r) {
    let s = is(r, i) - is(r, t);
    return this.heightOracle.lineWrapping ? e.height * s : r.total * this.heightOracle.charWidth * s;
  }
  updateLineGaps(e) {
    al.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = K.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let i = [];
    ie.spans(t, this.viewport.from, this.viewport.to, {
      span(s, o) {
        i.push({ from: s, to: o });
      },
      point() {
      }
    }, 20);
    let r = 0;
    if (i.length != this.visibleRanges.length)
      r = 12;
    else
      for (let s = 0; s < i.length && !(r & 8); s++) {
        let o = this.visibleRanges[s], l = i[s];
        (o.from != l.from || o.to != l.to) && (r |= 4, e && e.mapPos(o.from, -1) == l.from && e.mapPos(o.to, 1) == l.to || (r |= 8));
      }
    return this.visibleRanges = i, r;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || Fi(this.heightMap.lineAt(e, se.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || Fi(this.heightMap.lineAt(this.scaler.fromDOM(e), se.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop * this.scaleY : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 12 - this.paddingTop);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return Fi(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class ts {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Ix(n, e, t) {
  let i = [], r = n, s = 0;
  return ie.spans(t, n, e, {
    span() {
    },
    point(o, l) {
      o > r && (i.push({ from: r, to: o }), s += o - r), r = l;
    }
  }, 20), r < e && (i.push({ from: r, to: e }), s += e - r), { total: s, ranges: i };
}
function ns({ total: n, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let i = Math.floor(n * t);
  for (let r = 0; ; r++) {
    let { from: s, to: o } = e[r], l = o - s;
    if (i <= l)
      return s + i;
    i -= l;
  }
}
function is(n, e) {
  let t = 0;
  for (let { from: i, to: r } of n.ranges) {
    if (e <= r) {
      t += e - i;
      break;
    }
    t += r - i;
  }
  return t / n.total;
}
function Bx(n, e) {
  for (let t of n)
    if (e(t))
      return t;
}
const uu = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1,
  eq(n) {
    return n == this;
  }
};
function xh(n) {
  let e = n.facet(io).filter((i) => typeof i != "function"), t = n.facet(Ju).filter((i) => typeof i != "function");
  return t.length && e.push(ie.join(t)), e;
}
class Es {
  constructor(e, t) {
    this.scale = e, this.viewports = t;
  }
  static get(e, t, i) {
    let r = 0, s = 0, o = 0, l = i.map(({ from: a, to: c }) => {
      let h = t.lineAt(a, se.ByPos, e, 0, 0).top, f = t.lineAt(c, se.ByPos, e, 0, 0).bottom;
      return r += f - h, { from: a, to: c, top: h, bottom: f, domTop: 0, domBottom: 0 };
    });
    if (t.height - r < 10)
      return uu;
    let u = (7e6 - r) / (t.height - r);
    for (let a of l)
      a.domTop = o + (a.top - s) * u, o = a.domBottom = a.domTop + (a.bottom - a.top), s = a.bottom;
    return new Es(u, l);
  }
  toDOM(e) {
    for (let t = 0, i = 0, r = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.top)
        return r + (e - i) * this.scale;
      if (e <= s.bottom)
        return s.domTop + (e - s.top);
      i = s.bottom, r = s.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, i = 0, r = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.domTop)
        return i + (e - r) / this.scale;
      if (e <= s.domBottom)
        return s.top + (e - s.domTop);
      i = s.bottom, r = s.domBottom;
    }
  }
  eq(e) {
    return e instanceof Es ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to) : !1;
  }
}
function Fi(n, e) {
  if (e.scale == 1)
    return n;
  let t = e.toDOM(n.top), i = e.toDOM(n.bottom);
  return new dt(n.from, n.length, t, i - t, Array.isArray(n._content) ? n._content.map((r) => Fi(r, e)) : n._content);
}
const rs = /* @__PURE__ */ I.define({ combine: (n) => n.join(" ") }), au = /* @__PURE__ */ I.define({ combine: (n) => n.indexOf(!0) > -1 }), cu = /* @__PURE__ */ ai.newName(), M0 = /* @__PURE__ */ ai.newName(), L0 = /* @__PURE__ */ ai.newName(), j0 = { "&light": "." + M0, "&dark": "." + L0 };
function hu(n, e, t) {
  return new ai(e, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (r) => {
        if (r == "&")
          return n;
        if (!t || !t[r])
          throw new RangeError(`Unsupported selector: ${r}`);
        return t[r];
      }) : n + " " + i;
    }
  });
}
const qx = /* @__PURE__ */ hu("." + cu, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // Issue #456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    userSelect: "none",
    // #1708
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#ddd"
  },
  ".cm-selectionHandle": {
    backgroundColor: "currentColor",
    width: "1.5px"
  },
  ".cm-selectionHandle-start::before, .cm-selectionHandle-end::before": {
    content: '""',
    backgroundColor: "inherit",
    borderRadius: "50%",
    width: "8px",
    height: "8px",
    position: "absolute",
    left: "-3.25px"
  },
  ".cm-selectionHandle-start::before": { top: "-8px" },
  ".cm-selectionHandle-end::before": { bottom: "-8px" },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    zIndex: 200
  },
  ".cm-gutters-before": { insetInlineStart: 0 },
  ".cm-gutters-after": { insetInlineEnd: 0 },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    border: "0px solid #ddd",
    "&.cm-gutters-before": { borderRightWidth: "1px" },
    "&.cm-gutters-after": { borderLeftWidth: "1px" }
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  ".cm-panels-top": { top: "0" },
  ".cm-panels-bottom": { bottom: "0" },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-dialog": {
    padding: "2px 19px 4px 6px",
    position: "relative",
    "& label": { fontSize: "80%" }
  },
  ".cm-dialog-close": {
    position: "absolute",
    top: "3px",
    right: "4px",
    backgroundColor: "inherit",
    border: "none",
    font: "inherit",
    fontSize: "14px",
    padding: "0"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "baseline",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top",
    userSelect: "none"
  },
  ".cm-highlightSpace": {
    background: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 0) no-repeat",
    backgroundSize: ".4em",
    backgroundPosition: "calc(min(50%, 0px)) center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, j0), Fx = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, cl = Z.ie && Z.ie_version <= 11;
class Yx {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new b2(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let i of t)
        this.queue.push(i);
      (Z.ie && Z.ie_version <= 11 || Z.ios && e.composing) && t.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && Z.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(Z.chrome && Z.chrome_version < 126) && (this.editContext = new Nx(e), e.state.facet(Vt) && (e.contentDOM.editContext = this.editContext.editContext)), cl && (this.onCharData = (t) => {
      this.queue.push({
        target: t.target,
        type: "characterData",
        oldValue: t.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var t;
      ((t = this.view.docView) === null || t === void 0 ? void 0 : t.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(e.scrollDOM)), this.addWindowListeners(this.win = e.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((t) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), t.length > 0 && t[t.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((t) => {
      t.length > 0 && t[t.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e), this.intersecting && this.view.measure();
  }
  onScroll(e) {
    this.intersecting && this.flush(this.pendingRecords().length > 0), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(e) {
    (e.type == "change" || !e.type) && !e.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, i) => t != e[i]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    let t = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: i } = this, r = this.selectionRange;
    if (i.state.facet(Vt) ? i.root.activeElement != this.dom : !Ui(this.dom, r))
      return;
    let s = r.anchorNode && i.docView.tile.nearest(r.anchorNode);
    if (s && s.isWidget() && s.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (Z.ie && Z.ie_version <= 11 || Z.android && Z.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    r.focusNode && Hi(r.focusNode, r.focusOffset, r.anchorNode, r.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = cr(e.root);
    if (!t)
      return !1;
    let i = Z.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && Wx(this.view, t) || t;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let r = Ui(this.dom, i);
    return r && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && k2(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), r && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let i = this.dom; i; )
      if (we(i))
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == i ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = t)
        i.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, Fx), cl && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), cl && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(e, t) {
    var i;
    if (!this.delayedAndroidKey) {
      let r = () => {
        let s = this.delayedAndroidKey;
        s && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = s.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && s.force && ni(this.dom, s.key, s.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(r);
    }
    (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = {
      key: e,
      keyCode: t,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((i = this.delayedAndroidKey) === null || i === void 0) && i.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let e of this.observer.takeRecords())
      this.queue.push(e);
    return this.queue;
  }
  processRecords() {
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let t = -1, i = -1, r = !1;
    for (let s of e) {
      let o = this.readMutation(s);
      o && (o.typeOver && (r = !0), t == -1 ? { from: t, to: i } = o : (t = Math.min(o.from, t), i = Math.max(o.to, i)));
    }
    return { from: t, to: i, typeOver: r };
  }
  readChange() {
    let { from: e, to: t, typeOver: i } = this.processRecords(), r = this.selectionChanged && Ui(this.dom, this.selectionRange);
    if (e < 0 && !r)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let s = new ax(this.view, e, t, i);
    return this.view.docView.domChanged = { newSel: s.newSel ? s.newSel.main : null }, s;
  }
  // Apply pending changes, if any
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    e && this.readSelectionRange();
    let t = this.selectionChanged, i = this.readChange();
    if (!i)
      return this.view.requestMeasure(), !1;
    let r = this.view.state, s = P0(this.view, i);
    return this.view.state == r && (i.domChanged || t) && this.view.update([]), s;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let i = kh(t, e.previousSibling || e.target.previousSibling, -1), r = kh(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: i ? t.posAfter(i) : t.posAtStart,
        to: r ? t.posBefore(r) : t.posAtEnd,
        typeOver: !1
      };
    } else return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  setWindow(e) {
    e != this.win && (this.removeWindowListeners(this.win), this.win = e, this.addWindowListeners(this.win));
  }
  addWindowListeners(e) {
    e.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : e.addEventListener("beforeprint", this.onPrint), e.addEventListener("scroll", this.onScroll), e.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(e) {
    e.removeEventListener("scroll", this.onScroll), e.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : e.removeEventListener("beforeprint", this.onPrint), e.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(e) {
    this.editContext && (this.editContext.update(e), e.startState.facet(Vt) != e.state.facet(Vt) && (e.view.contentDOM.editContext = e.state.facet(Vt) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let r of this.scrollTargets)
      r.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function kh(n, e, t) {
  for (; e; ) {
    let i = fe.get(e);
    if (i && i.parent == n)
      return i;
    let r = e.parentNode;
    e = r != n.dom ? r : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Sh(n, e) {
  let t = e.startContainer, i = e.startOffset, r = e.endContainer, s = e.endOffset, o = n.docView.domAtPos(n.state.selection.main.anchor, 1);
  return Hi(o.node, o.offset, r, s) && ([t, i, r, s] = [r, s, t, i]), { anchorNode: t, anchorOffset: i, focusNode: r, focusOffset: s };
}
function Wx(n, e) {
  if (e.getComposedRanges) {
    let r = e.getComposedRanges(n.root)[0];
    if (r)
      return Sh(n, r);
  }
  let t = null;
  function i(r) {
    r.preventDefault(), r.stopImmediatePropagation(), t = r.getTargetRanges()[0];
  }
  return n.contentDOM.addEventListener("beforeinput", i, !0), n.dom.ownerDocument.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", i, !0), t ? Sh(n, t) : null;
}
class Nx {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.composing = null, this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (i) => {
      let r = e.state.selection.main, { anchor: s, head: o } = r, l = this.toEditorPos(i.updateRangeStart), u = this.toEditorPos(i.updateRangeEnd);
      e.inputState.composing >= 0 && !this.composing && (this.composing = { contextBase: i.updateRangeStart, editorBase: l, drifted: !1 });
      let a = u - l > i.text.length;
      l == this.from && s < this.from ? l = s : u == this.to && s > this.to && (u = s);
      let c = v0(e.state.sliceDoc(l, u), i.text, (a ? r.from : r.to) - l, a ? "end" : null);
      if (!c) {
        let f = v.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd));
        ou(f, r) || e.dispatch({ selection: f, userEvent: "select" });
        return;
      }
      let h = {
        from: c.from + l,
        to: c.toA + l,
        insert: U.of(i.text.slice(c.from, c.toB).split(`
`))
      };
      if ((Z.mac || Z.android) && h.from == o - 1 && /^\. ?$/.test(i.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (h = { from: l, to: u, insert: U.of([i.text.replace(".", " ")]) }), this.pendingContextChange = h, !e.state.readOnly) {
        let f = this.to - this.from + (h.to - h.from + h.insert.length);
        ea(e, h, v.single(this.toEditorPos(i.selectionStart, f), this.toEditorPos(i.selectionEnd, f)));
      }
      this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)), h.from < h.to && !h.insert.length && e.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(t.text.slice(Math.max(0, i.updateRangeStart - 1), Math.min(t.text.length, i.updateRangeStart + 1))) && this.handlers.compositionend(i);
    }, this.handlers.characterboundsupdate = (i) => {
      let r = [], s = null;
      for (let o = this.toEditorPos(i.rangeStart), l = this.toEditorPos(i.rangeEnd); o < l; o++) {
        let u = e.coordsForChar(o);
        s = u && new DOMRect(u.left, u.top, u.right - u.left, u.bottom - u.top) || s || new DOMRect(), r.push(s);
      }
      t.updateCharacterBounds(i.rangeStart, r);
    }, this.handlers.textformatupdate = (i) => {
      let r = [];
      for (let s of i.getTextFormats()) {
        let o = s.underlineStyle, l = s.underlineThickness;
        if (!/none/i.test(o) && !/none/i.test(l)) {
          let u = this.toEditorPos(s.rangeStart), a = this.toEditorPos(s.rangeEnd);
          if (u < a) {
            let c = `text-decoration: underline ${/^[a-z]/.test(o) ? o + " " : o == "Dashed" ? "dashed " : o == "Squiggle" ? "wavy " : ""}${/thin/i.test(l) ? 1 : 2}px`;
            r.push(K.mark({ attributes: { style: c } }).range(u, a));
          }
        }
      }
      e.dispatch({ effects: p0.of(K.set(r)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      if (e.inputState.composing = -1, e.inputState.compositionFirstChange = null, this.composing) {
        let { drifted: i } = this.composing;
        this.composing = null, i && this.reset(e.state);
      }
    };
    for (let i in this.handlers)
      t.addEventListener(i, this.handlers[i]);
    this.measureReq = { read: (i) => {
      let r = cr(i.root);
      r && r.rangeCount && this.editContext.updateSelectionBounds(r.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, i = !1, r = this.pendingContextChange;
    return e.changes.iterChanges((s, o, l, u, a) => {
      if (i)
        return;
      let c = a.length - (o - s);
      if (r && o >= r.to)
        if (r.from == s && r.to == o && r.insert.eq(a)) {
          r = this.pendingContextChange = null, t += c, this.to += c;
          return;
        } else
          r = null, this.revertPending(e.state);
      if (s += t, o += t, o <= this.from)
        this.from += c, this.to += c;
      else if (s < this.to) {
        if (s < this.from || o > this.to || this.to - this.from + a.length > 3e4) {
          i = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(s), this.toContextPos(o), a.toString()), this.to += c;
      }
      t += c;
    }), r && !i && this.revertPending(e.state), !i;
  }
  update(e) {
    let t = this.pendingContextChange, i = e.startState.selection.main;
    this.composing && (this.composing.drifted || !e.changes.touchesRange(i.from, i.to) && e.transactions.some((r) => !r.isUserEvent("input.type") && r.changes.touchesRange(this.from, this.to))) ? (this.composing.drifted = !0, this.composing.editorBase = e.changes.mapPos(this.composing.editorBase)) : !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.reset(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
  }
  resetRange(e) {
    let { head: t } = e.selection.main;
    this.from = Math.max(
      0,
      t - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      e.doc.length,
      t + 1e4
      /* CxVp.Margin */
    );
  }
  reset(e) {
    this.resetRange(e), this.editContext.updateText(0, this.editContext.text.length, e.doc.sliceString(this.from, this.to)), this.setSelection(e);
  }
  revertPending(e) {
    let t = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(t.from), this.toContextPos(t.from + t.insert.length), e.doc.sliceString(t.from, t.to));
  }
  setSelection(e) {
    let { main: t } = e.selection, i = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), r = this.toContextPos(t.head);
    (this.editContext.selectionStart != i || this.editContext.selectionEnd != r) && this.editContext.updateSelection(i, r);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e, t = this.to - this.from) {
    e = Math.min(e, t);
    let i = this.composing;
    return i && i.drifted ? i.editorBase + (e - i.contextBase) : e + this.from;
  }
  toContextPos(e) {
    let t = this.composing;
    return t && t.drifted ? t.contextBase + (e - t.editorBase) : e - this.from;
  }
  destroy() {
    for (let e in this.handlers)
      this.editContext.removeEventListener(e, this.handlers[e]);
  }
}
class j {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return !!this.inputState && this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return !!this.inputState && this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(e = {}) {
    var t;
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.clearAnnouncement = -1, this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), e.parent && e.parent.appendChild(this.dom);
    let { dispatch: i } = e;
    this.dispatchTransactions = e.dispatchTransactions || i && ((r) => r.forEach((s) => i(s, this))) || ((r) => this.update(r)), this.dispatch = this.dispatch.bind(this), this._root = e.root || x2(e.parent) || document, this.viewState = new bh(this, e.state || H.create(e)), e.scrollTo && e.scrollTo.is(Kr) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(Un).map((r) => new rl(r));
    for (let r of this.plugins)
      r.update(this);
    this.observer = new Yx(this), this.inputState = new dx(this), this.inputState.ensureHandlers(this.plugins), this.docView = new sh(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof ge ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
    this.dispatchTransactions(t, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, i = !1, r, s = this.state;
    for (let f of e) {
      if (f.startState != s)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      s = f.state;
    }
    if (this.destroyed) {
      this.viewState.state = s;
      return;
    }
    let o = this.hasFocus, l = 0, u = null;
    e.some((f) => f.annotation(X0)) ? (this.inputState.notifiedFocused = o, l = 1) : o != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = o, u = Z0(s, o), u || (l = 1));
    let a = this.observer.delayedAndroidKey, c = null;
    if (a ? (this.observer.clearDelayedAndroidKey(), c = this.observer.readChange(), (c && !this.state.doc.eq(s.doc) || !this.state.selection.eq(s.selection)) && (c = null)) : this.observer.clear(), s.facet(H.phrases) != this.state.facet(H.phrases))
      return this.setState(s);
    r = _s.create(this, s, e), r.flags |= l;
    let h = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let f of e) {
        if (h && (h = h.map(f.changes)), f.scrollIntoView) {
          let { main: d } = f.state.selection, { x: O, y: m } = this.state.facet(j.cursorScrollMargin);
          h = new ii(d.empty ? d : v.cursor(d.head, d.head > d.anchor ? -1 : 1), "nearest", "nearest", m, O);
        }
        for (let d of f.effects)
          d.is(Kr) && (h = d.value.clip(this.state));
      }
      this.viewState.update(r, h), this.bidiCache = Xs.update(this.bidiCache, r.changes), r.empty || (this.updatePlugins(r), this.inputState.update(r)), t = this.docView.update(r), this.state.facet(qi) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((f) => f.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (r.startState.facet(rs) != r.state.facet(rs) && (this.viewState.mustMeasureContent = !0), (t || i || h || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !r.empty)
      for (let f of this.state.facet(iu))
        try {
          f(r);
        } catch (d) {
          Et(this.state, d, "update listener");
        }
    (u || c) && Promise.resolve().then(() => {
      u && this.state == u.startState && this.dispatch(u), c && !P0(this, c) && a.force && ni(this.contentDOM, a.key, a.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new bh(this, e), this.plugins = e.facet(Un).map((i) => new rl(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new sh(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(Un), i = e.state.facet(Un);
    if (t != i) {
      let r = [];
      for (let s of i) {
        let o = t.indexOf(s);
        if (o < 0)
          r.push(new rl(s));
        else {
          let l = this.plugins[o];
          l.mustUpdate = e, r.push(l);
        }
      }
      for (let s of this.plugins)
        s.mustUpdate != e && s.destroy(this);
      this.plugins = r, this.pluginMap.clear();
    } else
      for (let r of this.plugins)
        r.mustUpdate = e;
    for (let r = 0; r < this.plugins.length; r++)
      this.plugins[r].update(this);
    t != i && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (i) {
          Et(this.state, i, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(e = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null, i = this.viewState.scrollParent, r = this.viewState.getScrollOffset(), { scrollAnchorPos: s, scrollAnchorHeight: o, scaleY: l } = this.viewState;
    Math.abs(r - this.viewState.scrollOffset) > 1 && (o = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let u = 0; ; u++) {
        if (o < 0) {
          if (Jd(i || this.win))
            s = -1, o = this.viewState.heightMap.height / this.viewState.scaleY;
          else {
            let O = this.viewState.scrollAnchorAt(r);
            s = O.from, o = O.top;
          }
          l = this.viewState.scaleY;
        }
        this.updateState = 1;
        let a = this.viewState.measure();
        if (!a && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (u > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let c = [];
        a & 4 || ([this.measureRequests, c] = [c, this.measureRequests]);
        let h = c.map((O) => {
          try {
            return O.read(this);
          } catch (m) {
            return Et(this.state, m), yh;
          }
        }), f = _s.create(this, this.state, []), d = !1;
        f.flags |= a, t ? t.flags |= a : t = f, this.updateState = 2, f.empty || (this.updatePlugins(f), this.inputState.update(f), this.updateAttrs(), d = this.docView.update(f), d && this.docViewUpdate());
        for (let O = 0; O < c.length; O++)
          if (h[O] != yh)
            try {
              let m = c[O];
              m.write && m.write(h[O], this);
            } catch (m) {
              Et(this.state, m);
            }
        if (d && this.docView.updateSelection(!0), !f.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, o = -1;
              continue;
            } else {
              let m = (s < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(s).top) / this.viewState.scaleY - o / l;
              if ((m > 1 || m < -1) && !(Z.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (i == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                r = r + m, i ? s < 0 ? i.scrollTop = i.scrollHeight : i.scrollTop += m : this.win.scrollBy(0, m), o = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let u of this.state.facet(iu))
        u(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return cu + " " + (this.state.facet(au) ? L0 : M0) + " " + this.state.facet(rs);
  }
  updateAttrs() {
    let e = Qh(this, m0, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(Vt) ? "true" : "false",
      class: "cm-content",
      style: `${Z.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), Qh(this, Ku, t);
    let i = this.observer.ignore(() => {
      let r = Jc(this.contentDOM, this.contentAttrs, t), s = Jc(this.dom, this.editorAttrs, e);
      return r || s;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let r of i.effects)
        if (r.is(j.announce)) {
          t && (this.announceDOM.textContent = "", this.win.clearTimeout(this.clearAnnouncement), this.clearAnnouncement = this.win.setTimeout(() => {
            this.announceDOM.textContent = " ";
          }, 200), t = !1);
          let s = this.announceDOM.appendChild(document.createElement("div"));
          s.textContent = r.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(qi);
    let e = this.state.facet(j.cspNonce);
    ai.mount(this.root, this.styleModules.concat(qx).reverse(), e ? { nonce: e } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable to reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), e) {
      if (this.measureRequests.indexOf(e) > -1)
        return;
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.plugin != e) && this.pluginMap.set(e, t = this.plugins.find((i) => i.plugin == e) || null), t && t.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(e, t, i) {
    return ul(this, e, oh(this, e, t, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return ul(this, e, oh(this, e, t, (i) => ix(this, e.head, i)));
  }
  /**
  **\[DEPRECATED]** Get the cursor position visually at the start
  or end of a line.
  */
  visualLineSide(e, t) {
    return t ? v.cursor(e.to, 1) : v.cursor(e.from, -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, i = !0) {
    return nx(this, e, t, i);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(e, t, i) {
    return ul(this, e, rx(this, e, t, i));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(e, t = 1) {
    return this.docView.domAtPos(e, t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    this.readMeasured();
    let i = su(this, e, t);
    return i && i.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), su(this, e, t);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let i = this.state.doc.lineAt(e), r = this.bidiSpans(i), s = r[Tt.find(r, e - i.from, -1, t)];
    return i.length && (e == i.from && t < 0 || e == i.to && t > 0) && s.dir != this.textDirectionAt(i.from) && (e == i.to ? (e = i.from + s.from, t = 1) : (e = i.from + s.to, t = -1)), this.docView.coordsAt(e, t, s.dir == pe.RTL);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(e) {
    return this.readMeasured(), this.docView.coordsForChar(e);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(e) {
    return !this.state.facet(d0) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(e) {
    if (e.length > Vx)
      return s0(e.length);
    let t = this.textDirectionAt(e.from), i;
    for (let s of this.bidiCache)
      if (s.from == e.from && s.dir == t && (s.fresh || r0(s.isolates, i = nh(this, e))))
        return s.order;
    i || (i = nh(this, e));
    let r = v2(e.text, t, i);
    return this.bidiCache.push(new Xs(e.from, e.to, t, i, !0, r)), r;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || Z.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      Kd(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(e) {
    this._root != e && (this._root = e, this.observer.setWindow((e.nodeType == 9 ? e : e.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.win.clearTimeout(this.clearAnnouncement), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(e, t = {}) {
    var i, r, s, o;
    return Kr.of(new ii(typeof e == "number" ? v.cursor(e) : e, (i = t.y) !== null && i !== void 0 ? i : "nearest", (r = t.x) !== null && r !== void 0 ? r : "nearest", (s = t.yMargin) !== null && s !== void 0 ? s : 5, (o = t.xMargin) !== null && o !== void 0 ? o : 5));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, i = this.viewState.scrollAnchorAt(e);
    return Kr.of(new ii(v.cursor(i.from), "start", "start", i.top - e, t, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(e) {
    e == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof e == "boolean" ? this.inputState.tabFocusMode = e ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + e);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(e) {
    return kn.define(() => ({}), { eventHandlers: e });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(e) {
    return kn.define(() => ({}), { eventObservers: e });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(e, t) {
    let i = ai.newName(), r = [rs.of(i), qi.of(hu(`.${i}`, e))];
    return t && t.dark && r.push(au.of(!0)), r;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return to.lowest(qi.of(hu("." + cu, e, j0)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), r = i && fe.get(i) || fe.get(e);
    return ((t = r?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
j.styleModule = qi;
j.inputHandler = h0;
j.clipboardInputFilter = Gu;
j.clipboardOutputFilter = Hu;
j.scrollHandler = O0;
j.focusChangeEffect = f0;
j.perLineTextDirection = d0;
j.exceptionSink = c0;
j.updateListener = iu;
j.editable = Vt;
j.mouseSelectionStyle = a0;
j.dragMovesSelection = u0;
j.clickAddsSelectionRange = l0;
j.decorations = io;
j.blockWrappers = g0;
j.outerDecorations = Ju;
j.atomicRanges = vr;
j.bidiIsolatedRanges = b0;
j.cursorScrollMargin = /* @__PURE__ */ I.define({
  combine: (n) => {
    let e = 5, t = 5;
    for (let i of n)
      typeof i == "number" ? e = t = i : { x: e, y: t } = i;
    return { x: e, y: t };
  }
});
j.scrollMargins = k0;
j.darkTheme = au;
j.cspNonce = /* @__PURE__ */ I.define({ combine: (n) => n.length ? n[0] : "" });
j.contentAttributes = Ku;
j.editorAttributes = m0;
j.lineWrapping = /* @__PURE__ */ j.contentAttributes.of({ class: "cm-lineWrapping" });
j.announce = /* @__PURE__ */ le.define();
const Vx = 4096, yh = {};
class Xs {
  constructor(e, t, i, r, s, o) {
    this.from = e, this.to = t, this.dir = i, this.isolates = r, this.fresh = s, this.order = o;
  }
  static update(e, t) {
    if (t.empty && !e.some((s) => s.fresh))
      return e;
    let i = [], r = e.length ? e[e.length - 1].dir : pe.LTR;
    for (let s = Math.max(0, e.length - 10); s < e.length; s++) {
      let o = e[s];
      o.dir == r && !t.touchesRange(o.from, o.to) && i.push(new Xs(t.mapPos(o.from, 1), t.mapPos(o.to, -1), o.dir, o.isolates, !1, o.order));
    }
    return i;
  }
}
function Qh(n, e, t) {
  for (let i = n.state.facet(e), r = i.length - 1; r >= 0; r--) {
    let s = i[r], o = typeof s == "function" ? s(n) : s;
    o && Nu(o, t);
  }
  return t;
}
const Ux = Z.mac ? "mac" : Z.windows ? "win" : Z.linux ? "linux" : "key";
function Gx(n, e) {
  const t = n.split(/-(?!$)/);
  let i = t[t.length - 1];
  i == "Space" && (i = " ");
  let r, s, o, l;
  for (let u = 0; u < t.length - 1; ++u) {
    const a = t[u];
    if (/^(cmd|meta|m)$/i.test(a))
      l = !0;
    else if (/^a(lt)?$/i.test(a))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(a))
      s = !0;
    else if (/^s(hift)?$/i.test(a))
      o = !0;
    else if (/^mod$/i.test(a))
      e == "mac" ? l = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + a);
  }
  return r && (i = "Alt-" + i), s && (i = "Ctrl-" + i), l && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function ss(n, e, t) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t !== !1 && e.shiftKey && (n = "Shift-" + n), n;
}
const Hx = /* @__PURE__ */ to.default(/* @__PURE__ */ j.domEventHandlers({
  keydown(n, e) {
    return tk(Kx(e.state), n, e, "editor");
  }
})), lo = /* @__PURE__ */ I.define({ enables: Hx }), wh = /* @__PURE__ */ new WeakMap();
function Kx(n) {
  let e = n.facet(lo), t = wh.get(e);
  return t || wh.set(e, t = ek(e.reduce((i, r) => i.concat(r), []))), t;
}
let dn = null;
const Jx = 4e3;
function ek(n, e = Ux) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), r = (o, l) => {
    let u = i[o];
    if (u == null)
      i[o] = l;
    else if (u != l)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, s = (o, l, u, a, c) => {
    var h, f;
    let d = t[o] || (t[o] = /* @__PURE__ */ Object.create(null)), O = l.split(/ (?!$)/).map((b) => Gx(b, e));
    for (let b = 1; b < O.length; b++) {
      let w = O.slice(0, b).join(" ");
      r(w, !0), d[w] || (d[w] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(S) => {
          let Q = dn = { view: S, prefix: w, scope: o };
          return setTimeout(() => {
            dn == Q && (dn = null);
          }, Jx), !0;
        }]
      });
    }
    let m = O.join(" ");
    r(m, !1);
    let g = d[m] || (d[m] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((f = (h = d._any) === null || h === void 0 ? void 0 : h.run) === null || f === void 0 ? void 0 : f.slice()) || []
    });
    u && g.run.push(u), a && (g.preventDefault = !0), c && (g.stopPropagation = !0);
  };
  for (let o of n) {
    let l = o.scope ? o.scope.split(" ") : ["editor"];
    if (o.any)
      for (let a of l) {
        let c = t[a] || (t[a] = /* @__PURE__ */ Object.create(null));
        c._any || (c._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: h } = o;
        for (let f in c)
          c[f].run.push((d) => h(d, fu));
      }
    let u = o[e] || o.key;
    if (u)
      for (let a of l)
        s(a, u, o.run, o.preventDefault, o.stopPropagation), o.shift && s(a, "Shift-" + u, o.shift, o.preventDefault, o.stopPropagation);
  }
  return t;
}
let fu = null;
function tk(n, e, t, i) {
  fu = e;
  let r = f2(e), s = Nb(r, 0), o = Vb(s) == r.length && r != " ", l = "", u = !1, a = !1, c = !1;
  dn && dn.view == t && dn.scope == i && (l = dn.prefix + " ", A0.indexOf(e.keyCode) < 0 && (a = !0, dn = null));
  let h = /* @__PURE__ */ new Set(), f = (g) => {
    if (g) {
      for (let b of g.run)
        if (!h.has(b) && (h.add(b), b(t)))
          return g.stopPropagation && (c = !0), !0;
      g.preventDefault && (g.stopPropagation && (c = !0), a = !0);
    }
    return !1;
  }, d = n[i], O, m;
  return d && (f(d[l + ss(r, e, !o)]) ? u = !0 : o && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(Z.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(Z.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (O = bn[e.keyCode]) && O != r ? (f(d[l + ss(O, e, !0)]) || e.shiftKey && (m = ur[e.keyCode]) != r && m != O && f(d[l + ss(m, e, !1)])) && (u = !0) : o && e.shiftKey && f(d[l + ss(r, e, !0)]) && (u = !0), !u && f(d._any) && (u = !0)), a && (u = !0), u && c && e.stopPropagation(), fu = null, u;
}
class nk extends tn {
  constructor(e) {
    super(), this.content = e;
  }
  toDOM(e) {
    let t = document.createElement("span");
    return t.className = "cm-placeholder", t.style.pointerEvents = "none", t.appendChild(typeof this.content == "string" ? document.createTextNode(this.content) : typeof this.content == "function" ? this.content(e) : this.content.cloneNode(!0)), t.setAttribute("aria-hidden", "true"), t;
  }
  coordsAt(e) {
    let t = e.firstChild ? Gi(e.firstChild) : [];
    if (!t.length)
      return null;
    let i = window.getComputedStyle(e.parentNode), r = hr(t[0], i.direction != "rtl"), s = parseInt(i.lineHeight);
    return r.bottom - r.top > s * 1.5 ? { left: r.left, right: r.right, top: r.top, bottom: r.top + s } : r;
  }
  ignoreEvent() {
    return !1;
  }
}
function ik(n) {
  let e = kn.fromClass(class {
    constructor(t) {
      this.view = t, this.placeholder = n ? K.set([K.widget({ widget: new nk(n), side: 1 }).range(0)]) : K.none;
    }
    get decorations() {
      return this.view.state.doc.length ? K.none : this.placeholder;
    }
  }, { decorations: (t) => t.decorations });
  return typeof n == "string" ? [
    e,
    j.contentAttributes.of({ "aria-placeholder": n })
  ] : e;
}
class pi extends gn {
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(e) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(e) {
  }
}
pi.prototype.elementClass = "";
pi.prototype.toDOM = void 0;
pi.prototype.mapMode = Re.TrackBefore;
pi.prototype.startSide = pi.prototype.endSide = -1;
pi.prototype.point = !0;
const z0 = 1024;
let rk = 0;
class lt {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class F {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = rk++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    }), this.combine = e.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = ke.match(e)), (t) => {
      let i = e(t);
      return i === void 0 ? null : [this, i];
    };
  }
}
F.closedBy = new F({ deserialize: (n) => n.split(" ") });
F.openedBy = new F({ deserialize: (n) => n.split(" ") });
F.group = new F({ deserialize: (n) => n.split(" ") });
F.isolate = new F({ deserialize: (n) => {
  if (n && n != "rtl" && n != "ltr" && n != "auto")
    throw new RangeError("Invalid value for isolate: " + n);
  return n || "auto";
} });
F.contextHash = new F({ perNode: !0 });
F.lookAhead = new F({ perNode: !0 });
F.mounted = new F({ perNode: !0 });
class ri {
  constructor(e, t, i, r = !1) {
    this.tree = e, this.overlay = t, this.parser = i, this.bracketed = r;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[F.mounted.id];
  }
}
const sk = /* @__PURE__ */ Object.create(null);
class ke {
  /**
  @internal
  */
  constructor(e, t, i, r = 0) {
    this.name = e, this.props = t, this.id = i, this.flags = r;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : sk, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), r = new ke(e.name || "", t, e.id, i);
    if (e.props) {
      for (let s of e.props)
        if (Array.isArray(s) || (s = s(r)), s) {
          if (s[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[s[0].id] = s[1];
        }
    }
    return r;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(e) {
    return this.props[e.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(F.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e)
      for (let r of i.split(" "))
        t[r] = e[i];
    return (i) => {
      for (let r = i.prop(F.group), s = -1; s < (r ? r.length : 0); s++) {
        let o = t[s < 0 ? i.name : r[s]];
        if (o)
          return o;
      }
    };
  }
}
ke.none = new ke(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class _r {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...e) {
    let t = [];
    for (let i of this.types) {
      let r = null;
      for (let s of e) {
        let o = s(i);
        if (o) {
          r || (r = Object.assign({}, i.props));
          let l = o[1], u = o[0];
          u.combine && u.id in r && (l = u.combine(r[u.id], l)), r[u.id] = l;
        }
      }
      t.push(r ? new ke(i.name, r, i.id, i.flags) : i);
    }
    return new _r(t);
  }
}
const os = /* @__PURE__ */ new WeakMap(), $h = /* @__PURE__ */ new WeakMap();
var V;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays", n[n.EnterBracketed = 16] = "EnterBracketed";
})(V || (V = {}));
class J {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, i, r, s) {
    if (this.type = e, this.children = t, this.positions = i, this.length = r, this.props = null, s && s.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, l] of s)
        this.props[typeof o == "number" ? o : o.id] = l;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = ri.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let i of this.children) {
      let r = i.toString();
      r && (t && (t += ","), t += r);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new Zs(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, i = 0) {
    let r = os.get(this) || this.topNode, s = new Zs(r);
    return s.moveTo(e, t), os.set(this, s._tree), s;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new Te(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(e, t = 0) {
    let i = dr(os.get(this) || this.topNode, e, t, !1);
    return os.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let i = dr($h.get(this) || this.topNode, e, t, !0);
    return $h.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return uk(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: i, from: r = 0, to: s = this.length } = e, o = e.mode || 0, l = (o & V.IncludeAnonymous) > 0;
    for (let u = this.cursor(o | V.IncludeAnonymous); ; ) {
      let a = !1;
      if (u.from <= s && u.to >= r && (!l && u.type.isAnonymous || t(u) !== !1)) {
        if (u.firstChild())
          continue;
        a = !0;
      }
      for (; a && i && (l || !u.type.isAnonymous) && i(u), !u.nextSibling(); ) {
        if (!u.parent())
          return;
        a = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : ra(ke.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, r) => new J(this.type, t, i, r, this.propValues), e.makeTree || ((t, i, r) => new J(ke.none, t, i, r)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return ak(e);
  }
}
J.empty = new J(ke.none, [], [], 0);
class na {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new na(this.buffer, this.index);
  }
}
class Sn {
  /**
  Create a tree buffer.
  */
  constructor(e, t, i) {
    this.buffer = e, this.length = t, this.set = i;
  }
  /**
  @internal
  */
  get type() {
    return ke.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let t = this.buffer[e], i = this.buffer[e + 3], r = this.set.types[t], s = r.name;
    if (/\W/.test(s) && !r.isError && (s = JSON.stringify(s)), e += 4, i == e)
      return s;
    let o = [];
    for (; e < i; )
      o.push(this.childString(e)), e = this.buffer[e + 3];
    return s + "(" + o.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, i, r, s) {
    let { buffer: o } = this, l = -1;
    for (let u = e; u != t && !(I0(s, r, o[u + 1], o[u + 2]) && (l = u, i > 0)); u = o[u + 3])
      ;
    return l;
  }
  /**
  @internal
  */
  slice(e, t, i) {
    let r = this.buffer, s = new Uint16Array(t - e), o = 0;
    for (let l = e, u = 0; l < t; ) {
      s[u++] = r[l++], s[u++] = r[l++] - i;
      let a = s[u++] = r[l++] - i;
      s[u++] = r[l++] - e, o = Math.max(o, a);
    }
    return new Sn(s, o, this.set);
  }
}
function I0(n, e, t, i) {
  switch (n) {
    case -2:
      return t < e;
    case -1:
      return i >= e && t < e;
    case 0:
      return t < e && i > e;
    case 1:
      return t <= e && i > e;
    case 2:
      return i > e;
    case 4:
      return !0;
  }
}
function dr(n, e, t, i) {
  for (var r; n.from == n.to || (t < 1 ? n.from >= e : n.from > e) || (t > -1 ? n.to <= e : n.to < e); ) {
    let o = !i && n instanceof Te && n.index < 0 ? null : n.parent;
    if (!o)
      return n;
    n = o;
  }
  let s = i ? 0 : V.IgnoreOverlays;
  if (i)
    for (let o = n, l = o.parent; l; o = l, l = o.parent)
      o instanceof Te && o.index < 0 && ((r = l.enter(e, t, s)) === null || r === void 0 ? void 0 : r.from) != o.from && (n = l);
  for (; ; ) {
    let o = n.enter(e, t, s);
    if (!o)
      return n;
    n = o;
  }
}
class B0 {
  cursor(e = 0) {
    return new Zs(this, e);
  }
  getChild(e, t = null, i = null) {
    let r = Ph(this, e, t, i);
    return r.length ? r[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return Ph(this, e, t, i);
  }
  resolve(e, t = 0) {
    return dr(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return dr(this, e, t, !0);
  }
  matchContext(e) {
    return du(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), i = this;
    for (; t; ) {
      let r = t.lastChild;
      if (!r || r.to != t.to)
        break;
      r.type.isError && r.from == r.to ? (i = t, t = r.prevSibling) : t = r;
    }
    return i;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class Te extends B0 {
  constructor(e, t, i, r) {
    super(), this._tree = e, this.from = t, this.index = i, this._parent = r;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, i, r, s = 0) {
    for (let o = this; ; ) {
      for (let { children: l, positions: u } = o._tree, a = t > 0 ? l.length : -1; e != a; e += t) {
        let c = l[e], h = u[e] + o.from, f;
        if (!(!(s & V.EnterBracketed && c instanceof J && (f = ri.get(c)) && !f.overlay && f.bracketed && i >= h && i <= h + c.length) && !I0(r, i, h, h + c.length))) {
          if (c instanceof Sn) {
            if (s & V.ExcludeBuffers)
              continue;
            let d = c.findChild(0, c.buffer.length, t, i - h, r);
            if (d > -1)
              return new Xt(new ok(o, c, e, h), null, d);
          } else if (s & V.IncludeAnonymous || !c.type.isAnonymous || ia(c)) {
            let d;
            if (!(s & V.IgnoreMounts) && (d = ri.get(c)) && !d.overlay)
              return new Te(d.tree, h, e, o);
            let O = new Te(c, h, e, o);
            return s & V.IncludeAnonymous || !O.type.isAnonymous ? O : O.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, r, s);
          }
        }
      }
      if (s & V.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? e = o.index + t : e = t < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.nextChild(
      0,
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this._tree.prop(e);
  }
  enter(e, t, i = 0) {
    let r;
    if (!(i & V.IgnoreOverlays) && (r = ri.get(this._tree)) && r.overlay) {
      let s = e - this.from, o = i & V.EnterBracketed && r.bracketed;
      for (let { from: l, to: u } of r.overlay)
        if ((t > 0 || o ? l <= s : l < s) && (t < 0 || o ? u >= s : u > s))
          return new Te(r.tree, r.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, i);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function Ph(n, e, t, i) {
  let r = n.cursor(), s = [];
  if (!r.firstChild())
    return s;
  if (t != null) {
    for (let o = !1; !o; )
      if (o = r.type.is(t), !r.nextSibling())
        return s;
  }
  for (; ; ) {
    if (i != null && r.type.is(i))
      return s;
    if (r.type.is(e) && s.push(r.node), !r.nextSibling())
      return i == null ? s : [];
  }
}
function du(n, e, t = e.length - 1) {
  for (let i = n; t >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (e[t] && e[t] != i.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class ok {
  constructor(e, t, i, r) {
    this.parent = e, this.buffer = t, this.index = i, this.start = r;
  }
}
class Xt extends B0 {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, i) {
    super(), this.context = e, this._parent = t, this.index = i, this.type = e.buffer.set.types[e.buffer.buffer[i]];
  }
  child(e, t, i) {
    let { buffer: r } = this.context, s = r.findChild(this.index + 4, r.buffer[this.index + 3], e, t - this.context.start, i);
    return s < 0 ? null : new Xt(this.context, this, s);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.child(
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.child(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this.type.prop(e);
  }
  enter(e, t, i = 0) {
    if (i & V.ExcludeBuffers)
      return null;
    let { buffer: r } = this.context, s = r.findChild(this.index + 4, r.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return s < 0 ? null : new Xt(this.context, this, s);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + e,
      e,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new Xt(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new Xt(this.context, this._parent, e.findChild(
      t,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: i } = this.context, r = this.index + 4, s = i.buffer[this.index + 3];
    if (s > r) {
      let o = i.buffer[this.index + 1];
      e.push(i.slice(r, s, o)), t.push(0);
    }
    return new J(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function q0(n) {
  if (!n.length)
    return null;
  let e = 0, t = n[0];
  for (let s = 1; s < n.length; s++) {
    let o = n[s];
    (o.from > t.from || o.to < t.to) && (t = o, e = s);
  }
  let i = t instanceof Te && t.index < 0 ? null : t.parent, r = n.slice();
  return i ? r[e] = i : r.splice(e, 1), new lk(r, t);
}
class lk {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return q0(this.heads);
  }
}
function uk(n, e, t) {
  let i = n.resolveInner(e, t), r = null;
  for (let s = i instanceof Te ? i : i.context.parent; s; s = s.parent)
    if (s.index < 0) {
      let o = s.parent;
      (r || (r = [i])).push(o.resolve(e, t)), s = o;
    } else {
      let o = ri.get(s.tree);
      if (o && o.overlay && o.overlay[0].from <= e && o.overlay[o.overlay.length - 1].to >= e) {
        let l = new Te(o.tree, o.overlay[0].from + s.from, -1, s);
        (r || (r = [i])).push(dr(l, e, t, !1));
      }
    }
  return r ? q0(r) : i;
}
class Zs {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, t = 0) {
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~V.EnterBracketed, e instanceof Te)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let i = e._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: i, buffer: r } = this.buffer;
    return this.type = t || r.set.types[r.buffer[e]], this.from = i + r.buffer[e + 1], this.to = i + r.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof Te ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(e, t, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, i, this.mode));
    let { buffer: r } = this.buffer, s = r.findChild(this.index + 4, r.buffer[this.index + 3], e, t - this.buffer.start, i);
    return s < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(s));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(e) {
    return this.enterChild(
      1,
      e,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(e) {
    return this.enterChild(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(e, t, i = this.mode) {
    return this.buffer ? i & V.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & V.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & V.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, i = this.stack.length - 1;
    if (e < 0) {
      let r = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != r)
        return this.yieldBuf(t.findChild(
          r,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let r = t.buffer[this.index + 3];
      if (r < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
        return this.yieldBuf(r);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, i, { buffer: r } = this;
    if (r) {
      if (e > 0) {
        if (this.index < r.buffer.buffer.length)
          return !1;
      } else
        for (let s = 0; s < this.index; s++)
          if (r.buffer.buffer[s + 3] < this.index)
            return !1;
      ({ index: t, parent: i } = r);
    } else
      ({ index: t, _parent: i } = this._tree);
    for (; i; { index: t, _parent: i } = i)
      if (t > -1)
        for (let s = t + e, o = e < 0 ? -1 : i._tree.children.length; s != o; s += e) {
          let l = i._tree.children[s];
          if (this.mode & V.IncludeAnonymous || l instanceof Sn || !l.type.isAnonymous || ia(l))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(
      e,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(e = !0) {
    return this.move(1, e);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(e = !0) {
    return this.move(-1, e);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, i = 0;
    if (e && e.context == this.buffer)
      e: for (let r = this.index, s = this.stack.length; s >= 0; ) {
        for (let o = e; o; o = o._parent)
          if (o.index == r) {
            if (r == this.index)
              return o;
            t = o, i = s + 1;
            break e;
          }
        r = this.stack[--s];
      }
    for (let r = i; r < this.stack.length; r++)
      t = new Xt(this.buffer, t, this.stack[r]);
    return this.bufferNode = new Xt(this.buffer, t, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(e, t) {
    for (let i = 0; ; ) {
      let r = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (r = !0);
      }
      for (; ; ) {
        if (r && t && t(this), r = this.type.isAnonymous, !i)
          return;
        if (this.nextSibling())
          break;
        this.parent(), i--, r = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(e) {
    if (!this.buffer)
      return du(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let r = e.length - 1, s = this.stack.length - 1; r >= 0; s--) {
      if (s < 0)
        return du(this._tree, e, r);
      let o = i[t.buffer[this.stack[s]]];
      if (!o.isAnonymous) {
        if (e[r] && e[r] != o.name)
          return !1;
        r--;
      }
    }
    return !0;
  }
}
function ia(n) {
  return n.children.some((e) => e instanceof Sn || !e.type.isAnonymous || ia(e));
}
function ak(n) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: r = z0, reused: s = [], minRepeatType: o = i.types.length } = n, l = Array.isArray(t) ? new na(t, t.length) : t, u = i.types, a = 0, c = 0;
  function h(y, A, C, z, X, q) {
    let { id: R, start: M, end: W, size: ne } = l, ee = c, We = a;
    if (ne < 0)
      if (l.next(), ne == -1) {
        let Ne = s[R];
        C.push(Ne), z.push(M - y);
        return;
      } else if (ne == -3) {
        a = R;
        return;
      } else if (ne == -4) {
        c = R;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ne}`);
    let it = u[R], Ln, zt, Qn = M - y;
    if (W - M <= r && (zt = g(l.pos - A, X))) {
      let Ne = new Uint16Array(zt.size - zt.skip), Xe = l.pos - zt.size, rt = Ne.length;
      for (; l.pos > Xe; )
        rt = b(zt.start, Ne, rt);
      Ln = new Sn(Ne, W - zt.start, i), Qn = zt.start - y;
    } else {
      let Ne = l.pos - ne;
      l.next();
      let Xe = [], rt = [], It = R >= o ? R : -1, nn = 0, te = W;
      for (; l.pos > Ne; )
        It >= 0 && l.id == It && l.size >= 0 ? (l.end <= te - r && (O(Xe, rt, M, nn, l.end, te, It, ee, We), nn = Xe.length, te = l.end), l.next()) : q > 2500 ? f(M, Ne, Xe, rt) : h(M, Ne, Xe, rt, It, q + 1);
      if (It >= 0 && nn > 0 && nn < Xe.length && O(Xe, rt, M, nn, M, te, It, ee, We), Xe.reverse(), rt.reverse(), It > -1 && nn > 0) {
        let Dr = d(it, We);
        Ln = ra(it, Xe, rt, 0, Xe.length, 0, W - M, Dr, Dr);
      } else
        Ln = m(it, Xe, rt, W - M, ee - W, We);
    }
    C.push(Ln), z.push(Qn);
  }
  function f(y, A, C, z) {
    let X = [], q = 0, R = -1;
    for (; l.pos > A; ) {
      let { id: M, start: W, end: ne, size: ee } = l;
      if (ee > 4)
        l.next();
      else {
        if (R > -1 && W < R)
          break;
        R < 0 && (R = ne - r), X.push(M, W, ne), q++, l.next();
      }
    }
    if (q) {
      let M = new Uint16Array(q * 4), W = X[X.length - 2];
      for (let ne = X.length - 3, ee = 0; ne >= 0; ne -= 3)
        M[ee++] = X[ne], M[ee++] = X[ne + 1] - W, M[ee++] = X[ne + 2] - W, M[ee++] = ee;
      C.push(new Sn(M, X[2] - W, i)), z.push(W - y);
    }
  }
  function d(y, A) {
    return (C, z, X) => {
      let q = 0, R = C.length - 1, M, W;
      if (R >= 0 && (M = C[R]) instanceof J) {
        if (!R && M.type == y && M.length == X)
          return M;
        (W = M.prop(F.lookAhead)) && (q = z[R] + M.length + W);
      }
      return m(y, C, z, X, q, A);
    };
  }
  function O(y, A, C, z, X, q, R, M, W) {
    let ne = [], ee = [];
    for (; y.length > z; )
      ne.push(y.pop()), ee.push(A.pop() + C - X);
    y.push(m(i.types[R], ne, ee, q - X, M - q, W)), A.push(X - C);
  }
  function m(y, A, C, z, X, q, R) {
    if (q) {
      let M = [F.contextHash, q];
      R = R ? [M].concat(R) : [M];
    }
    if (X > 25) {
      let M = [F.lookAhead, X];
      R = R ? [M].concat(R) : [M];
    }
    return new J(y, A, C, z, R);
  }
  function g(y, A) {
    let C = l.fork(), z = 0, X = 0, q = 0, R = C.end - r, M = { size: 0, start: 0, skip: 0 };
    e: for (let W = C.pos - y; C.pos > W; ) {
      let ne = C.size;
      if (C.id == A && ne >= 0) {
        M.size = z, M.start = X, M.skip = q, q += 4, z += 4, C.next();
        continue;
      }
      let ee = C.pos - ne;
      if (ne < 0 || ee < W || C.start < R)
        break;
      let We = C.id >= o ? 4 : 0, it = C.start;
      for (C.next(); C.pos > ee; ) {
        if (C.size < 0)
          if (C.size == -3 || C.size == -4)
            We += 4;
          else
            break e;
        else C.id >= o && (We += 4);
        C.next();
      }
      X = it, z += ne, q += We;
    }
    return (A < 0 || z == y) && (M.size = z, M.start = X, M.skip = q), M.size > 4 ? M : void 0;
  }
  function b(y, A, C) {
    let { id: z, start: X, end: q, size: R } = l;
    if (l.next(), R >= 0 && z < o) {
      let M = C;
      if (R > 4) {
        let W = l.pos - (R - 4);
        for (; l.pos > W; )
          C = b(y, A, C);
      }
      A[--C] = M, A[--C] = q - y, A[--C] = X - y, A[--C] = z;
    } else R == -3 ? a = z : R == -4 && (c = z);
    return C;
  }
  let w = [], S = [];
  for (; l.pos > 0; )
    h(n.start || 0, n.bufferStart || 0, w, S, -1, 0);
  let Q = (e = n.length) !== null && e !== void 0 ? e : w.length ? S[0] + w[0].length : 0;
  return new J(u[n.topID], w.reverse(), S.reverse(), Q);
}
const vh = /* @__PURE__ */ new WeakMap();
function ms(n, e) {
  if (!n.isAnonymous || e instanceof Sn || e.type != n)
    return 1;
  let t = vh.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != n || !(i instanceof J)) {
        t = 1;
        break;
      }
      t += ms(n, i);
    }
    vh.set(e, t);
  }
  return t;
}
function ra(n, e, t, i, r, s, o, l, u) {
  let a = 0;
  for (let O = i; O < r; O++)
    a += ms(n, e[O]);
  let c = Math.ceil(
    a * 1.5 / 8
    /* Balance.BranchFactor */
  ), h = [], f = [];
  function d(O, m, g, b, w) {
    for (let S = g; S < b; ) {
      let Q = S, y = m[S], A = ms(n, O[S]);
      for (S++; S < b; S++) {
        let C = ms(n, O[S]);
        if (A + C >= c)
          break;
        A += C;
      }
      if (S == Q + 1) {
        if (A > c) {
          let C = O[Q];
          d(C.children, C.positions, 0, C.children.length, m[Q] + w);
          continue;
        }
        h.push(O[Q]);
      } else {
        let C = m[S - 1] + O[S - 1].length - y;
        h.push(ra(n, O, m, Q, S, y, C, null, u));
      }
      f.push(y + w - s);
    }
  }
  return d(e, t, i, r, 0), (l || u)(h, f, o);
}
class F0 {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(e, t, i) {
    let r = this.map.get(e);
    r || this.map.set(e, r = /* @__PURE__ */ new Map()), r.set(t, i);
  }
  getBuffer(e, t) {
    let i = this.map.get(e);
    return i && i.get(t);
  }
  /**
  Set the value for this syntax node.
  */
  set(e, t) {
    e instanceof Xt ? this.setBuffer(e.context.buffer, e.index, t) : e instanceof Te && this.map.set(e.tree, t);
  }
  /**
  Retrieve value for this syntax node, if it exists in the map.
  */
  get(e) {
    return e instanceof Xt ? this.getBuffer(e.context.buffer, e.index) : e instanceof Te ? this.map.get(e.tree) : void 0;
  }
  /**
  Set the value for the node that a cursor currently points to.
  */
  cursorSet(e, t) {
    e.buffer ? this.setBuffer(e.buffer.buffer, e.index, t) : this.map.set(e.tree, t);
  }
  /**
  Retrieve the value for the node that a cursor currently points
  to.
  */
  cursorGet(e) {
    return e.buffer ? this.getBuffer(e.buffer.buffer, e.index) : this.map.get(e.tree);
  }
}
class Ht {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, i, r, s = !1, o = !1) {
    this.from = e, this.to = t, this.tree = i, this.offset = r, this.open = (s ? 1 : 0) | (o ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(e, t = [], i = !1) {
    let r = [new Ht(0, e.length, e, 0, !1, i)];
    for (let s of t)
      s.to > e.length && r.push(s);
    return r;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, i = 128) {
    if (!t.length)
      return e;
    let r = [], s = 1, o = e.length ? e[0] : null;
    for (let l = 0, u = 0, a = 0; ; l++) {
      let c = l < t.length ? t[l] : null, h = c ? c.fromA : 1e9;
      if (h - u >= i)
        for (; o && o.from < h; ) {
          let f = o;
          if (u >= f.from || h <= f.to || a) {
            let d = Math.max(f.from, u) - a, O = Math.min(f.to, h) - a;
            f = d >= O ? null : new Ht(d, O, f.tree, f.offset + a, l > 0, !!c);
          }
          if (f && r.push(f), o.to > h)
            break;
          o = s < e.length ? e[s++] : null;
        }
      if (!c)
        break;
      u = c.toA, a = c.toA - c.toB;
    }
    return r;
  }
}
class sa {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, i) {
    return typeof e == "string" && (e = new ck(e)), i = i ? i.length ? i.map((r) => new lt(r.from, r.to)) : [new lt(0, 0)] : [new lt(0, e.length)], this.createParse(e, t || [], i);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, i) {
    let r = this.startParse(e, t, i);
    for (; ; ) {
      let s = r.advance();
      if (s)
        return s;
    }
  }
}
class ck {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
function Y0(n) {
  return (e, t, i, r) => new fk(e, n, t, i, r);
}
class _h {
  constructor(e, t, i, r, s, o) {
    this.parser = e, this.parse = t, this.overlay = i, this.bracketed = r, this.target = s, this.from = o;
  }
}
function Ah(n) {
  if (!n.length || n.some((e) => e.from >= e.to))
    throw new RangeError("Invalid inner parse ranges given: " + JSON.stringify(n));
}
class hk {
  constructor(e, t, i, r, s, o, l, u) {
    this.parser = e, this.predicate = t, this.mounts = i, this.index = r, this.start = s, this.bracketed = o, this.target = l, this.prev = u, this.depth = 0, this.ranges = [];
  }
}
const Ou = new F({ perNode: !0 });
class fk {
  constructor(e, t, i, r, s) {
    this.nest = t, this.input = i, this.fragments = r, this.ranges = s, this.inner = [], this.innerDone = 0, this.baseTree = null, this.stoppedAt = null, this.baseParse = e;
  }
  advance() {
    if (this.baseParse) {
      let i = this.baseParse.advance();
      if (!i)
        return null;
      if (this.baseParse = null, this.baseTree = i, this.startInner(), this.stoppedAt != null)
        for (let r of this.inner)
          r.parse.stopAt(this.stoppedAt);
    }
    if (this.innerDone == this.inner.length) {
      let i = this.baseTree;
      return this.stoppedAt != null && (i = new J(i.type, i.children, i.positions, i.length, i.propValues.concat([[Ou, this.stoppedAt]]))), i;
    }
    let e = this.inner[this.innerDone], t = e.parse.advance();
    if (t) {
      this.innerDone++;
      let i = Object.assign(/* @__PURE__ */ Object.create(null), e.target.props);
      i[F.mounted.id] = new ri(t, e.overlay, e.parser, e.bracketed), e.target.props = i;
    }
    return null;
  }
  get parsedPos() {
    if (this.baseParse)
      return 0;
    let e = this.input.length;
    for (let t = this.innerDone; t < this.inner.length; t++)
      this.inner[t].from < e && (e = Math.min(e, this.inner[t].parse.parsedPos));
    return e;
  }
  stopAt(e) {
    if (this.stoppedAt = e, this.baseParse)
      this.baseParse.stopAt(e);
    else
      for (let t = this.innerDone; t < this.inner.length; t++)
        this.inner[t].parse.stopAt(e);
  }
  startInner() {
    let e = new pk(this.fragments), t = null, i = null, r = new Zs(new Te(this.baseTree, this.ranges[0].from, 0, null), V.IncludeAnonymous | V.IgnoreMounts);
    e: for (let s, o; ; ) {
      let l = !0, u;
      if (this.stoppedAt != null && r.from >= this.stoppedAt)
        l = !1;
      else if (e.hasNode(r)) {
        if (t) {
          let a = t.mounts.find((c) => c.frag.from <= r.from && c.frag.to >= r.to && c.mount.overlay);
          if (a)
            for (let c of a.mount.overlay) {
              let h = c.from + a.pos, f = c.to + a.pos;
              h >= r.from && f <= r.to && !t.ranges.some((d) => d.from < f && d.to > h) && t.ranges.push({ from: h, to: f });
            }
        }
        l = !1;
      } else if (i && (o = dk(i.ranges, r.from, r.to)))
        l = o != 2;
      else if (!r.type.isAnonymous && (s = this.nest(r, this.input)) && (r.from < r.to || !s.overlay)) {
        r.tree || (Ok(r), t && t.depth++, i && i.depth++);
        let a = e.findMounts(r.from, s.parser);
        if (typeof s.overlay == "function")
          t = new hk(s.parser, s.overlay, a, this.inner.length, r.from, !!s.bracketed, r.tree, t);
        else {
          let c = Eh(this.ranges, s.overlay || (r.from < r.to ? [new lt(r.from, r.to)] : []));
          c.length && Ah(c), (c.length || !s.overlay) && this.inner.push(new _h(s.parser, c.length ? s.parser.startParse(this.input, Xh(a, c), c) : s.parser.startParse(""), s.overlay ? s.overlay.map((h) => new lt(h.from - r.from, h.to - r.from)) : null, !!s.bracketed, r.tree, c.length ? c[0].from : r.from)), s.overlay ? c.length && (i = { ranges: c, depth: 0, prev: i }) : l = !1;
        }
      } else if (t && (u = t.predicate(r)) && (u === !0 && (u = new lt(r.from, r.to)), u.from < u.to)) {
        let a = t.ranges.length - 1;
        a >= 0 && t.ranges[a].to == u.from ? t.ranges[a] = { from: t.ranges[a].from, to: u.to } : t.ranges.push(u);
      }
      if (l && r.firstChild())
        t && t.depth++, i && i.depth++;
      else
        for (; !r.nextSibling(); ) {
          if (!r.parent())
            break e;
          if (t && !--t.depth) {
            let a = Eh(this.ranges, t.ranges);
            a.length && (Ah(a), this.inner.splice(t.index, 0, new _h(t.parser, t.parser.startParse(this.input, Xh(t.mounts, a), a), t.ranges.map((c) => new lt(c.from - t.start, c.to - t.start)), t.bracketed, t.target, a[0].from))), t = t.prev;
          }
          i && !--i.depth && (i = i.prev);
        }
    }
  }
}
function dk(n, e, t) {
  for (let i of n) {
    if (i.from >= t)
      break;
    if (i.to > e)
      return i.from <= e && i.to >= t ? 2 : 1;
  }
  return 0;
}
function Ch(n, e, t, i, r, s) {
  if (e < t) {
    let o = n.buffer[e + 1];
    i.push(n.slice(e, t, o)), r.push(o - s);
  }
}
function Ok(n) {
  let { node: e } = n, t = [], i = e.context.buffer;
  do
    t.push(n.index), n.parent();
  while (!n.tree);
  let r = n.tree, s = r.children.indexOf(i), o = r.children[s], l = o.buffer, u = [s];
  function a(c, h, f, d, O, m) {
    let g = t[m], b = [], w = [];
    Ch(o, c, g, b, w, d);
    let S = l[g + 1], Q = l[g + 2];
    u.push(b.length);
    let y = m ? a(g + 4, l[g + 3], o.set.types[l[g]], S, Q - S, m - 1) : e.toTree();
    return b.push(y), w.push(S - d), Ch(o, l[g + 3], h, b, w, d), new J(f, b, w, O);
  }
  r.children[s] = a(0, l.length, ke.none, 0, o.length, t.length - 1);
  for (let c of u) {
    let h = n.tree.children[c], f = n.tree.positions[c];
    n.yield(new Te(h, f + n.from, c, n._tree));
  }
}
class Th {
  constructor(e, t) {
    this.offset = t, this.done = !1, this.cursor = e.cursor(V.IncludeAnonymous | V.IgnoreMounts | V.ExcludeBuffers);
  }
  // Move to the first node (in pre-order) that starts at or after `pos`.
  moveTo(e) {
    let { cursor: t } = this, i = e - this.offset;
    for (; !this.done && t.from < i; )
      if (!(t.to >= i && t.enter(i, 1, V.IncludeAnonymous | V.IgnoreOverlays | V.ExcludeBuffers))) if (t.to <= i)
        t.next(!1) || (this.done = !0);
      else
        break;
  }
  hasNode(e) {
    if (this.moveTo(e.from), !this.done && this.cursor.from + this.offset == e.from && this.cursor.tree)
      for (let t = this.cursor.tree; ; ) {
        if (t == e.tree)
          return !0;
        if (t.children.length && t.positions[0] == 0 && t.children[0] instanceof J)
          t = t.children[0];
        else
          break;
      }
    return !1;
  }
}
let pk = class {
  constructor(e) {
    var t;
    if (this.fragments = e, this.curTo = 0, this.fragI = 0, e.length) {
      let i = this.curFrag = e[0];
      this.curTo = (t = i.tree.prop(Ou)) !== null && t !== void 0 ? t : i.to, this.inner = new Th(i.tree, -i.offset);
    } else
      this.curFrag = this.inner = null;
  }
  hasNode(e) {
    for (; this.curFrag && e.from >= this.curTo; )
      this.nextFrag();
    return this.curFrag && this.curFrag.from <= e.from && this.curTo >= e.to && this.inner.hasNode(e);
  }
  nextFrag() {
    var e;
    if (this.fragI++, this.fragI == this.fragments.length)
      this.curFrag = this.inner = null;
    else {
      let t = this.curFrag = this.fragments[this.fragI];
      this.curTo = (e = t.tree.prop(Ou)) !== null && e !== void 0 ? e : t.to, this.inner = new Th(t.tree, -t.offset);
    }
  }
  findMounts(e, t) {
    var i;
    let r = [];
    if (this.inner) {
      this.inner.cursor.moveTo(e, 1);
      for (let s = this.inner.cursor.node; s; s = s.parent) {
        let o = (i = s.tree) === null || i === void 0 ? void 0 : i.prop(F.mounted);
        if (o && o.parser == t)
          for (let l = this.fragI; l < this.fragments.length; l++) {
            let u = this.fragments[l];
            if (u.from >= s.to)
              break;
            u.tree == this.curFrag.tree && r.push({
              frag: u,
              pos: s.from - u.offset,
              mount: o
            });
          }
      }
    }
    return r;
  }
};
function Eh(n, e) {
  let t = null, i = e;
  for (let r = 1, s = 0; r < n.length; r++) {
    let o = n[r - 1].to, l = n[r].from;
    for (; s < i.length; s++) {
      let u = i[s];
      if (u.from >= l)
        break;
      u.to <= o || (t || (i = t = e.slice()), u.from < o ? (t[s] = new lt(u.from, o), u.to > l && t.splice(s + 1, 0, new lt(l, u.to))) : u.to > l ? t[s--] = new lt(l, u.to) : t.splice(s--, 1));
    }
  }
  return i;
}
function mk(n, e, t, i) {
  let r = 0, s = 0, o = !1, l = !1, u = -1e9, a = [];
  for (; ; ) {
    let c = r == n.length ? 1e9 : o ? n[r].to : n[r].from, h = s == e.length ? 1e9 : l ? e[s].to : e[s].from;
    if (o != l) {
      let f = Math.max(u, t), d = Math.min(c, h, i);
      f < d && a.push(new lt(f, d));
    }
    if (u = Math.min(c, h), u == 1e9)
      break;
    c == u && (o ? (o = !1, r++) : o = !0), h == u && (l ? (l = !1, s++) : l = !0);
  }
  return a;
}
function Xh(n, e) {
  let t = [];
  for (let { pos: i, mount: r, frag: s } of n) {
    let o = i + (r.overlay ? r.overlay[0].from : 0), l = o + r.tree.length, u = Math.max(s.from, o), a = Math.min(s.to, l);
    if (r.overlay) {
      let c = r.overlay.map((f) => new lt(f.from + i, f.to + i)), h = mk(e, c, u, a);
      for (let f = 0, d = u; ; f++) {
        let O = f == h.length, m = O ? a : h[f].from;
        if (m > d && t.push(new Ht(d, m, r.tree, -o, s.from >= d || s.openStart, s.to <= m || s.openEnd)), O)
          break;
        d = h[f].to;
      }
    } else
      t.push(new Ht(u, a, r.tree, -o, s.from >= o || s.openStart, s.to <= l || s.openEnd));
  }
  return t;
}
let gk = 0;
class Je {
  /**
  @internal
  */
  constructor(e, t, i, r) {
    this.name = e, this.set = t, this.base = i, this.modified = r, this.id = gk++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let i = typeof e == "string" ? e : "?";
    if (e instanceof Je && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let r = new Je(i, [], null, []);
    if (r.set.push(r), t)
      for (let s of t.set)
        r.set.push(s);
    return r;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(e) {
    let t = new Ds(e);
    return (i) => i.modified.indexOf(t) > -1 ? i : Ds.get(i.base || i, i.modified.concat(t).sort((r, s) => r.id - s.id));
  }
}
let bk = 0;
class Ds {
  constructor(e) {
    this.name = e, this.instances = [], this.id = bk++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && xk(t, l.modified));
    if (i)
      return i;
    let r = [], s = new Je(e.name, r, e, t);
    for (let l of t)
      l.instances.push(s);
    let o = kk(t);
    for (let l of e.set)
      if (!l.modified.length)
        for (let u of o)
          r.push(Ds.get(l, u));
    return s;
  }
}
function xk(n, e) {
  return n.length == e.length && n.every((t, i) => t == e[i]);
}
function kk(n) {
  let e = [[]];
  for (let t = 0; t < n.length; t++)
    for (let i = 0, r = e.length; i < r; i++)
      e.push(e[i].concat(n[t]));
  return e.sort((t, i) => i.length - t.length);
}
function Qi(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let i = n[t];
    Array.isArray(i) || (i = [i]);
    for (let r of t.split(" "))
      if (r) {
        let s = [], o = 2, l = r;
        for (let h = 0; ; ) {
          if (l == "..." && h > 0 && h + 3 == r.length) {
            o = 1;
            break;
          }
          let f = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!f)
            throw new RangeError("Invalid path: " + r);
          if (s.push(f[0] == "*" ? "" : f[0][0] == '"' ? JSON.parse(f[0]) : f[0]), h += f[0].length, h == r.length)
            break;
          let d = r[h++];
          if (h == r.length && d == "!") {
            o = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + r);
          l = r.slice(h);
        }
        let u = s.length - 1, a = s[u];
        if (!a)
          throw new RangeError("Invalid path: " + r);
        let c = new Rs(i, o, u > 0 ? s.slice(0, u) : null);
        e[a] = c.sort(e[a]);
      }
  }
  return Sk.add(e);
}
const Sk = new F({
  combine(n, e) {
    let t, i, r;
    for (; n || e; ) {
      if (!n || e && n.depth <= e.depth ? (r = e, e = e.next) : (r = n, n = n.next), t && t.mode == r.mode && !r.context && !t.context)
        continue;
      let s = new Rs(r.tags, r.mode, r.context);
      t ? t.next = s : i = s, t = s;
    }
    return i;
  }
});
class Rs {
  constructor(e, t, i, r) {
    this.tags = e, this.mode = t, this.context = i, this.next = r;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
Rs.empty = new Rs([], 2, null);
function yk(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of n)
    if (!Array.isArray(s.tag))
      t[s.tag.id] = s.class;
    else
      for (let o of s.tag)
        t[o.id] = s.class;
  let { scope: i, all: r = null } = {};
  return {
    style: (s) => {
      let o = r;
      for (let l of s)
        for (let u of l.set) {
          let a = t[u.id];
          if (a) {
            o = o ? o + " " + a : a;
            break;
          }
        }
      return o;
    },
    scope: i
  };
}
const E = Je.define, ls = E(), cn = E(), Zh = E(cn), Dh = E(cn), hn = E(), us = E(hn), hl = E(hn), Pt = E(), An = E(Pt), wt = E(), $t = E(), pu = E(), Mi = E(pu), as = E(), x = {
  /**
  A comment.
  */
  comment: ls,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: E(ls),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: E(ls),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: E(ls),
  /**
  Any kind of identifier.
  */
  name: cn,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: E(cn),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: Zh,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: E(Zh),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: Dh,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: E(Dh),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: E(cn),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: E(cn),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: E(cn),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: E(cn),
  /**
  A literal value.
  */
  literal: hn,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: us,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: E(us),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: E(us),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: E(us),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: hl,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: E(hl),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: E(hl),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: E(hn),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: E(hn),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: E(hn),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: E(hn),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: E(hn),
  /**
  A language keyword.
  */
  keyword: wt,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: E(wt),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: E(wt),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: E(wt),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: E(wt),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: E(wt),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: E(wt),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: E(wt),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: E(wt),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: E(wt),
  /**
  An operator.
  */
  operator: $t,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: E($t),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: E($t),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: E($t),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: E($t),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: E($t),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: E($t),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: E($t),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: E($t),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: E($t),
  /**
  Program or markup punctuation.
  */
  punctuation: pu,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: E(pu),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Mi,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: E(Mi),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: E(Mi),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: E(Mi),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: E(Mi),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Pt,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: An,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: E(An),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: E(An),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: E(An),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: E(An),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: E(An),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: E(An),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: E(Pt),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: E(Pt),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: E(Pt),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: E(Pt),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: E(Pt),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: E(Pt),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: E(Pt),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: E(Pt),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: E(),
  /**
  Deleted text.
  */
  deleted: E(),
  /**
  Changed text.
  */
  changed: E(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: E(),
  /**
  Metadata or meta-instruction.
  */
  meta: as,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: E(as),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: E(as),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: E(as),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: Je.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: Je.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: Je.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: Je.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: Je.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: Je.defineModifier("special")
};
for (let n in x) {
  let e = x[n];
  e instanceof Je && (e.name = n);
}
yk([
  { tag: x.link, class: "tok-link" },
  { tag: x.heading, class: "tok-heading" },
  { tag: x.emphasis, class: "tok-emphasis" },
  { tag: x.strong, class: "tok-strong" },
  { tag: x.keyword, class: "tok-keyword" },
  { tag: x.atom, class: "tok-atom" },
  { tag: x.bool, class: "tok-bool" },
  { tag: x.url, class: "tok-url" },
  { tag: x.labelName, class: "tok-labelName" },
  { tag: x.inserted, class: "tok-inserted" },
  { tag: x.deleted, class: "tok-deleted" },
  { tag: x.literal, class: "tok-literal" },
  { tag: x.string, class: "tok-string" },
  { tag: x.number, class: "tok-number" },
  { tag: [x.regexp, x.escape, x.special(x.string)], class: "tok-string2" },
  { tag: x.variableName, class: "tok-variableName" },
  { tag: x.local(x.variableName), class: "tok-variableName tok-local" },
  { tag: x.definition(x.variableName), class: "tok-variableName tok-definition" },
  { tag: x.special(x.variableName), class: "tok-variableName2" },
  { tag: x.definition(x.propertyName), class: "tok-propertyName tok-definition" },
  { tag: x.typeName, class: "tok-typeName" },
  { tag: x.namespace, class: "tok-namespace" },
  { tag: x.className, class: "tok-className" },
  { tag: x.macroName, class: "tok-macroName" },
  { tag: x.propertyName, class: "tok-propertyName" },
  { tag: x.operator, class: "tok-operator" },
  { tag: x.comment, class: "tok-comment" },
  { tag: x.meta, class: "tok-meta" },
  { tag: x.invalid, class: "tok-invalid" },
  { tag: x.punctuation, class: "tok-punctuation" }
]);
var fl;
const Gn = /* @__PURE__ */ new F();
function oa(n) {
  return I.define({
    combine: n ? (e) => e.concat(n) : void 0
  });
}
const la = /* @__PURE__ */ new F();
class pt {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, i = [], r = "") {
    this.data = e, this.name = r, H.prototype.hasOwnProperty("tree") || Object.defineProperty(H.prototype, "tree", { get() {
      return he(this);
    } }), this.parser = t, this.extension = [
      bi.of(this),
      H.languageData.of((s, o, l) => {
        let u = Rh(s, o, l), a = u.type.prop(Gn);
        if (!a)
          return [];
        let c = s.facet(a), h = u.type.prop(la);
        if (h) {
          let f = u.resolve(o - u.from, l);
          for (let d of h)
            if (d.test(f, s)) {
              let O = s.facet(d.facet);
              return d.type == "replace" ? O : O.concat(c);
            }
        }
        return c;
      })
    ].concat(i);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, i = -1) {
    return Rh(e, t, i).type.prop(Gn) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(bi);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], r = (s, o) => {
      if (s.prop(Gn) == this.data) {
        i.push({ from: o, to: o + s.length });
        return;
      }
      let l = s.prop(F.mounted);
      if (l) {
        if (l.tree.prop(Gn) == this.data) {
          if (l.overlay)
            for (let u of l.overlay)
              i.push({ from: u.from + o, to: u.to + o });
          else
            i.push({ from: o, to: o + s.length });
          return;
        } else if (l.overlay) {
          let u = i.length;
          if (r(l.tree, l.overlay[0].from + o), i.length > u)
            return;
        }
      }
      for (let u = 0; u < s.children.length; u++) {
        let a = s.children[u];
        a instanceof J && r(a, s.positions[u] + o);
      }
    };
    return r(he(e), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
pt.setState = /* @__PURE__ */ le.define();
function Rh(n, e, t) {
  let i = n.facet(bi), r = he(n).topNode;
  if (!i || i.allowsNesting)
    for (let s = r; s; s = s.enter(e, t, V.ExcludeBuffers | V.EnterBracketed))
      s.type.isTop && (r = s);
  return r;
}
class mi extends pt {
  constructor(e, t, i) {
    super(e, t, [], i), this.parser = t;
  }
  /**
  Define a language from a parser.
  */
  static define(e) {
    let t = oa(e.languageData);
    return new mi(t, e.parser.configure({
      props: [Gn.add((i) => i.isTop ? t : void 0)]
    }), e.name);
  }
  /**
  Create a new instance of this language with a reconfigured
  version of its parser and optionally a new name.
  */
  configure(e, t) {
    return new mi(this.data, this.parser.configure(e), t || this.name);
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function he(n) {
  let e = n.field(pt.state, !1);
  return e ? e.tree : J.empty;
}
class Qk {
  /**
  Create an input object for the given document.
  */
  constructor(e) {
    this.doc = e, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let i = this.cursorPos - this.string.length;
    return e < i || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - i, t - i);
  }
}
let Li = null;
class Or {
  constructor(e, t, i = [], r, s, o, l, u) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = r, this.treeLen = s, this.viewport = o, this.skipped = l, this.scheduleOn = u, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new Or(e, t, [], J.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new Qk(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != J.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let r = Date.now() + e;
        e = () => Date.now() > r;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let r = this.parse.advance();
        if (r)
          if (this.fragments = this.withoutTempSkipped(Ht.addTree(r, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = r, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(Ht.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Li;
    Li = this;
    try {
      return e();
    } finally {
      Li = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = Mh(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: i, tree: r, treeLen: s, viewport: o, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let u = [];
      if (e.iterChangedRanges((a, c, h, f) => u.push({ fromA: a, toA: c, fromB: h, toB: f })), i = Ht.applyChanges(i, u), r = J.empty, s = 0, o = { from: e.mapPos(o.from, -1), to: e.mapPos(o.to, 1) }, this.skipped.length) {
        l = [];
        for (let a of this.skipped) {
          let c = e.mapPos(a.from, 1), h = e.mapPos(a.to, -1);
          c < h && l.push({ from: c, to: h });
        }
      }
    }
    return new Or(this.parser, t, i, r, s, o, l, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: r, to: s } = this.skipped[i];
      r < e.to && s > e.from && (this.fragments = Mh(this.fragments, r, s), this.skipped.splice(i--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(e) {
    return new class extends sa {
      createParse(t, i, r) {
        let s = r[0].from, o = r[r.length - 1].to;
        return {
          parsedPos: s,
          advance() {
            let u = Li;
            if (u) {
              for (let a of r)
                u.tempSkipped.push(a);
              e && (u.scheduleOn = u.scheduleOn ? Promise.all([u.scheduleOn, e]) : e);
            }
            return this.parsedPos = o, new J(ke.none, [], [], o - s);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return Li;
  }
}
function Mh(n, e, t) {
  return Ht.applyChanges(n, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class gi {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new gi(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = Or.create(e.facet(bi).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new gi(i);
  }
}
pt.state = /* @__PURE__ */ jt.define({
  create: gi.init,
  update(n, e) {
    for (let t of e.effects)
      if (t.is(pt.setState))
        return t.value;
    return e.startState.facet(bi) != e.state.facet(bi) ? gi.init(e.state) : n.apply(e);
  }
});
let W0 = (n) => {
  let e = setTimeout(
    () => n(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (W0 = (n) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(n, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const dl = typeof navigator < "u" && (!((fl = navigator.scheduling) === null || fl === void 0) && fl.isInputPending) ? () => navigator.scheduling.isInputPending() : null, wk = /* @__PURE__ */ kn.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(pt.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(pt.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = W0(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: r } } = this.view, s = i.field(pt.state);
    if (s.tree == s.context.tree && s.context.isDone(
      r + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, e && !dl ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = s.context.treeLen < r && i.doc.length > r + 1e3, u = s.context.work(() => dl && dl() || Date.now() > o, r + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (u || this.chunkBudget <= 0) && (s.context.takeTree(), this.view.dispatch({ effects: pt.setState.of(new gi(s.context)) })), this.chunkBudget > 0 && !(u && !l) && this.scheduleWork(), this.checkAsyncSchedule(s.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Et(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), bi = /* @__PURE__ */ I.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: (n) => [
    pt.state,
    wk,
    j.contentAttributes.compute([n], (e) => {
      let t = e.facet(n);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
});
class pr {
  /**
  Create a language support object.
  */
  constructor(e, t = []) {
    this.language = e, this.support = t, this.extension = [e, t];
  }
}
class Ms {
  constructor(e, t, i, r, s, o = void 0) {
    this.name = e, this.alias = t, this.extensions = i, this.filename = r, this.loadFunc = s, this.support = o, this.loading = null;
  }
  /**
  Start loading the the language. Will return a promise that
  resolves to a [`LanguageSupport`](https://codemirror.net/6/docs/ref/#language.LanguageSupport)
  object when the language successfully loads.
  */
  load() {
    return this.loading || (this.loading = this.loadFunc().then((e) => this.support = e, (e) => {
      throw this.loading = null, e;
    }));
  }
  /**
  Create a language description.
  */
  static of(e) {
    let { load: t, support: i } = e;
    if (!t) {
      if (!i)
        throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");
      t = () => Promise.resolve(i);
    }
    return new Ms(e.name, (e.alias || []).concat(e.name).map((r) => r.toLowerCase()), e.extensions || [], e.filename, t, i);
  }
  /**
  Look for a language in the given array of descriptions that
  matches the filename. Will first match
  [`filename`](https://codemirror.net/6/docs/ref/#language.LanguageDescription.filename) patterns,
  and then [extensions](https://codemirror.net/6/docs/ref/#language.LanguageDescription.extensions),
  and return the first language that matches.
  */
  static matchFilename(e, t) {
    for (let r of e)
      if (r.filename && r.filename.test(t))
        return r;
    let i = /\.([^.]+)$/.exec(t);
    if (i) {
      for (let r of e)
        if (r.extensions.indexOf(i[1]) > -1)
          return r;
    }
    return null;
  }
  /**
  Look for a language whose name or alias matches the the given
  name (case-insensitively). If `fuzzy` is true, and no direct
  matchs is found, this'll also search for a language whose name
  or alias occurs in the string (for names shorter than three
  characters, only when surrounded by non-word characters).
  */
  static matchLanguageName(e, t, i = !0) {
    t = t.toLowerCase();
    for (let r of e)
      if (r.alias.some((s) => s == t))
        return r;
    if (i)
      for (let r of e)
        for (let s of r.alias) {
          let o = t.indexOf(s);
          if (o > -1 && (s.length > 2 || !/\w/.test(t[o - 1]) && !/\w/.test(t[o + s.length])))
            return r;
        }
    return null;
  }
}
const $k = /* @__PURE__ */ I.define(), Ar = /* @__PURE__ */ I.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    let e = n[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return e;
  }
});
function Ls(n) {
  let e = n.facet(Ar);
  return e.charCodeAt(0) == 9 ? n.tabSize * e.length : e.length;
}
function js(n, e) {
  let t = "", i = n.tabSize, r = n.facet(Ar)[0];
  if (r == "	") {
    for (; e >= i; )
      t += "	", e -= i;
    r = " ";
  }
  for (let s = 0; s < e; s++)
    t += r;
  return t;
}
function N0(n, e) {
  n instanceof H && (n = new uo(n));
  for (let i of n.state.facet($k)) {
    let r = i(n, e);
    if (r !== void 0)
      return r;
  }
  let t = he(n.state);
  return t.length >= e ? Pk(n, t, e) : null;
}
class uo {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = Ls(e);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(e, t = 1) {
    let i = this.state.doc.lineAt(e), { simulateBreak: r, simulateDoubleBreak: s } = this.options;
    return r != null && r >= i.from && r <= i.to ? s && r == e ? { text: "", from: e } : (t < 0 ? r < e : r <= e) ? { text: i.text.slice(r - i.from), from: r } : { text: i.text.slice(0, r - i.from), from: i.from } : i;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: i, from: r } = this.lineAt(e, t);
    return i.slice(e - r, Math.min(i.length, e + 100 - r));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: i, from: r } = this.lineAt(e, t), s = this.countColumn(i, e - r), o = this.options.overrideIndentation ? this.options.overrideIndentation(r) : -1;
    return o > -1 && (s += o - this.countColumn(i, i.search(/\S|$/))), s;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return Kt(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: i, from: r } = this.lineAt(e, t), s = this.options.overrideIndentation;
    if (s) {
      let o = s(r);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Cr = /* @__PURE__ */ new F();
function Pk(n, e, t) {
  let i = e.resolveStack(t), r = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (r != i.node) {
    let s = [];
    for (let o = r; o && !(o.from < i.node.from || o.to > i.node.to || o.from == i.node.from && o.type == i.node.type); o = o.parent)
      s.push(o);
    for (let o = s.length - 1; o >= 0; o--)
      i = { node: s[o], next: i };
  }
  return V0(i, n, t);
}
function V0(n, e, t) {
  for (let i = n; i; i = i.next) {
    let r = _k(i.node);
    if (r)
      return r(ua.create(e, t, i));
  }
  return 0;
}
function vk(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function _k(n) {
  let e = n.type.prop(Cr);
  if (e)
    return e;
  let t = n.firstChild, i;
  if (t && (i = t.type.prop(F.closedBy))) {
    let r = n.lastChild, s = r && i.indexOf(r.name) > -1;
    return (o) => U0(o, !0, 1, void 0, s && !vk(o) ? r.from : void 0);
  }
  return n.parent == null ? Ak : null;
}
function Ak() {
  return 0;
}
class ua extends uo {
  constructor(e, t, i) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = i;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new ua(e, t, i);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(e) {
    let t = this.state.doc.lineAt(e.from);
    for (; ; ) {
      let i = e.resolve(t.from);
      for (; i.parent && i.parent.from == i.from; )
        i = i.parent;
      if (Ck(i, e))
        break;
      t = this.state.doc.lineAt(i.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return V0(this.context.next, this.base, this.pos);
  }
}
function Ck(n, e) {
  for (let t = e; t; t = t.parent)
    if (n == t)
      return !0;
  return !1;
}
function Tk(n) {
  let e = n.node, t = e.childAfter(e.from), i = e.lastChild;
  if (!t)
    return null;
  let r = n.options.simulateBreak, s = n.state.doc.lineAt(t.from), o = r == null || r <= s.from ? s.to : Math.min(s.to, r);
  for (let l = t.to; ; ) {
    let u = e.childAfter(l);
    if (!u || u == i)
      return null;
    if (!u.type.isSkipped) {
      if (u.from >= o)
        return null;
      let a = /^ */.exec(s.text.slice(t.to - s.from))[0].length;
      return { from: t.from, to: t.to + a };
    }
    l = u.to;
  }
}
function Ek({ closing: n, align: e = !0, units: t = 1 }) {
  return (i) => U0(i, e, t, n);
}
function U0(n, e, t, i, r) {
  let s = n.textAfter, o = s.match(/^\s*/)[0].length, l = i && s.slice(o, o + i.length) == i || r == n.pos + o, u = e ? Tk(n) : null;
  return u ? l ? n.column(u.from) : n.column(u.to) : n.baseIndent + (l ? 0 : n.unit * t);
}
const Xk = (n) => n.baseIndent;
function gs({ except: n, units: e = 1 } = {}) {
  return (t) => {
    let i = n && n.test(t.textAfter);
    return t.baseIndent + (i ? 0 : e * t.unit);
  };
}
const Zk = /* @__PURE__ */ I.define(), Tr = /* @__PURE__ */ new F();
function G0(n) {
  let e = n.firstChild, t = n.lastChild;
  return e && e.to < t.from ? { from: e.to, to: t.type.isError ? n.to : t.from } : null;
}
const Dk = 1e4, Rk = "()[]{}", H0 = /* @__PURE__ */ new F();
function mu(n, e, t) {
  let i = n.prop(e < 0 ? F.openedBy : F.closedBy);
  if (i)
    return i;
  if (n.name.length == 1) {
    let r = t.indexOf(n.name);
    if (r > -1 && r % 2 == (e < 0 ? 1 : 0))
      return [t[r + e]];
  }
  return null;
}
function gu(n) {
  let e = n.type.prop(H0);
  return e ? e(n.node) : n;
}
function Hn(n, e, t, i = {}) {
  let r = i.maxScanDistance || Dk, s = i.brackets || Rk, o = he(n), l = o.resolveInner(e, t);
  for (let u = l; u; u = u.parent) {
    let a = mu(u.type, t, s);
    if (a && u.from < u.to) {
      let c = gu(u);
      if (c && (t > 0 ? e >= c.from && e < c.to : e > c.from && e <= c.to))
        return Mk(n, e, t, u, c, a, s);
    }
  }
  return Lk(n, e, t, o, l.type, r, s);
}
function Mk(n, e, t, i, r, s, o) {
  let l = i.parent, u = { from: r.from, to: r.to }, a = 0, c = l?.cursor();
  if (c && (t < 0 ? c.childBefore(i.from) : c.childAfter(i.to)))
    do
      if (t < 0 ? c.to <= i.from : c.from >= i.to) {
        if (a == 0 && s.indexOf(c.type.name) > -1 && c.from < c.to) {
          let h = gu(c);
          return { start: u, end: h ? { from: h.from, to: h.to } : void 0, matched: !0 };
        } else if (mu(c.type, t, o))
          a++;
        else if (mu(c.type, -t, o)) {
          if (a == 0) {
            let h = gu(c);
            return {
              start: u,
              end: h && h.from < h.to ? { from: h.from, to: h.to } : void 0,
              matched: !1
            };
          }
          a--;
        }
      }
    while (t < 0 ? c.prevSibling() : c.nextSibling());
  return { start: u, matched: !1 };
}
function Lk(n, e, t, i, r, s, o) {
  if (t < 0 ? !e : e == n.doc.length)
    return null;
  let l = t < 0 ? n.sliceDoc(e - 1, e) : n.sliceDoc(e, e + 1), u = o.indexOf(l);
  if (u < 0 || u % 2 == 0 != t > 0)
    return null;
  let a = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = n.doc.iterRange(e, t > 0 ? n.doc.length : 0), h = 0;
  for (let f = 0; !c.next().done && f <= s; ) {
    let d = c.value;
    t < 0 && (f += d.length);
    let O = e + f * t;
    for (let m = t > 0 ? 0 : d.length - 1, g = t > 0 ? d.length : -1; m != g; m += t) {
      let b = o.indexOf(d[m]);
      if (!(b < 0 || i.resolveInner(O + m, 1).type != r))
        if (b % 2 == 0 == t > 0)
          h++;
        else {
          if (h == 1)
            return { start: a, end: { from: O + m, to: O + m + 1 }, matched: b >> 1 == u >> 1 };
          h--;
        }
    }
    t > 0 && (f += d.length);
  }
  return c.done ? { start: a, matched: !1 } : null;
}
const jk = /* @__PURE__ */ Object.create(null), Lh = [ke.none], jh = [], zh = /* @__PURE__ */ Object.create(null), zk = /* @__PURE__ */ Object.create(null);
for (let [n, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  zk[n] = /* @__PURE__ */ Ik(jk, e);
function Ol(n, e) {
  jh.indexOf(n) > -1 || (jh.push(n), console.warn(e));
}
function Ik(n, e) {
  let t = [];
  for (let l of e.split(" ")) {
    let u = [];
    for (let a of l.split(".")) {
      let c = n[a] || x[a];
      c ? typeof c == "function" ? u.length ? u = u.map(c) : Ol(a, `Modifier ${a} used at start of tag`) : u.length ? Ol(a, `Tag ${a} used as modifier`) : u = Array.isArray(c) ? c : [c] : Ol(a, `Unknown highlighting tag ${a}`);
    }
    for (let a of u)
      t.push(a);
  }
  if (!t.length)
    return 0;
  let i = e.replace(/ /g, "_"), r = i + " " + t.map((l) => l.id), s = zh[r];
  if (s)
    return s.id;
  let o = zh[r] = ke.define({
    id: Lh.length,
    name: i,
    props: [Qi({ [i]: t })]
  });
  return Lh.push(o), o.id;
}
pe.RTL, pe.LTR;
const Bk = (n) => {
  let { state: e } = n, t = e.doc.lineAt(e.selection.main.from), i = ca(n.state, t.from);
  return i.line ? qk(n) : i.block ? Yk(n) : !1;
};
function aa(n, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let r = n(e, t);
    return r ? (i(t.update(r)), !0) : !1;
  };
}
const qk = /* @__PURE__ */ aa(
  Vk,
  0
  /* CommentOption.Toggle */
), Fk = /* @__PURE__ */ aa(
  K0,
  0
  /* CommentOption.Toggle */
), Yk = /* @__PURE__ */ aa(
  (n, e) => K0(n, e, Nk(e)),
  0
  /* CommentOption.Toggle */
);
function ca(n, e) {
  let t = n.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const ji = 50;
function Wk(n, { open: e, close: t }, i, r) {
  let s = n.sliceDoc(i - ji, i), o = n.sliceDoc(r, r + ji), l = /\s*$/.exec(s)[0].length, u = /^\s*/.exec(o)[0].length, a = s.length - l;
  if (s.slice(a - e.length, a) == e && o.slice(u, u + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: r + u, margin: u && 1 }
    };
  let c, h;
  r - i <= 2 * ji ? c = h = n.sliceDoc(i, r) : (c = n.sliceDoc(i, i + ji), h = n.sliceDoc(r - ji, r));
  let f = /^\s*/.exec(c)[0].length, d = /\s*$/.exec(h)[0].length, O = h.length - d - t.length;
  return c.slice(f, f + e.length) == e && h.slice(O, O + t.length) == t ? {
    open: {
      pos: i + f + e.length,
      margin: /\s/.test(c.charAt(f + e.length)) ? 1 : 0
    },
    close: {
      pos: r - d - t.length,
      margin: /\s/.test(h.charAt(O - 1)) ? 1 : 0
    }
  } : null;
}
function Nk(n) {
  let e = [];
  for (let t of n.selection.ranges) {
    let i = n.doc.lineAt(t.from), r = t.to <= i.to ? i : n.doc.lineAt(t.to);
    r.from > i.from && r.from == t.to && (r = t.to == i.to + 1 ? i : n.doc.lineAt(t.to - 1));
    let s = e.length - 1;
    s >= 0 && e[s].to > i.from ? e[s].to = r.to : e.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: r.to });
  }
  return e;
}
function K0(n, e, t = e.selection.ranges) {
  let i = t.map((s) => ca(e, s.from).block);
  if (!i.every((s) => s))
    return null;
  let r = t.map((s, o) => Wk(e, i[o], s.from, s.to));
  if (n != 2 && !r.every((s) => s))
    return { changes: e.changes(t.map((s, o) => r[o] ? [] : [{ from: s.from, insert: i[o].open + " " }, { from: s.to, insert: " " + i[o].close }])) };
  if (n != 1 && r.some((s) => s)) {
    let s = [];
    for (let o = 0, l; o < r.length; o++)
      if (l = r[o]) {
        let u = i[o], { open: a, close: c } = l;
        s.push({ from: a.pos - u.open.length, to: a.pos + a.margin }, { from: c.pos - c.margin, to: c.pos + u.close.length });
      }
    return { changes: s };
  }
  return null;
}
function Vk(n, e, t = e.selection.ranges) {
  let i = [], r = -1;
  e: for (let { from: s, to: o } of t) {
    let l = i.length, u = 1e9, a;
    for (let c = s; c <= o; ) {
      let h = e.doc.lineAt(c);
      if (a == null && (a = ca(e, h.from).line, !a))
        continue e;
      if (h.from > r && (s == o || o > h.from)) {
        r = h.from;
        let f = /^\s*/.exec(h.text)[0].length, d = f == h.length, O = h.text.slice(f, f + a.length) == a ? f : -1;
        f < h.text.length && f < u && (u = f), i.push({ line: h, comment: O, token: a, indent: f, empty: d, single: !1 });
      }
      c = h.to + 1;
    }
    if (u < 1e9)
      for (let c = l; c < i.length; c++)
        i[c].indent < i[c].line.text.length && (i[c].indent = u);
    i.length == l + 1 && (i[l].single = !0);
  }
  if (n != 2 && i.some((s) => s.comment < 0 && (!s.empty || s.single))) {
    let s = [];
    for (let { line: l, token: u, indent: a, empty: c, single: h } of i)
      (h || !c) && s.push({ from: l.from + a, insert: u + " " });
    let o = e.changes(s);
    return { changes: o, selection: e.selection.map(o, 1) };
  } else if (n != 1 && i.some((s) => s.comment >= 0)) {
    let s = [];
    for (let { line: o, comment: l, token: u } of i)
      if (l >= 0) {
        let a = o.from + l, c = a + u.length;
        o.text[c - o.from] == " " && c++, s.push({ from: a, to: c });
      }
    return { changes: s };
  }
  return null;
}
const bu = /* @__PURE__ */ en.define(), Uk = /* @__PURE__ */ en.define(), Gk = /* @__PURE__ */ I.define(), J0 = /* @__PURE__ */ I.define({
  combine(n) {
    return o2(n, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (e, t) => t
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (e, t) => (i, r) => e(i, r) || t(i, r)
    });
  }
}), eO = /* @__PURE__ */ jt.define({
  create() {
    return Zt.empty;
  },
  update(n, e) {
    let t = e.state.facet(J0), i = e.annotation(bu);
    if (i) {
      let u = Fe.fromTransaction(e, i.selection), a = i.side, c = a == 0 ? n.undone : n.done;
      return u ? c = zs(c, c.length, t.minDepth, u) : c = iO(c, e.startState.selection), new Zt(a == 0 ? i.rest : c, a == 0 ? c : i.rest);
    }
    let r = e.annotation(Uk);
    if ((r == "full" || r == "before") && (n = n.isolate()), e.annotation(ge.addToHistory) === !1)
      return e.changes.empty ? n : n.addMapping(e.changes.desc);
    let s = Fe.fromTransaction(e), o = e.annotation(ge.time), l = e.annotation(ge.userEvent);
    return s ? n = n.addChanges(s, o, l, t, e) : e.selection && (n = n.addSelection(e.startState.selection, o, l, t.newGroupDelay)), (r == "full" || r == "after") && (n = n.isolate()), n;
  },
  toJSON(n) {
    return { done: n.done.map((e) => e.toJSON()), undone: n.undone.map((e) => e.toJSON()) };
  },
  fromJSON(n) {
    return new Zt(n.done.map(Fe.fromJSON), n.undone.map(Fe.fromJSON));
  }
});
function Hk(n = {}) {
  return [
    eO,
    J0.of(n),
    j.domEventHandlers({
      beforeinput(e, t) {
        let i = e.inputType == "historyUndo" ? tO : e.inputType == "historyRedo" ? xu : null;
        return i ? (e.preventDefault(), i(t)) : !1;
      }
    })
  ];
}
function ao(n, e) {
  return function({ state: t, dispatch: i }) {
    if (!e && t.readOnly)
      return !1;
    let r = t.field(eO, !1);
    if (!r)
      return !1;
    let s = r.pop(n, t, e);
    return s ? (i(s), !0) : !1;
  };
}
const tO = /* @__PURE__ */ ao(0, !1), xu = /* @__PURE__ */ ao(1, !1), Kk = /* @__PURE__ */ ao(0, !0), Jk = /* @__PURE__ */ ao(1, !0);
class Fe {
  constructor(e, t, i, r, s) {
    this.changes = e, this.effects = t, this.mapped = i, this.startSelection = r, this.selectionsAfter = s;
  }
  setSelAfter(e) {
    return new Fe(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, i;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (i = this.startSelection) === null || i === void 0 ? void 0 : i.toJSON(),
      selectionsAfter: this.selectionsAfter.map((r) => r.toJSON())
    };
  }
  static fromJSON(e) {
    return new Fe(e.changes && xe.fromJSON(e.changes), [], e.mapped && Dt.fromJSON(e.mapped), e.startSelection && v.fromJSON(e.startSelection), e.selectionsAfter.map(v.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(e, t) {
    let i = ut;
    for (let r of e.startState.facet(Gk)) {
      let s = r(e);
      s.length && (i = i.concat(s));
    }
    return !i.length && e.changes.empty ? null : new Fe(e.changes.invert(e.startState.doc), i, void 0, t || e.startState.selection, ut);
  }
  static selection(e) {
    return new Fe(void 0, ut, void 0, void 0, e);
  }
}
function zs(n, e, t, i) {
  let r = e + 1 > t + 20 ? e - t - 1 : 0, s = n.slice(r, e);
  return s.push(i), s;
}
function eS(n, e) {
  let t = [], i = !1;
  return n.iterChangedRanges((r, s) => t.push(r, s)), e.iterChangedRanges((r, s, o, l) => {
    for (let u = 0; u < t.length; ) {
      let a = t[u++], c = t[u++];
      l >= a && o <= c && (i = !0);
    }
  }), i;
}
function tS(n, e) {
  return n.ranges.length == e.ranges.length && n.ranges.filter((t, i) => t.empty != e.ranges[i].empty).length === 0;
}
function nO(n, e) {
  return n.length ? e.length ? n.concat(e) : n : e;
}
const ut = [], nS = 200;
function iO(n, e) {
  if (n.length) {
    let t = n[n.length - 1], i = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - nS));
    return i.length && i[i.length - 1].eq(e) ? n : (i.push(e), zs(n, n.length - 1, 1e9, t.setSelAfter(i)));
  } else
    return [Fe.selection([e])];
}
function iS(n) {
  let e = n[n.length - 1], t = n.slice();
  return t[n.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function pl(n, e) {
  if (!n.length)
    return n;
  let t = n.length, i = ut;
  for (; t; ) {
    let r = rS(n[t - 1], e, i);
    if (r.changes && !r.changes.empty || r.effects.length) {
      let s = n.slice(0, t);
      return s[t - 1] = r, s;
    } else
      e = r.mapped, t--, i = r.selectionsAfter;
  }
  return i.length ? [Fe.selection(i)] : ut;
}
function rS(n, e, t) {
  let i = nO(n.selectionsAfter.length ? n.selectionsAfter.map((l) => l.map(e)) : ut, t);
  if (!n.changes)
    return Fe.selection(i);
  let r = n.changes.map(e), s = e.mapDesc(n.changes, !0), o = n.mapped ? n.mapped.composeDesc(s) : s;
  return new Fe(r, le.mapEffects(n.effects, e), o, n.startSelection.map(s), i);
}
const sS = /^(input\.type|delete)($|\.)/;
class Zt {
  constructor(e, t, i = 0, r = void 0) {
    this.done = e, this.undone = t, this.prevTime = i, this.prevUserEvent = r;
  }
  isolate() {
    return this.prevTime ? new Zt(this.done, this.undone) : this;
  }
  addChanges(e, t, i, r, s) {
    let o = this.done, l = o[o.length - 1];
    return l && l.changes && !l.changes.empty && e.changes && (!i || sS.test(i)) && (!l.selectionsAfter.length && t - this.prevTime < r.newGroupDelay && r.joinToEvent(s, eS(l.changes, e.changes)) || // For compose (but not compose.start) events, always join with previous event
    i == "input.type.compose") ? o = zs(o, o.length - 1, r.minDepth, new Fe(e.changes.compose(l.changes), nO(le.mapEffects(e.effects, l.changes), l.effects), l.mapped, l.startSelection, ut)) : o = zs(o, o.length, r.minDepth, e), new Zt(o, ut, t, i);
  }
  addSelection(e, t, i, r) {
    let s = this.done.length ? this.done[this.done.length - 1].selectionsAfter : ut;
    return s.length > 0 && t - this.prevTime < r && i == this.prevUserEvent && i && /^select($|\.)/.test(i) && tS(s[s.length - 1], e) ? this : new Zt(iO(this.done, e), this.undone, t, i);
  }
  addMapping(e) {
    return new Zt(pl(this.done, e), pl(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, i) {
    let r = e == 0 ? this.done : this.undone;
    if (r.length == 0)
      return null;
    let s = r[r.length - 1], o = s.selectionsAfter[0] || (s.startSelection ? s.startSelection.map(s.changes.invertedDesc, 1) : t.selection);
    if (i && s.selectionsAfter.length)
      return t.update({
        selection: s.selectionsAfter[s.selectionsAfter.length - 1],
        annotations: bu.of({ side: e, rest: iS(r), selection: o }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (s.changes) {
      let l = r.length == 1 ? ut : r.slice(0, r.length - 1);
      return s.mapped && (l = pl(l, s.mapped)), t.update({
        changes: s.changes,
        selection: s.startSelection,
        effects: s.effects,
        annotations: bu.of({ side: e, rest: l, selection: o }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
Zt.empty = /* @__PURE__ */ new Zt(ut, ut);
const oS = [
  { key: "Mod-z", run: tO, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: xu, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: xu, preventDefault: !0 },
  { key: "Mod-u", run: Kk, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: Jk, preventDefault: !0 }
];
function wi(n, e) {
  return v.create(n.ranges.map(e), n.mainIndex);
}
function bt(n, e) {
  return n.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function xt({ state: n, dispatch: e }, t) {
  let i = wi(n.selection, t);
  return i.eq(n.selection, !0) ? !1 : (e(bt(n, i)), !0);
}
function co(n, e) {
  return v.cursor(e ? n.to : n.from);
}
function rO(n, e) {
  return xt(n, (t) => t.empty ? n.moveByChar(t, e) : co(t, e));
}
function Ee(n) {
  return n.textDirectionAt(n.state.selection.main.head) == pe.LTR;
}
const sO = (n) => rO(n, !Ee(n)), oO = (n) => rO(n, Ee(n));
function lO(n, e) {
  return xt(n, (t) => t.empty ? n.moveByGroup(t, e) : co(t, e));
}
const lS = (n) => lO(n, !Ee(n)), uS = (n) => lO(n, Ee(n));
function aS(n, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(e.from, e.to))) || e.firstChild;
}
function ho(n, e, t) {
  let i = he(n).resolveInner(e.head), r = t ? F.closedBy : F.openedBy;
  for (let u = e.head; ; ) {
    let a = t ? i.childAfter(u) : i.childBefore(u);
    if (!a)
      break;
    aS(n, a, r) ? i = a : u = t ? a.to : a.from;
  }
  let s = i.type.prop(r), o, l;
  return s && (o = t ? Hn(n, i.from, 1) : Hn(n, i.to, -1)) && o.matched ? l = t ? o.end.to : o.end.from : l = t ? i.to : i.from, v.cursor(l, t ? -1 : 1);
}
const cS = (n) => xt(n, (e) => ho(n.state, e, !Ee(n))), hS = (n) => xt(n, (e) => ho(n.state, e, Ee(n)));
function uO(n, e) {
  return xt(n, (t) => {
    if (!t.empty)
      return co(t, e);
    let i = n.moveVertically(t, e);
    return i.head != t.head ? i : n.moveToLineBoundary(t, e);
  });
}
const aO = (n) => uO(n, !1), cO = (n) => uO(n, !0);
function hO(n) {
  let e = n.scrollDOM.clientHeight < n.scrollDOM.scrollHeight - 2, t = 0, i = 0, r;
  if (e) {
    for (let s of n.state.facet(j.scrollMargins)) {
      let o = s(n);
      o?.top && (t = Math.max(o?.top, t)), o?.bottom && (i = Math.max(o?.bottom, i));
    }
    r = n.scrollDOM.clientHeight - t - i;
  } else
    r = (n.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: i,
    selfScroll: e,
    height: Math.max(n.defaultLineHeight, r - 5)
  };
}
function fO(n, e) {
  let t = hO(n), { state: i } = n, r = wi(i.selection, (o) => o.empty ? n.moveVertically(o, e, t.height) : co(o, e));
  if (r.eq(i.selection))
    return !1;
  let s;
  if (t.selfScroll) {
    let o = n.coordsAtPos(i.selection.main.head), l = n.scrollDOM.getBoundingClientRect(), u = l.top + t.marginTop, a = l.bottom - t.marginBottom;
    o && o.top > u && o.bottom < a && (s = j.scrollIntoView(r.main.head, { y: "start", yMargin: o.top - u }));
  }
  return n.dispatch(bt(i, r), { effects: s }), !0;
}
const Ih = (n) => fO(n, !1), ku = (n) => fO(n, !0);
function yn(n, e, t) {
  let i = n.lineBlockAt(e.head), r = n.moveToLineBoundary(e, t);
  if (r.head == e.head && r.head != (t ? i.to : i.from) && (r = n.moveToLineBoundary(e, t, !1)), !t && r.head == i.from && i.length) {
    let s = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    s && e.head != i.from + s && (r = v.cursor(i.from + s));
  }
  return r;
}
const fS = (n) => xt(n, (e) => yn(n, e, !0)), dS = (n) => xt(n, (e) => yn(n, e, !1)), OS = (n) => xt(n, (e) => yn(n, e, !Ee(n))), pS = (n) => xt(n, (e) => yn(n, e, Ee(n))), mS = (n) => xt(n, (e) => n.moveToLineBoundary(e, !1, !1)), gS = (n) => xt(n, (e) => n.moveToLineBoundary(e, !0, !1));
function bS(n, e, t) {
  let i = !1, r = wi(n.selection, (s) => {
    let o = Hn(n, s.head, -1) || Hn(n, s.head, 1) || s.head > 0 && Hn(n, s.head - 1, 1) || s.head < n.doc.length && Hn(n, s.head + 1, -1);
    if (!o || !o.end)
      return s;
    i = !0;
    let l = o.start.from == s.head ? o.end.to : o.end.from;
    return v.cursor(l);
  });
  return i ? (e(bt(n, r)), !0) : !1;
}
const xS = ({ state: n, dispatch: e }) => bS(n, e);
function ht(n, e, t) {
  let i = wi(n.state.selection, (r) => {
    r.undirectional && r.head >= r.anchor != e && (r = v.range(r.head, r.anchor));
    let s = t(r);
    return v.range(r.anchor, s.head, s.goalColumn, s.bidiLevel || void 0, s.assoc);
  });
  return i.eq(n.state.selection) ? !1 : (n.dispatch(bt(n.state, i)), !0);
}
function dO(n, e) {
  return ht(n, e, (t) => n.moveByChar(t, e));
}
const OO = (n) => dO(n, !Ee(n)), pO = (n) => dO(n, Ee(n));
function mO(n, e) {
  return ht(n, e, (t) => n.moveByGroup(t, e));
}
const kS = (n) => mO(n, !Ee(n)), SS = (n) => mO(n, Ee(n)), yS = (n) => {
  let e = !Ee(n);
  return ht(n, e, (t) => ho(n.state, t, e));
}, QS = (n) => {
  let e = Ee(n);
  return ht(n, e, (t) => ho(n.state, t, e));
};
function gO(n, e) {
  return ht(n, e, (t) => n.moveVertically(t, e));
}
const bO = (n) => gO(n, !1), xO = (n) => gO(n, !0);
function kO(n, e) {
  return ht(n, e, (t) => n.moveVertically(t, e, hO(n).height));
}
const Bh = (n) => kO(n, !1), qh = (n) => kO(n, !0), wS = (n) => ht(n, !0, (e) => yn(n, e, !0)), $S = (n) => ht(n, !1, (e) => yn(n, e, !1)), PS = (n) => {
  let e = !Ee(n);
  return ht(n, e, (t) => yn(n, t, e));
}, vS = (n) => {
  let e = Ee(n);
  return ht(n, e, (t) => yn(n, t, e));
}, _S = (n) => ht(n, !1, (e) => v.cursor(n.lineBlockAt(e.head).from)), AS = (n) => ht(n, !0, (e) => v.cursor(n.lineBlockAt(e.head).to)), Fh = ({ state: n, dispatch: e }) => (e(bt(n, { anchor: 0 })), !0), Yh = ({ state: n, dispatch: e }) => (e(bt(n, { anchor: n.doc.length })), !0), Wh = ({ state: n, dispatch: e }) => (e(bt(n, { anchor: n.selection.main.anchor, head: 0 })), !0), Nh = ({ state: n, dispatch: e }) => (e(bt(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), CS = ({ state: n, dispatch: e }) => (e(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), TS = ({ state: n, dispatch: e }) => {
  let t = fo(n).map(({ from: i, to: r }) => v.undirectionalRange(i, Math.min(r + 1, n.doc.length)));
  return e(n.update({ selection: v.create(t), userEvent: "select" })), !0;
}, ES = ({ state: n, dispatch: e }) => {
  let t = wi(n.selection, (i) => {
    let r = he(n), s = r.resolveStack(i.from, 1);
    if (i.empty) {
      let o = r.resolveStack(i.from, -1);
      o.node.from >= s.node.from && o.node.to <= s.node.to && (s = o);
    }
    for (let o = s; o; o = o.next) {
      let { node: l } = o;
      if ((l.from < i.from && l.to >= i.to || l.to > i.to && l.from <= i.from) && o.next)
        return v.undirectionalRange(l.from, l.to);
    }
    return i;
  });
  return t.eq(n.selection) ? !1 : (e(bt(n, t)), !0);
};
function SO(n, e) {
  let { state: t } = n, i = t.selection, r = t.selection.ranges.slice();
  for (let s of t.selection.ranges) {
    let o = t.doc.lineAt(s.head);
    if (e ? o.to < n.state.doc.length : o.from > 0)
      for (let l = s; ; ) {
        let u = n.moveVertically(l, e);
        if (u.head < o.from || u.head > o.to) {
          r.some((a) => a.head == u.head) || r.push(u);
          break;
        } else {
          if (u.head == l.head)
            break;
          l = u;
        }
      }
  }
  return r.length == i.ranges.length ? !1 : (n.dispatch(bt(t, v.create(r, r.length - 1))), !0);
}
const XS = (n) => SO(n, !1), ZS = (n) => SO(n, !0), DS = ({ state: n, dispatch: e }) => {
  let t = n.selection, i = null;
  return t.ranges.length > 1 ? i = v.create([t.main]) : t.main.empty || (i = v.create([v.cursor(t.main.head)])), i ? (e(bt(n, i)), !0) : !1;
};
function Er(n, e) {
  if (n.state.readOnly)
    return !1;
  let t = "delete.selection", { state: i } = n, r = i.changeByRange((s) => {
    let { from: o, to: l } = s;
    if (o == l) {
      let u = e(s);
      u < o ? (t = "delete.backward", u = cs(n, u, !1)) : u > o && (t = "delete.forward", u = cs(n, u, !0)), o = Math.min(o, u), l = Math.max(l, u);
    } else
      o = cs(n, o, !1), l = cs(n, l, !0);
    return o == l ? { range: s } : { changes: { from: o, to: l }, range: v.cursor(o, o < s.head ? -1 : 1) };
  });
  return r.changes.empty ? !1 : (n.dispatch(i.update(r, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? j.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function cs(n, e, t) {
  if (n instanceof j)
    for (let i of n.state.facet(j.atomicRanges).map((r) => r(n)))
      i.between(e, e, (r, s) => {
        r < e && s > e && (e = t ? s : r);
      });
  return e;
}
const yO = (n, e, t) => Er(n, (i) => {
  let r = i.from, { state: s } = n, o = s.doc.lineAt(r), l, u;
  if (t && !e && r > o.from && r < o.from + 200 && !/[^ \t]/.test(l = o.text.slice(0, r - o.from))) {
    if (l[l.length - 1] == "	")
      return r - 1;
    let a = Kt(l, s.tabSize), c = a % Ls(s) || Ls(s);
    for (let h = 0; h < c && l[l.length - 1 - h] == " "; h++)
      r--;
    u = r;
  } else
    u = Ce(o.text, r - o.from, e, e) + o.from, u == r && o.number != (e ? s.doc.lines : 1) ? u += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(o.text.slice(u - o.from, r - o.from)) && (u = Ce(o.text, u - o.from, !1, !1) + o.from);
  return u;
}), Su = (n) => yO(n, !1, !0), QO = (n) => yO(n, !0, !1), wO = (n, e) => Er(n, (t) => {
  let i = t.head, { state: r } = n, s = r.doc.lineAt(i), o = r.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (e ? s.to : s.from)) {
      i == t.head && s.number != (e ? r.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let u = Ce(s.text, i - s.from, e) + s.from, a = s.text.slice(Math.min(i, u) - s.from, Math.max(i, u) - s.from), c = o(a);
    if (l != null && c != l)
      break;
    (a != " " || i != t.head) && (l = c), i = u;
  }
  return i;
}), $O = (n) => wO(n, !1), RS = (n) => wO(n, !0), MS = (n) => Er(n, (e) => {
  let t = n.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), LS = (n) => Er(n, (e) => {
  let t = n.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), jS = (n) => Er(n, (e) => {
  let t = n.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(n.state.doc.length, e.head + 1);
}), zS = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: U.of(["", ""]) },
    range: v.cursor(i.from)
  }));
  return e(n.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, IS = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let r = i.from, s = n.doc.lineAt(r), o = r == s.from ? r - 1 : Ce(s.text, r - s.from, !1) + s.from, l = r == s.to ? r + 1 : Ce(s.text, r - s.from, !0) + s.from;
    return {
      changes: { from: o, to: l, insert: n.doc.slice(r, l).append(n.doc.slice(o, r)) },
      range: v.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(n.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function fo(n) {
  let e = [], t = -1;
  for (let i of n.selection.ranges) {
    let r = n.doc.lineAt(i.from), s = n.doc.lineAt(i.to);
    if (!i.empty && i.to == s.from && (s = n.doc.lineAt(i.to - 1)), t >= r.number) {
      let o = e[e.length - 1];
      o.to = s.to, o.ranges.push(i);
    } else
      e.push({ from: r.from, to: s.to, ranges: [i] });
    t = s.number + 1;
  }
  return e;
}
function PO(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [], r = [];
  for (let s of fo(n)) {
    if (t ? s.to == n.doc.length : s.from == 0)
      continue;
    let o = n.doc.lineAt(t ? s.to + 1 : s.from - 1), l = o.length + 1;
    if (t) {
      i.push({ from: s.to, to: o.to }, { from: s.from, insert: o.text + n.lineBreak });
      for (let u of s.ranges)
        r.push(v.range(Math.min(n.doc.length, u.anchor + l), Math.min(n.doc.length, u.head + l)));
    } else {
      i.push({ from: o.from, to: s.from }, { from: s.to, insert: n.lineBreak + o.text });
      for (let u of s.ranges)
        r.push(v.range(u.anchor - l, u.head - l));
    }
  }
  return i.length ? (e(n.update({
    changes: i,
    scrollIntoView: !0,
    selection: v.create(r, n.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const BS = ({ state: n, dispatch: e }) => PO(n, e, !1), qS = ({ state: n, dispatch: e }) => PO(n, e, !0);
function vO(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let s of fo(n))
    t ? i.push({ from: s.from, insert: n.doc.slice(s.from, s.to) + n.lineBreak }) : i.push({ from: s.to, insert: n.lineBreak + n.doc.slice(s.from, s.to) });
  let r = n.changes(i);
  return e(n.update({
    changes: r,
    selection: n.selection.map(r, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const FS = ({ state: n, dispatch: e }) => vO(n, e, !1), YS = ({ state: n, dispatch: e }) => vO(n, e, !0), WS = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: e } = n, t = e.changes(fo(e).map(({ from: r, to: s }) => (r > 0 ? r-- : s < e.doc.length && s++, { from: r, to: s }))), i = wi(e.selection, (r) => {
    let s;
    if (n.lineWrapping) {
      let o = n.lineBlockAt(r.head), l = n.coordsAtPos(r.head, r.assoc || 1);
      l && (s = o.bottom + n.documentTop - l.bottom + n.defaultLineHeight / 2);
    }
    return n.moveVertically(r, !0, s);
  }).map(t);
  return n.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function NS(n, e) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = he(n).resolveInner(e), i = t.childBefore(e), r = t.childAfter(e), s;
  return i && r && i.to <= e && r.from >= e && (s = i.type.prop(F.closedBy)) && s.indexOf(r.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(r.from).from && !/\S/.test(n.sliceDoc(i.to, r.from)) ? { from: i.to, to: r.from } : null;
}
const Vh = /* @__PURE__ */ _O(!1), VS = /* @__PURE__ */ _O(!0);
function _O(n) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((r) => {
      let { from: s, to: o } = r, l = e.doc.lineAt(s), u = !n && s == o && NS(e, s);
      n && (s = o = (o <= l.to ? l : e.doc.lineAt(o)).to);
      let a = new uo(e, { simulateBreak: s, simulateDoubleBreak: !!u }), c = N0(a, s);
      for (c == null && (c = Kt(/^\s*/.exec(e.doc.lineAt(s).text)[0], e.tabSize)); o < l.to && /\s/.test(l.text[o - l.from]); )
        o++;
      u ? { from: s, to: o } = u : s > l.from && s < l.from + 100 && !/\S/.test(l.text.slice(0, s)) && (s = l.from);
      let h = ["", js(e, c)];
      return u && h.push(js(e, a.lineIndent(l.from, -1))), {
        changes: { from: s, to: o, insert: U.of(h) },
        range: v.cursor(s + 1 + h[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function ha(n, e) {
  let t = -1;
  return n.changeByRange((i) => {
    let r = [];
    for (let o = i.from; o <= i.to; ) {
      let l = n.doc.lineAt(o);
      l.number > t && (i.empty || i.to > l.from) && (e(l, r, i), t = l.number), o = l.to + 1;
    }
    let s = n.changes(r);
    return {
      changes: r,
      range: v.range(s.mapPos(i.anchor, 1), s.mapPos(i.head, 1))
    };
  });
}
const US = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new uo(n, { overrideIndentation: (s) => {
    let o = t[s];
    return o ?? -1;
  } }), r = ha(n, (s, o, l) => {
    let u = N0(i, s.from);
    if (u == null)
      return;
    /\S/.test(s.text) || (u = 0);
    let a = /^\s*/.exec(s.text)[0], c = js(n, u);
    (a != c || l.from < s.from + a.length) && (t[s.from] = u, o.push({ from: s.from, to: s.from + a.length, insert: c }));
  });
  return r.changes.empty || e(n.update(r, { userEvent: "indent" })), !0;
}, AO = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(ha(n, (t, i) => {
  i.push({ from: t.from, insert: n.facet(Ar) });
}), { userEvent: "input.indent" })), !0), CO = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(ha(n, (t, i) => {
  let r = /^\s*/.exec(t.text)[0];
  if (!r)
    return;
  let s = Kt(r, n.tabSize), o = 0, l = js(n, Math.max(0, s - Ls(n)));
  for (; o < r.length && o < l.length && r.charCodeAt(o) == l.charCodeAt(o); )
    o++;
  i.push({ from: t.from + o, to: t.from + r.length, insert: l.slice(o) });
}), { userEvent: "delete.dedent" })), !0), GS = (n) => (n.setTabFocusMode(), !0), HS = [
  { key: "Ctrl-b", run: sO, shift: OO, preventDefault: !0 },
  { key: "Ctrl-f", run: oO, shift: pO },
  { key: "Ctrl-p", run: aO, shift: bO },
  { key: "Ctrl-n", run: cO, shift: xO },
  { key: "Ctrl-a", run: mS, shift: _S },
  { key: "Ctrl-e", run: gS, shift: AS },
  { key: "Ctrl-d", run: QO },
  { key: "Ctrl-h", run: Su },
  { key: "Ctrl-k", run: MS },
  { key: "Ctrl-Alt-h", run: $O },
  { key: "Ctrl-o", run: zS },
  { key: "Ctrl-t", run: IS },
  { key: "Ctrl-v", run: ku }
], KS = /* @__PURE__ */ [
  { key: "ArrowLeft", run: sO, shift: OO, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: lS, shift: kS, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: OS, shift: PS, preventDefault: !0 },
  { key: "ArrowRight", run: oO, shift: pO, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: uS, shift: SS, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: pS, shift: vS, preventDefault: !0 },
  { key: "ArrowUp", run: aO, shift: bO, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Fh, shift: Wh },
  { mac: "Ctrl-ArrowUp", run: Ih, shift: Bh },
  { key: "ArrowDown", run: cO, shift: xO, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Yh, shift: Nh },
  { mac: "Ctrl-ArrowDown", run: ku, shift: qh },
  { key: "PageUp", run: Ih, shift: Bh },
  { key: "PageDown", run: ku, shift: qh },
  { key: "Home", run: dS, shift: $S, preventDefault: !0 },
  { key: "Mod-Home", run: Fh, shift: Wh },
  { key: "End", run: fS, shift: wS, preventDefault: !0 },
  { key: "Mod-End", run: Yh, shift: Nh },
  { key: "Enter", run: Vh, shift: Vh },
  { key: "Mod-a", run: CS },
  { key: "Backspace", run: Su, shift: Su, preventDefault: !0 },
  { key: "Delete", run: QO, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: $O, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: RS, preventDefault: !0 },
  { mac: "Mod-Backspace", run: LS, preventDefault: !0 },
  { mac: "Mod-Delete", run: jS, preventDefault: !0 }
].concat(/* @__PURE__ */ HS.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), JS = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cS, shift: yS },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: hS, shift: QS },
  { key: "Alt-ArrowUp", run: BS },
  { key: "Shift-Alt-ArrowUp", run: FS },
  { key: "Alt-ArrowDown", run: qS },
  { key: "Shift-Alt-ArrowDown", run: YS },
  { key: "Mod-Alt-ArrowUp", run: XS },
  { key: "Mod-Alt-ArrowDown", run: ZS },
  { key: "Escape", run: DS },
  { key: "Mod-Enter", run: VS },
  { key: "Alt-l", mac: "Ctrl-l", run: TS },
  { key: "Mod-i", run: ES, preventDefault: !0 },
  { key: "Mod-[", run: CO },
  { key: "Mod-]", run: AO },
  { key: "Mod-Alt-\\", run: US },
  { key: "Shift-Mod-k", run: WS },
  { key: "Shift-Mod-\\", run: xS },
  { key: "Mod-/", run: Bk },
  { key: "Alt-A", mac: "Ctrl-A", run: Fk },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: GS }
].concat(KS), ey = { key: "Tab", run: AO, shift: CO };
class ty {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(e, t, i, r) {
    this.state = e, this.pos = t, this.explicit = i, this.view = r, this.abortListeners = [], this.abortOnDocChange = !1;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(e) {
    let t = he(this.state).resolveInner(this.pos, -1);
    for (; t && e.indexOf(t.name) < 0; )
      t = t.parent;
    return t ? {
      from: t.from,
      to: this.pos,
      text: this.state.sliceDoc(t.from, this.pos),
      type: t.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(e) {
    let t = this.state.doc.lineAt(this.pos), i = Math.max(t.from, this.pos - 250), r = t.text.slice(i - t.from, this.pos - t.from), s = r.search(sy(e));
    return s < 0 ? null : { from: i + s, to: this.pos, text: r.slice(s) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(e, t, i) {
    e == "abort" && this.abortListeners && (this.abortListeners.push(t), i && i.onDocChange && (this.abortOnDocChange = !0));
  }
}
function Uh(n) {
  let e = Object.keys(n).join(""), t = /\w/.test(e);
  return t && (e = e.replace(/\w/g, "")), `[${t ? "\\w" : ""}${e.replace(/[^\w\s]/g, "\\$&")}]`;
}
function ny(n) {
  let e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  for (let { label: r } of n) {
    e[r[0]] = !0;
    for (let s = 1; s < r.length; s++)
      t[r[s]] = !0;
  }
  let i = Uh(e) + Uh(t) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function iy(n) {
  let e = n.map((r) => typeof r == "string" ? { label: r } : r), [t, i] = e.every((r) => /^\w+$/.test(r.label)) ? [/\w*$/, /\w+$/] : ny(e);
  return (r) => {
    let s = r.matchBefore(i);
    return s || r.explicit ? { from: s ? s.from : r.pos, options: e, validFor: t } : null;
  };
}
function ry(n, e) {
  return (t) => {
    for (let i = he(t.state).resolveInner(t.pos, -1); i; i = i.parent) {
      if (n.indexOf(i.name) > -1)
        return null;
      if (i.type.isTop)
        break;
    }
    return e(t);
  };
}
function sy(n, e) {
  var t;
  let { source: i } = n, r = i[i.length - 1] != "$";
  return r ? new RegExp(`(?:${i})${r ? "$" : ""}`, (t = n.flags) !== null && t !== void 0 ? t : n.ignoreCase ? "i" : "") : n;
}
const oy = /* @__PURE__ */ en.define(), ly = /* @__PURE__ */ j.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center",
    cursor: "pointer"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
class uy {
  constructor(e, t, i, r) {
    this.field = e, this.line = t, this.from = i, this.to = r;
  }
}
class fa {
  constructor(e, t, i) {
    this.field = e, this.from = t, this.to = i;
  }
  map(e) {
    let t = e.mapPos(this.from, -1, Re.TrackDel), i = e.mapPos(this.to, 1, Re.TrackDel);
    return t == null || i == null ? null : new fa(this.field, t, i);
  }
}
class da {
  constructor(e, t) {
    this.lines = e, this.fieldPositions = t;
  }
  instantiate(e, t) {
    let i = [], r = [t], s = e.doc.lineAt(t), o = /^\s*/.exec(s.text)[0];
    for (let u of this.lines) {
      if (i.length) {
        let a = o, c = /^\t*/.exec(u)[0].length;
        for (let h = 0; h < c; h++)
          a += e.facet(Ar);
        r.push(t + a.length - c), u = a + u.slice(c);
      }
      i.push(u), t += u.length + 1;
    }
    let l = this.fieldPositions.map((u) => new fa(u.field, r[u.line] + u.from, r[u.line] + u.to));
    return { text: i, ranges: l };
  }
  static parse(e) {
    let t = [], i = [], r = [], s;
    for (let o of e.split(/\r\n?|\n/)) {
      for (; s = /[#$]\{(?:(\d+)(?::([^{}]*))?|((?:\\[{}]|[^{}])*))\}/.exec(o); ) {
        let l = s[1] ? +s[1] : null, u = s[2] || s[3] || "", a = -1;
        l === 0 && (l = 1e9);
        let c = u.replace(/\\[{}]/g, (h) => h[1]);
        for (let h = 0; h < t.length; h++)
          (l != null ? t[h].seq == l : c && t[h].name == c) && (a = h);
        if (a < 0) {
          let h = 0;
          for (; h < t.length && (l == null || t[h].seq != null && t[h].seq < l); )
            h++;
          t.splice(h, 0, { seq: l, name: c }), a = h;
          for (let f of r)
            f.field >= a && f.field++;
        }
        for (let h of r)
          if (h.line == i.length && h.from > s.index) {
            let f = s[2] ? 3 + (s[1] || "").length : 2;
            h.from -= f, h.to -= f;
          }
        r.push(new uy(a, i.length, s.index, s.index + c.length)), o = o.slice(0, s.index) + u + o.slice(s.index + s[0].length);
      }
      o = o.replace(/\\([{}])/g, (l, u, a) => {
        for (let c of r)
          c.line == i.length && c.from > a && (c.from--, c.to--);
        return u;
      }), i.push(o);
    }
    return new da(i, r);
  }
}
let ay = /* @__PURE__ */ K.widget({ widget: /* @__PURE__ */ new class extends tn {
  toDOM() {
    let n = document.createElement("span");
    return n.className = "cm-snippetFieldPosition", n;
  }
  ignoreEvent() {
    return !1;
  }
}() }), cy = /* @__PURE__ */ K.mark({ class: "cm-snippetField" });
class $i {
  constructor(e, t) {
    this.ranges = e, this.active = t, this.deco = K.set(e.map((i) => (i.from == i.to ? ay : cy).range(i.from, i.to)), !0);
  }
  map(e) {
    let t = [];
    for (let i of this.ranges) {
      let r = i.map(e);
      if (!r)
        return null;
      t.push(r);
    }
    return new $i(t, this.active);
  }
  selectionInsideField(e) {
    return e.ranges.every((t) => this.ranges.some((i) => i.field == this.active && i.from <= t.from && i.to >= t.to));
  }
}
const Xr = /* @__PURE__ */ le.define({
  map(n, e) {
    return n && n.map(e);
  }
}), hy = /* @__PURE__ */ le.define(), mr = /* @__PURE__ */ jt.define({
  create() {
    return null;
  },
  update(n, e) {
    for (let t of e.effects) {
      if (t.is(Xr))
        return t.value;
      if (t.is(hy) && n)
        return new $i(n.ranges, t.value);
    }
    return n && e.docChanged && (n = n.map(e.changes)), n && e.selection && !n.selectionInsideField(e.selection) && (n = null), n;
  },
  provide: (n) => j.decorations.from(n, (e) => e ? e.deco : K.none)
});
function Oa(n, e) {
  return v.create(n.filter((t) => t.field == e).map((t) => v.range(t.from, t.to)));
}
function fy(n) {
  let e = da.parse(n);
  return (t, i, r, s) => {
    let { text: o, ranges: l } = e.instantiate(t.state, r), { main: u } = t.state.selection, a = {
      changes: { from: r, to: s == u.from ? u.to : s, insert: U.of(o) },
      scrollIntoView: !0,
      annotations: i ? [oy.of(i), ge.userEvent.of("input.complete")] : void 0
    };
    if (l.length && (a.selection = Oa(l, 0)), l.some((c) => c.field > 0)) {
      let c = new $i(l, 0), h = a.effects = [Xr.of(c)];
      t.state.field(mr, !1) === void 0 && h.push(le.appendConfig.of([mr, gy, by, ly]));
    }
    t.dispatch(t.state.update(a));
  };
}
function TO(n) {
  return ({ state: e, dispatch: t }) => {
    let i = e.field(mr, !1);
    if (!i || n < 0 && i.active == 0)
      return !1;
    let r = i.active + n, s = n > 0 && !i.ranges.some((o) => o.field == r + n);
    return t(e.update({
      selection: Oa(i.ranges, r),
      effects: Xr.of(s ? null : new $i(i.ranges, r)),
      scrollIntoView: !0
    })), !0;
  };
}
const dy = ({ state: n, dispatch: e }) => n.field(mr, !1) ? (e(n.update({ effects: Xr.of(null) })), !0) : !1, Oy = /* @__PURE__ */ TO(1), py = /* @__PURE__ */ TO(-1), my = [
  { key: "Tab", run: Oy, shift: py },
  { key: "Escape", run: dy }
], Gh = /* @__PURE__ */ I.define({
  combine(n) {
    return n.length ? n[0] : my;
  }
}), gy = /* @__PURE__ */ to.highest(/* @__PURE__ */ lo.compute([Gh], (n) => n.facet(Gh)));
function Ie(n, e) {
  return { ...e, apply: fy(n) };
}
const by = /* @__PURE__ */ j.domEventHandlers({
  mousedown(n, e) {
    let t = e.state.field(mr, !1), i;
    if (!t || (i = e.posAtCoords({ x: n.clientX, y: n.clientY })) == null)
      return !1;
    let r = t.ranges.find((s) => s.from <= i && s.to >= i);
    return !r || r.field == t.active ? !1 : (e.dispatch({
      selection: Oa(t.ranges, r.field),
      effects: Xr.of(t.ranges.some((s) => s.field > r.field) ? new $i(t.ranges, r.field) : null),
      scrollIntoView: !0
    }), !0);
  }
}), EO = /* @__PURE__ */ new class extends gn {
}();
EO.startSide = 1;
EO.endSide = -1;
class Is {
  static create(e, t, i, r, s) {
    let o = r + (r << 8) + e + (t << 4) | 0;
    return new Is(e, t, i, o, s, [], []);
  }
  constructor(e, t, i, r, s, o, l) {
    this.type = e, this.value = t, this.from = i, this.hash = r, this.end = s, this.children = o, this.positions = l, this.blankFirstLine = !1, this.hashProp = [[F.contextHash, r]];
  }
  addChild(e, t) {
    e.prop(F.contextHash) != this.hash && (e = new J(e.type, e.children, e.positions, e.length, this.hashProp)), this.children.push(e), this.positions.push(t);
  }
  toTree(e, t = this.end) {
    let i = this.children.length - 1;
    return i >= 0 && (t = Math.max(t, this.positions[i] + this.children[i].length + this.from)), new J(e.types[this.type], this.children, this.positions, t - this.from).balance({
      makeTree: (r, s, o) => new J(ke.none, r, s, o, this.hashProp)
    });
  }
}
var T;
(function(n) {
  n[n.Document = 1] = "Document", n[n.CodeBlock = 2] = "CodeBlock", n[n.FencedCode = 3] = "FencedCode", n[n.Blockquote = 4] = "Blockquote", n[n.HorizontalRule = 5] = "HorizontalRule", n[n.BulletList = 6] = "BulletList", n[n.OrderedList = 7] = "OrderedList", n[n.ListItem = 8] = "ListItem", n[n.ATXHeading1 = 9] = "ATXHeading1", n[n.ATXHeading2 = 10] = "ATXHeading2", n[n.ATXHeading3 = 11] = "ATXHeading3", n[n.ATXHeading4 = 12] = "ATXHeading4", n[n.ATXHeading5 = 13] = "ATXHeading5", n[n.ATXHeading6 = 14] = "ATXHeading6", n[n.SetextHeading1 = 15] = "SetextHeading1", n[n.SetextHeading2 = 16] = "SetextHeading2", n[n.HTMLBlock = 17] = "HTMLBlock", n[n.LinkReference = 18] = "LinkReference", n[n.Paragraph = 19] = "Paragraph", n[n.CommentBlock = 20] = "CommentBlock", n[n.ProcessingInstructionBlock = 21] = "ProcessingInstructionBlock", n[n.Escape = 22] = "Escape", n[n.Entity = 23] = "Entity", n[n.HardBreak = 24] = "HardBreak", n[n.Emphasis = 25] = "Emphasis", n[n.StrongEmphasis = 26] = "StrongEmphasis", n[n.Link = 27] = "Link", n[n.Image = 28] = "Image", n[n.InlineCode = 29] = "InlineCode", n[n.HTMLTag = 30] = "HTMLTag", n[n.Comment = 31] = "Comment", n[n.ProcessingInstruction = 32] = "ProcessingInstruction", n[n.Autolink = 33] = "Autolink", n[n.HeaderMark = 34] = "HeaderMark", n[n.QuoteMark = 35] = "QuoteMark", n[n.ListMark = 36] = "ListMark", n[n.LinkMark = 37] = "LinkMark", n[n.EmphasisMark = 38] = "EmphasisMark", n[n.CodeMark = 39] = "CodeMark", n[n.CodeText = 40] = "CodeText", n[n.CodeInfo = 41] = "CodeInfo", n[n.LinkTitle = 42] = "LinkTitle", n[n.LinkLabel = 43] = "LinkLabel", n[n.URL = 44] = "URL";
})(T || (T = {}));
class xy {
  /**
  @internal
  */
  constructor(e, t) {
    this.start = e, this.content = t, this.marks = [], this.parsers = [];
  }
}
class ky {
  constructor() {
    this.text = "", this.baseIndent = 0, this.basePos = 0, this.depth = 0, this.markers = [], this.pos = 0, this.indent = 0, this.next = -1;
  }
  /**
  @internal
  */
  forward() {
    this.basePos > this.pos && this.forwardInner();
  }
  /**
  @internal
  */
  forwardInner() {
    let e = this.skipSpace(this.basePos);
    this.indent = this.countIndent(e, this.pos, this.indent), this.pos = e, this.next = e == this.text.length ? -1 : this.text.charCodeAt(e);
  }
  /**
  Skip whitespace after the given position, return the position of
  the next non-space character or the end of the line if there's
  only space after `from`.
  */
  skipSpace(e) {
    return Ji(this.text, e);
  }
  /**
  @internal
  */
  reset(e) {
    for (this.text = e, this.baseIndent = this.basePos = this.pos = this.indent = 0, this.forwardInner(), this.depth = 1; this.markers.length; )
      this.markers.pop();
  }
  /**
  Move the line's base position forward to the given position.
  This should only be called by composite [block
  parsers](#BlockParser.parse) or [markup skipping
  functions](#NodeSpec.composite).
  */
  moveBase(e) {
    this.basePos = e, this.baseIndent = this.countIndent(e, this.pos, this.indent);
  }
  /**
  Move the line's base position forward to the given _column_.
  */
  moveBaseColumn(e) {
    this.baseIndent = e, this.basePos = this.findColumn(e);
  }
  /**
  Store a composite-block-level marker. Should be called from
  [markup skipping functions](#NodeSpec.composite) when they
  consume any non-whitespace characters.
  */
  addMarker(e) {
    this.markers.push(e);
  }
  /**
  Find the column position at `to`, optionally starting at a given
  position and column.
  */
  countIndent(e, t = 0, i = 0) {
    for (let r = t; r < e; r++)
      i += this.text.charCodeAt(r) == 9 ? 4 - i % 4 : 1;
    return i;
  }
  /**
  Find the position corresponding to the given column.
  */
  findColumn(e) {
    let t = 0;
    for (let i = 0; t < this.text.length && i < e; t++)
      i += this.text.charCodeAt(t) == 9 ? 4 - i % 4 : 1;
    return t;
  }
  /**
  @internal
  */
  scrub() {
    if (!this.baseIndent)
      return this.text;
    let e = "";
    for (let t = 0; t < this.basePos; t++)
      e += " ";
    return e + this.text.slice(this.basePos);
  }
}
function Hh(n, e, t) {
  if (t.pos == t.text.length || n != e.block && t.indent >= e.stack[t.depth + 1].value + t.baseIndent)
    return !0;
  if (t.indent >= t.baseIndent + 4)
    return !1;
  let i = (n.type == T.OrderedList ? ga : ma)(t, e, !1);
  return i > 0 && (n.type != T.BulletList || pa(t, e, !1) < 0) && t.text.charCodeAt(t.pos + i - 1) == n.value;
}
const XO = {
  [T.Blockquote](n, e, t) {
    return t.next != 62 ? !1 : (t.markers.push(N(T.QuoteMark, e.lineStart + t.pos, e.lineStart + t.pos + 1)), t.moveBase(t.pos + (tt(t.text.charCodeAt(t.pos + 1)) ? 2 : 1)), n.end = e.lineStart + t.text.length, !0);
  },
  [T.ListItem](n, e, t) {
    return (t.next < 0 ? n.blankFirstLine && n.children.length == 1 : t.indent < t.baseIndent + n.value) ? !1 : (t.moveBaseColumn(t.baseIndent + n.value), !0);
  },
  [T.OrderedList]: Hh,
  [T.BulletList]: Hh,
  [T.Document]() {
    return !0;
  }
};
function tt(n) {
  return n == 32 || n == 9 || n == 10 || n == 13;
}
function Ji(n, e = 0) {
  for (; e < n.length && tt(n.charCodeAt(e)); )
    e++;
  return e;
}
function Kh(n, e, t) {
  for (; e > t && tt(n.charCodeAt(e - 1)); )
    e--;
  return e;
}
function ZO(n) {
  if (n.next != 96 && n.next != 126)
    return -1;
  let e = n.pos + 1;
  for (; e < n.text.length && n.text.charCodeAt(e) == n.next; )
    e++;
  if (e < n.pos + 3)
    return -1;
  if (n.next == 96) {
    for (let t = e; t < n.text.length; t++)
      if (n.text.charCodeAt(t) == 96)
        return -1;
  }
  return e;
}
function DO(n) {
  return n.next != 62 ? -1 : n.text.charCodeAt(n.pos + 1) == 32 ? 2 : 1;
}
function pa(n, e, t) {
  if (n.next != 42 && n.next != 45 && n.next != 95)
    return -1;
  let i = 1;
  for (let r = n.pos + 1; r < n.text.length; r++) {
    let s = n.text.charCodeAt(r);
    if (s == n.next)
      i++;
    else if (!tt(s))
      return -1;
  }
  return t && n.next == 45 && LO(n) > -1 && n.depth == e.stack.length && e.parser.leafBlockParsers.indexOf(BO.SetextHeading) > -1 || i < 3 ? -1 : 1;
}
function RO(n, e) {
  for (let t = n.stack.length - 1; t >= 0; t--)
    if (n.stack[t].type == e)
      return !0;
  return !1;
}
function ma(n, e, t) {
  return (n.next == 45 || n.next == 43 || n.next == 42) && (n.pos == n.text.length - 1 || tt(n.text.charCodeAt(n.pos + 1))) && (!t || RO(e, T.BulletList) || n.skipSpace(n.pos + 2) < n.text.length) ? 1 : -1;
}
function ga(n, e, t) {
  let i = n.pos, r = n.next;
  for (; r >= 48 && r <= 57; ) {
    i++;
    if (i == n.text.length)
      return -1;
    r = n.text.charCodeAt(i);
  }
  return i == n.pos || i > n.pos + 9 || r != 46 && r != 41 || i < n.text.length - 1 && !tt(n.text.charCodeAt(i + 1)) || t && !RO(e, T.OrderedList) && (n.skipSpace(i + 1) == n.text.length || i > n.pos + 1 || n.next != 49) ? -1 : i + 1 - n.pos;
}
function MO(n) {
  if (n.next != 35)
    return -1;
  let e = n.pos + 1;
  for (; e < n.text.length && n.text.charCodeAt(e) == 35; )
    e++;
  if (e < n.text.length && !tt(n.text.charCodeAt(e)))
    return -1;
  let t = e - n.pos;
  return t > 6 ? -1 : t;
}
function LO(n) {
  if (n.next != 45 && n.next != 61 || n.indent >= n.baseIndent + 4)
    return -1;
  let e = n.pos + 1;
  for (; e < n.text.length && n.text.charCodeAt(e) == n.next; )
    e++;
  let t = e;
  for (; e < n.text.length && tt(n.text.charCodeAt(e)); )
    e++;
  return e == n.text.length ? t : -1;
}
const yu = /^[ \t]*$/, jO = /-->/, zO = /\?>/, Qu = [
  [/^<(?:script|pre|style|textarea)(?:\s|>|$)/i, /<\/(?:script|pre|style|textarea)>/i],
  [/^\s*<!--/, jO],
  [/^\s*<\?/, zO],
  [/^\s*<![A-Z]/, />/],
  [/^\s*<!\[CDATA\[/, /\]\]>/],
  [/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i, yu],
  [/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i, yu]
];
function IO(n, e, t) {
  if (n.next != 60)
    return -1;
  let i = n.text.slice(n.pos);
  for (let r = 0, s = Qu.length - (t ? 1 : 0); r < s; r++)
    if (Qu[r][0].test(i))
      return r;
  return -1;
}
function Jh(n, e) {
  let t = n.countIndent(e, n.pos, n.indent), i = n.skipSpace(e), r = n.countIndent(i, e, t);
  return r >= t + 5 || i == n.text.length ? t + 1 : r;
}
function un(n, e, t) {
  let i = n.length - 1;
  i >= 0 && n[i].to == e && n[i].type == T.CodeText ? n[i].to = t : n.push(N(T.CodeText, e, t));
}
const hs = {
  LinkReference: void 0,
  IndentedCode(n, e) {
    let t = e.baseIndent + 4;
    if (e.indent < t)
      return !1;
    let i = e.findColumn(t), r = n.lineStart + i, s = n.lineStart + e.text.length, o = [], l = [];
    for (un(o, r, s); n.nextLine() && e.depth >= n.stack.length; )
      if (e.pos == e.text.length) {
        un(l, n.lineStart - 1, n.lineStart);
        for (let u of e.markers)
          l.push(u);
      } else {
        if (e.indent < t)
          break;
        {
          if (l.length) {
            for (let a of l)
              a.type == T.CodeText ? un(o, a.from, a.to) : o.push(a);
            l = [];
          }
          un(o, n.lineStart - 1, n.lineStart);
          for (let a of e.markers)
            o.push(a);
          s = n.lineStart + e.text.length;
          let u = n.lineStart + e.findColumn(e.baseIndent + 4);
          u < s && un(o, u, s);
        }
      }
    return l.length && (l = l.filter((u) => u.type != T.CodeText), l.length && (e.markers = l.concat(e.markers))), n.addNode(n.buffer.writeElements(o, -r).finish(T.CodeBlock, s - r), r), !0;
  },
  FencedCode(n, e) {
    let t = ZO(e);
    if (t < 0)
      return !1;
    let i = n.lineStart + e.pos, r = e.next, s = t - e.pos, o = e.skipSpace(t), l = Kh(e.text, e.text.length, o), u = [N(T.CodeMark, i, i + s)];
    o < l && u.push(N(T.CodeInfo, n.lineStart + o, n.lineStart + l));
    for (let a = !0, c = !0, h = !1; n.nextLine() && e.depth >= n.stack.length; a = !1) {
      let f = e.pos;
      if (e.indent - e.baseIndent < 4)
        for (; f < e.text.length && e.text.charCodeAt(f) == r; )
          f++;
      if (f - e.pos >= s && e.skipSpace(f) == e.text.length) {
        for (let d of e.markers)
          u.push(d);
        c && h && un(u, n.lineStart - 1, n.lineStart), u.push(N(T.CodeMark, n.lineStart + e.pos, n.lineStart + f)), n.nextLine();
        break;
      } else {
        h = !0, a || (un(u, n.lineStart - 1, n.lineStart), c = !1);
        for (let m of e.markers)
          u.push(m);
        let d = n.lineStart + e.basePos, O = n.lineStart + e.text.length;
        d < O && (un(u, d, O), c = !1);
      }
    }
    return n.addNode(n.buffer.writeElements(u, -i).finish(T.FencedCode, n.prevLineEnd() - i), i), !0;
  },
  Blockquote(n, e) {
    let t = DO(e);
    return t < 0 ? !1 : (n.startContext(T.Blockquote, e.pos), n.addNode(T.QuoteMark, n.lineStart + e.pos, n.lineStart + e.pos + 1), e.moveBase(e.pos + t), null);
  },
  HorizontalRule(n, e) {
    if (pa(e, n, !1) < 0)
      return !1;
    let t = n.lineStart + e.pos;
    return n.nextLine(), n.addNode(T.HorizontalRule, t), !0;
  },
  BulletList(n, e) {
    let t = ma(e, n, !1);
    if (t < 0)
      return !1;
    n.block.type != T.BulletList && n.startContext(T.BulletList, e.basePos, e.next);
    let i = Jh(e, e.pos + 1);
    return n.startContext(T.ListItem, e.basePos, i - e.baseIndent), n.addNode(T.ListMark, n.lineStart + e.pos, n.lineStart + e.pos + t), e.moveBaseColumn(i), n.block.blankFirstLine = i >= e.text.length, null;
  },
  OrderedList(n, e) {
    let t = ga(e, n, !1);
    if (t < 0)
      return !1;
    n.block.type != T.OrderedList && n.startContext(T.OrderedList, e.basePos, e.text.charCodeAt(e.pos + t - 1));
    let i = Jh(e, e.pos + t);
    return n.startContext(T.ListItem, e.basePos, i - e.baseIndent), n.addNode(T.ListMark, n.lineStart + e.pos, n.lineStart + e.pos + t), e.moveBaseColumn(i), n.block.blankFirstLine = i == e.text.length, null;
  },
  ATXHeading(n, e) {
    let t = MO(e);
    if (t < 0)
      return !1;
    let i = e.pos, r = n.lineStart + i, s = Kh(e.text, e.text.length, i), o = s;
    for (; o > i && e.text.charCodeAt(o - 1) == e.next; )
      o--;
    (o == s || o == i || !tt(e.text.charCodeAt(o - 1))) && (o = e.text.length);
    let l = n.buffer.write(T.HeaderMark, 0, t).writeElements(n.parser.parseInline(e.text.slice(i + t + 1, o), r + t + 1), -r);
    o < e.text.length && l.write(T.HeaderMark, o - i, s - i);
    let u = l.finish(T.ATXHeading1 - 1 + t, e.text.length - i);
    return n.nextLine(), n.addNode(u, r), !0;
  },
  HTMLBlock(n, e) {
    let t = IO(e, n, !1);
    if (t < 0)
      return !1;
    let i = n.lineStart + e.pos, r = Qu[t][1], s = [], o = r != yu;
    for (; !r.test(e.text) && n.nextLine(); ) {
      if (e.depth < n.stack.length) {
        o = !1;
        break;
      }
      for (let a of e.markers)
        s.push(a);
    }
    o && n.nextLine();
    let l = r == jO ? T.CommentBlock : r == zO ? T.ProcessingInstructionBlock : T.HTMLBlock, u = n.prevLineEnd();
    return n.addNode(n.buffer.writeElements(s, -i).finish(l, u - i), i), !0;
  },
  SetextHeading: void 0
  // Specifies relative precedence for block-continue function
};
class Sy {
  constructor(e) {
    this.stage = 0, this.elts = [], this.pos = 0, this.start = e.start, this.advance(e.content);
  }
  nextLine(e, t, i) {
    if (this.stage == -1)
      return !1;
    let r = i.content + `
` + t.scrub(), s = this.advance(r);
    return s > -1 && s < r.length ? this.complete(e, i, s) : !1;
  }
  finish(e, t) {
    return (this.stage == 2 || this.stage == 3) && Ji(t.content, this.pos) == t.content.length ? this.complete(e, t, t.content.length) : !1;
  }
  complete(e, t, i) {
    return e.addLeafElement(t, N(T.LinkReference, this.start, this.start + i, this.elts)), !0;
  }
  nextStage(e) {
    return e ? (this.pos = e.to - this.start, this.elts.push(e), this.stage++, !0) : (e === !1 && (this.stage = -1), !1);
  }
  advance(e) {
    for (; ; ) {
      if (this.stage == -1)
        return -1;
      if (this.stage == 0) {
        if (!this.nextStage(UO(e, this.pos, this.start, !0)))
          return -1;
        if (e.charCodeAt(this.pos) != 58)
          return this.stage = -1;
        this.elts.push(N(T.LinkMark, this.pos + this.start, this.pos + this.start + 1)), this.pos++;
      } else if (this.stage == 1) {
        if (!this.nextStage(NO(e, Ji(e, this.pos), this.start)))
          return -1;
      } else if (this.stage == 2) {
        let t = Ji(e, this.pos), i = 0;
        if (t > this.pos) {
          let r = VO(e, t, this.start);
          if (r) {
            let s = ml(e, r.to - this.start);
            s > 0 && (this.nextStage(r), i = s);
          }
        }
        return i || (i = ml(e, this.pos)), i > 0 && i < e.length ? i : -1;
      } else
        return ml(e, this.pos);
    }
  }
}
function ml(n, e) {
  for (; e < n.length; e++) {
    let t = n.charCodeAt(e);
    if (t == 10)
      break;
    if (!tt(t))
      return -1;
  }
  return e;
}
class yy {
  nextLine(e, t, i) {
    let r = t.depth < e.stack.length ? -1 : LO(t), s = t.next;
    if (r < 0)
      return !1;
    let o = N(T.HeaderMark, e.lineStart + t.pos, e.lineStart + r);
    return e.nextLine(), e.addLeafElement(i, N(s == 61 ? T.SetextHeading1 : T.SetextHeading2, i.start, e.prevLineEnd(), [
      ...e.parser.parseInline(i.content, i.start),
      o
    ])), !0;
  }
  finish() {
    return !1;
  }
}
const BO = {
  LinkReference(n, e) {
    return e.content.charCodeAt(0) == 91 ? new Sy(e) : null;
  },
  SetextHeading() {
    return new yy();
  }
}, Qy = [
  (n, e) => MO(e) >= 0,
  (n, e) => ZO(e) >= 0,
  (n, e) => DO(e) >= 0,
  (n, e) => ma(e, n, !0) >= 0,
  (n, e) => ga(e, n, !0) >= 0,
  (n, e) => pa(e, n, !0) >= 0,
  (n, e) => IO(e, n, !0) >= 0
], wy = { text: "", end: 0 };
class $y {
  /**
  @internal
  */
  constructor(e, t, i, r) {
    this.parser = e, this.input = t, this.ranges = r, this.line = new ky(), this.atEnd = !1, this.reusePlaceholders = /* @__PURE__ */ new Map(), this.stoppedAt = null, this.rangeI = 0, this.to = r[r.length - 1].to, this.lineStart = this.absoluteLineStart = this.absoluteLineEnd = r[0].from, this.block = Is.create(T.Document, 0, this.lineStart, 0, 0), this.stack = [this.block], this.fragments = i.length ? new vy(i, t) : null, this.readLine();
  }
  get parsedPos() {
    return this.absoluteLineStart;
  }
  advance() {
    if (this.stoppedAt != null && this.absoluteLineStart > this.stoppedAt)
      return this.finish();
    let { line: e } = this;
    for (; ; ) {
      for (let i = 0; ; ) {
        let r = e.depth < this.stack.length ? this.stack[this.stack.length - 1] : null;
        for (; i < e.markers.length && (!r || e.markers[i].from < r.end); ) {
          let s = e.markers[i++];
          this.addNode(s.type, s.from, s.to);
        }
        if (!r)
          break;
        this.finishContext();
      }
      if (e.pos < e.text.length)
        break;
      if (!this.nextLine())
        return this.finish();
    }
    if (this.fragments && this.reuseFragment(e.basePos))
      return null;
    e: for (; ; ) {
      for (let i of this.parser.blockParsers)
        if (i) {
          let r = i(this, e);
          if (r != !1) {
            if (r == !0)
              return null;
            e.forward();
            continue e;
          }
        }
      break;
    }
    if (e.pos == e.text.length)
      return this.nextLine() ? null : this.finish();
    let t = new xy(this.lineStart + e.pos, e.text.slice(e.pos));
    for (let i of this.parser.leafBlockParsers)
      if (i) {
        let r = i(this, t);
        r && t.parsers.push(r);
      }
    e: for (; this.nextLine() && e.pos != e.text.length; ) {
      if (e.indent < e.baseIndent + 4) {
        for (let i of this.parser.endLeafBlock)
          if (i(this, e, t))
            break e;
      }
      for (let i of t.parsers)
        if (i.nextLine(this, e, t))
          return null;
      t.content += `
` + e.scrub();
      for (let i of e.markers)
        t.marks.push(i);
    }
    return this.finishLeaf(t), null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  reuseFragment(e) {
    if (!this.fragments.moveTo(this.absoluteLineStart + e, this.absoluteLineStart) || !this.fragments.matches(this.block.hash))
      return !1;
    let t = this.fragments.takeNodes(this);
    return t ? (this.absoluteLineStart += t, this.lineStart = HO(this.absoluteLineStart, this.ranges), this.moveRangeI(), this.absoluteLineStart < this.to ? (this.lineStart++, this.absoluteLineStart++, this.readLine()) : (this.atEnd = !0, this.readLine()), !0) : !1;
  }
  /**
  The number of parent blocks surrounding the current block.
  */
  get depth() {
    return this.stack.length;
  }
  /**
  Get the type of the parent block at the given depth. When no
  depth is passed, return the type of the innermost parent.
  */
  parentType(e = this.depth - 1) {
    return this.parser.nodeSet.types[this.stack[e].type];
  }
  /**
  Move to the next input line. This should only be called by
  (non-composite) [block parsers](#BlockParser.parse) that consume
  the line directly, or leaf block parser
  [`nextLine`](#LeafBlockParser.nextLine) methods when they
  consume the current line (and return true).
  */
  nextLine() {
    return this.lineStart += this.line.text.length, this.absoluteLineEnd >= this.to ? (this.absoluteLineStart = this.absoluteLineEnd, this.atEnd = !0, this.readLine(), !1) : (this.lineStart++, this.absoluteLineStart = this.absoluteLineEnd + 1, this.moveRangeI(), this.readLine(), !0);
  }
  /**
  Retrieve the text of the line after the current one, without
  actually moving the context's current line forward.
  */
  peekLine() {
    return this.scanLine(this.absoluteLineEnd + 1).text;
  }
  moveRangeI() {
    for (; this.rangeI < this.ranges.length - 1 && this.absoluteLineStart >= this.ranges[this.rangeI].to; )
      this.rangeI++, this.absoluteLineStart = Math.max(this.absoluteLineStart, this.ranges[this.rangeI].from);
  }
  /**
  @internal
  Collect the text for the next line.
  */
  scanLine(e) {
    let t = wy;
    if (t.end = e, e >= this.to)
      t.text = "";
    else if (t.text = this.lineChunkAt(e), t.end += t.text.length, this.ranges.length > 1) {
      let i = this.absoluteLineStart, r = this.rangeI;
      for (; this.ranges[r].to < t.end; ) {
        r++;
        let s = this.ranges[r].from, o = this.lineChunkAt(s);
        t.end = s + o.length, t.text = t.text.slice(0, this.ranges[r - 1].to - i) + o, i = t.end - t.text.length;
      }
    }
    return t;
  }
  /**
  @internal
  Populate this.line with the content of the next line. Skip
  leading characters covered by composite blocks.
  */
  readLine() {
    let { line: e } = this, { text: t, end: i } = this.scanLine(this.absoluteLineStart);
    for (this.absoluteLineEnd = i, e.reset(t); e.depth < this.stack.length; e.depth++) {
      let r = this.stack[e.depth], s = this.parser.skipContextMarkup[r.type];
      if (!s)
        throw new Error("Unhandled block context " + T[r.type]);
      let o = this.line.markers.length;
      if (!s(r, this, e)) {
        this.line.markers.length > o && (r.end = this.line.markers[this.line.markers.length - 1].to), e.forward();
        break;
      }
      e.forward();
    }
  }
  lineChunkAt(e) {
    let t = this.input.chunk(e), i;
    if (this.input.lineChunks)
      i = t == `
` ? "" : t;
    else {
      let r = t.indexOf(`
`);
      i = r < 0 ? t : t.slice(0, r);
    }
    return e + i.length > this.to ? i.slice(0, this.to - e) : i;
  }
  /**
  The end position of the previous line.
  */
  prevLineEnd() {
    return this.atEnd ? this.lineStart : this.lineStart - 1;
  }
  /**
  @internal
  */
  startContext(e, t, i = 0) {
    this.block = Is.create(e, i, this.lineStart + t, this.block.hash, this.lineStart + this.line.text.length), this.stack.push(this.block);
  }
  /**
  Start a composite block. Should only be called from [block
  parser functions](#BlockParser.parse) that return null.
  */
  startComposite(e, t, i = 0) {
    this.startContext(this.parser.getNodeType(e), t, i);
  }
  /**
  @internal
  */
  addNode(e, t, i) {
    typeof e == "number" && (e = new J(this.parser.nodeSet.types[e], xi, xi, (i ?? this.prevLineEnd()) - t)), this.block.addChild(e, t - this.block.from);
  }
  /**
  Add a block element. Can be called by [block
  parsers](#BlockParser.parse).
  */
  addElement(e) {
    this.block.addChild(e.toTree(this.parser.nodeSet), e.from - this.block.from);
  }
  /**
  Add a block element from a [leaf parser](#LeafBlockParser). This
  makes sure any extra composite block markup (such as blockquote
  markers) inside the block are also added to the syntax tree.
  */
  addLeafElement(e, t) {
    this.addNode(this.buffer.writeElements($u(t.children, e.marks), -t.from).finish(t.type, t.to - t.from), t.from);
  }
  /**
  @internal
  */
  finishContext() {
    let e = this.stack.pop(), t = this.stack[this.stack.length - 1];
    t.addChild(e.toTree(this.parser.nodeSet), e.from - t.from), this.block = t;
  }
  finish() {
    for (; this.stack.length > 1; )
      this.finishContext();
    return this.addGaps(this.block.toTree(this.parser.nodeSet, this.lineStart));
  }
  addGaps(e) {
    return this.ranges.length > 1 ? qO(this.ranges, 0, e.topNode, this.ranges[0].from, this.reusePlaceholders) : e;
  }
  /**
  @internal
  */
  finishLeaf(e) {
    for (let i of e.parsers)
      if (i.finish(this, e))
        return;
    let t = $u(this.parser.parseInline(e.content, e.start), e.marks);
    this.addNode(this.buffer.writeElements(t, -e.start).finish(T.Paragraph, e.content.length), e.start);
  }
  elt(e, t, i, r) {
    return typeof e == "string" ? N(this.parser.getNodeType(e), t, i, r) : new WO(e, t);
  }
  /**
  @internal
  */
  get buffer() {
    return new YO(this.parser.nodeSet);
  }
}
function qO(n, e, t, i, r) {
  let s = n[e].to, o = [], l = [], u = t.from + i;
  function a(c, h) {
    for (; h ? c >= s : c > s; ) {
      let f = n[e + 1].from - s;
      i += f, c += f, e++, s = n[e].to;
    }
  }
  for (let c = t.firstChild; c; c = c.nextSibling) {
    a(c.from + i, !0);
    let h = c.from + i, f, d = r.get(c.tree);
    d ? f = d : c.to + i > s ? (f = qO(n, e, c, i, r), a(c.to + i, !1)) : f = c.toTree(), o.push(f), l.push(h - u);
  }
  return a(t.to + i, !1), new J(t.type, o, l, t.to + i - u, t.tree ? t.tree.propValues : void 0);
}
class Oo extends sa {
  /**
  @internal
  */
  constructor(e, t, i, r, s, o, l, u, a) {
    super(), this.nodeSet = e, this.blockParsers = t, this.leafBlockParsers = i, this.blockNames = r, this.endLeafBlock = s, this.skipContextMarkup = o, this.inlineParsers = l, this.inlineNames = u, this.wrappers = a, this.nodeTypes = /* @__PURE__ */ Object.create(null);
    for (let c of e.types)
      this.nodeTypes[c.name] = c.id;
  }
  createParse(e, t, i) {
    let r = new $y(this, e, t, i);
    for (let s of this.wrappers)
      r = s(r, e, t, i);
    return r;
  }
  /**
  Reconfigure the parser.
  */
  configure(e) {
    let t = wu(e);
    if (!t)
      return this;
    let { nodeSet: i, skipContextMarkup: r } = this, s = this.blockParsers.slice(), o = this.leafBlockParsers.slice(), l = this.blockNames.slice(), u = this.inlineParsers.slice(), a = this.inlineNames.slice(), c = this.endLeafBlock.slice(), h = this.wrappers;
    if (zi(t.defineNodes)) {
      r = Object.assign({}, r);
      let f = i.types.slice(), d;
      for (let O of t.defineNodes) {
        let { name: m, block: g, composite: b, style: w } = typeof O == "string" ? { name: O } : O;
        if (f.some((y) => y.name == m))
          continue;
        b && (r[f.length] = (y, A, C) => b(A, C, y.value));
        let S = f.length, Q = b ? ["Block", "BlockContext"] : g ? S >= T.ATXHeading1 && S <= T.SetextHeading2 ? ["Block", "LeafBlock", "Heading"] : ["Block", "LeafBlock"] : void 0;
        f.push(ke.define({
          id: S,
          name: m,
          props: Q && [[F.group, Q]]
        })), w && (d || (d = {}), Array.isArray(w) || w instanceof Je ? d[m] = w : Object.assign(d, w));
      }
      i = new _r(f), d && (i = i.extend(Qi(d)));
    }
    if (zi(t.props) && (i = i.extend(...t.props)), zi(t.remove))
      for (let f of t.remove) {
        let d = this.blockNames.indexOf(f), O = this.inlineNames.indexOf(f);
        d > -1 && (s[d] = o[d] = void 0), O > -1 && (u[O] = void 0);
      }
    if (zi(t.parseBlock))
      for (let f of t.parseBlock) {
        let d = l.indexOf(f.name);
        if (d > -1)
          s[d] = f.parse, o[d] = f.leaf;
        else {
          let O = f.before ? fs(l, f.before) : f.after ? fs(l, f.after) + 1 : l.length - 1;
          s.splice(O, 0, f.parse), o.splice(O, 0, f.leaf), l.splice(O, 0, f.name);
        }
        f.endLeaf && c.push(f.endLeaf);
      }
    if (zi(t.parseInline))
      for (let f of t.parseInline) {
        let d = a.indexOf(f.name);
        if (d > -1)
          u[d] = f.parse;
        else {
          let O = f.before ? fs(a, f.before) : f.after ? fs(a, f.after) + 1 : a.length - 1;
          u.splice(O, 0, f.parse), a.splice(O, 0, f.name);
        }
      }
    return t.wrap && (h = h.concat(t.wrap)), new Oo(i, s, o, l, c, r, u, a, h);
  }
  /**
  @internal
  */
  getNodeType(e) {
    let t = this.nodeTypes[e];
    if (t == null)
      throw new RangeError(`Unknown node type '${e}'`);
    return t;
  }
  /**
  Parse the given piece of inline text at the given offset,
  returning an array of [`Element`](#Element) objects representing
  the inline content.
  */
  parseInline(e, t) {
    let i = new Zr(this, e, t);
    e: for (let r = t; r < i.end; ) {
      let s = i.char(r);
      for (let o of this.inlineParsers)
        if (o) {
          let l = o(i, s, r);
          if (l >= 0) {
            r = l;
            continue e;
          }
        }
      r++;
    }
    return i.resolveMarkers(0);
  }
}
function zi(n) {
  return n != null && n.length > 0;
}
function wu(n) {
  if (!Array.isArray(n))
    return n;
  if (n.length == 0)
    return null;
  let e = wu(n[0]);
  if (n.length == 1)
    return e;
  let t = wu(n.slice(1));
  if (!t || !e)
    return e || t;
  let i = (o, l) => (o || xi).concat(l || xi), r = e.wrap, s = t.wrap;
  return {
    props: i(e.props, t.props),
    defineNodes: i(e.defineNodes, t.defineNodes),
    parseBlock: i(e.parseBlock, t.parseBlock),
    parseInline: i(e.parseInline, t.parseInline),
    remove: i(e.remove, t.remove),
    wrap: r ? s ? (o, l, u, a) => r(s(o, l, u, a), l, u, a) : r : s
  };
}
function fs(n, e) {
  let t = n.indexOf(e);
  if (t < 0)
    throw new RangeError(`Position specified relative to unknown parser ${e}`);
  return t;
}
let FO = [ke.none];
for (let n = 1, e; e = T[n]; n++)
  FO[n] = ke.define({
    id: n,
    name: e,
    props: n >= T.Escape ? [] : [[F.group, n in XO ? ["Block", "BlockContext"] : ["Block", "LeafBlock"]]],
    top: e == "Document"
  });
const xi = [];
class YO {
  constructor(e) {
    this.nodeSet = e, this.content = [], this.nodes = [];
  }
  write(e, t, i, r = 0) {
    return this.content.push(e, t, i, 4 + r * 4), this;
  }
  writeElements(e, t = 0) {
    for (let i of e)
      i.writeTo(this, t);
    return this;
  }
  finish(e, t) {
    return J.build({
      buffer: this.content,
      nodeSet: this.nodeSet,
      reused: this.nodes,
      topID: e,
      length: t
    });
  }
}
let gr = class {
  /**
  @internal
  */
  constructor(e, t, i, r = xi) {
    this.type = e, this.from = t, this.to = i, this.children = r;
  }
  /**
  @internal
  */
  writeTo(e, t) {
    let i = e.content.length;
    e.writeElements(this.children, t), e.content.push(this.type, this.from + t, this.to + t, e.content.length + 4 - i);
  }
  /**
  @internal
  */
  toTree(e) {
    return new YO(e).writeElements(this.children, -this.from).finish(this.type, this.to - this.from);
  }
};
class WO {
  constructor(e, t) {
    this.tree = e, this.from = t;
  }
  get to() {
    return this.from + this.tree.length;
  }
  get type() {
    return this.tree.type.id;
  }
  get children() {
    return xi;
  }
  writeTo(e, t) {
    e.nodes.push(this.tree), e.content.push(e.nodes.length - 1, this.from + t, this.to + t, -1);
  }
  toTree() {
    return this.tree;
  }
}
function N(n, e, t, i) {
  return new gr(n, e, t, i);
}
const ba = { resolve: "Emphasis", mark: "EmphasisMark" }, xa = { resolve: "Emphasis", mark: "EmphasisMark" }, Xn = {}, Bs = {};
class Ke {
  constructor(e, t, i, r, s = i - t) {
    this.type = e, this.from = t, this.to = i, this.side = r, this.size = s;
  }
}
const ef = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
let br = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  br = new RegExp("[\\p{S}|\\p{P}]", "u");
} catch {
}
const gl = {
  Escape(n, e, t) {
    if (e != 92 || t == n.end - 1)
      return -1;
    let i = n.char(t + 1);
    for (let r = 0; r < ef.length; r++)
      if (ef.charCodeAt(r) == i)
        return n.append(N(T.Escape, t, t + 2));
    return -1;
  },
  Entity(n, e, t) {
    if (e != 38)
      return -1;
    let i = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(n.slice(t + 1, t + 31));
    return i ? n.append(N(T.Entity, t, t + 1 + i[0].length)) : -1;
  },
  InlineCode(n, e, t) {
    if (e != 96 || t && n.char(t - 1) == 96)
      return -1;
    let i = t + 1;
    for (; i < n.end && n.char(i) == 96; )
      i++;
    let r = i - t, s = 0;
    for (; i < n.end; i++)
      if (n.char(i) == 96) {
        if (s++, s == r && n.char(i + 1) != 96)
          return n.append(N(T.InlineCode, t, i + 1, [
            N(T.CodeMark, t, t + r),
            N(T.CodeMark, i + 1 - r, i + 1)
          ]));
      } else
        s = 0;
    return -1;
  },
  HTMLTag(n, e, t) {
    if (e != 60 || t == n.end - 1)
      return -1;
    let i = n.slice(t + 1, n.end), r = /^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(i);
    if (r)
      return n.append(N(T.Autolink, t, t + 1 + r[0].length, [
        N(T.LinkMark, t, t + 1),
        // url[0] includes the closing bracket, so exclude it from this slice
        N(T.URL, t + 1, t + r[0].length),
        N(T.LinkMark, t + r[0].length, t + 1 + r[0].length)
      ]));
    let s = /^!--(?:-?>|[^]*?-->)/.exec(i);
    if (s)
      return n.append(N(T.Comment, t, t + 1 + s[0].length));
    let o = /^\?[^]*?\?>/.exec(i);
    if (o)
      return n.append(N(T.ProcessingInstruction, t, t + 1 + o[0].length));
    let l = /^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/[a-zA-Z][\w-]*\s*>|[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*\/?>)/.exec(i);
    return l ? n.append(N(T.HTMLTag, t, t + 1 + l[0].length)) : -1;
  },
  Emphasis(n, e, t) {
    if (e != 95 && e != 42)
      return -1;
    let i = t + 1;
    for (; n.char(i) == e; )
      i++;
    let r = n.slice(t - 1, t), s = n.slice(i, i + 1), o = br.test(r), l = br.test(s), u = /\s|^$/.test(r), a = /\s|^$/.test(s), c = !a && (!l || u || o), h = !u && (!o || a || l), f = c && (e == 42 || !h || o), d = h && (e == 42 || !c || l);
    return n.append(new Ke(e == 95 ? ba : xa, t, i, (f ? 1 : 0) | (d ? 2 : 0)));
  },
  HardBreak(n, e, t) {
    if (e == 92 && n.char(t + 1) == 10)
      return n.append(N(T.HardBreak, t, t + 2));
    if (e == 32) {
      let i = t + 1;
      for (; n.char(i) == 32; )
        i++;
      if (n.char(i) == 10 && i >= t + 2)
        return n.append(N(T.HardBreak, t, i + 1));
    }
    return -1;
  },
  Link(n, e, t) {
    return e == 91 ? n.append(new Ke(
      Xn,
      t,
      t + 1,
      1
      /* Mark.Open */
    )) : -1;
  },
  Image(n, e, t) {
    return e == 33 && n.char(t + 1) == 91 ? n.append(new Ke(
      Bs,
      t,
      t + 2,
      1
      /* Mark.Open */
    )) : -1;
  },
  LinkEnd(n, e, t) {
    if (e != 93)
      return -1;
    for (let i = n.parts.length - 1; i >= 0; i--) {
      let r = n.parts[i];
      if (r instanceof Ke && (r.type == Xn || r.type == Bs)) {
        if (!r.side || n.skipSpace(r.to) == t && !/[(\[]/.test(n.slice(t + 1, t + 2)))
          return n.parts[i] = null, -1;
        let s = n.takeContent(i), o = n.parts[i] = Py(n, s, r.type == Xn ? T.Link : T.Image, r.from, t + 1);
        if (r.type == Xn)
          for (let l = 0; l < i; l++) {
            let u = n.parts[l];
            u instanceof Ke && u.type == Xn && (u.side = 0);
          }
        return o.to;
      }
    }
    return -1;
  }
};
function Py(n, e, t, i, r) {
  let { text: s } = n, o = n.char(r), l = r;
  if (e.unshift(N(T.LinkMark, i, i + (t == T.Image ? 2 : 1))), e.push(N(T.LinkMark, r - 1, r)), o == 40) {
    let u = n.skipSpace(r + 1), a = NO(s, u - n.offset, n.offset), c;
    a && (u = n.skipSpace(a.to), u != a.to && (c = VO(s, u - n.offset, n.offset), c && (u = n.skipSpace(c.to)))), n.char(u) == 41 && (e.push(N(T.LinkMark, r, r + 1)), l = u + 1, a && e.push(a), c && e.push(c), e.push(N(T.LinkMark, u, l)));
  } else if (o == 91) {
    let u = UO(s, r - n.offset, n.offset, !1);
    u && (e.push(u), l = u.to);
  }
  return N(t, i, l, e);
}
function NO(n, e, t) {
  if (n.charCodeAt(e) == 60) {
    for (let r = e + 1, s = !1; r < n.length; r++) {
      let o = n.charCodeAt(r);
      if (o == 62 && !s)
        return N(T.URL, e + t, r + 1 + t);
      if (o == 60 && !s || o == 10)
        return !1;
      s = o == 92;
    }
    return null;
  } else {
    let r = 0, s = e;
    for (let o = !1; s < n.length; s++) {
      let l = n.charCodeAt(s);
      if (tt(l))
        break;
      if (o)
        o = !1;
      else if (l == 40)
        r++;
      else if (l == 41) {
        if (!r)
          break;
        r--;
      } else l == 92 && (o = !0);
    }
    return s > e ? N(T.URL, e + t, s + t) : s == n.length ? null : !1;
  }
}
function VO(n, e, t) {
  let i = n.charCodeAt(e);
  if (i != 39 && i != 34 && i != 40)
    return !1;
  let r = i == 40 ? 41 : i;
  for (let s = e + 1, o = !1; s < n.length; s++) {
    let l = n.charCodeAt(s);
    if (o)
      o = !1;
    else {
      if (l == r)
        return N(T.LinkTitle, e + t, s + 1 + t);
      l == 92 && (o = !0);
    }
  }
  return null;
}
function UO(n, e, t, i) {
  for (let r = !1, s = e + 1, o = Math.min(n.length, s + 999); s < o; s++) {
    let l = n.charCodeAt(s);
    if (r)
      r = !1;
    else {
      if (l == 93)
        return i ? !1 : N(T.LinkLabel, e + t, s + 1 + t);
      if (i && !tt(l) && (i = !1), l == 91)
        return !1;
      l == 92 && (r = !0);
    }
  }
  return null;
}
class Zr {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.parser = e, this.text = t, this.offset = i, this.parts = [];
  }
  /**
  Get the character code at the given (document-relative)
  position.
  */
  char(e) {
    return e >= this.end ? -1 : this.text.charCodeAt(e - this.offset);
  }
  /**
  The position of the end of this inline section.
  */
  get end() {
    return this.offset + this.text.length;
  }
  /**
  Get a substring of this inline section. Again uses
  document-relative positions.
  */
  slice(e, t) {
    return this.text.slice(e - this.offset, t - this.offset);
  }
  /**
  @internal
  */
  append(e) {
    return this.parts.push(e), e.to;
  }
  /**
  Add a [delimiter](#DelimiterType) at this given position. `open`
  and `close` indicate whether this delimiter is opening, closing,
  or both. Returns the end of the delimiter, for convenient
  returning from [parse functions](#InlineParser.parse).
  */
  addDelimiter(e, t, i, r, s) {
    return this.append(new Ke(e, t, i, (r ? 1 : 0) | (s ? 2 : 0)));
  }
  /**
  Returns true when there is an unmatched link or image opening
  token before the current position.
  */
  get hasOpenLink() {
    for (let e = this.parts.length - 1; e >= 0; e--) {
      let t = this.parts[e];
      if (t instanceof Ke && (t.type == Xn || t.type == Bs))
        return !0;
    }
    return !1;
  }
  /**
  Add an inline element. Returns the end of the element.
  */
  addElement(e) {
    return this.append(e);
  }
  /**
  Resolve markers between this.parts.length and from, wrapping matched markers in the
  appropriate node and updating the content of this.parts. @internal
  */
  resolveMarkers(e) {
    for (let i = e; i < this.parts.length; i++) {
      let r = this.parts[i];
      if (!(r instanceof Ke && r.type.resolve && r.side & 2))
        continue;
      let s = r.type == ba || r.type == xa, o = r.to - r.from, l, u = i - 1;
      for (; u >= e; u--) {
        let m = this.parts[u];
        if (m instanceof Ke && m.side & 1 && m.type == r.type && // Ignore emphasis delimiters where the character count doesn't match
        !(s && (r.side & 1 || m.side & 2) && (m.size + r.size) % 3 == 0 && (m.size % 3 || r.size % 3))) {
          l = m;
          break;
        }
      }
      if (!l)
        continue;
      let a = r.type.resolve, c = [], h = l.from, f = r.to;
      if (s) {
        let m = Math.min(2, l.to - l.from, o);
        h = l.to - m, f = r.from + m, a = m == 1 ? "Emphasis" : "StrongEmphasis";
      }
      l.type.mark && c.push(this.elt(l.type.mark, h, l.to));
      for (let m = u + 1; m < i; m++)
        this.parts[m] instanceof gr && c.push(this.parts[m]), this.parts[m] = null;
      r.type.mark && c.push(this.elt(r.type.mark, r.from, f));
      let d = this.elt(a, h, f, c);
      this.parts[u] = s && l.from != h ? new Ke(l.type, l.from, h, l.side, l.size) : null, (this.parts[i] = s && r.to != f ? new Ke(r.type, f, r.to, r.side, r.size) : null) ? this.parts.splice(i, 0, d) : this.parts[i] = d;
    }
    let t = [];
    for (let i = e; i < this.parts.length; i++) {
      let r = this.parts[i];
      r instanceof gr && t.push(r);
    }
    return t;
  }
  /**
  Find an opening delimiter of the given type. Returns `null` if
  no delimiter is found, or an index that can be passed to
  [`takeContent`](#InlineContext.takeContent) otherwise.
  */
  findOpeningDelimiter(e) {
    for (let t = this.parts.length - 1; t >= 0; t--) {
      let i = this.parts[t];
      if (i instanceof Ke && i.type == e && i.side & 1)
        return t;
    }
    return null;
  }
  /**
  Remove all inline elements and delimiters starting from the
  given index (which you should get from
  [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter),
  resolve delimiters inside of them, and return them as an array
  of elements.
  */
  takeContent(e) {
    let t = this.resolveMarkers(e);
    return this.parts.length = e, t;
  }
  /**
  Return the delimiter at the given index. Mostly useful to get
  additional info out of a delimiter index returned by
  [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter).
  Returns null if there is no delimiter at this index.
  */
  getDelimiterAt(e) {
    let t = this.parts[e];
    return t instanceof Ke ? t : null;
  }
  /**
  Skip space after the given (document) position, returning either
  the position of the next non-space character or the end of the
  section.
  */
  skipSpace(e) {
    return Ji(this.text, e - this.offset) + this.offset;
  }
  elt(e, t, i, r) {
    return typeof e == "string" ? N(this.parser.getNodeType(e), t, i, r) : new WO(e, t);
  }
}
Zr.linkStart = Xn;
Zr.imageStart = Bs;
Zr.emphasisAsterisk = xa;
Zr.emphasisUnderscore = ba;
function $u(n, e) {
  if (!e.length)
    return n;
  if (!n.length)
    return e;
  let t = n.slice(), i = 0;
  for (let r of e) {
    for (; i < t.length && t[i].to < r.to; )
      i++;
    if (i < t.length && t[i].from < r.from) {
      let s = t[i];
      s instanceof gr && (t[i] = new gr(s.type, s.from, s.to, $u(s.children, [r])));
    } else
      t.splice(i++, 0, r);
  }
  return t;
}
const GO = [T.CodeBlock, T.ListItem, T.OrderedList, T.BulletList];
let vy = class {
  constructor(e, t) {
    this.fragments = e, this.input = t, this.i = 0, this.fragment = null, this.fragmentEnd = -1, this.cursor = null, e.length && (this.fragment = e[this.i++]);
  }
  nextFragment() {
    this.fragment = this.i < this.fragments.length ? this.fragments[this.i++] : null, this.cursor = null, this.fragmentEnd = -1;
  }
  moveTo(e, t) {
    for (; this.fragment && this.fragment.to <= e; )
      this.nextFragment();
    if (!this.fragment || this.fragment.from > (e ? e - 1 : 0))
      return !1;
    if (this.fragmentEnd < 0) {
      let s = this.fragment.to;
      for (; s > 0 && this.input.read(s - 1, s) != `
`; )
        s--;
      this.fragmentEnd = s ? s - 1 : 0;
    }
    let i = this.cursor;
    i || (i = this.cursor = this.fragment.tree.cursor(V.IncludeAnonymous | V.IgnoreMounts), i.firstChild());
    let r = e + this.fragment.offset;
    for (; i.to <= r; )
      if (!i.parent())
        return !1;
    for (; ; ) {
      if (i.from >= r)
        return this.fragment.from <= t;
      if (!i.childAfter(r))
        return !1;
    }
  }
  matches(e) {
    let t = this.cursor.tree;
    for (; t && t.type.isAnonymous && t.children[0] instanceof J; )
      t = t.children[0];
    return t && t.prop(F.contextHash) == e;
  }
  takeNodes(e) {
    let t = this.cursor, i = this.fragment.offset, r = this.fragmentEnd - (this.fragment.openEnd ? 1 : 0), s = e.absoluteLineStart, o = s, l = e.block.children.length, u = e.lineStart - e.block.from >> 2, a = o, c = l;
    e: for (; ; ) {
      if (t.to - i > Math.min(r, e.to) || t.type.isAnonymous && t.tree && (t.to - t.from > u || !_y(t.tree))) {
        if (t.type.isAnonymous && t.firstChild())
          continue;
        break;
      }
      let h = HO(t.from - i, e.ranges);
      if (t.to - i <= e.ranges[e.rangeI].to)
        e.addNode(t.tree, h);
      else {
        let f = new J(e.parser.nodeSet.types[T.Paragraph], [], [], 0, e.block.hashProp);
        e.reusePlaceholders.set(f, t.tree), e.addNode(f, h);
      }
      for ((t.type.isAnonymous || t.type.is("Block")) && (t.type.isAnonymous || GO.indexOf(t.type.id) < 0 ? (o = t.to - i, l = e.block.children.length) : (o = a, l = c), a = t.to - i, c = e.block.children.length); ; ) {
        if (t.nextSibling())
          continue e;
        if (!t.parent() || !t.type.isAnonymous)
          break e;
      }
    }
    for (; e.block.children.length > l; )
      e.block.children.pop(), e.block.positions.pop();
    return o - s;
  }
};
function _y(n) {
  for (; n.type.isAnonymous; ) {
    let e = n.children[n.children.length - 1];
    if (e instanceof J)
      n = e;
    else
      return !1;
  }
  return n.type.is("Block") && GO.indexOf(n.type.id) < 0;
}
function HO(n, e) {
  let t = n;
  for (let i = 1; i < e.length; i++) {
    let r = e[i - 1].to, s = e[i].from;
    r < n && (t -= s - r);
  }
  return t;
}
const Ay = Qi({
  "Blockquote/...": x.quote,
  HorizontalRule: x.contentSeparator,
  "ATXHeading1/... SetextHeading1/...": x.heading1,
  "ATXHeading2/... SetextHeading2/...": x.heading2,
  "ATXHeading3/...": x.heading3,
  "ATXHeading4/...": x.heading4,
  "ATXHeading5/...": x.heading5,
  "ATXHeading6/...": x.heading6,
  "Comment CommentBlock": x.comment,
  Escape: x.escape,
  Entity: x.character,
  "Emphasis/...": x.emphasis,
  "StrongEmphasis/...": x.strong,
  "Link/... Image/...": x.link,
  "OrderedList/... BulletList/...": x.list,
  "BlockQuote/...": x.quote,
  "InlineCode CodeText": x.monospace,
  "URL Autolink": x.url,
  "HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark": x.processingInstruction,
  "CodeInfo LinkLabel": x.labelName,
  LinkTitle: x.string,
  Paragraph: x.content
}), Cy = new Oo(new _r(FO).extend(Ay), Object.keys(hs).map((n) => hs[n]), Object.keys(hs).map((n) => BO[n]), Object.keys(hs), Qy, XO, Object.keys(gl).map((n) => gl[n]), Object.keys(gl), []);
function Ty(n, e, t) {
  let i = [];
  for (let r = n.firstChild, s = e; ; r = r.nextSibling) {
    let o = r ? r.from : t;
    if (o > s && i.push({ from: s, to: o }), !r)
      break;
    s = r.to;
  }
  return i;
}
function Ey(n) {
  let { codeParser: e, htmlParser: t } = n;
  return { wrap: Y0((r, s) => {
    let o = r.type.id;
    if (e && (o == T.CodeBlock || o == T.FencedCode)) {
      let l = "";
      if (o == T.FencedCode) {
        let a = r.node.getChild(T.CodeInfo);
        a && (l = s.read(a.from, a.to));
      }
      let u = e(l);
      if (u)
        return { parser: u, overlay: (a) => a.type.id == T.CodeText, bracketed: o == T.FencedCode };
    } else if (t && (o == T.HTMLBlock || o == T.HTMLTag || o == T.CommentBlock))
      return { parser: t, overlay: Ty(r.node, r.from, r.to) };
    return null;
  }) };
}
const Xy = { resolve: "Strikethrough", mark: "StrikethroughMark" }, Zy = {
  defineNodes: [{
    name: "Strikethrough",
    style: { "Strikethrough/...": x.strikethrough }
  }, {
    name: "StrikethroughMark",
    style: x.processingInstruction
  }],
  parseInline: [{
    name: "Strikethrough",
    parse(n, e, t) {
      if (e != 126 || n.char(t + 1) != 126 || n.char(t + 2) == 126)
        return -1;
      let i = n.slice(t - 1, t), r = n.slice(t + 2, t + 3), s = /\s|^$/.test(i), o = /\s|^$/.test(r), l = br.test(i), u = br.test(r);
      return n.addDelimiter(Xy, t, t + 2, !o && (!u || s || l), !s && (!l || o || u));
    },
    after: "Emphasis"
  }]
};
function er(n, e, t = 0, i, r = 0) {
  let s = 0, o = !0, l = -1, u = -1, a = !1, c = () => {
    i.push(n.elt("TableCell", r + l, r + u, n.parser.parseInline(e.slice(l, u), r + l)));
  };
  for (let h = t; h < e.length; h++) {
    let f = e.charCodeAt(h);
    f == 124 && !a ? ((!o || l > -1) && s++, o = !1, i && (l > -1 && c(), i.push(n.elt("TableDelimiter", h + r, h + r + 1))), l = u = -1) : (a || f != 32 && f != 9) && (l < 0 && (l = h), u = h + 1), a = !a && f == 92;
  }
  return l > -1 && (s++, i && c()), s;
}
function tf(n, e) {
  for (let t = e; t < n.length; t++) {
    let i = n.charCodeAt(t);
    if (i == 124)
      return !0;
    i == 92 && t++;
  }
  return !1;
}
const KO = /^[>\s]*\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;
class nf {
  constructor() {
    this.rows = null;
  }
  nextLine(e, t, i) {
    if (this.rows == null) {
      this.rows = !1;
      let r;
      if ((t.next == 45 || t.next == 58 || t.next == 124) && KO.test(r = t.text.slice(t.pos))) {
        let s = [];
        er(e, i.content, 0, s, i.start) == er(e, r, 0) && (this.rows = [
          e.elt("TableHeader", i.start, i.start + i.content.length, s),
          e.elt("TableDelimiter", e.lineStart + t.pos, e.lineStart + t.text.length)
        ]);
      }
    } else if (this.rows) {
      let r = [];
      er(e, t.text, t.pos, r, e.lineStart), this.rows.push(e.elt("TableRow", e.lineStart + t.pos, e.lineStart + t.text.length, r));
    }
    return !1;
  }
  finish(e, t) {
    return this.rows ? (e.addLeafElement(t, e.elt("Table", t.start, t.start + t.content.length, this.rows)), !0) : !1;
  }
}
const Dy = {
  defineNodes: [
    { name: "Table", block: !0 },
    { name: "TableHeader", style: { "TableHeader/...": x.heading } },
    "TableRow",
    { name: "TableCell", style: x.content },
    { name: "TableDelimiter", style: x.processingInstruction }
  ],
  parseBlock: [{
    name: "Table",
    leaf(n, e) {
      return tf(e.content, 0) ? new nf() : null;
    },
    endLeaf(n, e, t) {
      if (t.parsers.some((r) => r instanceof nf) || !tf(e.text, e.basePos))
        return !1;
      let i = n.peekLine();
      return KO.test(i) && er(n, e.text, e.basePos) == er(n, i, e.basePos);
    },
    before: "SetextHeading"
  }]
};
class Ry {
  nextLine() {
    return !1;
  }
  finish(e, t) {
    return e.addLeafElement(t, e.elt("Task", t.start, t.start + t.content.length, [
      e.elt("TaskMarker", t.start, t.start + 3),
      ...e.parser.parseInline(t.content.slice(3), t.start + 3)
    ])), !0;
  }
}
const My = {
  defineNodes: [
    { name: "Task", block: !0, style: x.list },
    { name: "TaskMarker", style: x.atom }
  ],
  parseBlock: [{
    name: "TaskList",
    leaf(n, e) {
      return /^\[[ xX]\][ \t]/.test(e.content) && n.parentType().name == "ListItem" ? new Ry() : null;
    },
    after: "SetextHeading"
  }]
}, rf = /(www\.)|(https?:\/\/)|([\w.+-]{1,100}@)|(mailto:|xmpp:)/gy, sf = /[\w-]+(\.[\w-]+)+(:\d+)?(\/[^\s<]*)?/gy, Ly = /[\w-]+\.[\w-]+($|[/:])/, of = /[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy, lf = /\/[a-zA-Z\d@.]+/gy;
function uf(n, e, t, i) {
  let r = 0;
  for (let s = e; s < t; s++)
    n[s] == i && r++;
  return r;
}
function jy(n, e) {
  sf.lastIndex = e;
  let t = sf.exec(n);
  if (!t || Ly.exec(t[0])[0].indexOf("_") > -1)
    return -1;
  let i = e + t[0].length;
  for (; ; ) {
    let r = n[i - 1], s;
    if (/[?!.,:*_~]/.test(r) || r == ")" && uf(n, e, i, ")") > uf(n, e, i, "("))
      i--;
    else if (r == ";" && (s = /&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(n.slice(e, i))))
      i = e + s.index;
    else
      break;
  }
  return i;
}
function af(n, e) {
  of.lastIndex = e;
  let t = of.exec(n);
  if (!t)
    return -1;
  let i = t[0][t[0].length - 1];
  return i == "_" || i == "-" ? -1 : e + t[0].length - (i == "." ? 1 : 0);
}
const zy = {
  parseInline: [{
    name: "Autolink",
    parse(n, e, t) {
      let i = t - n.offset;
      if (i && /\w/.test(n.text[i - 1]))
        return -1;
      rf.lastIndex = i;
      let r = rf.exec(n.text), s = -1;
      if (!r)
        return -1;
      if (r[1] || r[2]) {
        if (s = jy(n.text, i + r[0].length), s > -1 && n.hasOpenLink) {
          let o = /([^\[\]]|\[[^\]]*\])*/.exec(n.text.slice(i, s));
          s = i + o[0].length;
        }
      } else r[3] ? s = af(n.text, i) : (s = af(n.text, i + r[0].length), s > -1 && r[0] == "xmpp:" && (lf.lastIndex = s, r = lf.exec(n.text), r && (s = r.index + r[0].length)));
      return s < 0 ? -1 : (n.addElement(n.elt("URL", t, s + n.offset)), s + n.offset);
    }
  }]
}, JO = [Dy, My, Zy, zy];
function ep(n, e, t) {
  return (i, r, s) => {
    if (r != n || i.char(s + 1) == n)
      return -1;
    let o = [i.elt(t, s, s + 1)];
    for (let l = s + 1; l < i.end; l++) {
      let u = i.char(l);
      if (u == n)
        return i.addElement(i.elt(e, s, l + 1, o.concat(i.elt(t, l, l + 1))));
      if (u == 92 && o.push(i.elt("Escape", l, l++ + 2)), tt(u))
        break;
    }
    return -1;
  };
}
const Iy = {
  defineNodes: [
    { name: "Superscript", style: x.special(x.content) },
    { name: "SuperscriptMark", style: x.processingInstruction }
  ],
  parseInline: [{
    name: "Superscript",
    parse: ep(94, "Superscript", "SuperscriptMark")
  }]
}, By = {
  defineNodes: [
    { name: "Subscript", style: x.special(x.content) },
    { name: "SubscriptMark", style: x.processingInstruction }
  ],
  parseInline: [{
    name: "Subscript",
    parse: ep(126, "Subscript", "SubscriptMark")
  }]
}, qy = {
  defineNodes: [{ name: "Emoji", style: x.character }],
  parseInline: [{
    name: "Emoji",
    parse(n, e, t) {
      let i;
      return e != 58 || !(i = /^[a-zA-Z_0-9]+:/.exec(n.slice(t + 1, n.end))) ? -1 : n.addElement(n.elt("Emoji", t, t + 1 + i[0].length));
    }
  }]
};
class qs {
  /**
  @internal
  */
  constructor(e, t, i, r, s, o, l, u, a, c = 0, h) {
    this.p = e, this.stack = t, this.state = i, this.reducePos = r, this.pos = s, this.score = o, this.buffer = l, this.bufferBase = u, this.curContext = a, this.lookAhead = c, this.parent = h;
  }
  /**
  @internal
  */
  toString() {
    return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  // Start an empty stack
  /**
  @internal
  */
  static start(e, t, i = 0) {
    let r = e.parser.context;
    return new qs(e, [], t, i, i, 0, [], 0, r ? new cf(r, r.start) : null, 0, null);
  }
  /**
  The stack's current [context](#lr.ContextTracker) value, if
  any. Its type will depend on the context tracker's type
  parameter, or it will be `null` if there is no context
  tracker.
  */
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  // Push a state onto the stack, tracking its start position as well
  // as the buffer base at that point.
  /**
  @internal
  */
  pushState(e, t) {
    this.stack.push(this.state, t, this.bufferBase + this.buffer.length), this.state = e;
  }
  // Apply a reduce action
  /**
  @internal
  */
  reduce(e) {
    var t;
    let i = e >> 19, r = e & 65535, { parser: s } = this.p, o = this.reducePos < this.pos - 25 && this.setLookAhead(this.pos), l = s.dynamicPrecedence(r);
    if (l && (this.score += l), i == 0) {
      r < s.minRepeatTerm && this.reducePos < this.pos && (this.reducePos = this.pos), this.pushState(s.getGoto(this.state, r, !0), this.reducePos), r < s.minRepeatTerm && this.storeNode(r, this.reducePos, this.reducePos, o ? 8 : 4, !0), this.reduceContext(r, this.reducePos);
      return;
    }
    let u = this.stack.length - (i - 1) * 3 - (e & 262144 ? 6 : 0), a = u ? this.stack[u - 2] : this.p.ranges[0].from;
    r < s.minRepeatTerm && a == this.reducePos && this.reducePos < this.pos && (this.reducePos = this.pos);
    let c = this.reducePos - a;
    c >= 2e3 && !(!((t = this.p.parser.nodeSet.types[r]) === null || t === void 0) && t.isAnonymous) && (a == this.p.lastBigReductionStart ? (this.p.bigReductionCount++, this.p.lastBigReductionSize = c) : this.p.lastBigReductionSize < c && (this.p.bigReductionCount = 1, this.p.lastBigReductionStart = a, this.p.lastBigReductionSize = c));
    let h = u ? this.stack[u - 1] : 0, f = this.bufferBase + this.buffer.length - h;
    if (r < s.minRepeatTerm || e & 131072) {
      let d = s.stateFlag(
        this.state,
        1
        /* StateFlag.Skipped */
      ) ? this.pos : this.reducePos;
      this.storeNode(r, a, d, f + 4, !0);
    }
    if (e & 262144)
      this.state = this.stack[u];
    else {
      let d = this.stack[u - 3];
      this.state = s.getGoto(d, r, !0);
    }
    for (; this.stack.length > u; )
      this.stack.pop();
    this.reduceContext(r, a);
  }
  // Shift a value into the buffer
  /**
  @internal
  */
  storeNode(e, t, i, r = 4, s = !1) {
    if (e == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let o = this.buffer.length;
      if (o > 0 && this.buffer[o - 4] == 0 && this.buffer[o - 1] > -1) {
        if (t == i)
          return;
        if (this.buffer[o - 2] >= t) {
          this.buffer[o - 2] = i;
          return;
        }
      }
    }
    if (!s || this.pos == i)
      this.buffer.push(e, t, i, r);
    else {
      let o = this.buffer.length;
      if (o > 0 && (this.buffer[o - 4] != 0 || this.buffer[o - 1] < 0)) {
        let l = !1;
        for (let u = o; u > 0 && this.buffer[u - 2] > i; u -= 4)
          if (this.buffer[u - 1] >= 0) {
            l = !0;
            break;
          }
        if (l)
          for (; o > 0 && this.buffer[o - 2] > i; )
            this.buffer[o] = this.buffer[o - 4], this.buffer[o + 1] = this.buffer[o - 3], this.buffer[o + 2] = this.buffer[o - 2], this.buffer[o + 3] = this.buffer[o - 1], o -= 4, r > 4 && (r -= 4);
      }
      this.buffer[o] = e, this.buffer[o + 1] = t, this.buffer[o + 2] = i, this.buffer[o + 3] = r;
    }
  }
  // Apply a shift action
  /**
  @internal
  */
  shift(e, t, i, r) {
    if (e & 131072)
      this.pushState(e & 65535, this.pos);
    else if ((e & 262144) == 0) {
      let s = e, { parser: o } = this.p;
      this.pos = r;
      let l = o.stateFlag(
        s,
        1
        /* StateFlag.Skipped */
      );
      !l && (r > i || t <= o.maxNode) && (this.reducePos = r), this.pushState(s, l ? i : Math.min(i, this.reducePos)), this.shiftContext(t, i), t <= o.maxNode && this.buffer.push(t, i, r, 4);
    } else
      this.pos = r, this.shiftContext(t, i), t <= this.p.parser.maxNode && this.buffer.push(t, i, r, 4);
  }
  // Apply an action
  /**
  @internal
  */
  apply(e, t, i, r) {
    e & 65536 ? this.reduce(e) : this.shift(e, t, i, r);
  }
  // Add a prebuilt (reused) node into the buffer.
  /**
  @internal
  */
  useNode(e, t, i) {
    let r = this.p.reused.length - 1;
    (r < 0 || this.p.reused[r] != e) && (this.p.reused.push(e), r++);
    let s = this.reducePos = this.pos = i + e.length;
    this.pushState(t, i), this.buffer.push(
      r,
      i,
      s,
      -1
      /* size == -1 means this is a reused value */
    ), this.curContext && this.updateContext(this.curContext.tracker.reuse(this.curContext.context, e, this, this.p.stream.reset(this.pos - e.length)));
  }
  // Split the stack. Due to the buffer sharing and the fact
  // that `this.stack` tends to stay quite shallow, this isn't very
  // expensive.
  /**
  @internal
  */
  split() {
    let e = this, t = e.buffer.length;
    for (t && e.buffer[t - 4] == 0 && (t -= 4); t > 0 && e.buffer[t - 2] > e.reducePos; )
      t -= 4;
    let i = e.buffer.slice(t), r = e.bufferBase + t;
    for (; e && r == e.bufferBase; )
      e = e.parent;
    return new qs(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, i, r, this.curContext, this.lookAhead, e);
  }
  // Try to recover from an error by 'deleting' (ignoring) one token.
  /**
  @internal
  */
  recoverByDelete(e, t) {
    let i = e <= this.p.parser.maxNode;
    i && this.storeNode(e, this.pos, t, 4), this.storeNode(0, this.pos, t, i ? 8 : 4), this.pos = this.reducePos = t, this.score -= 190;
  }
  /**
  Check if the given term would be able to be shifted (optionally
  after some reductions) on this stack. This can be useful for
  external tokenizers that want to make sure they only provide a
  given token when it applies.
  */
  canShift(e) {
    for (let t = new Fy(this); ; ) {
      let i = this.p.parser.stateSlot(
        t.state,
        4
        /* ParseState.DefaultReduce */
      ) || this.p.parser.hasAction(t.state, e);
      if (i == 0)
        return !1;
      if ((i & 65536) == 0)
        return !0;
      t.reduce(i);
    }
  }
  // Apply up to Recover.MaxNext recovery actions that conceptually
  // inserts some missing token or rule.
  /**
  @internal
  */
  recoverByInsert(e) {
    if (this.stack.length >= 300)
      return [];
    let t = this.p.parser.nextStates(this.state);
    if (t.length > 8 || this.stack.length >= 120) {
      let r = [];
      for (let s = 0, o; s < t.length; s += 2)
        (o = t[s + 1]) != this.state && this.p.parser.hasAction(o, e) && r.push(t[s], o);
      if (this.stack.length < 120)
        for (let s = 0; r.length < 8 && s < t.length; s += 2) {
          let o = t[s + 1];
          r.some((l, u) => u & 1 && l == o) || r.push(t[s], o);
        }
      t = r;
    }
    let i = [];
    for (let r = 0; r < t.length && i.length < 4; r += 2) {
      let s = t[r + 1];
      if (s == this.state)
        continue;
      let o = this.split();
      o.pushState(s, this.pos), o.storeNode(0, o.pos, o.pos, 4, !0), o.shiftContext(t[r], this.pos), o.reducePos = this.pos, o.score -= 200, i.push(o);
    }
    return i;
  }
  // Force a reduce, if possible. Return false if that can't
  // be done.
  /**
  @internal
  */
  forceReduce() {
    let { parser: e } = this.p, t = e.stateSlot(
      this.state,
      5
      /* ParseState.ForcedReduce */
    );
    if ((t & 65536) == 0)
      return !1;
    if (!e.validAction(this.state, t)) {
      let i = t >> 19, r = t & 65535, s = this.stack.length - i * 3;
      if (s < 0 || e.getGoto(this.stack[s], r, !1) < 0) {
        let o = this.findForcedReduction();
        if (o == null)
          return !1;
        t = o;
      }
      this.storeNode(0, this.pos, this.pos, 4, !0), this.score -= 100;
    }
    return this.reducePos = this.pos, this.reduce(t), !0;
  }
  /**
  Try to scan through the automaton to find some kind of reduction
  that can be applied. Used when the regular ForcedReduce field
  isn't a valid action. @internal
  */
  findForcedReduction() {
    let { parser: e } = this.p, t = [], i = (r, s) => {
      if (!t.includes(r))
        return t.push(r), e.allActions(r, (o) => {
          if (!(o & 393216)) if (o & 65536) {
            let l = (o >> 19) - s;
            if (l > 1) {
              let u = o & 65535, a = this.stack.length - l * 3;
              if (a >= 0 && e.getGoto(this.stack[a], u, !1) >= 0)
                return l << 19 | 65536 | u;
            }
          } else {
            let l = i(o, s + 1);
            if (l != null)
              return l;
          }
        });
    };
    return i(this.state, 0);
  }
  /**
  @internal
  */
  forceAll() {
    for (; !this.p.parser.stateFlag(
      this.state,
      2
      /* StateFlag.Accepting */
    ); )
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, !0);
        break;
      }
    return this;
  }
  /**
  Check whether this state has no further actions (assumed to be a direct descendant of the
  top state, since any other states must be able to continue
  somehow). @internal
  */
  get deadEnd() {
    if (this.stack.length != 3)
      return !1;
    let { parser: e } = this.p;
    return e.data[e.stateSlot(
      this.state,
      1
      /* ParseState.Actions */
    )] == 65535 && !e.stateSlot(
      this.state,
      4
      /* ParseState.DefaultReduce */
    );
  }
  /**
  Restart the stack (put it back in its start state). Only safe
  when this.stack.length == 3 (state is directly below the top
  state). @internal
  */
  restart() {
    this.storeNode(0, this.pos, this.pos, 4, !0), this.state = this.stack[0], this.stack.length = 0;
  }
  /**
  @internal
  */
  sameState(e) {
    if (this.state != e.state || this.stack.length != e.stack.length)
      return !1;
    for (let t = 0; t < this.stack.length; t += 3)
      if (this.stack[t] != e.stack[t])
        return !1;
    return !0;
  }
  /**
  Get the parser used by this stack.
  */
  get parser() {
    return this.p.parser;
  }
  /**
  Test whether a given dialect (by numeric ID, as exported from
  the terms file) is enabled.
  */
  dialectEnabled(e) {
    return this.p.parser.dialect.flags[e];
  }
  shiftContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.shift(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  reduceContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.reduce(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  /**
  @internal
  */
  emitContext() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -3) && this.storeNode(this.curContext.hash, this.reducePos, this.reducePos, -3, !0);
  }
  /**
  @internal
  */
  emitLookAhead() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -4) && this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
  }
  updateContext(e) {
    if (e != this.curContext.context) {
      let t = new cf(this.curContext.tracker, e);
      t.hash != this.curContext.hash && this.emitContext(), this.curContext = t;
    }
  }
  /**
  @internal
  */
  setLookAhead(e) {
    return e <= this.lookAhead ? !1 : (this.emitLookAhead(), this.lookAhead = e, !0);
  }
  /**
  @internal
  */
  close() {
    this.curContext && this.curContext.tracker.strict && this.emitContext(), this.lookAhead > 0 && this.emitLookAhead();
  }
}
class cf {
  constructor(e, t) {
    this.tracker = e, this.context = t, this.hash = e.strict ? e.hash(t) : 0;
  }
}
class Fy {
  constructor(e) {
    this.start = e, this.state = e.state, this.stack = e.stack, this.base = this.stack.length;
  }
  reduce(e) {
    let t = e & 65535, i = e >> 19;
    i == 0 ? (this.stack == this.start.stack && (this.stack = this.stack.slice()), this.stack.push(this.state, 0, 0), this.base += 3) : this.base -= (i - 1) * 3;
    let r = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
    this.state = r;
  }
}
class Fs {
  constructor(e, t, i) {
    this.stack = e, this.pos = t, this.index = i, this.buffer = e.buffer, this.index == 0 && this.maybeNext();
  }
  static create(e, t = e.bufferBase + e.buffer.length) {
    return new Fs(e, t, t - e.bufferBase);
  }
  maybeNext() {
    let e = this.stack.parent;
    e != null && (this.index = this.stack.bufferBase - e.bufferBase, this.stack = e, this.buffer = e.buffer);
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4, this.pos -= 4, this.index == 0 && this.maybeNext();
  }
  fork() {
    return new Fs(this.stack, this.pos, this.index);
  }
}
function Yi(n, e = Uint16Array) {
  if (typeof n != "string")
    return n;
  let t = null;
  for (let i = 0, r = 0; i < n.length; ) {
    let s = 0;
    for (; ; ) {
      let o = n.charCodeAt(i++), l = !1;
      if (o == 126) {
        s = 65535;
        break;
      }
      o >= 92 && o--, o >= 34 && o--;
      let u = o - 32;
      if (u >= 46 && (u -= 46, l = !0), s += u, l)
        break;
      s *= 46;
    }
    t ? t[r++] = s : t = new e(s);
  }
  return t;
}
class bs {
  constructor() {
    this.start = -1, this.value = -1, this.end = -1, this.extended = -1, this.lookAhead = 0, this.mask = 0, this.context = 0;
  }
}
const hf = new bs();
class Yy {
  /**
  @internal
  */
  constructor(e, t) {
    this.input = e, this.ranges = t, this.chunk = "", this.chunkOff = 0, this.chunk2 = "", this.chunk2Pos = 0, this.next = -1, this.token = hf, this.rangeIndex = 0, this.pos = this.chunkPos = t[0].from, this.range = t[0], this.end = t[t.length - 1].to, this.readNext();
  }
  /**
  @internal
  */
  resolveOffset(e, t) {
    let i = this.range, r = this.rangeIndex, s = this.pos + e;
    for (; s < i.from; ) {
      if (!r)
        return null;
      let o = this.ranges[--r];
      s -= i.from - o.to, i = o;
    }
    for (; t < 0 ? s > i.to : s >= i.to; ) {
      if (r == this.ranges.length - 1)
        return null;
      let o = this.ranges[++r];
      s += o.from - i.to, i = o;
    }
    return s;
  }
  /**
  @internal
  */
  clipPos(e) {
    if (e >= this.range.from && e < this.range.to)
      return e;
    for (let t of this.ranges)
      if (t.to > e)
        return Math.max(e, t.from);
    return this.end;
  }
  /**
  Look at a code unit near the stream position. `.peek(0)` equals
  `.next`, `.peek(-1)` gives you the previous character, and so
  on.
  
  Note that looking around during tokenizing creates dependencies
  on potentially far-away content, which may reduce the
  effectiveness incremental parsing—when looking forward—or even
  cause invalid reparses when looking backward more than 25 code
  units, since the library does not track lookbehind.
  */
  peek(e) {
    let t = this.chunkOff + e, i, r;
    if (t >= 0 && t < this.chunk.length)
      i = this.pos + e, r = this.chunk.charCodeAt(t);
    else {
      let s = this.resolveOffset(e, 1);
      if (s == null)
        return -1;
      if (i = s, i >= this.chunk2Pos && i < this.chunk2Pos + this.chunk2.length)
        r = this.chunk2.charCodeAt(i - this.chunk2Pos);
      else {
        let o = this.rangeIndex, l = this.range;
        for (; l.to <= i; )
          l = this.ranges[++o];
        this.chunk2 = this.input.chunk(this.chunk2Pos = i), i + this.chunk2.length > l.to && (this.chunk2 = this.chunk2.slice(0, l.to - i)), r = this.chunk2.charCodeAt(0);
      }
    }
    return i >= this.token.lookAhead && (this.token.lookAhead = i + 1), r;
  }
  /**
  Accept a token. By default, the end of the token is set to the
  current stream position, but you can pass an offset (relative to
  the stream position) to change that.
  */
  acceptToken(e, t = 0) {
    let i = t ? this.resolveOffset(t, -1) : this.pos;
    if (i == null || i < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = e, this.token.end = i;
  }
  /**
  Accept a token ending at a specific given position.
  */
  acceptTokenTo(e, t) {
    this.token.value = e, this.token.end = t;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk: e, chunkPos: t } = this;
      this.chunk = this.chunk2, this.chunkPos = this.chunk2Pos, this.chunk2 = e, this.chunk2Pos = t, this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk, this.chunk2Pos = this.chunkPos;
      let e = this.input.chunk(this.pos), t = this.pos + e.length;
      this.chunk = t > this.range.to ? e.slice(0, this.range.to - this.pos) : e, this.chunkPos = this.pos, this.chunkOff = 0;
    }
  }
  readNext() {
    return this.chunkOff >= this.chunk.length && (this.getChunk(), this.chunkOff == this.chunk.length) ? this.next = -1 : this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  /**
  Move the stream forward N (defaults to 1) code units. Returns
  the new value of [`next`](#lr.InputStream.next).
  */
  advance(e = 1) {
    for (this.chunkOff += e; this.pos + e >= this.range.to; ) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      e -= this.range.to - this.pos, this.range = this.ranges[++this.rangeIndex], this.pos = this.range.from;
    }
    return this.pos += e, this.pos >= this.token.lookAhead && (this.token.lookAhead = this.pos + 1), this.readNext();
  }
  setDone() {
    return this.pos = this.chunkPos = this.end, this.range = this.ranges[this.rangeIndex = this.ranges.length - 1], this.chunk = "", this.next = -1;
  }
  /**
  @internal
  */
  reset(e, t) {
    if (t ? (this.token = t, t.start = e, t.lookAhead = e + 1, t.value = t.extended = -1) : this.token = hf, this.pos != e) {
      if (this.pos = e, e == this.end)
        return this.setDone(), this;
      for (; e < this.range.from; )
        this.range = this.ranges[--this.rangeIndex];
      for (; e >= this.range.to; )
        this.range = this.ranges[++this.rangeIndex];
      e >= this.chunkPos && e < this.chunkPos + this.chunk.length ? this.chunkOff = e - this.chunkPos : (this.chunk = "", this.chunkOff = 0), this.readNext();
    }
    return this;
  }
  /**
  @internal
  */
  read(e, t) {
    if (e >= this.chunkPos && t <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(e - this.chunkPos, t - this.chunkPos);
    if (e >= this.chunk2Pos && t <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(e - this.chunk2Pos, t - this.chunk2Pos);
    if (e >= this.range.from && t <= this.range.to)
      return this.input.read(e, t);
    let i = "";
    for (let r of this.ranges) {
      if (r.from >= t)
        break;
      r.to > e && (i += this.input.read(Math.max(r.from, e), Math.min(r.to, t)));
    }
    return i;
  }
}
class si {
  constructor(e, t) {
    this.data = e, this.id = t;
  }
  token(e, t) {
    let { parser: i } = t.p;
    tp(this.data, e, t, this.id, i.data, i.tokenPrecTable);
  }
}
si.prototype.contextual = si.prototype.fallback = si.prototype.extend = !1;
class Ys {
  constructor(e, t, i) {
    this.precTable = t, this.elseToken = i, this.data = typeof e == "string" ? Yi(e) : e;
  }
  token(e, t) {
    let i = e.pos, r = 0;
    for (; ; ) {
      let s = e.next < 0, o = e.resolveOffset(1, 1);
      if (tp(this.data, e, t, 0, this.data, this.precTable), e.token.value > -1)
        break;
      if (this.elseToken == null)
        return;
      if (s || r++, o == null)
        break;
      e.reset(o, e.token);
    }
    r && (e.reset(i, e.token), e.acceptToken(this.elseToken, r));
  }
}
Ys.prototype.contextual = si.prototype.fallback = si.prototype.extend = !1;
class nt {
  /**
  Create a tokenizer. The first argument is the function that,
  given an input stream, scans for the types of tokens it
  recognizes at the stream's position, and calls
  [`acceptToken`](#lr.InputStream.acceptToken) when it finds
  one.
  */
  constructor(e, t = {}) {
    this.token = e, this.contextual = !!t.contextual, this.fallback = !!t.fallback, this.extend = !!t.extend;
  }
}
function tp(n, e, t, i, r, s) {
  let o = 0, l = 1 << i, { dialect: u } = t.p.parser;
  e: for (; (l & n[o]) != 0; ) {
    let a = n[o + 1];
    for (let d = o + 3; d < a; d += 2)
      if ((n[d + 1] & l) > 0) {
        let O = n[d];
        if (u.allows(O) && (e.token.value == -1 || e.token.value == O || Wy(O, e.token.value, r, s))) {
          e.acceptToken(O);
          break;
        }
      }
    let c = e.next, h = 0, f = n[o + 2];
    if (e.next < 0 && f > h && n[a + f * 3 - 3] == 65535) {
      o = n[a + f * 3 - 1];
      continue e;
    }
    for (; h < f; ) {
      let d = h + f >> 1, O = a + d + (d << 1), m = n[O], g = n[O + 1] || 65536;
      if (c < m)
        f = d;
      else if (c >= g)
        h = d + 1;
      else {
        o = n[O + 2], e.advance();
        continue e;
      }
    }
    break;
  }
}
function ff(n, e, t) {
  for (let i = e, r; (r = n[i]) != 65535; i++)
    if (r == t)
      return i - e;
  return -1;
}
function Wy(n, e, t, i) {
  let r = ff(t, i, e);
  return r < 0 || ff(t, i, n) < r;
}
const Ve = typeof process < "u" && process.env && /\bparse\b/.test(process.env.LOG);
let bl = null;
function df(n, e, t) {
  let i = n.cursor(V.IncludeAnonymous);
  for (i.moveTo(e); ; )
    if (!(t < 0 ? i.childBefore(e) : i.childAfter(e)))
      for (; ; ) {
        if ((t < 0 ? i.to < e : i.from > e) && !i.type.isError)
          return t < 0 ? Math.max(0, Math.min(
            i.to - 1,
            e - 25
            /* Lookahead.Margin */
          )) : Math.min(n.length, Math.max(
            i.from + 1,
            e + 25
            /* Lookahead.Margin */
          ));
        if (t < 0 ? i.prevSibling() : i.nextSibling())
          break;
        if (!i.parent())
          return t < 0 ? 0 : n.length;
      }
}
class Ny {
  constructor(e, t) {
    this.fragments = e, this.minRepeat = t, this.i = 0, this.fragment = null, this.safeFrom = -1, this.safeTo = -1, this.trees = [], this.start = [], this.index = [], this.lastRepeat = null, this.lastRepeatPos = -1, this.nextFragment();
  }
  nextFragment() {
    let e = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (e) {
      for (this.safeFrom = e.openStart ? df(e.tree, e.from + e.offset, 1) - e.offset : e.from, this.safeTo = e.openEnd ? df(e.tree, e.to + e.offset, -1) - e.offset : e.to; this.trees.length; )
        this.trees.pop(), this.start.pop(), this.index.pop();
      this.trees.push(e.tree), this.start.push(-e.offset), this.index.push(0), this.nextStart = this.safeFrom;
    } else
      this.nextStart = 1e9;
  }
  // `pos` must be >= any previously given `pos` for this cursor
  nodeAt(e) {
    if (e < this.nextStart)
      return null;
    for (; this.fragment && this.safeTo <= e; )
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let t = this.trees.length - 1;
      if (t < 0)
        return this.nextFragment(), null;
      let i = this.trees[t], r = this.index[t];
      if (r == i.children.length) {
        this.trees.pop(), this.start.pop(), this.index.pop();
        continue;
      }
      let s = i.children[r], o = this.start[t] + i.positions[r];
      if (o > e)
        return this.nextStart = o, null;
      if (s instanceof J) {
        let l = o > this.lastRepeatPos && s.type.id >= this.minRepeat;
        if (o == e || l) {
          let u = o + s.length, a;
          if (o >= this.safeFrom && u <= this.safeTo && (!(a = s.prop(F.lookAhead)) || u + a < this.fragment.to)) {
            if (l && (this.lastRepeat = s, this.lastRepeatPos = o), o == e)
              return s;
          } else if (o == e)
            return null;
        }
        this.index[t]++, o + s.length >= Math.max(this.safeFrom, e) && (this.trees.push(s), this.start.push(o), this.index.push(0));
      } else
        this.index[t]++, this.nextStart = o + s.length;
    }
  }
}
class Vy {
  constructor(e, t) {
    this.stream = t, this.tokens = [], this.mainToken = null, this.actions = [], this.tokens = e.tokenizers.map((i) => new bs());
  }
  getActions(e) {
    let t = 0, i = null, { parser: r } = e.p, { tokenizers: s } = r, o = r.stateSlot(
      e.state,
      3
      /* ParseState.TokenizerMask */
    ), l = e.curContext ? e.curContext.hash : 0, u = 0;
    for (let a = 0; a < s.length; a++) {
      if ((1 << a & o) == 0)
        continue;
      let c = s[a], h = this.tokens[a];
      if (!(i && !c.fallback) && ((c.contextual || h.start != e.pos || h.mask != o || h.context != l) && (this.updateCachedToken(h, c, e), h.mask = o, h.context = l), h.lookAhead > h.end + 25 && (u = Math.max(h.lookAhead, u)), h.value != 0)) {
        let f = t;
        if (h.extended > -1 && (t = this.addActions(e, h.extended, h.end, t)), t = this.addActions(e, h.value, h.end, t), !c.extend && (i = h, t > f))
          break;
      }
    }
    for (; this.actions.length > t; )
      this.actions.pop();
    return u && e.setLookAhead(u), !i && e.pos == this.stream.end && (i = new bs(), i.value = e.p.parser.eofTerm, i.start = i.end = e.pos, t = this.addActions(e, i.value, i.end, t)), this.mainToken = i, this.actions;
  }
  getMainToken(e) {
    if (this.mainToken)
      return this.mainToken;
    let t = new bs(), { pos: i, p: r } = e;
    return t.start = i, t.end = Math.min(i + 1, r.stream.end), t.value = i == r.stream.end ? r.parser.eofTerm : 0, t;
  }
  updateCachedToken(e, t, i) {
    let r = this.stream.clipPos(i.pos);
    if (t.token(this.stream.reset(r, e), i), e.value > -1) {
      let { parser: s } = i.p;
      for (let o = 0; o < s.specialized.length; o++)
        if (s.specialized[o] == e.value) {
          let l = s.specializers[o](this.stream.read(e.start, e.end), i);
          if (l >= 0 && i.p.parser.dialect.allows(l >> 1)) {
            (l & 1) == 0 ? e.value = l >> 1 : e.extended = l >> 1;
            break;
          }
        }
    } else
      e.value = 0, e.end = this.stream.clipPos(r + 1);
  }
  putAction(e, t, i, r) {
    for (let s = 0; s < r; s += 3)
      if (this.actions[s] == e)
        return r;
    return this.actions[r++] = e, this.actions[r++] = t, this.actions[r++] = i, r;
  }
  addActions(e, t, i, r) {
    let { state: s } = e, { parser: o } = e.p, { data: l } = o;
    for (let u = 0; u < 2; u++)
      for (let a = o.stateSlot(
        s,
        u ? 2 : 1
        /* ParseState.Actions */
      ); ; a += 3) {
        if (l[a] == 65535)
          if (l[a + 1] == 1)
            a = Wt(l, a + 2);
          else {
            r == 0 && l[a + 1] == 2 && (r = this.putAction(Wt(l, a + 2), t, i, r));
            break;
          }
        l[a] == t && (r = this.putAction(Wt(l, a + 1), t, i, r));
      }
    return r;
  }
}
class Uy {
  constructor(e, t, i, r) {
    this.parser = e, this.input = t, this.ranges = r, this.recovering = 0, this.nextStackID = 9812, this.minStackPos = 0, this.reused = [], this.stoppedAt = null, this.lastBigReductionStart = -1, this.lastBigReductionSize = 0, this.bigReductionCount = 0, this.stream = new Yy(t, r), this.tokens = new Vy(e, this.stream), this.topTerm = e.top[1];
    let { from: s } = r[0];
    this.stacks = [qs.start(this, e.top[0], s)], this.fragments = i.length && this.stream.end - s > e.bufferLength * 4 ? new Ny(i, e.minRepeatTerm) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  // Move the parser forward. This will process all parse stacks at
  // `this.pos` and try to advance them to a further position. If no
  // stack for such a position is found, it'll start error-recovery.
  //
  // When the parse is finished, this will return a syntax tree. When
  // not, it returns `null`.
  advance() {
    let e = this.stacks, t = this.minStackPos, i = this.stacks = [], r, s;
    if (this.bigReductionCount > 300 && e.length == 1) {
      let [o] = e;
      for (; o.forceReduce() && o.stack.length && o.stack[o.stack.length - 2] >= this.lastBigReductionStart; )
        ;
      this.bigReductionCount = this.lastBigReductionSize = 0;
    }
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      for (; ; ) {
        if (this.tokens.mainToken = null, l.pos > t)
          i.push(l);
        else {
          if (this.advanceStack(l, i, e))
            continue;
          {
            r || (r = [], s = []), r.push(l);
            let u = this.tokens.getMainToken(l);
            s.push(u.value, u.end);
          }
        }
        break;
      }
    }
    if (!i.length) {
      let o = r && Hy(r);
      if (o)
        return Ve && console.log("Finish with " + this.stackID(o)), this.stackToTree(o);
      if (this.parser.strict)
        throw Ve && r && console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none")), new SyntaxError("No parse at " + t);
      this.recovering || (this.recovering = 5);
    }
    if (this.recovering && r) {
      let o = this.stoppedAt != null && r[0].pos > this.stoppedAt ? r[0] : this.runRecovery(r, s, i);
      if (o)
        return Ve && console.log("Force-finish " + this.stackID(o)), this.stackToTree(o.forceAll());
    }
    if (this.recovering) {
      let o = this.recovering == 1 ? 1 : this.recovering * 3;
      if (i.length > o)
        for (i.sort((l, u) => u.score - l.score); i.length > o; )
          i.pop();
      i.some((l) => l.reducePos > t) && this.recovering--;
    } else if (i.length > 1) {
      e: for (let o = 0; o < i.length - 1; o++) {
        let l = i[o];
        for (let u = o + 1; u < i.length; u++) {
          let a = i[u];
          if (l.sameState(a) || l.buffer.length > 500 && a.buffer.length > 500)
            if ((l.score - a.score || l.buffer.length - a.buffer.length) > 0)
              i.splice(u--, 1);
            else {
              i.splice(o--, 1);
              continue e;
            }
        }
      }
      i.length > 12 && (i.sort((o, l) => l.score - o.score), i.splice(
        12,
        i.length - 12
        /* Rec.MaxStackCount */
      ));
    }
    this.minStackPos = i[0].pos;
    for (let o = 1; o < i.length; o++)
      i[o].pos < this.minStackPos && (this.minStackPos = i[o].pos);
    return null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  // See if a given tree, or a descendant right at its start, can be
  // reused in the given stack.
  tryReuse(e, t, i, r) {
    if (!i)
      return null;
    let s = e.curContext && e.curContext.tracker.strict, o = s ? e.curContext.hash : 0;
    for (; i; ) {
      let l = this.parser.nodeSet.types[i.type.id] != i.type ? -1 : this.parser.getGoto(e.state, i.type.id);
      if (l > -1 && i.length && (!s || (i.prop(F.contextHash) || 0) == o))
        return e.useNode(i, l, t), i;
      if (i.children.length == 0 || i.positions[0] > 0)
        break;
      let u = i.children[0];
      if (u instanceof J && (!r || u.type.id >= this.parser.minRepeatTerm))
        i = u;
      else
        break;
    }
    return null;
  }
  // Returns an updated version of the given stack, or null if the
  // stack can't advance normally. When `split` and `stacks` are
  // given, stacks split off by ambiguous operations will be pushed to
  // `split`, or added to `stacks` if they move `pos` forward.
  advanceStack(e, t, i) {
    let r = e.pos, { parser: s } = this, o = Ve ? this.stackID(e) + " -> " : "";
    if (this.stoppedAt != null && r > this.stoppedAt)
      return e.forceReduce() ? e : null;
    if (this.fragments) {
      let a = e.reducePos < r && e.buffer.length && e.buffer[e.buffer.length - 2] <= e.reducePos && this.fragments.lastRepeatPos == e.reducePos && this.tryReuse(e, e.reducePos, this.fragments.lastRepeat, !0) || this.tryReuse(e, r, this.fragments.nodeAt(r), !1);
      if (a)
        return Ve && console.log(o + this.stackID(e) + ` (via reuse of ${s.getName(a.type.id)})`), !0;
    }
    let l = s.stateSlot(
      e.state,
      4
      /* ParseState.DefaultReduce */
    );
    if (l > 0)
      return e.reduce(l), Ve && console.log(o + this.stackID(e) + ` (via always-reduce ${s.getName(
        l & 65535
        /* Action.ValueMask */
      )})`), !0;
    if (e.stack.length >= 8400)
      for (; e.stack.length > 6e3 && e.forceReduce(); )
        ;
    let u = this.tokens.getActions(e);
    for (let a = 0; a < u.length; ) {
      let c = u[a++], h = u[a++], f = u[a++], d = a == u.length || !i, O = d ? e : e.split(), m = this.tokens.mainToken;
      if (O.apply(c, h, m ? m.start : O.pos, f), Ve && console.log(o + this.stackID(O) + ` (via ${(c & 65536) == 0 ? "shift" : `reduce of ${s.getName(
        c & 65535
        /* Action.ValueMask */
      )}`} for ${s.getName(h)} @ ${r}${O == e ? "" : ", split"})`), d)
        return !0;
      O.pos > r ? t.push(O) : i.push(O);
    }
    return !1;
  }
  // Advance a given stack forward as far as it will go. Returns the
  // (possibly updated) stack if it got stuck, or null if it moved
  // forward and was given to `pushStackDedup`.
  advanceFully(e, t) {
    let i = e.pos;
    for (; ; ) {
      if (!this.advanceStack(e, null, null))
        return !1;
      if (e.pos > i)
        return Of(e, t), !0;
    }
  }
  runRecovery(e, t, i) {
    let r = null, s = !1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o], u = t[o << 1], a = t[(o << 1) + 1], c = Ve ? this.stackID(l) + " -> " : "";
      if (l.deadEnd && (s || (s = !0, l.restart(), Ve && console.log(c + this.stackID(l) + " (restarted)"), this.advanceFully(l, i))))
        continue;
      let h = l.split(), f = c;
      for (let d = 0; d < 10 && h.forceReduce() && (Ve && console.log(f + this.stackID(h) + " (via force-reduce)"), !this.advanceFully(h, i)); d++)
        Ve && (f = this.stackID(h) + " -> ");
      for (let d of l.recoverByInsert(u))
        Ve && console.log(c + this.stackID(d) + " (via recover-insert)"), this.advanceFully(d, i);
      this.stream.end > l.pos ? (a == l.pos && (a++, u = 0), l.recoverByDelete(u, a), Ve && console.log(c + this.stackID(l) + ` (via recover-delete ${this.parser.getName(u)})`), Of(l, i)) : (!r || r.score < h.score) && (r = h);
    }
    return r;
  }
  // Convert the stack's buffer to a syntax tree.
  stackToTree(e) {
    return e.close(), J.build({
      buffer: Fs.create(e),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: e.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(e) {
    let t = (bl || (bl = /* @__PURE__ */ new WeakMap())).get(e);
    return t || bl.set(e, t = String.fromCodePoint(this.nextStackID++)), t + e;
  }
}
function Of(n, e) {
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    if (i.pos == n.pos && i.sameState(n)) {
      e[t].score < n.score && (e[t] = n);
      return;
    }
  }
  e.push(n);
}
class Gy {
  constructor(e, t, i) {
    this.source = e, this.flags = t, this.disabled = i;
  }
  allows(e) {
    return !this.disabled || this.disabled[e] == 0;
  }
}
const xl = (n) => n;
class np {
  /**
  Define a context tracker.
  */
  constructor(e) {
    this.start = e.start, this.shift = e.shift || xl, this.reduce = e.reduce || xl, this.reuse = e.reuse || xl, this.hash = e.hash || (() => 0), this.strict = e.strict !== !1;
  }
}
class ki extends sa {
  /**
  @internal
  */
  constructor(e) {
    if (super(), this.wrappers = [], e.version != 14)
      throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (14)`);
    let t = e.nodeNames.split(" ");
    this.minRepeatTerm = t.length;
    for (let l = 0; l < e.repeatNodeCount; l++)
      t.push("");
    let i = Object.keys(e.topRules).map((l) => e.topRules[l][1]), r = [];
    for (let l = 0; l < t.length; l++)
      r.push([]);
    function s(l, u, a) {
      r[l].push([u, u.deserialize(String(a))]);
    }
    if (e.nodeProps)
      for (let l of e.nodeProps) {
        let u = l[0];
        typeof u == "string" && (u = F[u]);
        for (let a = 1; a < l.length; ) {
          let c = l[a++];
          if (c >= 0)
            s(c, u, l[a++]);
          else {
            let h = l[a + -c];
            for (let f = -c; f > 0; f--)
              s(l[a++], u, h);
            a++;
          }
        }
      }
    this.nodeSet = new _r(t.map((l, u) => ke.define({
      name: u >= this.minRepeatTerm ? void 0 : l,
      id: u,
      props: r[u],
      top: i.indexOf(u) > -1,
      error: u == 0,
      skipped: e.skippedNodes && e.skippedNodes.indexOf(u) > -1
    }))), e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)), this.strict = !1, this.bufferLength = z0;
    let o = Yi(e.tokenData);
    this.context = e.context, this.specializerSpecs = e.specialized || [], this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let l = 0; l < this.specializerSpecs.length; l++)
      this.specialized[l] = this.specializerSpecs[l].term;
    this.specializers = this.specializerSpecs.map(pf), this.states = Yi(e.states, Uint32Array), this.data = Yi(e.stateData), this.goto = Yi(e.goto), this.maxTerm = e.maxTerm, this.tokenizers = e.tokenizers.map((l) => typeof l == "number" ? new si(o, l) : l), this.topRules = e.topRules, this.dialects = e.dialects || {}, this.dynamicPrecedences = e.dynamicPrecedences || null, this.tokenPrecTable = e.tokenPrec, this.termNames = e.termNames || null, this.maxNode = this.nodeSet.types.length - 1, this.dialect = this.parseDialect(), this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(e, t, i) {
    let r = new Uy(this, e, t, i);
    for (let s of this.wrappers)
      r = s(r, e, t, i);
    return r;
  }
  /**
  Get a goto table entry @internal
  */
  getGoto(e, t, i = !1) {
    let r = this.goto;
    if (t >= r[0])
      return -1;
    for (let s = r[t + 1]; ; ) {
      let o = r[s++], l = o & 1, u = r[s++];
      if (l && i)
        return u;
      for (let a = s + (o >> 1); s < a; s++)
        if (r[s] == e)
          return u;
      if (l)
        return -1;
    }
  }
  /**
  Check if this state has an action for a given terminal @internal
  */
  hasAction(e, t) {
    let i = this.data;
    for (let r = 0; r < 2; r++)
      for (let s = this.stateSlot(
        e,
        r ? 2 : 1
        /* ParseState.Actions */
      ), o; ; s += 3) {
        if ((o = i[s]) == 65535)
          if (i[s + 1] == 1)
            o = i[s = Wt(i, s + 2)];
          else {
            if (i[s + 1] == 2)
              return Wt(i, s + 2);
            break;
          }
        if (o == t || o == 0)
          return Wt(i, s + 1);
      }
    return 0;
  }
  /**
  @internal
  */
  stateSlot(e, t) {
    return this.states[e * 6 + t];
  }
  /**
  @internal
  */
  stateFlag(e, t) {
    return (this.stateSlot(
      e,
      0
      /* ParseState.Flags */
    ) & t) > 0;
  }
  /**
  @internal
  */
  validAction(e, t) {
    return !!this.allActions(e, (i) => i == t ? !0 : null);
  }
  /**
  @internal
  */
  allActions(e, t) {
    let i = this.stateSlot(
      e,
      4
      /* ParseState.DefaultReduce */
    ), r = i ? t(i) : void 0;
    for (let s = this.stateSlot(
      e,
      1
      /* ParseState.Actions */
    ); r == null; s += 3) {
      if (this.data[s] == 65535)
        if (this.data[s + 1] == 1)
          s = Wt(this.data, s + 2);
        else
          break;
      r = t(Wt(this.data, s + 1));
    }
    return r;
  }
  /**
  Get the states that can follow this one through shift actions or
  goto jumps. @internal
  */
  nextStates(e) {
    let t = [];
    for (let i = this.stateSlot(
      e,
      1
      /* ParseState.Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535)
        if (this.data[i + 1] == 1)
          i = Wt(this.data, i + 2);
        else
          break;
      if ((this.data[i + 2] & 1) == 0) {
        let r = this.data[i + 1];
        t.some((s, o) => o & 1 && s == r) || t.push(this.data[i], r);
      }
    }
    return t;
  }
  /**
  Configure the parser. Returns a new parser instance that has the
  given settings modified. Settings not provided in `config` are
  kept from the original parser.
  */
  configure(e) {
    let t = Object.assign(Object.create(ki.prototype), this);
    if (e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top) {
      let i = this.topRules[e.top];
      if (!i)
        throw new RangeError(`Invalid top rule name ${e.top}`);
      t.top = i;
    }
    return e.tokenizers && (t.tokenizers = this.tokenizers.map((i) => {
      let r = e.tokenizers.find((s) => s.from == i);
      return r ? r.to : i;
    })), e.specializers && (t.specializers = this.specializers.slice(), t.specializerSpecs = this.specializerSpecs.map((i, r) => {
      let s = e.specializers.find((l) => l.from == i.external);
      if (!s)
        return i;
      let o = Object.assign(Object.assign({}, i), { external: s.to });
      return t.specializers[r] = pf(o), o;
    })), e.contextTracker && (t.context = e.contextTracker), e.dialect && (t.dialect = this.parseDialect(e.dialect)), e.strict != null && (t.strict = e.strict), e.wrap && (t.wrappers = t.wrappers.concat(e.wrap)), e.bufferLength != null && (t.bufferLength = e.bufferLength), t;
  }
  /**
  Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
  are registered for this parser.
  */
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  /**
  Returns the name associated with a given term. This will only
  work for all terms when the parser was generated with the
  `--names` option. By default, only the names of tagged terms are
  stored.
  */
  getName(e) {
    return this.termNames ? this.termNames[e] : String(e <= this.maxNode && this.nodeSet.types[e].name || e);
  }
  /**
  The eof term id is always allocated directly after the node
  types. @internal
  */
  get eofTerm() {
    return this.maxNode + 1;
  }
  /**
  The type of top node produced by the parser.
  */
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  /**
  @internal
  */
  dynamicPrecedence(e) {
    let t = this.dynamicPrecedences;
    return t == null ? 0 : t[e] || 0;
  }
  /**
  @internal
  */
  parseDialect(e) {
    let t = Object.keys(this.dialects), i = t.map(() => !1);
    if (e)
      for (let s of e.split(" ")) {
        let o = t.indexOf(s);
        o >= 0 && (i[o] = !0);
      }
    let r = null;
    for (let s = 0; s < t.length; s++)
      if (!i[s])
        for (let o = this.dialects[t[s]], l; (l = this.data[o++]) != 65535; )
          (r || (r = new Uint8Array(this.maxTerm + 1)))[l] = 1;
    return new Gy(e, i, r);
  }
  /**
  Used by the output of the parser generator. Not available to
  user code. @hide
  */
  static deserialize(e) {
    return new ki(e);
  }
}
function Wt(n, e) {
  return n[e] | n[e + 1] << 16;
}
function Hy(n) {
  let e = null;
  for (let t of n) {
    let i = t.p.stoppedAt;
    (t.pos == t.p.stream.end || i != null && t.pos > i) && t.p.parser.stateFlag(
      t.state,
      2
      /* StateFlag.Accepting */
    ) && (!e || e.score < t.score) && (e = t);
  }
  return e;
}
function pf(n) {
  if (n.external) {
    let e = n.extend ? 1 : 0;
    return (t, i) => n.external(t, i) << 1 | e;
  }
  return n.get;
}
const Ky = 55, Jy = 1, e3 = 56, t3 = 2, n3 = 57, i3 = 3, mf = 4, r3 = 5, ka = 6, ip = 7, rp = 8, sp = 9, op = 10, s3 = 11, o3 = 12, l3 = 13, kl = 58, u3 = 14, a3 = 15, gf = 59, lp = 21, c3 = 23, up = 24, h3 = 25, Pu = 27, ap = 28, f3 = 29, d3 = 32, O3 = 35, p3 = 37, m3 = 38, g3 = 0, b3 = 1, x3 = {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  command: !0,
  embed: !0,
  frame: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0,
  menuitem: !0
}, k3 = {
  dd: !0,
  li: !0,
  optgroup: !0,
  option: !0,
  p: !0,
  rp: !0,
  rt: !0,
  tbody: !0,
  td: !0,
  tfoot: !0,
  th: !0,
  tr: !0
}, bf = {
  dd: { dd: !0, dt: !0 },
  dt: { dd: !0, dt: !0 },
  li: { li: !0 },
  option: { option: !0, optgroup: !0 },
  optgroup: { optgroup: !0 },
  p: {
    address: !0,
    article: !0,
    aside: !0,
    blockquote: !0,
    dir: !0,
    div: !0,
    dl: !0,
    fieldset: !0,
    footer: !0,
    form: !0,
    h1: !0,
    h2: !0,
    h3: !0,
    h4: !0,
    h5: !0,
    h6: !0,
    header: !0,
    hgroup: !0,
    hr: !0,
    menu: !0,
    nav: !0,
    ol: !0,
    p: !0,
    pre: !0,
    section: !0,
    table: !0,
    ul: !0
  },
  rp: { rp: !0, rt: !0 },
  rt: { rp: !0, rt: !0 },
  tbody: { tbody: !0, tfoot: !0 },
  td: { td: !0, th: !0 },
  tfoot: { tbody: !0 },
  th: { td: !0, th: !0 },
  thead: { tbody: !0, tfoot: !0 },
  tr: { tr: !0 }
};
function S3(n) {
  return n == 45 || n == 46 || n == 58 || n >= 65 && n <= 90 || n == 95 || n >= 97 && n <= 122 || n >= 161;
}
let xf = null, kf = null, Sf = 0;
function vu(n, e) {
  let t = n.pos + e;
  if (Sf == t && kf == n) return xf;
  let i = n.peek(e), r = "";
  for (; S3(i); )
    r += String.fromCharCode(i), i = n.peek(++e);
  return kf = n, Sf = t, xf = r ? r.toLowerCase() : i == y3 || i == Q3 ? void 0 : null;
}
const cp = 60, Ws = 62, Sa = 47, y3 = 63, Q3 = 33, w3 = 45;
function yf(n, e) {
  this.name = n, this.parent = e;
}
const $3 = [ka, op, ip, rp, sp], P3 = new np({
  start: null,
  shift(n, e, t, i) {
    return $3.indexOf(e) > -1 ? new yf(vu(i, 1) || "", n) : n;
  },
  reduce(n, e) {
    return e == lp && n ? n.parent : n;
  },
  reuse(n, e, t, i) {
    let r = e.type.id;
    return r == ka || r == p3 ? new yf(vu(i, 1) || "", n) : n;
  },
  strict: !1
}), v3 = new nt((n, e) => {
  if (n.next != cp) {
    n.next < 0 && e.context && n.acceptToken(kl);
    return;
  }
  n.advance();
  let t = n.next == Sa;
  t && n.advance();
  let i = vu(n, 0);
  if (i === void 0) return;
  if (!i) return n.acceptToken(t ? a3 : u3);
  let r = e.context ? e.context.name : null;
  if (t) {
    if (i == r) return n.acceptToken(s3);
    if (r && k3[r]) return n.acceptToken(kl, -2);
    if (e.dialectEnabled(g3)) return n.acceptToken(o3);
    for (let s = e.context; s; s = s.parent) if (s.name == i) return;
    n.acceptToken(l3);
  } else {
    if (i == "script") return n.acceptToken(ip);
    if (i == "style") return n.acceptToken(rp);
    if (i == "textarea") return n.acceptToken(sp);
    if (x3.hasOwnProperty(i)) return n.acceptToken(op);
    r && bf[r] && bf[r][i] ? n.acceptToken(kl, -1) : n.acceptToken(ka);
  }
}, { contextual: !0 }), _3 = new nt((n) => {
  for (let e = 0, t = 0; ; t++) {
    if (n.next < 0) {
      t && n.acceptToken(gf);
      break;
    }
    if (n.next == w3)
      e++;
    else if (n.next == Ws && e >= 2) {
      t >= 3 && n.acceptToken(gf, -2);
      break;
    } else
      e = 0;
    n.advance();
  }
});
function A3(n) {
  for (; n; n = n.parent)
    if (n.name == "svg" || n.name == "math") return !0;
  return !1;
}
const C3 = new nt((n, e) => {
  if (n.next == Sa && n.peek(1) == Ws) {
    let t = e.dialectEnabled(b3) || A3(e.context);
    n.acceptToken(t ? r3 : mf, 2);
  } else n.next == Ws && n.acceptToken(mf, 1);
});
function ya(n, e, t) {
  let i = 2 + n.length;
  return new nt((r) => {
    for (let s = 0, o = 0, l = 0; ; l++) {
      if (r.next < 0) {
        l && r.acceptToken(e);
        break;
      }
      if (s == 0 && r.next == cp || s == 1 && r.next == Sa || s >= 2 && s < i && r.next == n.charCodeAt(s - 2))
        s++, o++;
      else if (s == i && r.next == Ws) {
        l > o ? r.acceptToken(e, -o) : r.acceptToken(t, -(o - 2));
        break;
      } else if ((r.next == 10 || r.next == 13) && l) {
        r.acceptToken(e, 1);
        break;
      } else
        s = o = 0;
      r.advance();
    }
  });
}
const T3 = ya("script", Ky, Jy), E3 = ya("style", e3, t3), X3 = ya("textarea", n3, i3), Z3 = Qi({
  "Text RawText IncompleteTag IncompleteCloseTag": x.content,
  "StartTag StartCloseTag SelfClosingEndTag EndTag": x.angleBracket,
  TagName: x.tagName,
  "MismatchedCloseTag/TagName": [x.tagName, x.invalid],
  AttributeName: x.attributeName,
  "AttributeValue UnquotedAttributeValue": x.attributeValue,
  Is: x.definitionOperator,
  "EntityReference CharacterReference": x.character,
  Comment: x.blockComment,
  ProcessingInst: x.processingInstruction,
  DoctypeDecl: x.documentMeta
}), D3 = ki.deserialize({
  version: 14,
  states: ",xOVO!rOOO!ZQ#tO'#CrO!`Q#tO'#C{O!eQ#tO'#DOO!jQ#tO'#DRO!oQ#tO'#DTO!tOaO'#CqO#PObO'#CqO#[OdO'#CqO$kO!rO'#CqOOO`'#Cq'#CqO$rO$fO'#DUO$zQ#tO'#DWO%PQ#tO'#DXOOO`'#Dl'#DlOOO`'#DZ'#DZQVO!rOOO%UQ&rO,59^O%aQ&rO,59gO%lQ&rO,59jO%wQ&rO,59mO&SQ&rO,59oOOOa'#D_'#D_O&_OaO'#CyO&jOaO,59]OOOb'#D`'#D`O&rObO'#C|O&}ObO,59]OOOd'#Da'#DaO'VOdO'#DPO'bOdO,59]OOO`'#Db'#DbO'jO!rO,59]O'qQ#tO'#DSOOO`,59],59]OOOp'#Dc'#DcO'vO$fO,59pOOO`,59p,59pO(OQ#|O,59rO(TQ#|O,59sOOO`-E7X-E7XO(YQ&rO'#CtOOQW'#D['#D[O(hQ&rO1G.xOOOa1G.x1G.xOOO`1G/Z1G/ZO(sQ&rO1G/ROOOb1G/R1G/RO)OQ&rO1G/UOOOd1G/U1G/UO)ZQ&rO1G/XOOO`1G/X1G/XO)fQ&rO1G/ZOOOa-E7]-E7]O)qQ#tO'#CzOOO`1G.w1G.wOOOb-E7^-E7^O)vQ#tO'#C}OOOd-E7_-E7_O){Q#tO'#DQOOO`-E7`-E7`O*QQ#|O,59nOOOp-E7a-E7aOOO`1G/[1G/[OOO`1G/^1G/^OOO`1G/_1G/_O*VQ,UO,59`OOQW-E7Y-E7YOOOa7+$d7+$dOOO`7+$u7+$uOOOb7+$m7+$mOOOd7+$p7+$pOOO`7+$s7+$sO*bQ#|O,59fO*gQ#|O,59iO*lQ#|O,59lOOO`1G/Y1G/YO*qO7[O'#CwO+SOMhO'#CwOOQW1G.z1G.zOOO`1G/Q1G/QOOO`1G/T1G/TOOO`1G/W1G/WOOOO'#D]'#D]O+eO7[O,59cOOQW,59c,59cOOOO'#D^'#D^O+vOMhO,59cOOOO-E7Z-E7ZOOQW1G.}1G.}OOOO-E7[-E7[",
  stateData: ",c~O!_OS~OUSOVPOWQOXROYTO[]O][O^^O_^Oa^Ob^Oc^Od^Oy^O|_O!eZO~OgaO~OgbO~OgcO~OgdO~OgeO~O!XfOPmP![mP~O!YiOQpP![pP~O!ZlORsP![sP~OUSOVPOWQOXROYTOZqO[]O][O^^O_^Oa^Ob^Oc^Od^Oy^O!eZO~O![rO~P#gO!]sO!fuO~OgvO~OgwO~OS|OT}OiyO~OS!POT}OiyO~OS!ROT}OiyO~OS!TOT}OiyO~OS}OT}OiyO~O!XfOPmX![mX~OP!WO![!XO~O!YiOQpX![pX~OQ!ZO![!XO~O!ZlORsX![sX~OR!]O![!XO~O![!XO~P#gOg!_O~O!]sO!f!aO~OS!bO~OS!cO~Oj!dOShXThXihX~OS!fOT!gOiyO~OS!hOT!gOiyO~OS!iOT!gOiyO~OS!jOT!gOiyO~OS!gOT!gOiyO~Og!kO~Og!lO~Og!mO~OS!nO~Ol!qO!a!oO!c!pO~OS!rO~OS!sO~OS!tO~Ob!uOc!uOd!uO!a!wO!b!uO~Ob!xOc!xOd!xO!c!wO!d!xO~Ob!uOc!uOd!uO!a!{O!b!uO~Ob!xOc!xOd!xO!c!{O!d!xO~OT~cbd!ey|!e~",
  goto: "%q!aPPPPPPPPPPPPPPPPPPPPP!b!hP!nPP!zP!}#Q#T#Z#^#a#g#j#m#s#y!bP!b!bP$P$V$m$s$y%P%V%]%cPPPPPPPP%iX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
  nodeNames: "⚠ StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
  maxTerm: 68,
  context: P3,
  nodeProps: [
    ["closedBy", -10, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, "EndTag", 6, "EndTag SelfClosingEndTag", -4, 22, 31, 34, 37, "CloseTag"],
    ["openedBy", 4, "StartTag StartCloseTag", 5, "StartTag", -4, 30, 33, 36, 38, "OpenTag"],
    ["group", -10, 14, 15, 18, 19, 20, 21, 40, 41, 42, 43, "Entity", 17, "Entity TextContent", -3, 29, 32, 35, "TextContent Entity"],
    ["isolate", -11, 22, 30, 31, 33, 34, 36, 37, 38, 39, 42, 43, "ltr", -3, 27, 28, 40, ""]
  ],
  propSources: [Z3],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|caPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bXaP!b`!dpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UVaP!dpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pTaPOv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!dpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({WaP!b`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!b`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!b`!dpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYlWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]`aP!b`!dp!_^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljiSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebiSlWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXiSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vciSaP!b`!dpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!ahaP!dpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WiiSlWd!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zblWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOb!R!R7tP;=`<%l7S!Z8OYlWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{iiSlWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbiSlWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QciSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXiSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhiSlWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TalWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOc!R!RAwP;=`<%lAY!ZBRYlWc!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhiSlWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbiSlWc!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbiSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXiSc!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!cxaP!b`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYliSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_kiSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_XaP!b`!dp!fQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZiSgQaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!b`!dpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!b`!dpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!b`!dpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!b`!dp!ePOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!b`!dpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!b`!dpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!b`!dpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!b`!dpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!b`!dpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!b`!dpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!b`!dpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!dpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO|PP!-nP;=`<%l!-Sq!-xS!dp|POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!b`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!b`|POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!b`!dp|POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!b`!dpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!b`!dpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!b`!dpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!b`!dpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!b`!dpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!b`!dpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!b`!dpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!dpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOyPP!7TP;=`<%l!6Vq!7]V!dpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!dpyPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!b`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!b`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!b`yPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!b`!dpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!b`!dpyPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXjSaP!b`!dpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",
  tokenizers: [T3, E3, X3, C3, v3, _3, 0, 1, 2, 3, 4, 5],
  topRules: { Document: [0, 16] },
  dialects: { noMatch: 0, selfClosing: 515 },
  tokenPrec: 517
});
function hp(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let i of n.getChildren(up)) {
    let r = i.getChild(h3), s = i.getChild(Pu) || i.getChild(ap);
    r && (t[e.read(r.from, r.to)] = s ? s.type.id == Pu ? e.read(s.from + 1, s.to - 1) : e.read(s.from, s.to) : "");
  }
  return t;
}
function Qf(n, e) {
  let t = n.getChild(c3);
  return t ? e.read(t.from, t.to) : " ";
}
function Sl(n, e, t) {
  let i;
  for (let r of t)
    if (!r.attrs || r.attrs(i || (i = hp(n.node.parent.firstChild, e))))
      return { parser: r.parser, bracketed: !0 };
  return null;
}
function fp(n = [], e = []) {
  let t = [], i = [], r = [], s = [];
  for (let l of n)
    (l.tag == "script" ? t : l.tag == "style" ? i : l.tag == "textarea" ? r : s).push(l);
  let o = e.length ? /* @__PURE__ */ Object.create(null) : null;
  for (let l of e) (o[l.name] || (o[l.name] = [])).push(l);
  return Y0((l, u) => {
    let a = l.type.id;
    if (a == f3) return Sl(l, u, t);
    if (a == d3) return Sl(l, u, i);
    if (a == O3) return Sl(l, u, r);
    if (a == lp && s.length) {
      let c = l.node, h = c.firstChild, f = h && Qf(h, u), d;
      if (f) {
        for (let O of s)
          if (O.tag == f && (!O.attrs || O.attrs(d || (d = hp(h, u))))) {
            let m = c.lastChild, g = m.type.id == m3 ? m.from : c.to;
            if (g > h.to)
              return { parser: O.parser, overlay: [{ from: h.to, to: g }] };
          }
      }
    }
    if (o && a == up) {
      let c = l.node, h;
      if (h = c.firstChild) {
        let f = o[u.read(h.from, h.to)];
        if (f) for (let d of f) {
          if (d.tagName && d.tagName != Qf(c.parent, u)) continue;
          let O = c.lastChild;
          if (O.type.id == Pu) {
            let m = O.from + 1, g = O.lastChild, b = O.to - (g && g.isError ? 0 : 1);
            if (b > m) return { parser: d.parser, overlay: [{ from: m, to: b }], bracketed: !0 };
          } else if (O.type.id == ap)
            return { parser: d.parser, overlay: [{ from: O.from, to: O.to }] };
        }
      }
    }
    return null;
  });
}
const R3 = 148, wf = 1, M3 = 149, L3 = 150, dp = 2, j3 = 151, z3 = 3, I3 = 4, B3 = 152, Op = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], q3 = 58, F3 = 40, pp = 95, Y3 = 91, xs = 45, W3 = 46, N3 = 35, V3 = 37, U3 = 38, G3 = 92, H3 = 10, K3 = 42;
function xr(n) {
  return n >= 65 && n <= 90 || n >= 97 && n <= 122 || n >= 161;
}
function Qa(n) {
  return n >= 48 && n <= 57;
}
function $f(n) {
  return Qa(n) || n >= 97 && n <= 102 || n >= 65 && n <= 70;
}
const mp = (n, e, t) => (i, r) => {
  for (let s = !1, o = 0, l = 0; ; l++) {
    let { next: u } = i;
    if (xr(u) || u == xs || u == pp || s && Qa(u))
      !s && (u != xs || l > 0) && (s = !0), o === l && u == xs && o++, i.advance();
    else if (u == G3 && i.peek(1) != H3) {
      if (i.advance(), $f(i.next)) {
        do
          i.advance();
        while ($f(i.next));
        i.next == 32 && i.advance();
      } else i.next > -1 && i.advance();
      s = !0;
    } else {
      s && i.acceptToken(
        o >= 2 && r.canShift(dp) ? e : u == F3 ? t : n
      );
      break;
    }
  }
}, J3 = new nt(
  mp(M3, dp, L3),
  { contextual: !0 }
), eQ = new nt(
  mp(j3, z3, I3),
  { contextual: !0 }
), tQ = new nt((n) => {
  if (Op.includes(n.peek(-1))) {
    let { next: e } = n;
    (xr(e) || e == pp || e == N3 || e == W3 || e == K3 || e == Y3 || e == q3 && xr(n.peek(1)) || e == xs || e == U3) && n.acceptToken(R3);
  }
}), nQ = new nt((n) => {
  if (!Op.includes(n.peek(-1))) {
    let { next: e } = n;
    if (e == V3 && (n.advance(), n.acceptToken(wf)), xr(e)) {
      do
        n.advance();
      while (xr(n.next) || Qa(n.next));
      n.acceptToken(wf);
    }
  }
});
function Pf(n) {
  let e = n.length;
  return (e == 4 || e == 5 || e == 7 || e == 9) && /^#[a-f\d]+$/i.test(n) ? B3 : -1;
}
const iQ = Qi({
  "AtKeyword import charset namespace keyframes media supports font-feature-values": x.definitionKeyword,
  "from to selector scope MatchFlag": x.keyword,
  NamespaceName: x.namespace,
  KeyframeName: x.labelName,
  KeyframeRangeName: x.operatorKeyword,
  TagName: x.tagName,
  ClassName: x.className,
  PseudoClassName: x.constant(x.className),
  IdName: x.labelName,
  "FeatureName PropertyName": x.propertyName,
  AttributeName: x.attributeName,
  NumberLiteral: x.number,
  KeywordQuery: x.keyword,
  UnaryQueryOp: x.operatorKeyword,
  "CallTag ValueName FontName": x.atom,
  VariableName: x.variableName,
  Callee: x.operatorKeyword,
  Unit: x.unit,
  "UniversalSelector NestingSelector": x.definitionOperator,
  "MatchOp CompareOp": x.compareOperator,
  "ChildOp SiblingOp, LogicOp": x.logicOperator,
  BinOp: x.arithmeticOperator,
  Important: x.modifier,
  Comment: x.blockComment,
  ColorLiteral: x.color,
  "ParenthesizedContent StringLiteral": x.string,
  ":": x.punctuation,
  PseudoOp: x.derefOperator,
  "; , |": x.separator,
  "( )": x.paren,
  "[ ]": x.squareBracket,
  "{ }": x.brace
}), rQ = { __proto__: null, lang: 44, "nth-child": 44, "nth-last-child": 44, "nth-of-type": 44, "nth-last-of-type": 44, dir: 44, "host-context": 44, if: 88, url: 158, "url-prefix": 158, domain: 158, regexp: 158 }, sQ = { __proto__: null, or: 102, and: 102, not: 112, only: 112, layer: 212 }, oQ = { __proto__: null, selector: 118, style: 124, layer: 208 }, lQ = { __proto__: null, "@import": 204, "@media": 216, "@charset": 220, "@namespace": 224, "@keyframes": 230, "@supports": 242, "@scope": 246, "@font-feature-values": 252 }, uQ = { __proto__: null, to: 249 }, aQ = ki.deserialize({
  version: 14,
  states: "MrQYQdOOO$TQdOOP$[O`OOO%XQaO'#CfOOQP'#Ce'#CeO%`QdO'#CgO%eQ`O'#CgO%jQaO'#FrO&eQdO'#CkO'XQaO'#CcO'cQdO'#CnOOQP'#ES'#ESOOQP'#ER'#ERO'nQdO'#ETO'yQdO'#E[O'yQdO'#E_OOQP'#Fr'#FrO)`QhO'#FQOOQS'#Fq'#FqOOQS'#FT'#FTQYQdOOO)gQdO'#EeO*vQhO'#EkO)gQdO'#EmO*}QdO'#EoO+YQdO'#ErO*[QhO'#ExO+bQdO'#EzO+mQdO'#E}O+rQaO'#CfO+yQ`O'#EbO,OQ`O'#GPO,ZQdO'#GPQOQ`OOP,eO&jO'#CaPOOO)CAa)CAaOOQP'#Ci'#CiOOQP,59R,59RO%`QdO,59ROOQP'#Cm'#CmOOQP,59V,59VO&eQdO,59VO,pQdO,59YOOQP,5:m,5:mO'nQdO,5:oO'yQdO,5:vO'yQdO,5:xO'yQdO,5:yO'yQdO'#F[O,{Q`O,58}O-TQdO'#EaOOQS,58},58}OOQP'#Cq'#CqOOQO'#EP'#EPOOQP,59Y,59YO-[Q`O,59YO-aQ`O,59YO-fQpO'#EUO-qQdO'#EVO-vQ`O'#EVO-{QpO,5:oO.iQaO,5:vO/PQaO,5:yOOQW'#D]'#D]O0OQhO'#DgO0cQhO,5;lO*[QhO'#DeO0pQ`O'#DnO0uQhO'#D{OOQW'#Fx'#FxOOQS,5;l,5;lO0zQ`O'#DhO1PQ`O'#DkOOQS-E9R-E9ROOQ['#Cv'#CvO1UQdO'#CwO1iQdO'#C|O1|QdO'#DPOOQ['#DQ'#DQO2aQ!pO'#DRO4jQ!jO,5;POOQO'#DW'#DWO-aQ`O'#DVO4zQ!nO'#FuO6}Q`O'#DXO7SQ`O'#D|OOQ['#Fu'#FuO7XQhO'#GSO7gQ`O,5;VO7lQ!bO,5;XOOQS'#Eq'#EqO7tQ`O,5;ZO7yQdO,5;ZOOQO'#Et'#EtO8RQ`O,5;^O8WQhO,5;dO'yQdO'#DjOOQS,5;f,5;fO0zQ`O,5;fO8`QdO,5;fOOQS'#Fc'#FcO8hQdO'#FPO7gQ`O,5;iO8pQdO,5:|O9QQdO'#F^O9_Q`O,5<kO9_Q`O,5<kPOOO'#FS'#FSP9jO&jO,58{POOO,58{,58{OOQP1G.m1G.mOOQP1G.q1G.qOOQP1G.t1G.tO-[Q`O1G.tO-aQ`O1G.tO9uQpO1G0ZO9}QaO1G0bO:eQaO1G0dO:{QaO1G0eO;cQaO,5;vOOQO-E9Y-E9YOOQS1G.i1G.iO;mQ`O,5:{O;rQdO'#EQO;yQdO'#CuOOQO'#EX'#EXOOQO,5:q,5:qO-qQdO,5:qOOQP1G0Z1G0ZO)gQdO1G0ZO<QQ!jO'#D]O<`Q!bO,59xO<hQhO,5:ROOQO'#Dc'#DcOOQO'#Fy'#FyO<cQ!bO,59|O<pQhO'#FdO*[QhO,59zO*[QhO'#FdO=hQhO1G1WOOQS1G1W1G1WO=rQhO,5:PO>mQhO'#DoOOQW,5:Y,5:YOOQW,5:g,5:gOOQW,5:S,5:SO>wQhO,5:VO?cQ!fO'#FvOOQS'#Fv'#FvOOQS'#FV'#FVO@pQdO,59cOOQ[,59c,59cOATQdO,59hOOQ[,59h,59hOAhQdO,59kOOQ[,59k,59kOOQ[,59m,59mO)gQdO,59oOA{QhO'#EgOOQW'#Eg'#EgOBjQ`O1G0kO4sQhO1G0kOOQ[,59q,59qO*[QhO'#DZOOQ[,59s,59sOBoQ#tO,5:hOBzQhO'#F`OCXQ`O,5<nOOQS1G0q1G0qOOQS1G0s1G0sOOQS1G0u1G0uOCdQ`O1G0uOCiQdO'#EuOOQS1G0x1G0xOOQS1G1O1G1OOCtQaO,5:UO7gQ`O1G1QOOQS1G1Q1G1QO0zQ`O1G1QOOQS-E9a-E9aOOQS1G1T1G1TOC{Q!fO1G0hODcQ`O'#EdOOQO1G0h1G0hOOQO,5;x,5;xODhQdO,5;xOOQO-E9[-E9[ODuQ`O1G2VPOOO-E9Q-E9QPOOO1G.g1G.gOOQP7+$`7+$`OOQP7+%u7+%uO)gQdO7+%uOOQS1G0g1G0gOEQQaO'#F}OE[Q`O,5:lOEaQ!fO'#FUOF_QdO'#FtOFiQ`O,59aOOQO1G0]1G0]OFnQ!bO7+%uO)gQdO1G/dOFyQhO1G/hOOQW1G/m1G/mOOQW1G/f1G/fOG[QhO,5<OOOQW-E9b-E9bOOQS7+&r7+&rOHSQhO'#D]OHbQhO'#F|OHmQ`O'#F|OHrQ`O,5:ZOHwQ!bO'#D_O>wQhO'#DmOISQhO'#DsOI[QhO'#DuOIaQ!jO'#F{OOQO'#F{'#F{OIlQ`O'#DxOItQ!bO'#DzOOQO'#Fz'#FzOIyQ`O1G/qOOQS-E9T-E9TOOQ[1G.}1G.}OOQ[1G/S1G/SOOQ[1G/V1G/VOOQ[1G/Z1G/ZOJOQdO,5;ROOQS7+&V7+&VOJTQ`O7+&VOJYQhO'#D[OJbQ`O,59uO*[QhO,59uOOQ[1G0S1G0SOJjQ`O1G0SOJoQhO,5;zOOQO-E9^-E9^OOQS7+&a7+&aOJ}QbO'#DROOQO'#Ew'#EwOK]Q`O'#EvOOQO'#Ev'#EvOKhQ`O'#FaOKpQdO,5;aOOQS,5;a,5;aOOQ[1G/p1G/pOOQS7+&l7+&lO7gQ`O7+&lOK{Q!fO'#F]O)gQdO'#F]OMSQdO7+&SOOQO7+&S7+&SOOQO,5;O,5;OOOQO1G1d1G1dOMgQ!bO<<IaOMrQdO'#FZOM|Q`O,5<iOOQP1G0W1G0WOOQS-E9S-E9SONUQdO'#FYON`Q`O,5<`OOQ]1G.{1G.{OOQP<<Ia<<IaONhQ`O<<IaONmQdO7+%OOOQO'#D_'#D_ONtQ!bO7+%SON|QhO'#FXO! ZQ`O,5<hO)gQdO,5<hOOQW1G/u1G/uO! cQ`O,5:XO>wQhO'#DtOOQO,5:_,5:_O! hQhO,5:aO! pQhO,5:fO)gQdO,5:dOOQW7+%]7+%]OOQO'#Ei'#EiO! wQ`O1G0mOOQS<<Iq<<IqO)gQdO,59vO!!kQhO1G/aOOQ[1G/a1G/aO!!rQ`O1G/aOOQW-E9U-E9UOOQ[7+%n7+%nOOQO,5;b,5;bOClQdO'#FbOKhQ`O,5;{OOQS,5;{,5;{OOQS-E9_-E9_OOQS1G0{1G0{OOQS<<JW<<JWO!!zQ!fO,5;wOOQS-E9Z-E9ZOOQO<<In<<InOOQPAN>{AN>{O!$RQ`OAN>{O!$WQaO,5;uOOQO-E9X-E9XO!$bQdO,5;tOOQO-E9W-E9WOOQW<<Hj<<HjOOQW<<Hn<<HnO!$lQhO<<HnO!$}QhO'#D]O!%]QhO,5;sO!%hQ`O,5;sOOQO-E9V-E9VO!%mQdO1G2SO!%wQhO1G/sO!&PQ`O,5:`O>wQhO'#DwOOQO1G/{1G/{O!&UQ!bO1G0QO!&^QdO1G0OOJOQdO'#F_O!&eQ`O7+&XOOQW7+&X7+&XO!&mQ!bO1G/bOOQ[7+${7+${O!&xQhO7+${P!'PQ`O'#FWOOQO,5;|,5;|OOQO-E9`-E9`OOQS1G1g1G1gOOQPG24gG24gO!'UQ`OAN>YO)gQdO1G1_O!'ZQ`O7+'nOOQO1G/z1G/zO!'cQ`O,5:cO!'hQhO7+%lOOQO,5;y,5;yOOQO-E9]-E9]OOQW<<Is<<IsOOQ[<<Hg<<HgPOQW,5;r,5;rOOQWG23tG23tO!'oQdO7+&yOOQO1G/}1G/}OOQO<<IW<<IW",
  stateData: "!(R~O$`OS$aQQ~OWVO^`O`WOcYOdYOlaOo]O#P^O#S_O#YeO#`fO#bgO#dhO#giO#mjO#okO#rlO$ZRO$^ZO$gTO$rZO~OQnOWVO^`O`WOcYOdYOlaOo]O#P^O#S_O#YeO#`fO#bgO#dhO#giO#mjO#okO#rlO$ZmO$^ZO$gTO$rZO~O$X$sP~P!mO$arO~O`YXcYXdYXoYXrYX!eYX#PYX#SYX$YYX$^YX$g[X$rYX~OgYX~P$aO$ZtO~O$gvO~O$gvO`$fXc$fXd$fXo$fXr$fX!e$fX#P$fX#S$fX$Y$fX$^$fX$r$fXg$fX~O$ZwO~O`yOczOdzOo|O#P}O#S!PO$Y!OO$^ZO$rZO~Or!SO!e!QO~P&jOf!YO$Z!UO$[!VO~OW!]O$Z!ZO$g![O~OWVO^`O`WOcYOdYOo]O#P^O#S_O$ZRO$^ZO$gTO$rZO~OS!eOc!fOd!fOh!bOr!SO!Y!dO!]!iO!`!jO$]!aO~Om!hO~P(qOQ!uOh!mOo!nOr!oOv!xO|!vO!q!wO$Z!lO$[!sO$^!pO$k!qO~OS!eOc!fOd!fOh!bO!Y!dO!]!iO!`!jO$]!aO~Or$vP~P*[Ov!}O!q!wO$Z!|O~Ov#PO$Z#PO~Oh#SOr!SO#p#UO~O$Z#WO~Oc#VX~P$aOc#ZO~Om#[O$X$sXq$sX~O$X$sXq$sX~P!mO$b#_O$c#_O$d#aO~Of#fO$Z!UO$[!VO~Or!SO!e!QO~Oq$sP~P!mOh#oO~Oh#pO~On!xX!|!xX$g!zX~O$Z#qO~O$g#sO~On#tO!|#uO~O`yOczOdzOo|O$^ZO$rZO~Or#Oa!e#Oa#P#Oa#S#Oa$Y#Oag#Oa~P.TOr#Ra!e#Ra#P#Ra#S#Ra$Y#Rag#Ra~P.TOS!eOc!fOd!fOh!bO!Y!dO!]!iO!`!jO~OR#zOv#zO$]#vO$^#yO$k!qO~P/gOm$QO!T#}O!e$OO~P(qOh$SO~O$]$UO~Oh#SO~Oh$WO~O`$YOc$YOg$]Ol$YOm$YO~P)gO`$YOc$YOl$YOm$YOn$_O~P)gO`$YOc$YOl$YOm$YOq$aO~P)gOP$bOSuXcuXduXhuXmuXxuX!YuX!]uX!`uX#[uX#^uX$]uX!WuXQuX`uXguXluXouXruXvuX|uX!quX$ZuX$[uX$^uX$kuXnuXquX!euX$XuX$uuX!}uX~Ox$cO#[$dO#^$eOm$vP~P*[Oh#pOS$iXc$iXd$iXm$iXx$iX!Y$iX!]$iX!`$iX#[$iX#^$iX$]$iXQ$iX`$iXg$iXl$iXo$iXr$iXv$iX|$iX!q$iX$Z$iX$[$iX$^$iX$k$iXn$iXq$iX!e$iX$X$iX$u$iX!}$iX~Oh$iO~Oh$kO~O!T#}O!e$lOr$vXm$vX~Or!SO~Om$oOx$cO~Om$pO~Ov$qO!q!wO~Or$rO~Or!SO!T#}O~Or!SO#p$xO~O$Z#WOr#sX~O$u$|Om#Ua$X#Uaq#Ua~P)gOm$QX$X$QXq$QX~P!mOm#[O$X$saq$sa~O$b#_O$c#_O$d%TO~On%VO!|%WO~Or#Oi!e#Oi#P#Oi#S#Oi$Y#Oig#Oi~P.TOr#Qi!e#Qi#P#Qi#S#Qi$Y#Qig#Qi~P.TOr#Ri!e#Ri#P#Ri#S#Ri$Y#Rig#Ri~P.TOr$Oa!e$Oa~P&jOq%XO~Og$qP~P'yOg$hP~P)gOc!RXg!PX!T!PX!W!RX~Oc%aO!W%bO~Og%cO!T#}O~O!T#}OS$WXc$WXd$WXh$WXm$WXr$WX!Y$WX!]$WX!`$WX!e$WX$]$WX~Om%gO!e$OO~P(qO!T#}OS!Xac!Xad!Xah!Xam!Xar!Xa!Y!Xa!]!Xa!`!Xa!e!Xa$]!Xag!Xa~O$]%hOg$pP~P/gOR#zOS!eOh%mOv#zO!Y%nO$]%lO$^#yO$k!qO~Ox$cOQ$jX`$jXc$jXg$jXh$jXl$jXm$jXo$jXr$jXv$jX|$jX!q$jX$Z$jX$[$jX$^$jX$k$jXn$jXq$jX~O`$YOc$YOg%wOl$YOm$YO~P)gO`$YOc$YOl$YOm$YOn%xO~P)gO`$YOc$YOl$YOm$YOq%yO~P)gOh%{OS#ZXc#ZXd#ZXm#ZX!Y#ZX!]#ZX!`#ZX$]#ZX~Om%|O~Og&ROv&SO!r&SO~Or$SX!e$SXm$SX~P*[O!e$lOr$vam$va~Om&VO~Oq&^O$Z&XO$k&WO~Og&_O~P&jOx$cO!e&cO$u$|Om#Ui$X#Uiq#Ui~P)gO$t&fO~Om$Qa$X$Qaq$Qa~P!mOm#[O$X$siq$si~O!e&iOg$qX~P&jOg&kO~Ox$cOQ#xXg#xXh#xXo#xXr#xXv#xX|#xX!e#xX!q#xX$Z#xX$[#xX$^#xX$k#xX~O!e&mOg$hX~P)gOg&oO~On&pOx$cO!}&qO~OR#zOv#zO$]&sO$^#yO$k!qO~O!T#}OS$Wac$Wad$Wah$Wam$War$Wa!Y$Wa!]$Wa!`$Wa!e$Wa$]$Wa~Oc!dXg!PX!T!PX!e!PX~O!T#}O!e&uOg$pX~Oc&wO~Og&xO~Oc!mXg!mX!W!RX~OS!eOh&zO~O!T&|O~O!T&|O!W&}Og$oX~Oc'OOg!lX~O!W&}O~Og'PO~O$Z'QO~Om'SO~Oc'TO!T#}O~Og'VOm'UO~Og'YO~O!T#}Or$Sa!e$Sam$Sa~OP$bOruX!euXguX~O$k&WOr#jX!e#jX~Or!SO!e'[O~Oq'`O$Z&XO$k&WO~Ox$cOQ$PXh$PXm$PXo$PXr$PXv$PX|$PX!e$PX!q$PX$X$PX$Z$PX$[$PX$^$PX$k$PX$u$PXq$PX~O!e&cO$u$|Om#Uq$X#Uqq#Uq~P)gOn'eOx$cO!}'fO~Og#}X!e#}X~P'yO!e&iOg$qa~Og#|X!e#|X~P)gO!e&mOg$ha~On'eO~Og'kO~P)gOg'lO!W'mO~O$]'nOg#{X!e#{X~P/gO!e&uOg$pa~Og'sO~OS!eOh'uO~OS!eO~PFyO`'yOg'{O~OS#zac#zad#zah#za!Y#za!]#za!`#za$]#za~Og'}O~P!!POg'}Om(OO~Ox$cOQ$Pah$Pam$Pao$Par$Pav$Pa|$Pa!e$Pa!q$Pa$X$Pa$Z$Pa$[$Pa$^$Pa$k$Pa$u$Paq$Pa~On(TO~Og#}a!e#}a~P&jOg#|a!e#|a~P)gOR#zOv#zO$]&sO$^#yO$k&WO~Oc!fXg!PX!T!PX!e!PX~O!T#}Og#{a!e#{a~Oc(VO~O!e&uOg$pi~P)gOg!ai!T!ji~Og(XO~O!W(ZOg!ni~Og!li~P)gO`'yOg(^O~Ox$cOg!Oim!Oi~Og(_O~P!!POm(`O~Og(aO~O!e&uOg$pq~Og(cO~OS!eO~P!$lOg#{q!e#{q~P)gO$`!r$a$k`x#S~",
  goto: "8^$wPPPPP$xP${P%U%h%U%z&^P%UP&d%UPP&jPPP&p&z&zPPPP&zPP&z&z'jP&zP&z(m&zP)])`)f)f)x)fP)f*_P)fP)f)fP*j)fP*v*|+r+uP+x*v+{*v,O,U,X,_,X)f,ePP-Z-a%U-g%U.V.V.].aPP%UP%U%UP.g/c/p/w${P0QP0TP${P${P${P0Z${P0^0a0d0k${P${PP${P0p${P0s0y1Y1t2S2Y2d2j2p2v2|3W3^3d3j3p3vPPPPPPPPPPPP3|4VP4{5O6SP6[7U7k,X7w7zP7}PP8TRsQ_bOPdp!S#[%Pq`OP^_dp}!O!P!Q!S#S#[#o%P&iqSOP^_dp}!O!P!Q!S#S#[#o%P&iqUOP^_dp}!O!P!Q!S#S#[#o%P&iQuTR#bvQxWR#cyQ!WYR#dzQ#d!YS$h!t!uR%U#f!Z!xeg!m!n!o#Z#p#u$[$^$`$c${%W%]%a&c&d&m&r&w'O'T'i'r'x(V(b!Y!xeg!m!n!o#Z#p#u$[$^$`$c${%W%]%a&c&d&m&r&w'O'T'i'r'x(V(bb#z!b$W%b%m&z&}'m'u(ZU&Z$r&]'[R'Z&Y!Z!teg!m!n!o#Z#p#u$[$^$`$c${%W%]%a&c&d&m&r&w'O'T'i'r'x(V(bR$j!vQ&P$iR'W&Qq!gafj!b!c!d!r#}$O$P$S$g$i$l&Q&uQ#w!bW%s$W%m&z'uQ&t%bQ'w&}Q(U'mR(d(Zc#z!b$W%b%m&z&}'m'u(ZQ#VkQ$V!iQ$v#UR&a$xX%q$W%m&z'up!gafj!b!c!d!r#}$O$P$S$g$i$l&Q&uW%p$W%m&z'uQ&{%nQ'v&|Q'w&}R(d(ZR$T!eR%j$SR'p&uR&{%nX%o$W%m&z'uR'v&|X%t$W%m&z'uX%r$W%m&z'u!Y!xeg!m!n!o#Z#p#u$[$^$`$c${%W%]%a&c&d&m&r&w'O'T'i'r'x(V(bQ!}hR$q#OQ!XYR#ezQ#d!XR%U#ep[OP^_dp}!O!P!Q!S#S#[#o%P&ie{X!_!`#h#i#j#k$u%Y'gQ!^]R#g|T!]]|Q#r![R%_#sQ!TXQ!haQ#TkQ#m!RQ$Q!cQ$n!zQ$t#RQ$w#VQ$z#YQ%g$PQ&`$vQ'^&[Q'a&aR(S']SoP!SQ#^pQ%O#[R&g%PZnPp!S#[%PQ$}#ZQ&e${R'd&dR$g!rQ'R%{R(['yR#OhR#QiR$s#QS&[$r&]R(Q'[V&Y$r&]'[R#YlQ#`rR%S#`QdOSpP!SU!kdp%PR%P#[Q%]#p[&l%]&r'i'r'x(bQ&r%aQ'i&mQ'r&wQ'x'OR(b(VQ$[!mQ$^!nQ$`!oV%v$[$^$`Q&Q$iR'X&QQ&v%iS'q&v(WR(W'rQ&n%]R'j&nQ&j%YR'h&jQ!RXR#l!RQ&d${R'c&dQ#]oS%Q#]%RR%R#^Q'z'RR(]'zQ$m!yR&U$mQ&]$rR'_&]Q']&[R(R']Q#XlR$y#XQ$P!cR%f$P_cOPdp!S#[%P^XOPdp!S#[%PQ!_^Q!`_Q#h}Q#i!OQ#j!PQ#k!QQ$u#SQ%Y#oR'g&iR%^#pQ!reQ!{g[$X!m!n!o$[$^$`Q${#Zh%[#p%]%a&m&r&w'O'i'r'x(V(bQ%`#uQ%z$cS&b${&dQ&h%WQ'b&cR'|'T]$Z!m!n!o$[$^$`Q!caU!yf!r$gQ#RjQ#x!bS#|!c$PQ$R!dQ%d#}Q%e$OQ%i$SS&O$i&QQ&T$lR'o&uQ#{!bW%s$W%m&z'uQ&t%bQ'w&}Q(U'mR(d(ZQ%u$WQ&y%mQ't&zR(Y'uR%k$SR%Z#oQqPR#n!SQ!zfQ$f!rR%}$g",
  nodeNames: "⚠ Unit VariableName VariableName QueryCallee Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NamespacedTagSelector NamespaceName TagName NestingSelector ClassSelector . ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue AtKeyword ; ] [ BracketedValue } { BracedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee IfExpression if ArgList IfBranch KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp ComparisonQuery ColorLiteral CompareOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector ParenthesizedSelector StyleQuery style ParenthesedQuery CallQuery ArgList PropertyName , PropertyName UnaryQuery ParenthesedQuery BinaryQuery ParenthesedQuery ParenthesedQuery StyleFeature PropertyName StyleRange PseudoQuery CallLiteral CallTag ParenthesizedContent PseudoClassName ArgList IdSelector IdName AttributeSelector AttributeName NamespacedAttribute NamespaceName AttributeName MatchOp MatchFlag ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp Block Declaration PropertyName Important ImportStatement import Layer layer LayerName layer MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports ScopeStatement scope to FontFeatureStatement font-feature-values FontName AtRule Styles",
  maxTerm: 176,
  nodeProps: [
    ["isolate", -2, 5, 38, ""],
    ["openedBy", 23, "(", 30, "[", 33, "{"],
    ["closedBy", 24, ")", 31, "]", 34, "}"]
  ],
  propSources: [iQ],
  skippedNodes: [0, 5, 130],
  repeatNodeCount: 17,
  tokenData: "IO~R!bOX%ZX^&R^p%Zpq&Rqr)ers)vst+jtu/wuv%Zvw0qwx1Sxy2qyz3Sz{3X{|3r|}8e}!O8v!O!P9e!P!Q9|!Q![:u![!];p!]!^<l!^!_<}!_!`=y!`!a>^!a!b%Z!b!c?_!c!k%Z!k!lAl!l!u%Z!u!vAl!v!}%Z!}#OA}#O#P%Z#P#QB`#Q#R/w#R#]%Z#]#^Bq#^#g%Z#g#hAl#h#o%Z#o#pGU#p#qGg#q#rHO#r#sHa#s#y%Z#y#z&R#z$f%Z$f$g&R$g#BY%Z#BY#BZ&R#BZ$IS%Z$IS$I_&R$I_$I|%Z$I|$JO&R$JO$JT%Z$JT$JU&R$JU$KV%Z$KV$KW&R$KW&FU%Z&FU&FV&R&FV;'S%Z;'S;=`Hx<%lO%Z`%^SOy%jz;'S%j;'S;=`%{<%lO%j`%oS!r`Oy%jz;'S%j;'S;=`%{<%lO%j`&OP;=`<%l%j~&Wh$`~OX%jX^'r^p%jpq'rqy%jz#y%j#y#z'r#z$f%j$f$g'r$g#BY%j#BY#BZ'r#BZ$IS%j$IS$I_'r$I_$I|%j$I|$JO'r$JO$JT%j$JT$JU'r$JU$KV%j$KV$KW'r$KW&FU%j&FU&FV'r&FV;'S%j;'S;=`%{<%lO%j~'yh$`~!r`OX%jX^'r^p%jpq'rqy%jz#y%j#y#z'r#z$f%j$f$g'r$g#BY%j#BY#BZ'r#BZ$IS%j$IS$I_'r$I_$I|%j$I|$JO'r$JO$JT%j$JT$JU'r$JU$KV%j$KV$KW'r$KW&FU%j&FU&FV'r&FV;'S%j;'S;=`%{<%lO%jj)jS$uYOy%jz;'S%j;'S;=`%{<%lO%j~)yWOY)vZr)vrs*cs#O)v#O#P*h#P;'S)v;'S;=`+d<%lO)v~*hOv~~*kRO;'S)v;'S;=`*t;=`O)v~*wXOY)vZr)vrs*cs#O)v#O#P*h#P;'S)v;'S;=`+d;=`<%l)v<%lO)v~+gP;=`<%l)vj+maOy%jz}%j}!O,r!O!Q%j!Q![,r![!c%j!c!},r!}#O%j#O#P.O#P#R%j#R#S,r#S#T%j#T#o,r#o$g%j$g;'S,r;'S;=`/q<%lO,rj,ya$rY!r`Oy%jz}%j}!O,r!O!Q%j!Q![,r![!c%j!c!},r!}#O%j#O#P.O#P#R%j#R#S,r#S#T%j#T#o,r#o$g%j$g;'S,r;'S;=`/q<%lO,rj.TV!r`OY,rYZ%jZy,ryz.jz;'S,r;'S;=`/q<%lO,rY.oX$rY}!O.j!Q![.j!c!}.j#O#P/[#R#S.j#T#o.j$g;'S.j;'S;=`/k<%lO.jY/_SOY.jZ;'S.j;'S;=`/k<%lO.jY/nP;=`<%l.jj/tP;=`<%l,rd/zUOy%jz!_%j!_!`0^!`;'S%j;'S;=`%{<%lO%jd0eS!|S!r`Oy%jz;'S%j;'S;=`%{<%lO%jb0vS^QOy%jz;'S%j;'S;=`%{<%lO%j~1VWOY1SZw1Swx*cx#O1S#O#P1o#P;'S1S;'S;=`2k<%lO1S~1rRO;'S1S;'S;=`1{;=`O1S~2OXOY1SZw1Swx*cx#O1S#O#P1o#P;'S1S;'S;=`2k;=`<%l1S<%lO1S~2nP;=`<%l1Sj2vShYOy%jz;'S%j;'S;=`%{<%lO%j~3XOg~n3`UWQxWOy%jz!_%j!_!`0^!`;'S%j;'S;=`%{<%lO%jj3yWxW#SQOy%jz!O%j!O!P4c!P!Q%j!Q![7h![;'S%j;'S;=`%{<%lO%jj4hU!r`Oy%jz!Q%j!Q![4z![;'S%j;'S;=`%{<%lO%jj5RY!r`$kYOy%jz!Q%j!Q![4z![!g%j!g!h5q!h#X%j#X#Y5q#Y;'S%j;'S;=`%{<%lO%jj5vY!r`Oy%jz{%j{|6f|}%j}!O6f!O!Q%j!Q![6}![;'S%j;'S;=`%{<%lO%jj6kU!r`Oy%jz!Q%j!Q![6}![;'S%j;'S;=`%{<%lO%jj7UU!r`$kYOy%jz!Q%j!Q![6}![;'S%j;'S;=`%{<%lO%jj7o[!r`$kYOy%jz!O%j!O!P4z!P!Q%j!Q![7h![!g%j!g!h5q!h#X%j#X#Y5q#Y;'S%j;'S;=`%{<%lO%jj8jS!eYOy%jz;'S%j;'S;=`%{<%lO%jj8{WxWOy%jz!O%j!O!P4c!P!Q%j!Q![7h![;'S%j;'S;=`%{<%lO%jj9jU`YOy%jz!Q%j!Q![4z![;'S%j;'S;=`%{<%lO%j~:RTxWOy%jz{:b{;'S%j;'S;=`%{<%lO%j~:iS!r`$a~Oy%jz;'S%j;'S;=`%{<%lO%jj:z[$kYOy%jz!O%j!O!P4z!P!Q%j!Q![7h![!g%j!g!h5q!h#X%j#X#Y5q#Y;'S%j;'S;=`%{<%lO%jj;uUcYOy%jz![%j![!]<X!];'S%j;'S;=`%{<%lO%jj<`SdY!r`Oy%jz;'S%j;'S;=`%{<%lO%jj<qSmYOy%jz;'S%j;'S;=`%{<%lO%jh=SU!WWOy%jz!_%j!_!`=f!`;'S%j;'S;=`%{<%lO%jh=mS!WW!r`Oy%jz;'S%j;'S;=`%{<%lO%jl>QS!WW!|SOy%jz;'S%j;'S;=`%{<%lO%jj>eV#PQ!WWOy%jz!_%j!_!`=f!`!a>z!a;'S%j;'S;=`%{<%lO%jb?RS#PQ!r`Oy%jz;'S%j;'S;=`%{<%lO%jj?bYOy%jz}%j}!O@Q!O!c%j!c!}@o!}#T%j#T#o@o#o;'S%j;'S;=`%{<%lO%jj@VW!r`Oy%jz!c%j!c!}@o!}#T%j#T#o@o#o;'S%j;'S;=`%{<%lO%jj@v[lY!r`Oy%jz}%j}!O@o!O!Q%j!Q![@o![!c%j!c!}@o!}#T%j#T#o@o#o;'S%j;'S;=`%{<%lO%jhAqS!}WOy%jz;'S%j;'S;=`%{<%lO%jjBSSoYOy%jz;'S%j;'S;=`%{<%lO%jnBeSn^Oy%jz;'S%j;'S;=`%{<%lO%jjBvU!}WOy%jz#a%j#a#bCY#b;'S%j;'S;=`%{<%lO%jbC_U!r`Oy%jz#d%j#d#eCq#e;'S%j;'S;=`%{<%lO%jbCvU!r`Oy%jz#c%j#c#dDY#d;'S%j;'S;=`%{<%lO%jbD_U!r`Oy%jz#f%j#f#gDq#g;'S%j;'S;=`%{<%lO%jbDvU!r`Oy%jz#h%j#h#iEY#i;'S%j;'S;=`%{<%lO%jbE_U!r`Oy%jz#T%j#T#UEq#U;'S%j;'S;=`%{<%lO%jbEvU!r`Oy%jz#b%j#b#cFY#c;'S%j;'S;=`%{<%lO%jbF_U!r`Oy%jz#h%j#h#iFq#i;'S%j;'S;=`%{<%lO%jbFxS$tQ!r`Oy%jz;'S%j;'S;=`%{<%lO%jjGZSrYOy%jz;'S%j;'S;=`%{<%lO%jfGlU$gUOy%jz!_%j!_!`0^!`;'S%j;'S;=`%{<%lO%jjHTSqYOy%jz;'S%j;'S;=`%{<%lO%jfHfU#SQOy%jz!_%j!_!`0^!`;'S%j;'S;=`%{<%lO%j`H{P;=`<%l%Z",
  tokenizers: [tQ, nQ, J3, eQ, 1, 2, 3, 4, new Ys("m~RRYZ[z{a~~g~aO$c~~dP!P!Qg~lO$d~~", 28, 156)],
  topRules: { StyleSheet: [0, 6], Styles: [1, 129] },
  dynamicPrecedences: { 97: 1 },
  specialized: [{ term: 172, get: (n, e) => Pf(n) << 1, external: Pf }, { term: 150, get: (n) => rQ[n] || -1 }, { term: 151, get: (n) => sQ[n] || -1 }, { term: 4, get: (n) => oQ[n] || -1 }, { term: 28, get: (n) => lQ[n] || -1 }, { term: 149, get: (n) => uQ[n] || -1 }],
  tokenPrec: 2433
});
let yl = null;
function Ql() {
  if (!yl && typeof document == "object" && document.body) {
    let { style: n } = document.body, e = [], t = /* @__PURE__ */ new Set();
    for (let i in n)
      i != "cssText" && i != "cssFloat" && typeof n[i] == "string" && (/[A-Z]/.test(i) && (i = i.replace(/[A-Z]/g, (r) => "-" + r.toLowerCase())), t.has(i) || (e.push(i), t.add(i)));
    yl = e.sort().map((i) => ({ type: "property", label: i, apply: i + ": " }));
  }
  return yl || [];
}
const vf = /* @__PURE__ */ [
  "active",
  "after",
  "any-link",
  "autofill",
  "backdrop",
  "before",
  "checked",
  "cue",
  "default",
  "defined",
  "disabled",
  "empty",
  "enabled",
  "file-selector-button",
  "first",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "fullscreen",
  "has",
  "host",
  "host-context",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "marker",
  "modal",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "part",
  "placeholder",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "selection",
  "slotted",
  "target",
  "target-text",
  "valid",
  "visited",
  "where"
].map((n) => ({ type: "class", label: n })), _f = /* @__PURE__ */ [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((n) => ({ type: "keyword", label: n })).concat(/* @__PURE__ */ [
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((n) => ({ type: "constant", label: n }))), cQ = /* @__PURE__ */ [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((n) => ({ type: "type", label: n })), hQ = /* @__PURE__ */ [
  "@charset",
  "@color-profile",
  "@container",
  "@counter-style",
  "@font-face",
  "@font-feature-values",
  "@font-palette-values",
  "@import",
  "@keyframes",
  "@layer",
  "@media",
  "@namespace",
  "@page",
  "@position-try",
  "@property",
  "@scope",
  "@starting-style",
  "@supports",
  "@view-transition"
].map((n) => ({ type: "keyword", label: n })), Yt = /^(\w[\w-]*|-\w[\w-]*|)$/, fQ = /^-(-[\w-]*)?$/;
function dQ(n, e) {
  var t;
  if ((n.name == "(" || n.type.isError) && (n = n.parent || n), n.name != "ArgList")
    return !1;
  let i = (t = n.parent) === null || t === void 0 ? void 0 : t.firstChild;
  return i?.name != "Callee" ? !1 : e.sliceString(i.from, i.to) == "var";
}
const Af = /* @__PURE__ */ new F0(), OQ = ["Declaration"];
function pQ(n) {
  for (let e = n; ; ) {
    if (e.type.isTop)
      return e;
    if (!(e = e.parent))
      return n;
  }
}
function gp(n, e, t) {
  if (e.to - e.from > 4096) {
    let i = Af.get(e);
    if (i)
      return i;
    let r = [], s = /* @__PURE__ */ new Set(), o = e.cursor(V.IncludeAnonymous);
    if (o.firstChild())
      do
        for (let l of gp(n, o.node, t))
          s.has(l.label) || (s.add(l.label), r.push(l));
      while (o.nextSibling());
    return Af.set(e, r), r;
  } else {
    let i = [], r = /* @__PURE__ */ new Set();
    return e.cursor().iterate((s) => {
      var o;
      if (t(s) && s.matchContext(OQ) && ((o = s.node.nextSibling) === null || o === void 0 ? void 0 : o.name) == ":") {
        let l = n.sliceString(s.from, s.to);
        r.has(l) || (r.add(l), i.push({ label: l, type: "variable" }));
      }
    }), i;
  }
}
const mQ = (n) => (e) => {
  let { state: t, pos: i } = e, r = he(t).resolveInner(i, -1), s = r.type.isError && r.from == r.to - 1 && t.doc.sliceString(r.from, r.to) == "-";
  if (r.name == "PropertyName" || (s || r.name == "TagName") && /^(Block|Styles)$/.test(r.resolve(r.to).name))
    return { from: r.from, options: Ql(), validFor: Yt };
  if (r.name == "ValueName")
    return { from: r.from, options: _f, validFor: Yt };
  if (r.name == "PseudoClassName")
    return { from: r.from, options: vf, validFor: Yt };
  if (n(r) || (e.explicit || s) && dQ(r, t.doc))
    return {
      from: n(r) || s ? r.from : i,
      options: gp(t.doc, pQ(r), n),
      validFor: fQ
    };
  if (r.name == "TagName") {
    for (let { parent: u } = r; u; u = u.parent)
      if (u.name == "Block")
        return { from: r.from, options: Ql(), validFor: Yt };
    return { from: r.from, options: cQ, validFor: Yt };
  }
  if (r.name == "AtKeyword")
    return { from: r.from, options: hQ, validFor: Yt };
  if (!e.explicit)
    return null;
  let o = r.resolve(i), l = o.childBefore(i);
  return l && l.name == ":" && o.name == "PseudoClassSelector" ? { from: i, options: vf, validFor: Yt } : l && l.name == ":" && o.name == "Declaration" || o.name == "ArgList" ? { from: i, options: _f, validFor: Yt } : o.name == "Block" || o.name == "Styles" ? { from: i, options: Ql(), validFor: Yt } : null;
}, gQ = /* @__PURE__ */ mQ((n) => n.name == "VariableName"), Ns = /* @__PURE__ */ mi.define({
  name: "css",
  parser: /* @__PURE__ */ aQ.configure({
    props: [
      /* @__PURE__ */ Cr.add({
        Declaration: /* @__PURE__ */ gs()
      }),
      /* @__PURE__ */ Tr.add({
        "Block KeyframeList": G0
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    wordChars: "-"
  }
});
function bQ() {
  return new pr(Ns, Ns.data.of({ autocomplete: gQ }));
}
const xQ = 317, kQ = 318, Cf = 1, SQ = 2, yQ = 3, QQ = 4, wQ = 319, $Q = 321, PQ = 322, vQ = 5, _Q = 6, AQ = 0, _u = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], bp = 125, CQ = 59, Au = 47, TQ = 42, EQ = 43, XQ = 45, ZQ = 60, DQ = 44, RQ = 63, MQ = 46, LQ = 91, jQ = new np({
  start: !1,
  shift(n, e) {
    return e == vQ || e == _Q || e == $Q ? n : e == PQ;
  },
  strict: !1
}), zQ = new nt((n, e) => {
  let { next: t } = n;
  (t == bp || t == -1 || e.context) && n.acceptToken(wQ);
}, { contextual: !0, fallback: !0 }), IQ = new nt((n, e) => {
  let { next: t } = n, i;
  _u.indexOf(t) > -1 || t == Au && ((i = n.peek(1)) == Au || i == TQ) || t != bp && t != CQ && t != -1 && !e.context && n.acceptToken(xQ);
}, { contextual: !0 }), BQ = new nt((n, e) => {
  n.next == LQ && !e.context && n.acceptToken(kQ);
}, { contextual: !0 }), qQ = new nt((n, e) => {
  let { next: t } = n;
  if (t == EQ || t == XQ) {
    if (n.advance(), t == n.next) {
      n.advance();
      let i = !e.context && e.canShift(Cf);
      n.acceptToken(i ? Cf : SQ);
    }
  } else t == RQ && n.peek(1) == MQ && (n.advance(), n.advance(), (n.next < 48 || n.next > 57) && n.acceptToken(yQ));
}, { contextual: !0 });
function wl(n, e) {
  return n >= 65 && n <= 90 || n >= 97 && n <= 122 || n == 95 || n >= 192 || !e && n >= 48 && n <= 57;
}
const FQ = new nt((n, e) => {
  if (n.next != ZQ || !e.dialectEnabled(AQ) || (n.advance(), n.next == Au)) return;
  let t = 0;
  for (; _u.indexOf(n.next) > -1; )
    n.advance(), t++;
  if (wl(n.next, !0)) {
    for (n.advance(), t++; wl(n.next, !1); )
      n.advance(), t++;
    for (; _u.indexOf(n.next) > -1; )
      n.advance(), t++;
    if (n.next == DQ) return;
    for (let i = 0; ; i++) {
      if (i == 7) {
        if (!wl(n.next, !0)) return;
        break;
      }
      if (n.next != "extends".charCodeAt(i)) break;
      n.advance(), t++;
    }
  }
  n.acceptToken(QQ, -t);
}), YQ = Qi({
  "get set async static": x.modifier,
  "for while do if else switch try catch finally return throw break continue default case defer": x.controlKeyword,
  "in of await yield void typeof delete instanceof as satisfies": x.operatorKeyword,
  "let var const using function class extends": x.definitionKeyword,
  "import export from": x.moduleKeyword,
  "with debugger new": x.keyword,
  TemplateString: x.special(x.string),
  super: x.atom,
  BooleanLiteral: x.bool,
  this: x.self,
  null: x.null,
  Star: x.modifier,
  VariableName: x.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": x.function(x.variableName),
  VariableDefinition: x.definition(x.variableName),
  Label: x.labelName,
  PropertyName: x.propertyName,
  PrivatePropertyName: x.special(x.propertyName),
  "CallExpression/MemberExpression/PropertyName": x.function(x.propertyName),
  "FunctionDeclaration/VariableDefinition": x.function(x.definition(x.variableName)),
  "ClassDeclaration/VariableDefinition": x.definition(x.className),
  "NewExpression/VariableName": x.className,
  PropertyDefinition: x.definition(x.propertyName),
  PrivatePropertyDefinition: x.definition(x.special(x.propertyName)),
  UpdateOp: x.updateOperator,
  "LineComment Hashbang": x.lineComment,
  BlockComment: x.blockComment,
  Number: x.number,
  String: x.string,
  Escape: x.escape,
  ArithOp: x.arithmeticOperator,
  LogicOp: x.logicOperator,
  BitOp: x.bitwiseOperator,
  CompareOp: x.compareOperator,
  RegExp: x.regexp,
  Equals: x.definitionOperator,
  Arrow: x.function(x.punctuation),
  ": Spread": x.punctuation,
  "( )": x.paren,
  "[ ]": x.squareBracket,
  "{ }": x.brace,
  "InterpolationStart InterpolationEnd": x.special(x.brace),
  ".": x.derefOperator,
  ", ;": x.separator,
  "@": x.meta,
  TypeName: x.typeName,
  TypeDefinition: x.definition(x.typeName),
  "type enum interface implements namespace module declare": x.definitionKeyword,
  "abstract global Privacy readonly override": x.modifier,
  "is keyof unique infer asserts": x.operatorKeyword,
  JSXAttributeValue: x.attributeValue,
  JSXText: x.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": x.angleBracket,
  "JSXIdentifier JSXNameSpacedName": x.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": x.attributeName,
  "JSXBuiltin/JSXIdentifier": x.standard(x.tagName)
}), WQ = { __proto__: null, export: 20, as: 25, from: 33, default: 36, async: 41, function: 42, in: 52, out: 55, const: 56, extends: 60, this: 64, true: 72, false: 72, null: 84, void: 88, typeof: 92, super: 108, new: 142, delete: 154, yield: 163, await: 167, class: 172, public: 237, private: 237, protected: 237, readonly: 239, instanceof: 258, satisfies: 261, import: 294, keyof: 351, unique: 355, infer: 361, asserts: 397, is: 399, abstract: 419, implements: 421, type: 423, let: 426, var: 428, using: 431, interface: 437, enum: 441, namespace: 447, module: 449, declare: 453, global: 457, defer: 473, for: 478, of: 487, while: 490, with: 494, do: 498, if: 502, else: 504, switch: 508, case: 514, try: 520, catch: 524, finally: 528, return: 532, throw: 536, break: 540, continue: 544, debugger: 548 }, NQ = { __proto__: null, async: 129, get: 131, set: 133, declare: 195, public: 197, private: 197, protected: 197, static: 199, abstract: 201, override: 203, readonly: 209, accessor: 211, new: 403 }, VQ = { __proto__: null, "<": 193 }, UQ = ki.deserialize({
  version: 14,
  states: "$GSQ%TQlOOO%[QlOOO'_QpOOP(lO`OOO*zQ!0MxO'#CiO+RO#tO'#CjO+aO&jO'#CjO+oO#@ItO'#DaO.QQlO'#DgO.bQlO'#DrO%[QlO'#DzO0fQlO'#ESOOQ!0Lf'#E['#E[O1PQ`O'#EXOOQO'#Ep'#EpOOQO'#Im'#ImO1XQ`O'#GtO1dQ`O'#EoO1iQ`O'#EoO3hQ!0MxO'#JsO6[Q!0MxO'#JtO6uQ`O'#F^O6zQ,UO'#FuOOQ!0Lf'#Fg'#FgO7VO7dO'#FgO9XQMhO'#F}O9`Q`O'#F|OOQ!0Lf'#Jt'#JtOOQ!0Lb'#Js'#JsO9eQ`O'#GxOOQ['#K`'#K`O9pQ`O'#IZO9uQ!0LrO'#I[OOQ['#Ja'#JaOOQ['#I`'#I`Q`QlOOQ`QlOOO9}Q!L^O'#DvO:UQlO'#EOO:]QlO'#EQO9kQ`O'#GtO:dQMhO'#CoO:rQ`O'#EnO:}Q`O'#EzO;hQMhO'#FfO;xQ`O'#GtOOQO'#Ka'#KaO;}Q`O'#KaO<]Q`O'#G|O<]Q`O'#G}O<]Q`O'#HPO9kQ`O'#HSO=SQ`O'#HVO>kQ`O'#CeO>{Q`O'#HdO?TQ`O'#HjO?TQ`O'#HlO`QlO'#HnO?TQ`O'#HpO?TQ`O'#HsO?YQ`O'#HyO?_Q!0LsO'#IPO%[QlO'#IRO?jQ!0LsO'#ITO?uQ!0LsO'#IVO9uQ!0LrO'#IXO@QQ!0MxO'#CiOASQpO'#DlQOQ`OOO%[QlO'#EQOAjQ`O'#ETO:dQMhO'#EnOAuQ`O'#EnOBQQ!bO'#FfOOQ['#Cg'#CgOOQ!0Lb'#Dq'#DqOOQ!0Lb'#Jw'#JwO%[QlO'#JwOOQO'#Jz'#JzOOQO'#Ii'#IiOCQQpO'#EgOOQ!0Lb'#Ef'#EfOOQ!0Lb'#KO'#KOOC|Q!0MSO'#EgODWQpO'#EWOOQO'#Jy'#JyODlQpO'#JzOEyQpO'#EWODWQpO'#EgPFWO&2DjO'#CbPOOO)CEO)CEOOOOO'#Ia'#IaOFcO#tO,59UOOQ!0Lh,59U,59UOOOO'#Ib'#IbOFqO&jO,59UOGPQ!L^O'#DcOOOO'#Id'#IdOGWO#@ItO,59{OOQ!0Lf,59{,59{OGfQlO'#IeOGyQ`O'#JuOIxQ!fO'#JuO+}QlO'#JuOJPQ`O,5:ROJgQ`O'#EpOJtQ`O'#KUOKPQ`O'#KTOKPQ`O'#KTOKXQ`O,5;^OK^Q`O'#KSOOQ!0Ln,5:^,5:^OKeQlO,5:^OMcQ!0MxO,5:fONSQ`O,5:nONmQ!0LrO'#KRONtQ`O'#KQO9eQ`O'#KQO! YQ`O'#KQO! bQ`O,5;]O! gQ`O'#KQO!#lQ!fO'#JtOOQ!0Lh'#Ci'#CiO%[QlO'#ESO!$[Q!fO,5:sOOQS'#J{'#J{OOQO-E<k-E<kO9kQ`O,5=`O!$rQ`O,5=`O!$wQlO,5;ZO!&zQMhO'#EkO!(eQ`O,5;ZO!(jQlO'#DyO!(tQpO,5;eO!(|QpO,5;eO%[QlO,5;eOOQ['#FU'#FUOOQ['#FW'#FWO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fO%[QlO,5;fOOQ['#F['#F[O!)[QlO,5;uOOQ!0Lf,5;z,5;zOOQ!0Lf,5;{,5;{OOQ!0Lf,5;},5;}O%[QlO'#IqO!+_Q!0LrO,5<jO%[QlO,5;fO!&zQMhO,5;fO!+|QMhO,5;fO!-nQMhO'#E^O%[QlO,5;xOOQ!0Lf,5;|,5;|O!-uQ,UO'#FkO!.rQ,UO'#KYO!.^Q,UO'#KYO!.yQ,UO'#KYOOQO'#KY'#KYO!/_Q,UO,5<TOOOW,5<a,5<aO!/pQlO'#FwOOOW'#Ip'#IpO7VO7dO,5<RO!/wQ,UO'#FyOOQ!0Lf,5<R,5<RO!0hQ$IUO'#CyOOQ!0Lh'#C}'#C}O!0{O#@ItO'#DRO!1iQMjO,5<fO!1pQ`O,5<iO!3YQ(CWO'#GYO!3jQ`O'#GZO!3oQ`O'#GZO!5_Q(CWO'#G_O!6dQpO'#GcOOQO'#Go'#GoO!,TQMhO'#GnOOQO'#Gq'#GqO!,TQMhO'#GpO!7VQ$IUO'#JmOOQ!0Lh'#Jm'#JmO!7aQ`O'#JlO!7oQ`O'#JkO!7wQ`O'#CuOOQ!0Lh'#C{'#C{O!8YQ`O'#C}OOQ!0Lh'#DV'#DVOOQ!0Lh'#DX'#DXO!8_Q`O,5<fO1SQ`O'#DZO!,TQMhO'#GQO!,TQMhO'#GSO!8gQ`O'#GUO!8lQ`O'#GVO!3oQ`O'#G]O!,TQMhO'#GbO<]Q`O'#JlO!8qQ`O'#EqO!9`Q`O,5<hOOQ!0Lb'#Cr'#CrO!9hQ`O'#ErO!:bQpO'#EsOOQ!0Lb'#KS'#KSO!:iQ!0LrO'#KbO9uQ!0LrO,5=dO`QlO,5>uOOQ['#Ji'#JiOOQ[,5>v,5>vOOQ[-E<^-E<^O!<hQ!0MxO,5:bO!=[QpO,5:`O!?WQ!0MxO,5:jO%[QlO,5:jO!AnQ!0MxO,5:lOOQO,5@{,5@{O!B_QMhO,5=`O!BmQ!0LrO'#JjO9`Q`O'#JjO!COQ!0LrO,59ZO!CZQpO,59ZO!CcQMhO,59ZO:dQMhO,59ZO!CnQ`O,5;ZO!CvQ`O'#HcO!D[Q`O'#KeO%[QlO,5<OO!=[QpO,5<QO!DdQ`O,5={O!DiQ`O,5={O!DnQ`O,5={O!D|Q`O,5={O9uQ!0LrO,5={O<]Q`O,5=kOOQO'#Cy'#CyO!ETQpO,5=hO!E]QMhO,5=iO!EhQ`O,5=kO!EmQ!bO,5=nO!EuQ`O'#KaO?YQ`O'#HXO9kQ`O'#HZO!EzQ`O'#HZO:dQMhO'#H]O!FPQ`O'#H]OOQ[,5=q,5=qO!FUQ`O'#H^O!FgQ`O'#CoO!FlQ`O,59PO!FvQ`O,59PO!H{QlO,59POOQ[,59P,59PO!I]Q!0LrO,59PO%[QlO,59PO!KhQlO'#HfOOQ['#Hg'#HgOOQ['#Hh'#HhO`QlO,5>OO!LOQ`O,5>OO`QlO,5>UO`QlO,5>WO!LTQ`O,5>YO`QlO,5>[O!LYQ`O,5>_O!L_QlO,5>eOOQ[,5>k,5>kO%[QlO,5>kO9uQ!0LrO,5>mOOQ[,5>o,5>oO#!iQ`O,5>oOOQ[,5>q,5>qO#!iQ`O,5>qOOQ[,5>s,5>sO##VQpO'#D_O%[QlO'#JwO##aQpO'#JwO##{QpO'#DmO#$^QpO'#DmO#&oQlO'#DmO#&vQ`O'#JvO#'OQ`O,5:WO#'TQ`O'#EtO#'`Q`O'#EtO#'eQ`O'#KVO#'mQ`O,5;_O#'rQpO'#DmO#(PQpO'#EVOOQ!0Lf,5:o,5:oO%[QlO,5:oO#(WQ`O,5:oO?YQ`O,5;YO!CZQpO,5;YO!CcQMhO,5;YO:dQMhO,5;YO#(`Q`O,5@cO#(eQ07dO,5:sOOQO-E<g-E<gO#)kQ!0MSO,5;RODWQpO,5:rO#)uQpO,5:rODWQpO,5;RO!COQ!0LrO,5:rOOQ!0Lb'#Ej'#EjOOQO,5;R,5;RO%[QlO,5;RO#*SQ!0LrO,5;RO#*_Q!0LrO,5;RO!CZQpO,5:rOOQO,5;X,5;XO#*mQ!0LrO,5;RPOOO'#I_'#I_P#+RO&2DjO,58|POOO,58|,58|OOOO-E<_-E<_OOQ!0Lh1G.p1G.pOOOO-E<`-E<`OOOO,59},59}O#+^Q!bO,59}OOOO-E<b-E<bOOQ!0Lf1G/g1G/gO#+cQ!fO,5?PO+}QlO,5?POOQO,5?V,5?VO#+mQlO'#IeOOQO-E<c-E<cO#+zQ`O,5@aO#,SQ!fO,5@aO#,ZQ`O,5@oOOQ!0Lf1G/m1G/mO%[QlO,5@pO#,cQ`O'#IkOOQO-E<i-E<iO#,ZQ`O,5@oOOQ!0Lb1G0x1G0xOOQ!0Ln1G/x1G/xOOQ!0Ln1G0Y1G0YO%[QlO,5@mO#,wQ!0LrO,5@mO#-YQ!0LrO,5@mO#-aQ`O,5@lO9eQ`O,5@lO#-iQ`O,5@lO#-wQ`O'#InO#-aQ`O,5@lOOQ!0Lb1G0w1G0wO!(tQpO,5:uO!)PQpO,5:uOOQS,5:w,5:wO#.iQdO,5:wO#.qQMhO1G2zO9kQ`O1G2zOOQ!0Lf1G0u1G0uO#/PQ!0MxO1G0uO#0UQ!0MvO,5;VOOQ!0Lh'#GX'#GXO#0rQ!0MzO'#JmO!$wQlO1G0uO#2}Q!fO'#JxO%[QlO'#JxO#3XQ`O,5:eOOQ!0Lh'#D_'#D_OOQ!0Lf1G1P1G1PO%[QlO1G1POOQ!0Lf1G1g1G1gO#3^Q`O1G1PO#5rQ!0MxO1G1QO#5yQ!0MxO1G1QO#8aQ!0MxO1G1QO#8hQ!0MxO1G1QO#;OQ!0MxO1G1QO#=fQ!0MxO1G1QO#=mQ!0MxO1G1QO#=tQ!0MxO1G1QO#@[Q!0MxO1G1QO#@cQ!0MxO1G1QO#BpQ?MtO'#CiO#DkQ?MtO1G1aO#DrQ?MtO'#JtO#EVQ!0MxO,5?]OOQ!0Lb-E<o-E<oO#GdQ!0MxO1G1QO#HaQ!0MzO1G1QOOQ!0Lf1G1Q1G1QO#IdQMjO'#J}O#InQ`O,5:xO#IsQ!0MxO1G1dO#JgQ,UO,5<XO#JoQ,UO,5<YO#JwQ,UO'#FpO#K`Q`O'#FoOOQO'#KZ'#KZOOQO'#Io'#IoO#KeQ,UO1G1oOOQ!0Lf1G1o1G1oOOOW1G1z1G1zO#KvQ?MtO'#JsO#LQQ`O,5<cO!)[QlO,5<cOOOW-E<n-E<nOOQ!0Lf1G1m1G1mO#LVQpO'#KYOOQ!0Lf,5<e,5<eO#L_QpO,5<eO#LdQMhO'#DTOOOO'#Ic'#IcO#LkO#@ItO,59mOOQ!0Lh,59m,59mO%[QlO1G2QO!8lQ`O'#IsO#LvQ`O,5<{OOQ!0Lh,5<x,5<xO!,TQMhO'#IvO#MdQMjO,5=YO!,TQMhO'#IxO#NVQMjO,5=[O!&zQMhO,5=^OOQO1G2T1G2TO#NaQ!dO'#CrO#NtQ(CWO'#ErO$ |QpO'#GcO$!dQ!dO,5<tO$!kQ`O'#K]O9eQ`O'#K]O$!yQ`O,5<vO$#aQ!dO'#C{O!,TQMhO,5<uO$#kQ`O'#G[O$$PQ`O,5<uO$$UQ!dO'#GXO$$cQ!dO'#K^O$$mQ`O'#K^O!&zQMhO'#K^O$$rQ`O,5<yO$$wQlO'#JwO$%RQpO'#GdO#$^QpO'#GdO$%dQ`O'#GhO!3oQ`O'#GlO$%iQ!0LrO'#IuO$%tQpO,5<}OOQ!0Lp,5<},5<}O$%{QpO'#GdO$&YQpO'#GeO$&kQpO'#GeO$&pQMjO,5=YO$'QQMjO,5=[OOQ!0Lh,5=_,5=_O!,TQMhO,5@WO!,TQMhO,5@WO$'bQ`O'#IzO$'vQ`O,5@VO$(OQ`O,59aOOQ!0Lh,59i,59iO$(TQ`O,5@WO$)TQ$IYO,59uOOQ!0Lh'#Jq'#JqO$)vQMjO,5<lO$*iQMjO,5<nO@zQ`O,5<pOOQ!0Lh,5<q,5<qO$*sQ`O,5<wO$*xQMjO,5<|O$+YQ`O'#KQO!$wQlO1G2SO$+_Q`O1G2SO9eQ`O'#KTO$+dQ`O'#D_O9eQ`O'#EtO%[QlO'#EtO9eQ`O'#I|O$+rQ!0LrO,5@|OOQ[1G3O1G3OOOQ[1G4a1G4aOOQ!0Lf1G/|1G/|OOQ!0Lf1G/z1G/zO$-tQ!0MxO1G0UOOQ[1G2z1G2zO!&zQMhO1G2zO%[QlO1G2zO#.tQ`O1G2zO$/xQMhO'#EkOOQ!0Lb,5@U,5@UO$0VQ!0LrO,5@UOOQ[1G.u1G.uO!COQ!0LrO1G.uO!CZQpO1G.uO!CcQMhO1G.uO$0hQ`O1G0uO$0mQ`O'#CiO$0xQ`O'#KfO$1QQ`O,5=}O$1VQ`O'#KfO$1[Q`O'#KfO$1jQ`O'#JSO$1xQ`O,5APO$2QQ!fO1G1jOOQ!0Lf1G1l1G1lO9kQ`O1G3gO@zQ`O1G3gO$2XQ`O1G3gO$2^Q`O1G3gO!DnQ`O1G3gO9uQ!0LrO1G3gOOQ[1G3g1G3gO!EhQ`O1G3VO!&zQMhO1G3SO$2cQ`O1G3SOOQ[1G3T1G3TO!&zQMhO1G3TO$2hQ`O1G3TO$2pQpO'#HROOQ[1G3V1G3VO!6_QpO'#JOO!EmQ!bO1G3YOOQ[1G3Y1G3YOOQ[,5=s,5=sO$2xQMhO,5=uO9kQ`O,5=uO$%dQ`O,5=wO9`Q`O,5=wO!CZQpO,5=wO!CcQMhO,5=wO:dQMhO,5=wO$3WQ`O'#KdO$3cQ`O,5=xOOQ[1G.k1G.kO$3hQ!0LrO1G.kO@zQ`O1G.kO$3sQ`O1G.kO9uQ!0LrO1G.kO$5{Q!fO,5ARO$6YQ`O,5ARO9eQ`O,5ARO$6eQlO,5>QO$6lQ`O,5>QOOQ[1G3j1G3jO`QlO1G3jOOQ[1G3p1G3pOOQ[1G3r1G3rO?TQ`O1G3tO$6qQlO1G3vO$:uQlO'#HuOOQ[1G3y1G3yO$;SQ`O'#H{O?YQ`O'#H}OOQ[1G4P1G4PO$;[QlO1G4PO9uQ!0LrO1G4VOOQ[1G4X1G4XOOQ!0Lb'#G`'#G`O9uQ!0LrO1G4ZO9uQ!0LrO1G4]O$?cQ`O,5@cO9eQ`O,5;`O?YQ`O,5:XO!)[QlO,5:XO!CZQpO,5:XO$?hQ?MtO,5:XOOQO,5;`,5;`O$?rQpO'#IfO$@YQ`O,5@bOOQ!0Lf1G/r1G/rO!)[QlO,5;`O$@bQpO'#IlO$@lQ`O,5@qOOQ!0Lb1G0y1G0yO#$^QpO,5:XOOQO'#Ih'#IhO$@tQpO,5:qOOQ!0Ln,5:q,5:qO#(ZQ`O1G0ZOOQ!0Lf1G0Z1G0ZO%[QlO1G0ZOOQ!0Lf1G0t1G0tO?YQ`O1G0tO!CZQpO1G0tO!CcQMhO1G0tOOQ!0Lb1G5}1G5}O!COQ!0LrO1G0^OOQO1G0m1G0mO%[QlO1G0mO$@{Q!0LrO1G0mO$AWQ!0LrO1G0mO!CZQpO1G0^ODWQpO1G0^O$AfQ!0LrO1G0mOOQO1G0^1G0^O$AzQ!0MxO1G0mPOOO-E<]-E<]POOO1G.h1G.hOOOO1G/i1G/iO$BUQ!bO,5<jO$B^Q!fO1G4kOOQO1G4q1G4qO%[QlO,5?PO$BhQ`O1G5{O$BpQ`O1G6ZO$BxQ!fO1G6[O9eQ`O,5?VO$CSQ!0MxO1G6XO%[QlO1G6XO$CdQ!0LrO1G6XO$CuQ`O1G6WO$CuQ`O1G6WO9eQ`O1G6WO$C}Q`O,5?YO9eQ`O,5?YOOQO,5?Y,5?YO$DcQ`O,5?YO$+YQ`O,5?YOOQO-E<l-E<lOOQS1G0a1G0aOOQS1G0c1G0cO#.lQ`O1G0cOOQ[7+(f7+(fO!&zQMhO7+(fO%[QlO7+(fO$DqQ`O7+(fO$D|QMhO7+(fO$E[Q!0MzO,5=YO$GgQ!0MzO,5=[O$IrQ!0MzO,5=YO$LTQ!0MzO,5=[O$NfQ!0MzO,59uO%!kQ!0MzO,5<lO%$vQ!0MzO,5<nO%'RQ!0MzO,5<|OOQ!0Lf7+&a7+&aO%)dQ!0MxO7+&aO%*WQlO'#IgO%*eQ`O,5@dO%*mQ!fO,5@dOOQ!0Lf1G0P1G0PO%*wQ`O7+&kOOQ!0Lf7+&k7+&kO%*|Q?MtO,5:fO%[QlO7+&{O%+WQ?MtO,5:bO%+eQ?MtO,5:jO%+oQ?MtO,5:lO%+yQMhO'#IjO%,TQ`O,5@iOOQ!0Lh1G0d1G0dOOQO1G1s1G1sOOQO1G1t1G1tO%,]Q!jO,5<[O!)[QlO,5<ZOOQO-E<m-E<mOOQ!0Lf7+'Z7+'ZOOOW7+'f7+'fOOOW1G1}1G1}O%,hQ`O1G1}OOQ!0Lf1G2P1G2POOOO,59o,59oO%,mQ!dO,59oOOOO-E<a-E<aOOQ!0Lh1G/X1G/XO%,tQ!0MxO7+'lOOQ!0Lh,5?_,5?_O%-hQMhO1G2gP%-oQ`O'#IsPOQ!0Lh-E<q-E<qO%.]QMjO,5?bOOQ!0Lh-E<t-E<tO%/OQMjO,5?dOOQ!0Lh-E<v-E<vO%/YQ!dO1G2xO%/aQ!dO'#CrO%/wQMhO'#KTO$$wQlO'#JwOOQ!0Lh1G2`1G2`O%0RQ`O'#IrO%0jQ`O,5@wO%0jQ`O,5@wO%0rQ`O,5@wO%0}Q`O,5@wOOQO1G2b1G2bO%1]QMjO1G2aO$+YQ`O'#K]O!,TQMhO1G2aO%1mQ(CWO'#ItO%1zQ`O,5@xO!&zQMhO,5@xO%2SQ!dO,5@xOOQ!0Lh1G2e1G2eO%4dQ!fO'#CiO%4nQ`O,5=QOOQ!0Lb,5=O,5=OO%4vQpO,5=OOOQ!0Lb,5=P,5=POCwQ`O,5=OO%5RQpO,5=OOOQ!0Lb,5=S,5=SO$+YQ`O,5=WOOQO,5?a,5?aOOQO-E<s-E<sOOQ!0Lp1G2i1G2iO#$^QpO,5=OO$$wQlO,5=QO%5aQ`O,5=PO%5lQpO,5=PO!,TQMhO'#IvO%6fQMjO1G2tO!,TQMhO'#IxO%7XQMjO1G2vO%7cQMjO1G5rO%7mQMjO1G5rOOQO,5?f,5?fOOQO-E<x-E<xOOQO1G.{1G.{O!,TQMhO1G5rO!,TQMhO1G5rO!=[QpO,59wO%[QlO,59wOOQ!0Lh,5<k,5<kO%7zQ`O1G2[O!,TQMhO1G2cO%8PQ!0MxO7+'nOOQ!0Lf7+'n7+'nO!$wQlO7+'nO%8sQ`O,5;`OOQ!0Lb,5?h,5?hOOQ!0Lb-E<z-E<zO%8xQ!dO'#K_O#(ZQ`O7+(fO4UQ!fO7+(fO$DtQ`O7+(fO%9SQ!0MvO'#CiO%9gQ!0MvO,5=TO%9zQ`O,5=TO%:SQ`O,5=TOOQ!0Lb1G5p1G5pOOQ[7+$a7+$aO!COQ!0LrO7+$aO!CZQpO7+$aO!$wQlO7+&aO%:XQ`O'#JRO%:pQ`O,5AQOOQO1G3i1G3iO9kQ`O,5AQO%:pQ`O,5AQO%:xQ`O,5AQOOQO,5?n,5?nOOQO-E=Q-E=QOOQ!0Lf7+'U7+'UO%:}Q`O7+)RO9uQ!0LrO7+)RO9kQ`O7+)RO@zQ`O7+)RO%;SQ`O7+)ROOQ[7+)R7+)ROOQ[7+(q7+(qO%;XQ!0MvO7+(nO!&zQMhO7+(nO!EcQ`O7+(oOOQ[7+(o7+(oO!&zQMhO7+(oO%;cQ`O'#KcO%;nQ`O,5=mOOQO,5?j,5?jOOQO-E<|-E<|OOQ[7+(t7+(tO%=QQpO'#H[OOQ[1G3a1G3aO!&zQMhO1G3aO%[QlO1G3aO%=XQ`O1G3aO%=dQMhO1G3aO9uQ!0LrO1G3cO$%dQ`O1G3cO9`Q`O1G3cO!CZQpO1G3cO!CcQMhO1G3cO%=rQ`O'#JQO%>WQ`O,5AOO%>`QpO,5AOOOQ!0Lb1G3d1G3dOOQ[7+$V7+$VO@zQ`O7+$VO9uQ!0LrO7+$VO%>kQ`O7+$VO%[QlO1G6mO%[QlO1G6nO%>pQ!0LrO1G6mO%>zQlO1G3lO%?RQ`O1G3lO%?WQlO1G3lOOQ[7+)U7+)UO9uQ!0LrO7+)`O`QlO7+)bOOQ['#Ki'#KiOOQ['#JT'#JTO%?_QlO,5>aOOQ[,5>a,5>aO%[QlO'#HvO%?lQ`O'#HxOOQ[,5>g,5>gO9eQ`O,5>gOOQ[,5>i,5>iOOQ[7+)k7+)kOOQ[7+)q7+)qOOQ[7+)u7+)uOOQ[7+)w7+)wO%?qQpO1G5}O%@]Q`O1G0zOOQO1G/s1G/sO%@hQ?MtO1G/sO?YQ`O1G/sO!)[QlO'#DmOOQO,5?Q,5?QOOQO-E<d-E<dO%@rQ?MtO1G0zOOQO,5?W,5?WOOQO-E<j-E<jO!CZQpO1G/sOOQO-E<f-E<fOOQ!0Ln1G0]1G0]OOQ!0Lf7+%u7+%uO#(ZQ`O7+%uOOQ!0Lf7+&`7+&`O?YQ`O7+&`O!CZQpO7+&`OOQO7+%x7+%xO$AzQ!0MxO7+&XOOQO7+&X7+&XO%[QlO7+&XO%@|Q!0LrO7+&XO!COQ!0LrO7+%xO!CZQpO7+%xO%AXQ!0LrO7+&XO%AgQ!0MxO7++sO%[QlO7++sO%AwQ`O7++rO%AwQ`O7++rOOQO1G4t1G4tO9eQ`O1G4tO%BPQ`O1G4tOOQS7+%}7+%}O#(ZQ`O<<LQO4UQ!fO<<LQO%B_Q`O<<LQOOQ[<<LQ<<LQO!&zQMhO<<LQO%[QlO<<LQO%BgQ`O<<LQO%BrQ!0MzO,5?bO%D}Q!0MzO,5?dO%GYQ!0MzO1G2aO%IkQ!0MzO1G2tO%KvQ!0MzO1G2vO%NRQ!fO,5?RO%[QlO,5?ROOQO-E<e-E<eO%N]Q`O1G6OOOQ!0Lf<<JV<<JVO%NeQ?MtO1G0uO&!lQ?MtO1G1QO&!sQ?MtO1G1QO&$tQ?MtO1G1QO&${Q?MtO1G1QO&&|Q?MtO1G1QO&(}Q?MtO1G1QO&)UQ?MtO1G1QO&)]Q?MtO1G1QO&+^Q?MtO1G1QO&+eQ?MtO1G1QO&+lQ!0MxO<<JgO&-dQ?MtO1G1QO&.aQ?MvO1G1QO&/dQ?MvO'#JmO&1jQ?MtO1G1dO&1wQ?MtO1G0UO&2RQMjO,5?UOOQO-E<h-E<hO!)[QlO'#FrOOQO'#K['#K[OOQO1G1v1G1vO&2]Q`O1G1uO&2bQ?MtO,5?]OOOW7+'i7+'iOOOO1G/Z1G/ZO&2lQ!dO1G4yOOQ!0Lh7+(R7+(RP!&zQMhO,5?_O!,TQMhO7+(dO&2sQ`O,5?^O9eQ`O,5?^O$+YQ`O,5?^OOQO-E<p-E<pO&3RQ`O1G6cO&3RQ`O1G6cO&3ZQ`O1G6cO&3fQMjO7+'{O&3vQ!dO,5?`O&4QQ`O,5?`O!&zQMhO,5?`OOQO-E<r-E<rO&4VQ!dO1G6dO&4aQ`O1G6dO&4iQ`O1G2lO!&zQMhO1G2lOOQ!0Lb1G2j1G2jOOQ!0Lb1G2k1G2kO%4vQpO1G2jO!CZQpO1G2jOCwQ`O1G2jOOQ!0Lb1G2r1G2rO&4nQpO1G2jO&4|Q`O1G2lO$+YQ`O1G2kOCwQ`O1G2kO$$wQlO1G2lO&5UQ`O1G2kO&5xQMjO,5?bOOQ!0Lh-E<u-E<uO&6kQMjO,5?dOOQ!0Lh-E<w-E<wO!,TQMhO7++^O&6uQMjO7++^O&7PQMjO7++^OOQ!0Lh1G/c1G/cO&7^Q`O1G/cOOQ!0Lh7+'v7+'vO&7cQMjO7+'}O&7sQ!0MxO<<KYOOQ!0Lf<<KY<<KYO&8gQ`O1G0zO!&zQMhO'#I{O&8lQ`O,5@yO&:nQ!fO<<LQO!&zQMhO1G2oO&:uQ!0LrO1G2oOOQ[<<G{<<G{O!COQ!0LrO<<G{O&;WQ!0MxO<<I{OOQ!0Lf<<I{<<I{OOQO,5?m,5?mO&;zQ`O,5?mO&<PQ`O,5?mOOQO-E=P-E=PO&<_Q`O1G6lO&<_Q`O1G6lO9kQ`O1G6lO@zQ`O<<LmOOQ[<<Lm<<LmO&<gQ`O<<LmO9uQ!0LrO<<LmO9kQ`O<<LmOOQ[<<LY<<LYO%;XQ!0MvO<<LYOOQ[<<LZ<<LZO!EcQ`O<<LZO&<lQpO'#I}O&<wQ`O,5@}O!)[QlO,5@}OOQ[1G3X1G3XOOQO'#JP'#JPO9uQ!0LrO'#JPO&=PQpO,5=vOOQ[,5=v,5=vO&=WQpO'#EgO&=_QpO'#GfO&=dQ`O7+({O&=iQ`O7+({OOQ[7+({7+({O!&zQMhO7+({O%[QlO7+({O&=qQ`O7+({OOQ[7+(}7+(}O9uQ!0LrO7+(}O$%dQ`O7+(}O9`Q`O7+(}O!CZQpO7+(}O&=|Q`O,5?lOOQO-E=O-E=OOOQO'#H_'#H_O&>XQ`O1G6jO9uQ!0LrO<<GqOOQ[<<Gq<<GqO@zQ`O<<GqO&>aQ`O7+,XO&>fQ`O7+,YO%[QlO7+,XO%[QlO7+,YOOQ[7+)W7+)WO&>kQ`O7+)WO&>pQlO7+)WO&>wQ`O7+)WOOQ[<<Lz<<LzOOQ[<<L|<<L|OOQ[-E=R-E=ROOQ[1G3{1G3{O&>|Q`O,5>bOOQ[,5>d,5>dO&?RQ`O1G4RO9eQ`O7+&fO!)[QlO7+&fOOQO7+%_7+%_O&?WQ?MtO1G6[O?YQ`O7+%_OOQ!0Lf<<Ia<<IaOOQ!0Lf<<Iz<<IzO?YQ`O<<IzOOQO<<Is<<IsO$AzQ!0MxO<<IsO%[QlO<<IsOOQO<<Id<<IdO!COQ!0LrO<<IdO&?bQ!0LrO<<IsO&?mQ!0MxO<= _O&?}Q`O<= ^OOQO7+*`7+*`O9eQ`O7+*`OOQ[ANAlANAlO&@VQ!fOANAlO!&zQMhOANAlO#(ZQ`OANAlO4UQ!fOANAlO&@^Q`OANAlO%[QlOANAlO&@fQ!0MzO7+'{O&BwQ!0MzO,5?bO&ESQ!0MzO,5?dO&G_Q!0MzO7+'}O&IpQ!fO1G4mO&IzQ?MtO7+&aO&LOQ?MvO,5=YO&NVQ?MvO,5=[O&NgQ?MvO,5=YO&NwQ?MvO,5=[O' XQ?MvO,59uO'#_Q?MvO,5<lO'%bQ?MvO,5<nO''vQ?MvO,5<|O')lQ?MtO7+'lO')yQ?MtO7+'nO'*WQ`O,5<^OOQO7+'a7+'aOOQ!0Lh7+*e7+*eO'*]QMjO<<LOOOQO1G4x1G4xO'*dQ`O1G4xO'*oQ`O1G4xO'*}Q`O7++}O'*}Q`O7++}O!&zQMhO1G4zO'+VQ!dO1G4zO'+aQ`O7+,OO'+iQ`O7+(WO'+tQ!dO7+(WOOQ!0Lb7+(U7+(UOOQ!0Lb7+(V7+(VO!CZQpO7+(UOCwQ`O7+(UO',OQ`O7+(WO!&zQMhO7+(WO$+YQ`O7+(VO',TQ`O7+(WOCwQ`O7+(VO',]QMjO<<NxO!,TQMhO<<NxOOQ!0Lh7+$}7+$}O',gQ!dO,5?gOOQO-E<y-E<yO',qQ!0MvO7+(ZO!&zQMhO7+(ZOOQ[AN=gAN=gO9kQ`O1G5XOOQO1G5X1G5XO'-RQ`O1G5XO'-WQ`O7+,WO'-WQ`O7+,WO9uQ!0LrOANBXO@zQ`OANBXOOQ[ANBXANBXO'-`Q`OANBXOOQ[ANAtANAtOOQ[ANAuANAuO'-eQ`O,5?iOOQO-E<{-E<{O'-pQ?MtO1G6iOOQO,5?k,5?kOOQO-E<}-E<}OOQ[1G3b1G3bO'-zQ`O,5=QOOQ[<<Lg<<LgO!&zQMhO<<LgO&=dQ`O<<LgO'.PQ`O<<LgO%[QlO<<LgOOQ[<<Li<<LiO9uQ!0LrO<<LiO$%dQ`O<<LiO9`Q`O<<LiO'.XQpO1G5WO'.dQ`O7+,UOOQ[AN=]AN=]O9uQ!0LrOAN=]OOQ[<= s<= sOOQ[<= t<= tO'.lQ`O<= sO'.qQ`O<= tOOQ[<<Lr<<LrO'.vQ`O<<LrO'.{QlO<<LrOOQ[1G3|1G3|O?YQ`O7+)mO'/SQ`O<<JQO'/_Q?MtO<<JQOOQO<<Hy<<HyOOQ!0LfAN?fAN?fOOQOAN?_AN?_O$AzQ!0MxOAN?_OOQOAN?OAN?OO%[QlOAN?_OOQO<<Mz<<MzOOQ[G27WG27WO!&zQMhOG27WO#(ZQ`OG27WO'/iQ!fOG27WO4UQ!fOG27WO'/pQ`OG27WO'/xQ?MtO<<JgO'0VQ?MvO1G2aO'1{Q?MvO,5?bO'4OQ?MvO,5?dO'6RQ?MvO1G2tO'8UQ?MvO1G2vO':XQ?MtO<<KYO':fQ?MtO<<I{OOQO1G1x1G1xO!,TQMhOANAjOOQO7+*d7+*dO':sQ`O7+*dO';OQ`O<= iO';WQ!dO7+*fOOQ!0Lb<<Kr<<KrO$+YQ`O<<KrOCwQ`O<<KrO';bQ`O<<KrO!&zQMhO<<KrOOQ!0Lb<<Kp<<KpO!CZQpO<<KpO';mQ!dO<<KrOOQ!0Lb<<Kq<<KqO';wQ`O<<KrO!&zQMhO<<KrO$+YQ`O<<KqO';|QMjOANDdO'<WQ!0MvO<<KuOOQO7+*s7+*sO9kQ`O7+*sO'<hQ`O<= rOOQ[G27sG27sO9uQ!0LrOG27sO@zQ`OG27sO!)[QlO1G5TO'<pQ`O7+,TO'<xQ`O1G2lO&=dQ`OANBROOQ[ANBRANBRO!&zQMhOANBRO'<}Q`OANBROOQ[ANBTANBTO9uQ!0LrOANBTO$%dQ`OANBTOOQO'#H`'#H`OOQO7+*r7+*rOOQ[G22wG22wOOQ[ANE_ANE_OOQ[ANE`ANE`OOQ[ANB^ANB^O'=VQ`OANB^OOQ[<<MX<<MXO!)[QlOAN?lOOQOG24yG24yO$AzQ!0MxOG24yO#(ZQ`OLD,rOOQ[LD,rLD,rO!&zQMhOLD,rO'=[Q!fOLD,rO'=cQ?MvO7+'{O'?XQ?MvO,5?bO'A[Q?MvO,5?dO'C_Q?MvO7+'}O'ETQMjOG27UOOQO<<NO<<NOOOQ!0LbANA^ANA^O$+YQ`OANA^OCwQ`OANA^O'EeQ!dOANA^OOQ!0LbANA[ANA[O'ElQ`OANA^O!&zQMhOANA^O'EwQ!dOANA^OOQ!0LbANA]ANA]OOQO<<N_<<N_OOQ[LD-_LD-_O9uQ!0LrOLD-_O'FRQ?MtO7+*oOOQO'#Gg'#GgOOQ[G27mG27mO&=dQ`OG27mO!&zQMhOG27mOOQ[G27oG27oO9uQ!0LrOG27oOOQ[G27xG27xO'F]Q?MtOG25WOOQOLD*eLD*eOOQ[!$(!^!$(!^O#(ZQ`O!$(!^O!&zQMhO!$(!^O'FgQ!0MzOG27UOOQ!0LbG26xG26xO$+YQ`OG26xO'HxQ`OG26xOCwQ`OG26xO'ITQ!dOG26xO!&zQMhOG26xOOQ[!$(!y!$(!yOOQ[LD-XLD-XO&=dQ`OLD-XOOQ[LD-ZLD-ZOOQ[!)9Ex!)9ExO#(ZQ`O!)9ExOOQ!0LbLD,dLD,dO$+YQ`OLD,dOCwQ`OLD,dO'I[Q`OLD,dO'IgQ!dOLD,dOOQ[!$(!s!$(!sOOQ[!.K;d!.K;dO'InQ?MvOG27UOOQ!0Lb!$(!O!$(!OO$+YQ`O!$(!OOCwQ`O!$(!OO'KdQ`O!$(!OOOQ!0Lb!)9Ej!)9EjO$+YQ`O!)9EjOCwQ`O!)9EjOOQ!0Lb!.K;U!.K;UO$+YQ`O!.K;UOOQ!0Lb!4/0p!4/0pO!)[QlO'#DzO1PQ`O'#EXO'KoQ!fO'#JsO'KvQ!L^O'#DvO'K}QlO'#EOO'LUQ!fO'#CiO'NlQ!fO'#CiO!)[QlO'#EQO'N|QlO,5;ZO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO,5;fO!)[QlO'#IqO(#PQ`O,5<jO!)[QlO,5;fO(#XQMhO,5;fO($rQMhO,5;fO!)[QlO,5;xO!&zQMhO'#GnO(#XQMhO'#GnO!&zQMhO'#GpO(#XQMhO'#GpO1SQ`O'#DZO1SQ`O'#DZO!&zQMhO'#GQO(#XQMhO'#GQO!&zQMhO'#GSO(#XQMhO'#GSO!&zQMhO'#GbO(#XQMhO'#GbO!)[QlO,5:jO($yQpO'#D_O!)[QlO,5@pO'N|QlO1G0uO(%TQ?MtO'#CiO!)[QlO1G2QO!&zQMhO'#IvO(#XQMhO'#IvO!&zQMhO'#IxO(#XQMhO'#IxO(%_Q!dO'#CrO!&zQMhO,5<uO(#XQMhO,5<uO'N|QlO1G2SO!)[QlO7+&{O!&zQMhO1G2aO(#XQMhO1G2aO!&zQMhO'#IvO(#XQMhO'#IvO!&zQMhO'#IxO(#XQMhO'#IxO!&zQMhO1G2cO(#XQMhO1G2cO'N|QlO7+'nO'N|QlO7+&aO!&zQMhOANAjO(#XQMhOANAjO(%rQ`O'#EoO(%wQ`O'#EoO(&PQ`O'#F^O(&UQ`O'#EzO(&ZQ`O'#KUO(&fQ`O'#KSO(&qQ`O,5;ZO(&vQMjO,5<fO(&}Q`O'#GZO('SQ`O'#GZO('XQ`O,5<fO('aQ`O,5<hO('iQ`O,5;ZO('qQ?MtO1G1aO('xQ`O,5<uO('}Q`O,5<uO((SQ`O,5<wO((XQ`O,5<wO((^Q`O1G2SO((cQ`O1G0uO((hQMjO<<LOO((oQMjO<<LOO((vQMhO'#F}O9`Q`O'#F|OAuQ`O'#EnO!)[QlO,5;uO!3oQ`O'#GZO!3oQ`O'#GZO!3oQ`O'#G]O!3oQ`O'#G]O!,TQMhO7+(dO!,TQMhO7+(dO%/YQ!dO1G2xO%/YQ!dO1G2xO!&zQMhO,5=^O!&zQMhO,5=^",
  stateData: "(){~O'}OS(OOSTOS(PRQ~OPYOQYOSfOY!VOaqOdzOeyOl!POpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_XO!iuO!lZO!oYO!pYO!qYO!svO!uwO!xxO!|]O$X|O$oiO%i}O%k!QO%m!OO%n!OO%o!OO%r!RO%t!SO%w!TO%x!TO%z!UO&X!WO&_!XO&a!YO&c!ZO&e![O&h!]O&n!^O&t!_O&v!`O&x!aO&z!bO&|!cO(USO(WTO(ZUO(bVO(p[O~OWtO~P`OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$X!kO$oiO(U!dO(WTO(ZUO(bVO(p[O~Oa!wOs!nO!S!oO!b!yO!c!vO!d!vO!|<XO#T!pO#U!pO#V!xO#W!pO#X!pO#[!zO#]!zO(V!lO(WTO(ZUO(f!mO(p!sO~O(P!{O~OP]XR]X[]Xa]Xj]Xr]X!Q]X!S]X!]]X!l]X!p]X#R]X#S]X#`]X#lfX#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#w]X#y]X#{]X#|]X$R]X'{]X(b]X(s]X(z]X({]X~O!g%SX~P(qO_!}O(W#PO(X!}O(Y#PO~O_#QO(Y#PO(Z#PO([#QO~Ox#SO!U#TO(c#TO(d#VO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$X!kO$oiO(U<]O(WTO(ZUO(bVO(p[O~O![#ZO!]#WO!Y(iP!Y(wP~P+}O!^#cO~P`OPYOQYOSfOd!jOe!iOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$X!kO$oiO(WTO(ZUO(bVO(p[O~Op#mO![#iO!|]O#j#lO#k#iO(U<^O!k(tP~P.iO!l#oO(U#nO~O!x#sO!|]O%i#tO~O#l#uO~O!g#vO#l#uO~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!]$_O!l#xO!p$[O#R$RO#o$OO#p$PO#q$PO#r$PO#s$QO#t$RO#u$RO#v$bO#w$SO#y$UO#{$WO#|$XO(bVO(s$YO(z#|O({#}O~Oa(gX'{(gX'x(gX!k(gX!Y(gX!_(gX%j(gX!g(gX~P1qO#S$dO#`$eO$R$eOP(hXR(hX[(hXj(hXr(hX!Q(hX!S(hX!](hX!l(hX!p(hX#R(hX#o(hX#p(hX#q(hX#r(hX#s(hX#t(hX#u(hX#v(hX#w(hX#y(hX#{(hX#|(hX(b(hX(s(hX(z(hX({(hX!_(hX%j(hX~Oa(hX'{(hX'x(hX!Y(hX!k(hXv(hX!g(hX~P4UO#`$eO~O$^$hO$`$gO$g$mO~OSfO!_$nO$j$oO$l$qO~Oh%VOj%dOk%dOp%WOr%XOs$tOt$tOz%YO|%ZO!O%]O!S${O!_$|O!i%bO!l$xO#k%cO$X%`O$u%^O$w%_O$z%aO(U$sO(WTO(ZUO(b$uO(z$}O({%POg(_P~Ol%[O~P7eO!l%eO~O!S%hO!_%iO(U%gO~O!g%mO~Oa%nO'{%nO~O!Q%rO~P%[O(V!lO~P%[O%o%vO~P%[Oh%VO!l%eO(U%gO(V!lO~Oe%}O!l%eO(U%gO~Oj$RO~O!_&PO(U%gO(V!lO(WTO(ZUO`)XP~O!Q&SO!l&RO%k&VO&U&WO~P;SO!x#sO~O%t&YO!S)TX!_)TX(U)TX~O(U&ZO~Ol!PO!u&`O%k!QO%m!OO%n!OO%o!OO%r!RO%t!SO%w!TO%x!TO~Od&eOe&dO!x&bO%i&cO%|&aO~P<bOd&hOeyOl!PO!_&gO!u&`O!xxO!|]O%i}O%m!OO%n!OO%o!OO%r!RO%t!SO%w!TO%x!TO%z!UO~Ob&kO#`&nO%k&iO(V!lO~P=gO!l&oO!u&sO~O!l#oO~O!_XO~Oa%nO'y&{O'{%nO~Oa%nO'y'OO'{%nO~Oa%nO'y'QO'{%nO~O'x]X!Y]Xv]X!k]X&]]X!_]X%j]X!g]X~P(qO!b'`O!c'WO!d'WO(V!lO(WTO(ZUO~Os'UO!S'TO!['XO(f'SO!^(jP!^(yP~P@nOn'cO!_'aO(U%gO~Oe'hO!l%eO(U%gO~O!Q&SO!l&RO~Os!nO!S!oO!|<XO#T!pO#U!pO#W!pO#X!pO(V!lO(WTO(ZUO(f!mO(p!sO~O!b'nO!c'mO!d'mO#V!pO#['oO#]'oO~PBYOa%nOh%VO!g#vO!l%eO'{%nO(s'qO~O!p'uO#`'sO~PChOs!nO!S!oO(WTO(ZUO(f!mO(p!sO~O!_XOs(nX!S(nX!b(nX!c(nX!d(nX!|(nX#T(nX#U(nX#V(nX#W(nX#X(nX#[(nX#](nX(V(nX(W(nX(Z(nX(f(nX(p(nX~O!c'mO!d'mO(V!lO~PDWO(Q'yO(R'yO(S'{O~O_!}O(W'}O(X!}O(Y'}O~O_#QO(Y'}O(Z'}O([#QO~Ov(PO~P%[Ox#SO!U#TO(c#TO(d(SO~O![(UO!Y'XX!Y'_X!]'XX!]'_X~P+}O!](WO!Y(iX~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!](WO!l#xO!p$[O#R$RO#o$OO#p$PO#q$PO#r$PO#s$QO#t$RO#u$RO#v$bO#w$SO#y$UO#{$WO#|$XO(bVO(s$YO(z#|O({#}O~O!Y(iX~PHRO!Y(]O~O!Y(vX!](vX!g(vX!k(vX(s(vX~O#`(vX#l#dX!^(vX~PJUO#`(^O!Y(xX!](xX~O!](_O!Y(wX~O!Y(bO~O#`$eO~PJUO!^(cO~P`OR#zO!Q#yO!S#{O!l#xO(bVOP!na[!naj!nar!na!]!na!p!na#R!na#o!na#p!na#q!na#r!na#s!na#t!na#u!na#v!na#w!na#y!na#{!na#|!na(s!na(z!na({!na~Oa!na'{!na'x!na!Y!na!k!nav!na!_!na%j!na!g!na~PKlO!k(dO~O!g#vO#`(eO(s'qO!](uXa(uX'{(uX~O!k(uX~PNXO!S%hO!_%iO!|]O#j(jO#k(iO(U%gO~O!](kO!k(tX~O!k(mO~O!S%hO!_%iO#k(iO(U%gO~OP(hXR(hX[(hXj(hXr(hX!Q(hX!S(hX!](hX!l(hX!p(hX#R(hX#o(hX#p(hX#q(hX#r(hX#s(hX#t(hX#u(hX#v(hX#w(hX#y(hX#{(hX#|(hX(b(hX(s(hX(z(hX({(hX~O!g#vO!k(hX~P! uOR(oO!Q(nO!l#xO#S$dO!|!{a!S!{a~O!x!{a%i!{a!_!{a#j!{a#k!{a(U!{a~P!#vO!x(sO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_XO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$X!kO$oiO(U!dO(WTO(ZUO(bVO(p[O~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<uO!S${O!_$|O!i>WO!l$xO#k<{O$X%`O$u<wO$w<yO$z%aO(U(wO(WTO(ZUO(b$uO(z$}O({%PO~O#l(yO~O![({O!k(lP~P%[O(f(}O(p[O~O!S)PO!l#xO(f(}O(p[O~OP<WOQ<WOSfOd>SOe!iOpkOr<WOskOtkOzkO|<WO!O<WO!SWO!WkO!XkO!_!eO!i<ZO!lZO!o<WO!p<WO!q<WO!s<[O!u<_O!x!hO$X!kO$o>QO(U)^O(WTO(ZUO(bVO(p[O~O!]$_Oa$ra'{$ra'x$ra!k$ra!Y$ra!_$ra%j$ra!g$ra~Ol)eO~P!&zOh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O%]O!S${O!_$|O!i%bO!l$xO#k%cO$X%`O$u%^O$w%_O$z%aO(U(wO(WTO(ZUO(b$uO(z$}O({%PO~Og(qP~P!,TO!Q)jO!g)iO!_$_X$[$_X$^$_X$`$_X$g$_X~O!g)iO!_(|X$[(|X$^(|X$`(|X$g(|X~O!Q)jO~P!.^O!Q)jO!_(|X$[(|X$^(|X$`(|X$g(|X~O!_)lO$[)pO$^)kO$`)kO$g)qO~O![)tO~P!)[O$^$hO$`$gO$g)xO~On${X!Q${X#S${X'z${X(z${X({${X~OgmXg${XnmX!]mX#`mX~P!0SOx)zO(c){O(d)}O~On*WO!Q*PO'z*QO(z$}O({%PO~Og*OO~P!1WOg*XO~Oh%VOr%XOs$tOt$tOz%YO|%ZO!O<uO!S*ZO!_*[O!i>WO!l$xO#k<{O$X%`O$u<wO$w<yO$z%aO(WTO(ZUO(b$uO(z$}O({%PO~Op*aO![*_O(U*YO!k)PP~P!1uO#l*bO~O!l*cO~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<uO!S${O!_$|O!i>WO!l$xO#k<{O$X%`O$u<wO$w<yO$z%aO(U*eO(WTO(ZUO(b$uO(z$}O({%PO~O![*hO!Y)QP~P!3tOr*tOs!nO!S*jO!b*rO!c*lO!d*lO!l*cO#[*sO%a*nO(V!lO(WTO(ZUO(f!mO~O!^*qO~P!5iO#S$dOn(aX!Q(aX'z(aX(z(aX({(aX!](aX#`(aX~Og(aX$P(aX~P!6kOn*yO#`*xOg(`X!](`X~O!]*zOg(_X~Oj%dOk%dOl%dO(U&ZOg(_P~Os*}O~Og*OO(U&ZO~O!l+TO~O(U(wO~Op+XO!S%hO![#iO!_%iO!|]O#j#lO#k#iO(U%gO!k(tP~O!g#vO#l+YO~O!S%hO![+[O!](_O!_%iO(U%gO!Y(wP~Os']O!S+_O![+^O(WTO(ZUO(f+]O~O!^(yP~P!9|O!]+`Oa)UX'{)UX~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#o$OO#p$PO#q$PO#r$PO#s$QO#t$RO#u$RO#v$bO#w$SO#y$UO#{$WO#|$XO(bVO(s$YO(z#|O({#}O~Oa!ja!]!ja'{!ja'x!ja!Y!ja!k!jav!ja!_!ja%j!ja!g!ja~P!:tO(f(}O~OR#zO!Q#yO!S#{O!l#xO(bVOP!ra[!raj!rar!ra!]!ra!p!ra#R!ra#o!ra#p!ra#q!ra#r!ra#s!ra#t!ra#u!ra#v!ra#w!ra#y!ra#{!ra#|!ra(s!ra(z!ra({!ra~Oa!ra'{!ra'x!ra!Y!ra!k!rav!ra!_!ra%j!ra!g!ra~P!=aOR#zO!Q#yO!S#{O!l#xO(bVOP!ta[!taj!tar!ta!]!ta!p!ta#R!ta#o!ta#p!ta#q!ta#r!ta#s!ta#t!ta#u!ta#v!ta#w!ta#y!ta#{!ta#|!ta(s!ta(z!ta({!ta~Oa!ta'{!ta'x!ta!Y!ta!k!tav!ta!_!ta%j!ta!g!ta~P!?wOh%VOn+iO!_'aO%j+hO~O!g+kOa(^X!_(^X'{(^X!](^X~Oa%nO!_XO'{%nO~Oh%VO!l%eO~Oh%VO!l%eO(U%gO~O!g#vO#l(yO~Ob+vO%k+wO(U+sO(WTO(ZUO!^)YP~O!]+xO`)XX~O[+|O~O`+}O~O!_&PO(U%gO(V!lO`)XP~O%k,QO~P;SOh%VO#`,UO~Oh%VOn,XO!_$|O~O!_,ZO~O!Q,]O!_XO~O%o%vO~O!x,bO~Oe,gO~Ob,hO(U#nO(WTO(ZUO!^)WP~Oe%}O~O%k!QO(U&ZO~P=gO[,mO`,lO~OPYOQYOSfOdzOeyOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!iuO!lZO!oYO!pYO!qYO!svO!xxO!|]O$oiO%i}O(WTO(ZUO(bVO(p[O~O!_!eO!u!gO$X!kO(U!dO~P!GOO`,lOa%nO'{%nO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!x!hO$X!kO$oiO(U!dO(WTO(ZUO(bVO(p[O~Oa,rOl!OO!uwO%m!OO%n!OO%o!OO~P!IhO!l&oO~O&_,xO~O!_,zO~O&p,|O&r,}OP&maQ&maS&maY&maa&mad&mae&mal&map&mar&mas&mat&maz&ma|&ma!O&ma!S&ma!W&ma!X&ma!_&ma!i&ma!l&ma!o&ma!p&ma!q&ma!s&ma!u&ma!x&ma!|&ma$X&ma$o&ma%i&ma%k&ma%m&ma%n&ma%o&ma%r&ma%t&ma%w&ma%x&ma%z&ma&X&ma&_&ma&a&ma&c&ma&e&ma&h&ma&n&ma&t&ma&v&ma&x&ma&z&ma&|&ma'x&ma(U&ma(W&ma(Z&ma(b&ma(p&ma!^&ma&f&mab&ma&k&ma~O(U-SO~Oh!eX!]#iX!^#iX!g!RX!g!eX!l!eX#`#iX~O!]!eX!^!eX~P#!nO!g-WOh(kX!](kX!^(kX!g(kX!l(kXr(kX(s(kX~Oh%VO!g-YO!l%eO!]!aX!^!aX~Os!nO!S!oO(WTO(ZUO(f!mO~OP<WOQ<WOSfOd>SOe!iOpkOr<WOskOtkOzkO|<WO!O<WO!SWO!WkO!XkO!_!eO!i<ZO!lZO!o<WO!p<WO!q<WO!s<[O!u<_O!x!hO$X!kO$o>QO(WTO(ZUO(bVO(p[O~O(U=RO~P#$oO!]-^O!^(jX~O!^-`O~O#`-aO!]#hX!^#hX~O!g-WO~O!]-bO!^(yX~O!^-dO~O!c-eO!d-eO(V!lO~P#$^O!^-hO~P'_On-kO!_'aO~O!Y-pO~Os!{a!b!{a!c!{a!d!{a#T!{a#U!{a#V!{a#W!{a#X!{a#[!{a#]!{a(V!{a(W!{a(Z!{a(f!{a(p!{a~P!#vO!p-uO#`-sO~PChO!c-wO!d-wO(V!lO~PDWOa%nO#`-sO'{%nO~Oa%nO!g#vO#`-sO'{%nO~Oa%nO!g#vO!p-uO#`-sO'{%nO(s'qO~O(Q'yO(R'yO(S-|O~Ov-}O~O!Y'Xa!]'Xa~P!:tO![.RO!Y'XX!]'XX~P%[O!](WO!Y(ia~O!Y(ia~PHRO!](_O!Y(wa~O!S%hO![.VO!_%iO(U%gO!Y'_X!]'_X~O#`.XO!](ua!k(uaa(ua'{(ua~O!g#vO~P#,wO!](kO!k(ta~O!S%hO!_%iO#k.]O(U%gO~Op.bO!S%hO![._O!_%iO!|]O#j.aO#k._O(U%gO!]'bX!k'bX~OR.fO!l#xO~Oh%VOn.iO!_'aO%j.hO~Oa#ci!]#ci'{#ci'x#ci!Y#ci!k#civ#ci!_#ci%j#ci!g#ci~P!:tOn>^O!Q*PO'z*QO(z$}O({%PO~O#l#_aa#_a#`#_a'{#_a!]#_a!k#_a!_#_a!Y#_a~P#/sO#l(aXP(aXR(aX[(aXa(aXj(aXr(aX!S(aX!l(aX!p(aX#R(aX#o(aX#p(aX#q(aX#r(aX#s(aX#t(aX#u(aX#v(aX#w(aX#y(aX#{(aX#|(aX'{(aX(b(aX(s(aX!k(aX!Y(aX'x(aXv(aX!_(aX%j(aX!g(aX~P!6kO!].vO!k(lX~P!:tO!k.yO~O!Y.{O~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O(bVO[#nia#nij#nir#ni!]#ni#R#ni#p#ni#q#ni#r#ni#s#ni#t#ni#u#ni#v#ni#w#ni#y#ni#{#ni#|#ni'{#ni(s#ni(z#ni({#ni'x#ni!Y#ni!k#niv#ni!_#ni%j#ni!g#ni~O#o#ni~P#3cO#o$OO~P#3cOP$[OR#zOr$aO!Q#yO!S#{O!l#xO!p$[O#o$OO#p$PO#q$PO#r$PO(bVO[#nia#nij#ni!]#ni#R#ni#t#ni#u#ni#v#ni#w#ni#y#ni#{#ni#|#ni'{#ni(s#ni(z#ni({#ni'x#ni!Y#ni!k#niv#ni!_#ni%j#ni!g#ni~O#s#ni~P#6QO#s$QO~P#6QOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#o$OO#p$PO#q$PO#r$PO#s$QO#t$RO#u$RO#v$bO(bVOa#ni!]#ni#y#ni#{#ni#|#ni'{#ni(s#ni(z#ni({#ni'x#ni!Y#ni!k#niv#ni!_#ni%j#ni!g#ni~O#w#ni~P#8oOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#o$OO#p$PO#q$PO#r$PO#s$QO#t$RO#u$RO#v$bO#w$SO(bVO({#}Oa#ni!]#ni#{#ni#|#ni'{#ni(s#ni(z#ni'x#ni!Y#ni!k#niv#ni!_#ni%j#ni!g#ni~O#y$UO~P#;VO#y#ni~P#;VO#w$SO~P#8oOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#o$OO#p$PO#q$PO#r$PO#s$QO#t$RO#u$RO#v$bO#w$SO#y$UO(bVO(z#|O({#}Oa#ni!]#ni#|#ni'{#ni(s#ni'x#ni!Y#ni!k#niv#ni!_#ni%j#ni!g#ni~O#{#ni~P#={O#{$WO~P#={OP]XR]X[]Xj]Xr]X!Q]X!S]X!l]X!p]X#R]X#S]X#`]X#lfX#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#w]X#y]X#{]X#|]X$R]X(b]X(s]X(z]X({]X!]]X!^]X~O$P]X~P#@jOP$[OR#zO[<oOj<dOr<mO!Q#yO!S#{O!l#xO!p$[O#R<dO#o<aO#p<bO#q<bO#r<bO#s<cO#t<dO#u<dO#v<nO#w<eO#y<gO#{<iO#|<jO(bVO(s$YO(z#|O({#}O~O$P.}O~P#BwO#S$dO#`<pO$R<pO$P(hX!^(hX~P! uOa'ea!]'ea'{'ea'x'ea!k'ea!Y'eav'ea!_'ea%j'ea!g'ea~P!:tO[#nia#nij#nir#ni!]#ni#R#ni#s#ni#t#ni#u#ni#v#ni#w#ni#y#ni#{#ni#|#ni'{#ni(s#ni'x#ni!Y#ni!k#niv#ni!_#ni%j#ni!g#ni~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O#o$OO#p$PO#q$PO#r$PO(bVO(z#ni({#ni~P#EyOn>^O!Q*PO'z*QO(z$}O({%POP#niR#ni!S#ni!l#ni!p#ni#o#ni#p#ni#q#ni#r#ni(b#ni~P#EyO!]/ROg(qX~P!1WOg/TO~Oa$Qi!]$Qi'{$Qi'x$Qi!Y$Qi!k$Qiv$Qi!_$Qi%j$Qi!g$Qi~P!:tO$^/UO$`/UO~O$^/VO$`/VO~O!g)iO#`/WO!_$dX$[$dX$^$dX$`$dX$g$dX~O![/XO~O!_)lO$[/ZO$^)kO$`)kO$g/[O~O!]<kO!^(gX~P#BwO!^/]O~O!g)iO$g(|X~O$g/_O~Ov/`O~P!&zOx)zO(c){O(d/cO~O!S/fO~O(z$}On%ba!Q%ba'z%ba({%ba!]%ba#`%ba~Og%ba$P%ba~P#L{O({%POn%da!Q%da'z%da(z%da!]%da#`%da~Og%da$P%da~P#MnO!]fX!gfX!kfX!k${X(sfX~P!0SOp%WO![/oO!](_O(U/nO!Y(wP!Y)QP~P!1uOr*tO!b*rO!c*lO!d*lO!l*cO#[*sO%a*nO(V!lO(WTO(ZUO~Os'UO!S/pO![+^O!^*qO(f=OO!^(yP~P$ [O!k/qO~P#/sO!]/rO!g#vO(s'qO!k)PX~O!k/wO~OnoX!QoX'zoX(zoX({oX~O!g#vO!koX~P$#OOp/yO!S%hO![*_O!_%iO(U%gO!k)PP~O#l/zO~O!Y${X!]${X!g%SX~P!0SO!]/{O!Y)QX~P#/sO!g/}O~O!Y0PO~OpkO(U0QO~P.iOh%VOr0VO!g#vO!l%eO(s'qO~O!g+kO~Oa%nO!]0ZO'{%nO~O!^0]O~P!5iO!c0^O!d0^O(V!lO~P#$^Os!nO!S0_O(WTO(ZUO(f!mO~O#[0aO~Og%ba!]%ba#`%ba$P%ba~P!1WOg%da!]%da#`%da$P%da~P!1WOj%dOk%dOl%dO(U&ZOg'nX!]'nX~O!]*zOg(_a~Og0jO~On0lO#`0kOg(`a!](`a~OR0mO!Q0mO!S0nO#S$dOn}a'z}a(z}a({}a!]}a#`}a~Og}a$P}a~P$(cO!Q*PO'z*QOn$ta(z$ta({$ta!]$ta#`$ta~Og$ta$P$ta~P$)_O!Q*PO'z*QOn$va(z$va({$va!]$va#`$va~Og$va$P$va~P$*QO#l0qO~Og%Ua!]%Ua#`%Ua$P%Ua~P!1WO!g#vO~O#l0tO~O!]#iX!^#iX!g!RX#`#iX~O!]+`Oa)Ua'{)Ua~OR#zO!Q#yO!S#{O!l#xO(bVOP!ri[!rij!rir!ri!]!ri!p!ri#R!ri#o!ri#p!ri#q!ri#r!ri#s!ri#t!ri#u!ri#v!ri#w!ri#y!ri#{!ri#|!ri(s!ri(z!ri({!ri~Oa!ri'{!ri'x!ri!Y!ri!k!riv!ri!_!ri%j!ri!g!ri~P$+}Oh%VOr%XOs$tOt$tOz%YO|%ZO!O<uO!S${O!_$|O!i>WO!l$xO#k<{O$X%`O$u<wO$w<yO$z%aO(WTO(ZUO(b$uO(z$}O({%PO~Op0}O%^1OO(U0|O~P$.eO!g+kOa(^a!_(^a'{(^a!](^a~O#l1UO~O[]X!]fX!^fX~O!]1VO!^)YX~O!^1XO~O[1YO~Ob1[O(U+sO(WTO(ZUO~O!_&PO(U%gO`'vX!]'vX~O!]+xO`)Xa~O!k1_O~P!:tO[1bO~O`1cO~O#`1hO~On1kO!_$|O~O(f(}O!^)VP~Oh%VOn1tO!_1qO%j1sO~O[2OO!]1|O!^)WX~O!^2PO~O`2ROa%nO'{%nO~O(U#nO(WTO(ZUO~O#S$dO#`$eO$R$eOP(hXR(hX[(hXr(hX!Q(hX!S(hX!](hX!l(hX!p(hX#R(hX#o(hX#p(hX#q(hX#r(hX#s(hX#t(hX#u(hX#v(hX#w(hX#y(hX#{(hX#|(hX(b(hX(s(hX(z(hX({(hX~Oj2UO&]2VOa(hX~P$4OOj2UO#`$eO&]2VO~Oa2XO~P%[Oa2ZO~O&f2^OP&diQ&diS&diY&dia&did&die&dil&dip&dir&dis&dit&diz&di|&di!O&di!S&di!W&di!X&di!_&di!i&di!l&di!o&di!p&di!q&di!s&di!u&di!x&di!|&di$X&di$o&di%i&di%k&di%m&di%n&di%o&di%r&di%t&di%w&di%x&di%z&di&X&di&_&di&a&di&c&di&e&di&h&di&n&di&t&di&v&di&x&di&z&di&|&di'x&di(U&di(W&di(Z&di(b&di(p&di!^&dib&di&k&di~Ob2dO!^2bO&k2cO~P`O!_XO!l2fO~O&r,}OP&miQ&miS&miY&mia&mid&mie&mil&mip&mir&mis&mit&miz&mi|&mi!O&mi!S&mi!W&mi!X&mi!_&mi!i&mi!l&mi!o&mi!p&mi!q&mi!s&mi!u&mi!x&mi!|&mi$X&mi$o&mi%i&mi%k&mi%m&mi%n&mi%o&mi%r&mi%t&mi%w&mi%x&mi%z&mi&X&mi&_&mi&a&mi&c&mi&e&mi&h&mi&n&mi&t&mi&v&mi&x&mi&z&mi&|&mi'x&mi(U&mi(W&mi(Z&mi(b&mi(p&mi!^&mi&f&mib&mi&k&mi~O!Y2lO~O!]!aa!^!aa~P#BwOs!nO!S!oO![2qO(f!mO!]'YX!^'YX~P@nO!]-^O!^(ja~O!]'`X!^'`X~P!9|O!]-bO!^(ya~O!^2yO~P'_Oa%nO#`3SO'{%nO~Oa%nO!g#vO#`3SO'{%nO~Oa%nO!g#vO!p3WO#`3SO'{%nO(s'qO~Oa%nO'{%nO~P!:tO!]$_Ov$ra~O!Y'Xi!]'Xi~P!:tO!](WO!Y(ii~O!](_O!Y(wi~O!Y(xi!](xi~P!:tO!](ui!k(uia(ui'{(ui~P!:tO#`3YO!](ui!k(uia(ui'{(ui~O!](kO!k(ti~O!S%hO!_%iO!|]O#j3_O#k3^O(U%gO~O!S%hO!_%iO#k3^O(U%gO~On3fO!_'aO%j3eO~Oh%VOn3fO!_'aO%j3eO~O#l%baP%baR%ba[%baa%baj%bar%ba!S%ba!l%ba!p%ba#R%ba#o%ba#p%ba#q%ba#r%ba#s%ba#t%ba#u%ba#v%ba#w%ba#y%ba#{%ba#|%ba'{%ba(b%ba(s%ba!k%ba!Y%ba'x%bav%ba!_%ba%j%ba!g%ba~P#L{O#l%daP%daR%da[%daa%daj%dar%da!S%da!l%da!p%da#R%da#o%da#p%da#q%da#r%da#s%da#t%da#u%da#v%da#w%da#y%da#{%da#|%da'{%da(b%da(s%da!k%da!Y%da'x%dav%da!_%da%j%da!g%da~P#MnO#l%baP%baR%ba[%baa%baj%bar%ba!S%ba!]%ba!l%ba!p%ba#R%ba#o%ba#p%ba#q%ba#r%ba#s%ba#t%ba#u%ba#v%ba#w%ba#y%ba#{%ba#|%ba'{%ba(b%ba(s%ba!k%ba!Y%ba'x%ba#`%bav%ba!_%ba%j%ba!g%ba~P#/sO#l%daP%daR%da[%daa%daj%dar%da!S%da!]%da!l%da!p%da#R%da#o%da#p%da#q%da#r%da#s%da#t%da#u%da#v%da#w%da#y%da#{%da#|%da'{%da(b%da(s%da!k%da!Y%da'x%da#`%dav%da!_%da%j%da!g%da~P#/sO#l}aP}a[}aa}aj}ar}a!l}a!p}a#R}a#o}a#p}a#q}a#r}a#s}a#t}a#u}a#v}a#w}a#y}a#{}a#|}a'{}a(b}a(s}a!k}a!Y}a'x}av}a!_}a%j}a!g}a~P$(cO#l$taP$taR$ta[$taa$taj$tar$ta!S$ta!l$ta!p$ta#R$ta#o$ta#p$ta#q$ta#r$ta#s$ta#t$ta#u$ta#v$ta#w$ta#y$ta#{$ta#|$ta'{$ta(b$ta(s$ta!k$ta!Y$ta'x$tav$ta!_$ta%j$ta!g$ta~P$)_O#l$vaP$vaR$va[$vaa$vaj$var$va!S$va!l$va!p$va#R$va#o$va#p$va#q$va#r$va#s$va#t$va#u$va#v$va#w$va#y$va#{$va#|$va'{$va(b$va(s$va!k$va!Y$va'x$vav$va!_$va%j$va!g$va~P$*QO#l%UaP%UaR%Ua[%Uaa%Uaj%Uar%Ua!S%Ua!]%Ua!l%Ua!p%Ua#R%Ua#o%Ua#p%Ua#q%Ua#r%Ua#s%Ua#t%Ua#u%Ua#v%Ua#w%Ua#y%Ua#{%Ua#|%Ua'{%Ua(b%Ua(s%Ua!k%Ua!Y%Ua'x%Ua#`%Uav%Ua!_%Ua%j%Ua!g%Ua~P#/sOa#cq!]#cq'{#cq'x#cq!Y#cq!k#cqv#cq!_#cq%j#cq!g#cq~P!:tO![3nO!]'ZX!k'ZX~P%[O!].vO!k(la~O!].vO!k(la~P!:tO!Y3qO~O$P!na!^!na~PKlO$P!ja!]!ja!^!ja~P#BwO$P!ra!^!ra~P!=aO$P!ta!^!ta~P!?wOg'^X!]'^X~P!,TO!]/ROg(qa~OSfO!_4VO$e4WO~O!^4[O~Ov4]O~P#/sOa$nq!]$nq'{$nq'x$nq!Y$nq!k$nqv$nq!_$nq%j$nq!g$nq~P!:tO!Y4_O~P!&zO!S4`O~O!Q*PO'z*QO({%POn'ja(z'ja!]'ja#`'ja~Og'ja$P'ja~P%-tO!Q*PO'z*QOn'la(z'la({'la!]'la#`'la~Og'la$P'la~P%.gO(s$YO~P#/sO!YfX!Y${X!]fX!]${X!g%SX#`fX~P!0SOp%WO(U=XO~P!1uOp4dO!S%hO![4cO!_%iO(U%gO!]'fX!k'fX~O!]/rO!k)Pa~O!]/rO!g#vO!k)Pa~O!]/rO!g#vO(s'qO!k)Pa~Og$}i!]$}i#`$}i$P$}i~P!1WO![4lO!Y'hX!]'hX~P!3tO!]/{O!Y)Qa~O!]/{O!Y)Qa~P#/sOP]XR]X[]Xj]Xr]X!Q]X!S]X!Y]X!]]X!l]X!p]X#R]X#S]X#`]X#lfX#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#w]X#y]X#{]X#|]X$R]X(b]X(s]X(z]X({]X~Oj%ZX!g%ZX~P%2^Oj4qO!g#vO~Oh%VO!g#vO!l%eO~Oh%VOr4vO!l%eO(s'qO~Or4{O!g#vO(s'qO~Os!nO!S4|O(WTO(ZUO(f!mO~O(z$}On%bi!Q%bi'z%bi({%bi!]%bi#`%bi~Og%bi$P%bi~P%5}O({%POn%di!Q%di'z%di(z%di!]%di#`%di~Og%di$P%di~P%6pOg(`i!](`i~P!1WO#`5SOg(`i!](`i~P!1WO!k5XO~Oa$pq!]$pq'{$pq'x$pq!Y$pq!k$pqv$pq!_$pq%j$pq!g$pq~P!:tO!Y5]O~O!]5^O!_)RX~P#/sOa${X!_${X%_]X'{${X!]${X~P!0SO%_5aOaoX!_oX'{oX!]oX~P$#OOp5bO(U#nO~O%_5aO~Ob5hO%k5iO(U+sO(WTO(ZUO!]'uX!^'uX~O!]1VO!^)Ya~O[5mO~O`5nO~O[5rO~Oa%nO'{%nO~P#/sO!]5wO#`5yO!^)VX~O!^5zO~Or6QOs!nO!S*jO!b!yO!c!vO!d!vO!|<XO#T!pO#U!pO#V!pO#W!pO#X!pO#[6PO#]!zO(V!lO(WTO(ZUO(f!mO(p!sO~O!^6OO~P%;sOn6VO!_1qO%j6UO~Oh%VOn6VO!_1qO%j6UO~Ob6^O(U#nO(WTO(ZUO!]'tX!^'tX~O!]1|O!^)Wa~O(WTO(ZUO(f6`O~O`6dO~Oj6gO&]6hO~PNXO!k6iO~P%[Oa6kO~Oa6kO~P%[Ob2dO!^6pO&k2cO~P`O!g6rO~O!g6tOh(ki!](ki!^(ki!g(ki!l(kir(ki(s(ki~O#`6uO!]#hi!^#hi~O!]!ai!^!ai~P#BwO!]#hi!^#hi~P#BwOa%nO#`7OO'{%nO~Oa%nO!g#vO#`7OO'{%nO~O!](uq!k(uqa(uq'{(uq~P!:tO!](kO!k(tq~O!S%hO!_%iO#k7VO(U%gO~O!_'aO%j7YO~On7^O!_'aO%j7YO~O#l'jaP'jaR'ja['jaa'jaj'jar'ja!S'ja!l'ja!p'ja#R'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#v'ja#w'ja#y'ja#{'ja#|'ja'{'ja(b'ja(s'ja!k'ja!Y'ja'x'jav'ja!_'ja%j'ja!g'ja~P%-tO#l'laP'laR'la['laa'laj'lar'la!S'la!l'la!p'la#R'la#o'la#p'la#q'la#r'la#s'la#t'la#u'la#v'la#w'la#y'la#{'la#|'la'{'la(b'la(s'la!k'la!Y'la'x'lav'la!_'la%j'la!g'la~P%.gO#l$}iP$}iR$}i[$}ia$}ij$}ir$}i!S$}i!]$}i!l$}i!p$}i#R$}i#o$}i#p$}i#q$}i#r$}i#s$}i#t$}i#u$}i#v$}i#w$}i#y$}i#{$}i#|$}i'{$}i(b$}i(s$}i!k$}i!Y$}i'x$}i#`$}iv$}i!_$}i%j$}i!g$}i~P#/sO#l%biP%biR%bi[%bia%bij%bir%bi!S%bi!l%bi!p%bi#R%bi#o%bi#p%bi#q%bi#r%bi#s%bi#t%bi#u%bi#v%bi#w%bi#y%bi#{%bi#|%bi'{%bi(b%bi(s%bi!k%bi!Y%bi'x%biv%bi!_%bi%j%bi!g%bi~P%5}O#l%diP%diR%di[%dia%dij%dir%di!S%di!l%di!p%di#R%di#o%di#p%di#q%di#r%di#s%di#t%di#u%di#v%di#w%di#y%di#{%di#|%di'{%di(b%di(s%di!k%di!Y%di'x%div%di!_%di%j%di!g%di~P%6pO!]'Za!k'Za~P!:tO!].vO!k(li~O$P#ci!]#ci!^#ci~P#BwOP$[OR#zO!Q#yO!S#{O!l#xO!p$[O(bVO[#nij#nir#ni#R#ni#p#ni#q#ni#r#ni#s#ni#t#ni#u#ni#v#ni#w#ni#y#ni#{#ni#|#ni$P#ni(s#ni(z#ni({#ni!]#ni!^#ni~O#o#ni~P%NrO#o<aO~P%NrOP$[OR#zOr<mO!Q#yO!S#{O!l#xO!p$[O#o<aO#p<bO#q<bO#r<bO(bVO[#nij#ni#R#ni#t#ni#u#ni#v#ni#w#ni#y#ni#{#ni#|#ni$P#ni(s#ni(z#ni({#ni!]#ni!^#ni~O#s#ni~P&!zO#s<cO~P&!zOP$[OR#zO[<oOj<dOr<mO!Q#yO!S#{O!l#xO!p$[O#R<dO#o<aO#p<bO#q<bO#r<bO#s<cO#t<dO#u<dO#v<nO(bVO#y#ni#{#ni#|#ni$P#ni(s#ni(z#ni({#ni!]#ni!^#ni~O#w#ni~P&%SOP$[OR#zO[<oOj<dOr<mO!Q#yO!S#{O!l#xO!p$[O#R<dO#o<aO#p<bO#q<bO#r<bO#s<cO#t<dO#u<dO#v<nO#w<eO(bVO({#}O#{#ni#|#ni$P#ni(s#ni(z#ni!]#ni!^#ni~O#y<gO~P&'TO#y#ni~P&'TO#w<eO~P&%SOP$[OR#zO[<oOj<dOr<mO!Q#yO!S#{O!l#xO!p$[O#R<dO#o<aO#p<bO#q<bO#r<bO#s<cO#t<dO#u<dO#v<nO#w<eO#y<gO(bVO(z#|O({#}O#|#ni$P#ni(s#ni!]#ni!^#ni~O#{#ni~P&)dO#{<iO~P&)dOa#}y!]#}y'{#}y'x#}y!Y#}y!k#}yv#}y!_#}y%j#}y!g#}y~P!:tO[#nij#nir#ni#R#ni#s#ni#t#ni#u#ni#v#ni#w#ni#y#ni#{#ni#|#ni$P#ni(s#ni!]#ni!^#ni~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O#o<aO#p<bO#q<bO#r<bO(bVO(z#ni({#ni~P&,`On>_O!Q*PO'z*QO(z$}O({%POP#niR#ni!S#ni!l#ni!p#ni#o#ni#p#ni#q#ni#r#ni(b#ni~P&,`O#S$dOP(aXR(aX[(aXj(aXn(aXr(aX!Q(aX!S(aX!l(aX!p(aX#R(aX#o(aX#p(aX#q(aX#r(aX#s(aX#t(aX#u(aX#v(aX#w(aX#y(aX#{(aX#|(aX$P(aX'z(aX(b(aX(s(aX(z(aX({(aX!](aX!^(aX~O$P$Qi!]$Qi!^$Qi~P#BwO$P!ri!^!ri~P$+}Og'^a!]'^a~P!1WO!^7pO~O!]'ea!^'ea~P#BwO!Y7qO~P#/sO!g#vO(s'qO!]'fa!k'fa~O!]/rO!k)Pi~O!]/rO!g#vO!k)Pi~Og$}q!]$}q#`$}q$P$}q~P!1WO!Y'ha!]'ha~P#/sO!g7xO~O!]/{O!Y)Qi~P#/sO!]/{O!Y)Qi~O!Y7{O~Oh%VOr8QO!l%eO(s'qO~Oj8SO!g#vO~Or8VO!g#vO(s'qO~O!Q*PO'z*QO({%POn'ka(z'ka!]'ka#`'ka~Og'ka$P'ka~P&5aO!Q*PO'z*QOn'ma(z'ma({'ma!]'ma#`'ma~Og'ma$P'ma~P&6SOg(`q!](`q~P!1WO#`8XOg(`q!](`q~P!1WO!Y8YO~Og%Pq!]%Pq#`%Pq$P%Pq~P!1WOa$py!]$py'{$py'x$py!Y$py!k$pyv$py!_$py%j$py!g$py~P!:tO!g6tO~O!]5^O!_)Ra~O!_'aOP$UaR$Ua[$Uaj$Uar$Ua!Q$Ua!S$Ua!]$Ua!l$Ua!p$Ua#R$Ua#o$Ua#p$Ua#q$Ua#r$Ua#s$Ua#t$Ua#u$Ua#v$Ua#w$Ua#y$Ua#{$Ua#|$Ua(b$Ua(s$Ua(z$Ua({$Ua~O%j7YO~P&8tO%_8^Oa%]i!_%]i'{%]i!]%]i~Oa#cy!]#cy'{#cy'x#cy!Y#cy!k#cyv#cy!_#cy%j#cy!g#cy~P!:tO[8`O~Ob8bO(U+sO(WTO(ZUO~O!]1VO!^)Yi~O`8fO~O(f(}O!]'qX!^'qX~O!]5wO!^)Va~O!^8pO~P%;sO(p!sO~P$&YO#[8qO~O!_1qO~O!_1qO%j8sO~On8vO!_1qO%j8sO~O[8{O!]'ta!^'ta~O!]1|O!^)Wi~O!k9PO~O!k9QO~O!k9TO~O!k9TO~P%[Oa9VO~O!g9WO~O!k9XO~O!](xi!^(xi~P#BwOa%nO#`9aO'{%nO~O!](uy!k(uya(uy'{(uy~P!:tO!](kO!k(ty~O%j9dO~P&8tO!_'aO%j9dO~O#l$}qP$}qR$}q[$}qa$}qj$}qr$}q!S$}q!]$}q!l$}q!p$}q#R$}q#o$}q#p$}q#q$}q#r$}q#s$}q#t$}q#u$}q#v$}q#w$}q#y$}q#{$}q#|$}q'{$}q(b$}q(s$}q!k$}q!Y$}q'x$}q#`$}qv$}q!_$}q%j$}q!g$}q~P#/sO#l'kaP'kaR'ka['kaa'kaj'kar'ka!S'ka!l'ka!p'ka#R'ka#o'ka#p'ka#q'ka#r'ka#s'ka#t'ka#u'ka#v'ka#w'ka#y'ka#{'ka#|'ka'{'ka(b'ka(s'ka!k'ka!Y'ka'x'kav'ka!_'ka%j'ka!g'ka~P&5aO#l'maP'maR'ma['maa'maj'mar'ma!S'ma!l'ma!p'ma#R'ma#o'ma#p'ma#q'ma#r'ma#s'ma#t'ma#u'ma#v'ma#w'ma#y'ma#{'ma#|'ma'{'ma(b'ma(s'ma!k'ma!Y'ma'x'mav'ma!_'ma%j'ma!g'ma~P&6SO#l%PqP%PqR%Pq[%Pqa%Pqj%Pqr%Pq!S%Pq!]%Pq!l%Pq!p%Pq#R%Pq#o%Pq#p%Pq#q%Pq#r%Pq#s%Pq#t%Pq#u%Pq#v%Pq#w%Pq#y%Pq#{%Pq#|%Pq'{%Pq(b%Pq(s%Pq!k%Pq!Y%Pq'x%Pq#`%Pqv%Pq!_%Pq%j%Pq!g%Pq~P#/sO!]'Zi!k'Zi~P!:tO$P#cq!]#cq!^#cq~P#BwO(z$}OP%baR%ba[%baj%bar%ba!S%ba!l%ba!p%ba#R%ba#o%ba#p%ba#q%ba#r%ba#s%ba#t%ba#u%ba#v%ba#w%ba#y%ba#{%ba#|%ba$P%ba(b%ba(s%ba!]%ba!^%ba~On%ba!Q%ba'z%ba({%ba~P&JXO({%POP%daR%da[%daj%dar%da!S%da!l%da!p%da#R%da#o%da#p%da#q%da#r%da#s%da#t%da#u%da#v%da#w%da#y%da#{%da#|%da$P%da(b%da(s%da!]%da!^%da~On%da!Q%da'z%da(z%da~P&L`On>_O!Q*PO'z*QO({%PO~P&JXOn>_O!Q*PO'z*QO(z$}O~P&L`OR0mO!Q0mO!S0nO#S$dOP}a[}aj}an}ar}a!l}a!p}a#R}a#o}a#p}a#q}a#r}a#s}a#t}a#u}a#v}a#w}a#y}a#{}a#|}a$P}a'z}a(b}a(s}a(z}a({}a!]}a!^}a~O!Q*PO'z*QOP$taR$ta[$taj$tan$tar$ta!S$ta!l$ta!p$ta#R$ta#o$ta#p$ta#q$ta#r$ta#s$ta#t$ta#u$ta#v$ta#w$ta#y$ta#{$ta#|$ta$P$ta(b$ta(s$ta(z$ta({$ta!]$ta!^$ta~O!Q*PO'z*QOP$vaR$va[$vaj$van$var$va!S$va!l$va!p$va#R$va#o$va#p$va#q$va#r$va#s$va#t$va#u$va#v$va#w$va#y$va#{$va#|$va$P$va(b$va(s$va(z$va({$va!]$va!^$va~On>_O!Q*PO'z*QO(z$}O({%PO~OP%UaR%Ua[%Uaj%Uar%Ua!S%Ua!l%Ua!p%Ua#R%Ua#o%Ua#p%Ua#q%Ua#r%Ua#s%Ua#t%Ua#u%Ua#v%Ua#w%Ua#y%Ua#{%Ua#|%Ua$P%Ua(b%Ua(s%Ua!]%Ua!^%Ua~P''eO$P$nq!]$nq!^$nq~P#BwO$P$pq!]$pq!^$pq~P#BwO!^9qO~O$P9rO~P!1WO!g#vO!]'fi!k'fi~O!g#vO(s'qO!]'fi!k'fi~O!]/rO!k)Pq~O!Y'hi!]'hi~P#/sO!]/{O!Y)Qq~Or9yO!g#vO(s'qO~O[9{O!Y9zO~P#/sO!Y9zO~Oj:RO!g#vO~Og(`y!](`y~P!1WO!]'oa!_'oa~P#/sOa%]q!_%]q'{%]q!]%]q~P#/sO[:WO~O!]1VO!^)Yq~O`:[O~O#`:]O!]'qa!^'qa~O!]5wO!^)Vi~P#BwO!S:_O~O!_1qO%j:bO~O(WTO(ZUO(f:gO~O!]1|O!^)Wq~O!k:jO~O!k:kO~O!k:lO~O!k:lO~P%[O#`:oO!]#hy!^#hy~O!]#hy!^#hy~P#BwO%j:tO~P&8tO!_'aO%j:tO~O$P#}y!]#}y!^#}y~P#BwOP$}iR$}i[$}ij$}ir$}i!S$}i!l$}i!p$}i#R$}i#o$}i#p$}i#q$}i#r$}i#s$}i#t$}i#u$}i#v$}i#w$}i#y$}i#{$}i#|$}i$P$}i(b$}i(s$}i!]$}i!^$}i~P''eO!Q*PO'z*QO({%POP'jaR'ja['jaj'jan'jar'ja!S'ja!l'ja!p'ja#R'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#v'ja#w'ja#y'ja#{'ja#|'ja$P'ja(b'ja(s'ja(z'ja!]'ja!^'ja~O!Q*PO'z*QOP'laR'la['laj'lan'lar'la!S'la!l'la!p'la#R'la#o'la#p'la#q'la#r'la#s'la#t'la#u'la#v'la#w'la#y'la#{'la#|'la$P'la(b'la(s'la(z'la({'la!]'la!^'la~O(z$}OP%biR%bi[%bij%bin%bir%bi!Q%bi!S%bi!l%bi!p%bi#R%bi#o%bi#p%bi#q%bi#r%bi#s%bi#t%bi#u%bi#v%bi#w%bi#y%bi#{%bi#|%bi$P%bi'z%bi(b%bi(s%bi({%bi!]%bi!^%bi~O({%POP%diR%di[%dij%din%dir%di!Q%di!S%di!l%di!p%di#R%di#o%di#p%di#q%di#r%di#s%di#t%di#u%di#v%di#w%di#y%di#{%di#|%di$P%di'z%di(b%di(s%di(z%di!]%di!^%di~O$P$py!]$py!^$py~P#BwO$P#cy!]#cy!^#cy~P#BwO!g#vO!]'fq!k'fq~O!]/rO!k)Py~O!Y'hq!]'hq~P#/sOr;OO!g#vO(s'qO~O[;SO!Y;RO~P#/sO!Y;RO~Og(`!R!](`!R~P!1WOa%]y!_%]y'{%]y!]%]y~P#/sO!]1VO!^)Yy~O!]5wO!^)Vq~O(U;ZO~O!_1qO%j;^O~O!k;aO~O%j;fO~P&8tOP$}qR$}q[$}qj$}qr$}q!S$}q!l$}q!p$}q#R$}q#o$}q#p$}q#q$}q#r$}q#s$}q#t$}q#u$}q#v$}q#w$}q#y$}q#{$}q#|$}q$P$}q(b$}q(s$}q!]$}q!^$}q~P''eO!Q*PO'z*QO({%POP'kaR'ka['kaj'kan'kar'ka!S'ka!l'ka!p'ka#R'ka#o'ka#p'ka#q'ka#r'ka#s'ka#t'ka#u'ka#v'ka#w'ka#y'ka#{'ka#|'ka$P'ka(b'ka(s'ka(z'ka!]'ka!^'ka~O!Q*PO'z*QOP'maR'ma['maj'man'mar'ma!S'ma!l'ma!p'ma#R'ma#o'ma#p'ma#q'ma#r'ma#s'ma#t'ma#u'ma#v'ma#w'ma#y'ma#{'ma#|'ma$P'ma(b'ma(s'ma(z'ma({'ma!]'ma!^'ma~OP%PqR%Pq[%Pqj%Pqr%Pq!S%Pq!l%Pq!p%Pq#R%Pq#o%Pq#p%Pq#q%Pq#r%Pq#s%Pq#t%Pq#u%Pq#v%Pq#w%Pq#y%Pq#{%Pq#|%Pq$P%Pq(b%Pq(s%Pq!]%Pq!^%Pq~P''eOg%f!Z!]%f!Z#`%f!Z$P%f!Z~P!1WO!Y;jO~P#/sOr;kO!g#vO(s'qO~O[;mO!Y;jO~P#/sO!]'qq!^'qq~P#BwO!]#h!Z!^#h!Z~P#BwO#l%f!ZP%f!ZR%f!Z[%f!Za%f!Zj%f!Zr%f!Z!S%f!Z!]%f!Z!l%f!Z!p%f!Z#R%f!Z#o%f!Z#p%f!Z#q%f!Z#r%f!Z#s%f!Z#t%f!Z#u%f!Z#v%f!Z#w%f!Z#y%f!Z#{%f!Z#|%f!Z'{%f!Z(b%f!Z(s%f!Z!k%f!Z!Y%f!Z'x%f!Z#`%f!Zv%f!Z!_%f!Z%j%f!Z!g%f!Z~P#/sOr;vO!g#vO(s'qO~O!Y;wO~P#/sOr<OO!g#vO(s'qO~O!Y<PO~P#/sOP%f!ZR%f!Z[%f!Zj%f!Zr%f!Z!S%f!Z!l%f!Z!p%f!Z#R%f!Z#o%f!Z#p%f!Z#q%f!Z#r%f!Z#s%f!Z#t%f!Z#u%f!Z#v%f!Z#w%f!Z#y%f!Z#{%f!Z#|%f!Z$P%f!Z(b%f!Z(s%f!Z!]%f!Z!^%f!Z~P''eOr<SO!g#vO(s'qO~Ov(gX~P1qO!Q%rO~P!)[O(V!lO~P!)[O!YfX!]fX#`fX~P%2^OP]XR]X[]Xj]Xr]X!Q]X!S]X!]]X!]fX!l]X!p]X#R]X#S]X#`]X#`fX#lfX#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#w]X#y]X#{]X#|]X$R]X(b]X(s]X(z]X({]X~O!gfX!k]X!kfX(sfX~P'LcOP<WOQ<WOSfOd>SOe!iOpkOr<WOskOtkOzkO|<WO!O<WO!SWO!WkO!XkO!_XO!i<ZO!lZO!o<WO!p<WO!q<WO!s<[O!u<_O!x!hO$X!kO$o>QO(U)^O(WTO(ZUO(bVO(p[O~O!]<kO!^$ra~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<vO!S${O!_$|O!i>XO!l$xO#k<|O$X%`O$u<xO$w<zO$z%aO(U(wO(WTO(ZUO(b$uO(z$}O({%PO~Ol)eO~P(#XOr!eX(s!eX~P#!nO!^]X!^fX~P'LcO!YfX!Y${X!]fX!]${X#`fX~P!0SO#l<`O~O!g#vO#l<`O~O#`<pO~Oj<dO~O#`=PO!](xX!^(xX~O#`<pO!](vX!^(vX~O#l=QO~Og=SO~P!1WO#l=YO~O#l=ZO~Og=SO(U&ZO~O!g#vO#l=[O~O!g#vO#l=QO~O$P=]O~P#BwO#l=^O~O#l=_O~O#l=dO~O#l=eO~O#l=fO~O#l=gO~O$P=hO~P!1WO$P=iO~P!1WOl=tO~P7eOk#S#T#U#W#X#[#j#k#v$o$u$w$z%^%_%i%j%k%r%t%w%x%z%|~(PT#p!X'}(V#qs#o#rr!Q(O$^(U$`(f~",
  goto: "$9_)^PPPPPP)_PP)bP)sP+X/^PPPP6lPP7SPP=PPPP@sPA]PA]PPPA]PCePA]PA]PA]PCiPCnPD]PIVPPPIZPPPPIZL^PPPLdMUPIZPIZPP! dIZPPPIZPIZP!#kIZP!'R!(W!(aP!)T!)X!)T!,fPPPPPPP!-V!(WPP!-g!/XP!2hIZIZ!2m!5y!:g!:g!>f!>nPPP!>tIZPPPPPPPPP!BTP!CbPPIZ!DsPIZPIZIZIZIZIZPIZ!FVP!IaP!LgP!Lk!Lu!Ly!LyP!I^P!L}!L}P#!TP#!XIZPIZ#!_#%dCiA]PA]PA]A]P#&qA]A]#)TA]#+{A]#.XA]A]#.w#1]#1]#1b#1k#1]#1vPP#1]PA]#2`A]#6_A]A]6lPPP#:dPPP#:}#:}P#:}P#;e#:}PP#;kP#;bP#;b#<O#;b#<j#<p#<s)bP#<v)bP#=P#=P#=PP)bP)bP)bP)bPP)bP#=V#=YP#=Y)bP#=^P#=aP)bP)bP)bP)bP)bP)b)bPP#=g#=m#=x#>O#>U#>[#>b#>p#>v#?Q#?W#?b#?h#?x#@O#@p#AS#AY#A`#An#BT#Cx#DW#D_#Ey#FX#Gy#HX#H_#He#Hk#Hu#H{#IR#I]#Io#IuPPPPPPPPPPP#I{PPPPPPP#Jp#M}$ g$ n$ vPPP$'bP$'k$*d$0}$1Q$1T$2S$2V$2^$2fP$2l$2oP$3]$3a$4X$5g$5l$6SPP$6X$6_$6c$6f$6j$6n$7j$8R$8j$8n$8q$8t$9O$9R$9V$9ZR!|RoqOXst!Z#d%m&r&t&u&w,u,z2^2aY!vQ'a-g1q5}Q%tvQ%|yQ&T|Q&j!VS'W!e-^Q'g!iS'm!r!yU*l$|*[*pQ+q%}S,O&V&WQ,f&dQ-e'`Q-o'hQ-w'nQ0^*rQ1d,QQ1{,gR<}<[%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'c's(U(W(^(e(y({)P*O*j+Y+_,r,u,z-k-s.R.X.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3n4|6V6g6h6k7O8v9V9aS#q]<X!r)`$Z$n'X)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TU+Q%]<u<vQ+v&PQ,h&gQ,o&oQ0z+iQ1P+kQ1[+wQ2T,mQ3b.iQ5b1OQ5h1VQ6^1|Q7[3fQ8b5iR9g7^'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>T!S!nQ!r!v!y!z$|'W'`'a'm'n'o*l*p*r*s-^-e-g-w0^0a1q5}6P%[$ti#v$b$c$d$x${%O%Q%^%_%c)z*S*U*W*Z*b*h*x*y+h+k,U,X.h/R/f/o/z/{/}0b0d0k0l0q1h1k1s3e4`4a4l4q5S5^5a6U7Y7x8S8X8^8s9d9r9{:R:b:t;S;^;f;m<n<o<q<r<s<t<w<x<y<z<{<|=T=U=V=W=Y=Z=^=_=`=a=b=c=d=e=h=i>Q>Y>Z>^>_Q&X|S'U!e*[S']%i-bQ+v&PQ,R&WQ,h&gQ0p+TQ1[+wQ1a+}Q2S,lQ2T,mQ5h1VQ5q1cQ6^1|Q6a2OQ6b2RQ8b5iQ8e5nQ9O6dQ:Z8fQ:h8{R;X:[rnOXst!V!Z#d%m&i&r&t&u&w,u,z2^2aR,j&k&z^OPXYstuvwz!Z!`!g!j!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'c's(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>S>T[#]WZ#W#Z'X(U!b%jm#h#i#l$x%e%h(_(i(j(k*Z*_*c+[+^+`,q-W.V.].^._.a/o/r2f3^3_4c6t7VQ%wxQ%{yW&Q|&V&W,QQ&_!TQ'd!hQ'f!iQ(r#sS+p%|%}Q+t&PQ,a&bQ,e&dS-n'g'hQ.k(sQ1T+qQ1Z+wQ1]+xQ1`+|Q1v,bS1z,f,gQ3O-oQ5g1VQ5k1YQ5p1bQ6]1{Q8a5iQ8d5mQ8h5rQ:V8`R;V:W!U$zi$d%O%Q%^%_%c*S*U*b*x*y/R/z0b0d0k0l0q4a5S8X9r>Q>Y>Z!^%yy!i!u%{%|%}'V'f'g'h'l'v*k+p+q-Z-n-o-v0T0W1T2w3O3V4t4u4x8P9}Q+j%wQ,V&[Q,Y&]Q,d&dQ.j(rQ1u,aU1y,e,f,gQ3g.kQ6W1vS6[1z1{Q8z6]#f>U#v$b$c$x${)z*W*Z*h+h+k,U,X.h/f/o/{/}1h1k1s3e4`4l4q5^5a6U7Y7x8S8^8s9d9{:R:b:t;S;^;f;m<q<s<w<y<{=T=V=Y=^=`=b=d=h>^>_o>V<n<o<r<t<x<z<|=U=W=Z=_=a=c=e=iW%Ti%V*z>QS&[!Q&iQ&]!RQ&^!SU+O%[%d=tR,T&Y%]%Si#v$b$c$d$x${%O%Q%^%_%c)z*S*U*W*Z*b*h*x*y+h+k,U,X.h/R/f/o/z/{/}0b0d0k0l0q1h1k1s3e4`4a4l4q5S5^5a6U7Y7x8S8X8^8s9d9r9{:R:b:t;S;^;f;m<n<o<q<r<s<t<w<x<y<z<{<|=T=U=V=W=Y=Z=^=_=`=a=b=c=d=e=h=i>Q>Y>Z>^>_T){$u)|V+Q%]<u<vW']!e%i*[-bS)O#y#zQ+e%rQ+{&SS.d(n(oQ1l,ZQ5V0mR8k5w'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>T$i$^c#Y#e%q%s%u(T(Z(u(z)S)T)U)V)W)X)Y)Z)[)])_)a)c)h)r+f+z-[-z.P.U.W.u.x.|/O/P/Q/d0r2o2t3Q3X3m3r3s3t3u3v3w3x3y3z3{3|3}4O4R4S4Z5Z5e6w6}7S7c7d7m7n8m9Z9_9i9o9p:q;Y;b<Y=wT#TV#U'RkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TQ'Y!eR2r-^!W!nQ!e!r!v!y!z$|'W'`'a'm'n'o*[*l*p*r*s-^-e-g-w0^0a1q5}6PR1n,]nqOXst!Z#d%m&r&t&u&w,u,z2^2aQ&y!^Q'w!xS(t#u<`Q+n%zQ,_&_Q,`&aQ-l'eQ-y'pS.t(y=QS0s+Y=[Q1R+oQ1p,^Q2e,|Q2g,}Q2n-XQ2|-mQ3P-qS5[0t=fQ5c1SS5f1U=gQ6v2pQ6z2}Q7P3UQ8_5dQ9[6xQ9]6{Q9`7QR:n9X$d$]c#Y#e%s%u(T(Z(u(z)S)T)U)V)W)X)Y)Z)[)])_)a)c)h)r+f+z-[-z.P.U.W.u.x.|/P/Q/d0r2o2t3Q3X3m3r3s3t3u3v3w3x3y3z3{3|3}4O4R4S4Z5Z5e6w6}7S7c7d7m7n8m9Z9_9i9o9p:q;Y;b<Y=wS(p#p'jQ)Q#zS+d%q/OS.e(o(qR3`.f'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TS#q]<XQ&t!XQ&u!YQ&w![Q&x!]R2],xQ'b!hQ+g%wQ-j'dS.g(r+jQ2z-iW3d.j.k0y0{Q6y2{W7W3a3c3g5`U9c7X7Z7]U:s9e9f9hS;d:r:uQ;r;eR;z;sU!wQ'a-gT5{1q5}!Q_OXZ`st!V!Z#d#h%e%m&i&k&r&t&u&w(k,u,z.^2^2a]!pQ!r'a-g1q5}T#q]<X%^{OPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'c's(U(W(^(e(y({)P*O*j+Y+_+i,r,u,z-k-s.R.X.i.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3f3n4|6V6g6h6k7O7^8v9V9aS)O#y#zS.d(n(o!s=m$Z$n'X)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TU$fd)`,oS(q#p'jU*w%R(x4QU0o+P.p7iQ5`0zQ7X3bQ9f7[R:u9gm!tQ!r!v!y!z'a'm'n'o-g-w1q5}6PQ'u!uS(g#g2WS-u'l'xQ/u*^Q0T*kQ3W-xQ4h/vQ4t0VQ4u0WQ4z0`Q7t4bS8P4v4xS8T4{4}Q9t7uQ9x7{Q9}8QQ:S8VS:}9y9zS;i;O;RS;u;j;kS;};v;wS<R<O<PR<U<SQ#wbQ't!uS(f#g2WS(h#m+XQ+Z%fQ+l%xQ+r&OU-t'l'u'xQ.Y(gU/t*^*a/yQ0U*kQ0X*mQ1Q+mQ1w,cS3T-u-xQ3].bS4g/u/vQ4p0RS4s0T0`Q4w0YQ6Y1xQ7R3WS7s4b4dQ7w4hU8O4t4z4}Q8R4yQ8x6ZS9s7t7uQ9w7{Q:P8TQ:Q8UQ:e8yQ:{9tS:|9x9zQ;U:SQ;`:fS;h:};RS;t;i;jS;|;u;wS<Q;}<PQ<T<RQ<V<UQ=p=kQ=|=uR=}=vV!wQ'a-g%^aOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'c's(U(W(^(e(y({)P*O*j+Y+_+i,r,u,z-k-s.R.X.i.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3f3n4|6V6g6h6k7O7^8v9V9aS#wz!j!r=j$Z$n'X)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TR=p>S%^bOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'c's(U(W(^(e(y({)P*O*j+Y+_+i,r,u,z-k-s.R.X.i.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3f3n4|6V6g6h6k7O7^8v9V9aQ%fj!^%xy!i!u%{%|%}'V'f'g'h'l'v*k+p+q-Z-n-o-v0T0W1T2w3O3V4t4u4x8P9}S&Oz!jQ+m%yQ,c&dW1x,d,e,f,gU6Z1y1z1{S8y6[6]Q:f8z!r=k$Z$n'X)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TQ=u>RR=v>S%QeOPXYstuvw!Z!`!g!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'c's(W(^(e(y({)P*O*j+Y+_+i,r,u,z-k-s.R.X.i.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3f3n4|6V6g6h6k7O7^8v9V9aY#bWZ#W#Z(U!b%jm#h#i#l$x%e%h(_(i(j(k*Z*_*c+[+^+`,q-W.V.].^._.a/o/r2f3^3_4c6t7VQ,p&o!p=l$Z$n)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TR=o'XU'^!e%i*[R2u-bX'[!e%i*[-b%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'c's(U(W(^(e(y({)P*O*j+Y+_,r,u,z-k-s.R.X.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3n4|6V6g6h6k7O8v9V9a!r)`$Z$n'X)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TQ,o&oQ0z+iQ3b.iQ7[3fR9g7^!b$Tc#Y%q(T(Z(u(z)[)])a)h+z-z.P.U.W.u.x/d0r3Q3X3m3}5Z5e6}7S7c9_:q<Y!P<f)_)r-[/O2o2t3r3{3|4R4Z6w7d7m7n8m9Z9i9o9p;Y;b=w!f$Vc#Y%q(T(Z(u(z)X)Y)[)])a)h+z-z.P.U.W.u.x/d0r3Q3X3m3}5Z5e6}7S7c9_:q<Y!T<h)_)r-[/O2o2t3r3x3y3{3|4R4Z6w7d7m7n8m9Z9i9o9p;Y;b=w!^$Zc#Y%q(T(Z(u(z)a)h+z-z.P.U.W.u.x/d0r3Q3X3m3}5Z5e6}7S7c9_:q<YQ4a/mz>T)_)r-[/O2o2t3r4R4Z6w7d7m7n8m9Z9i9o9p;Y;b=wQ>Y>[R>Z>]'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TS$oh$pR4W/W'XgOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/W/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TT$kf$qQ$ifS)k$l)oR)w$qT$jf$qT)m$l)o'XhOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%m%t&R&k&n&o&r&t&u&w&{'T'X'c's(U(W(^(e(y({)P)t*O*j+Y+_+i,r,u,z-Y-a-k-s.R.X.i.v.}/W/X/p0_0n0t1U1t2U2V2X2Z2^2a2c2q3S3Y3f3n4V4|5y6V6g6h6k6u7O7^8v9V9a:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>TT$oh$pQ$rhR)v$p%^jOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'c's(U(W(^(e(y({)P*O*j+Y+_+i,r,u,z-k-s.R.X.i.v.}/p0_0n0t1U1t2U2V2X2Z2^2a2c3S3Y3f3n4|6V6g6h6k7O7^8v9V9a!s>R$Z$n'X)t-Y-a/X2q4V5y6u:]:o<W<Z<[<_<`<a<b<c<d<e<f<g<h<i<j<k<m<p<}=P=Q=S=[=]=f=g>T#glOPXZst!Z!`!o#S#d#o#{$n%m&k&n&o&r&t&u&w&{'T'c)P)t*j+_+i,r,u,z-k.i/X/p0_0n1t2U2V2X2Z2^2a2c3f4V4|6V6g6h6k7^8v9V!U%Ri$d%O%Q%^%_%c*S*U*b*x*y/R/z0b0d0k0l0q4a5S8X9r>Q>Y>Z#f(x#v$b$c$x${)z*W*Z*h+h+k,U,X.h/f/o/{/}1h1k1s3e4`4l4q5^5a6U7Y7x8S8^8s9d9{:R:b:t;S;^;f;m<q<s<w<y<{=T=V=Y=^=`=b=d=h>^>_Q+U%aQ/e*Po4Q<n<o<r<t<x<z<|=U=W=Z=_=a=c=e=i!U$yi$d%O%Q%^%_%c*S*U*b*x*y/R/z0b0d0k0l0q4a5S8X9r>Q>Y>ZQ*d$zU*m$|*[*pQ+V%bQ0Y*n#f=r#v$b$c$x${)z*W*Z*h+h+k,U,X.h/f/o/{/}1h1k1s3e4`4l4q5^5a6U7Y7x8S8^8s9d9{:R:b:t;S;^;f;m<q<s<w<y<{=T=V=Y=^=`=b=d=h>^>_n=s<n<o<r<t<x<z<|=U=W=Z=_=a=c=e=iQ=x>UQ=y>VQ=z>WR={>X!U%Ri$d%O%Q%^%_%c*S*U*b*x*y/R/z0b0d0k0l0q4a5S8X9r>Q>Y>Z#f(x#v$b$c$x${)z*W*Z*h+h+k,U,X.h/f/o/{/}1h1k1s3e4`4l4q5^5a6U7Y7x8S8^8s9d9{:R:b:t;S;^;f;m<q<s<w<y<{=T=V=Y=^=`=b=d=h>^>_o4Q<n<o<r<t<x<z<|=U=W=Z=_=a=c=e=inoOXst!Z#d%m&r&t&u&w,u,z2^2aS*g${*ZQ-T'OQ-U'QR4k/{%[%Si#v$b$c$d$x${%O%Q%^%_%c)z*S*U*W*Z*b*h*x*y+h+k,U,X.h/R/f/o/z/{/}0b0d0k0l0q1h1k1s3e4`4a4l4q5S5^5a6U7Y7x8S8X8^8s9d9r9{:R:b:t;S;^;f;m<n<o<q<r<s<t<w<x<y<z<{<|=T=U=V=W=Y=Z=^=_=`=a=b=c=d=e=h=i>Q>Y>Z>^>_Q,W&]Q1j,YQ5u1iR8j5vV*o$|*[*pU*o$|*[*pT5|1q5}S0R*j/pQ4y0_T8U4|:_Q+l%xQ0X*mQ1Q+mQ1w,cQ6Y1xQ8x6ZQ:e8yR;`:f!U%Oi$d%O%Q%^%_%c*S*U*b*x*y/R/z0b0d0k0l0q4a5S8X9r>Q>Y>Zx*S$v)f*T*v+W/x0f0g4T4i5T5U5Y7r8W:T:z=q>O>PS0b*u0c#f<q#v$b$c$x${)z*W*Z*h+h+k,U,X.h/f/o/{/}1h1k1s3e4`4l4q5^5a6U7Y7x8S8^8s9d9{:R:b:t;S;^;f;m<q<s<w<y<{=T=V=Y=^=`=b=d=h>^>_n<r<n<o<r<t<x<z<|=U=W=Z=_=a=c=e=i!d=T(v)d*]*f.l.o.s/a/m0O0x1g3j4^4j4n5t7_7b7y7|8Z8]9v:O:U;P;T;g;l;x>[>]`=U4P7e7h7l9j:v:y;{S=`.n3kT=a7g9m!U%Qi$d%O%Q%^%_%c*S*U*b*x*y/R/z0b0d0k0l0q4a5S8X9r>Q>Y>Z|*U$v)f*V*u+W/i/x0f0g4T4i5O5T5U5Y7r8W:T:z=q>O>PS0d*v0e#f<s#v$b$c$x${)z*W*Z*h+h+k,U,X.h/f/o/{/}1h1k1s3e4`4l4q5^5a6U7Y7x8S8^8s9d9{:R:b:t;S;^;f;m<q<s<w<y<{=T=V=Y=^=`=b=d=h>^>_n<t<n<o<r<t<x<z<|=U=W=Z=_=a=c=e=i!h=V(v)d*]*f.m.n.s/a/m0O0x1g3h3j4^4j4n5t7_7`7b7y7|8Z8]9v:O:U;P;T;g;l;x>[>]d=W4P7f7g7l9j9k:v:w:y;{S=b.o3lT=c7h9nrnOXst!V!Z#d%m&i&r&t&u&w,u,z2^2aQ&f!UR,r&ornOXst!V!Z#d%m&i&r&t&u&w,u,z2^2aR&f!UQ,[&^R1f,TsnOXst!V!Z#d%m&i&r&t&u&w,u,z2^2aQ1r,aS6T1u1vU8r6R6S6WS:a8t8uS;[:`:cQ;o;]R;y;pQ&m!VR,k&iR6a2OR:h8{W&Q|&V&W,QR1]+xQ&r!WR,u&sR,{&xT2_,z2aR-P&yQ-O&yR2h-PQ'z!{R-{'zSsOtQ#dXT%ps#dQ#OTR'|#OQ#RUR(O#RQ)|$uR/b)|Q#UVR(R#UQ#XWU(X#X(Y.SQ(Y#YR.S(ZQ-_'YR2s-_Q.w(zS3o.w3pR3p.xQ-g'aR2x-gY!rQ'a-g1q5}R'k!rQ/S)fR4U/SU#_W%h*ZU(`#_(a.TQ(a#`R.T([Q-c'^R2v-ct`OXst!V!Z#d%m&i&k&r&t&u&w,u,z2^2aS#hZ%eU#r`#h.^R.^(kQ(l#jQ.Z(hW.c(l.Z3Z7TQ3Z.[R7T3[Q)o$lR/Y)oQ$phR)u$pQ$`cU)b$`.O<lQ.O<YR<l)rQ/s*^W4e/s4f7v9uU4f/t/u/vS7v4g4hR9u7w$e*R$v(v)d)f*]*f*u*v+R+S+W.n.o.q.r.s/a/i/k/m/x0O0f0g0x1g3h3i3j4P4T4^4i4j4n5O5Q5T5U5Y5t7_7`7a7b7g7h7j7k7l7r7y7|8W8Z8]9j9k9l9v:O:T:U:v:w:x:y:z;P;T;g;l;x;{=q>O>P>[>]Q/|*fU4m/|4o7zQ4o0OR7z4nS*p$|*[R0[*px*T$v)f*u*v+W/x0f0g4T4i5T5U5Y7r8W:T:z=q>O>P!d.l(v)d*]*f.n.o.s/a/m0O0x1g3j4^4j4n5t7_7b7y7|8Z8]9v:O:U;P;T;g;l;x>[>]U/j*T.l7ea7e4P7g7h7l9j:v:y;{Q0c*uQ3k.nU5P0c3k9mR9m7g|*V$v)f*u*v+W/i/x0f0g4T4i5O5T5U5Y7r8W:T:z=q>O>P!h.m(v)d*]*f.n.o.s/a/m0O0x1g3h3j4^4j4n5t7_7`7b7y7|8Z8]9v:O:U;P;T;g;l;x>[>]U/l*V.m7fe7f4P7g7h7l9j9k:v:w:y;{Q0e*vQ3l.oU5R0e3l9nR9n7hQ*{%UR0i*{Q5_0xR8[5_Q+a%kR0w+aQ5x1lS8l5x:^R:^8mQ,^&_R1o,^Q5}1qR8o5}Q1},hS6_1}8|R8|6aQ1W+tW5j1W5l8c:XQ5l1ZQ8c5kR:X8dQ+y&QR1^+yQ2a,zR6o2aYrOXst#dQ&v!ZQ+c%mQ,t&rQ,v&tQ,w&uQ,y&wQ2[,uS2_,z2aR6n2^Q%opQ&z!_Q&}!aQ'P!bQ'R!cQ'r!uQ+b%lQ+n%zQ,S&XQ,j&mQ-R&|W-r'l't'u'xQ-y'pQ0Z*oQ1R+oQ1e,RS2Q,k,nQ2i-QQ2j-TQ2k-UQ3P-qW3R-t-u-x-zQ5c1SQ5o1aQ5s1gQ6X1wQ6c2SQ6m2]U6|3Q3T3WQ7P3UQ8_5dQ8g5qQ8i5tQ8n5|Q8w6YQ8}6bS9^6}7RQ9`7QQ:Y8eQ:d8xQ:i9OQ:p9_Q;W:ZQ;_:eQ;c:qQ;n;XR;q;`Q%zyQ'e!iQ'p!uU+o%{%|%}Q-X'VU-m'f'g'hS-q'l'vQ0S*kS1S+p+qQ2p-ZS2}-n-oQ3U-vS4r0T0WQ5d1TQ6x2wQ6{3OQ7Q3VU7}4t4u4xQ9|8PR;Q9}S$wi>QR*|%VU%Ui%V>QR0h*zQ$viS(v#v+kS)d$b$cQ)f$dQ*]$xS*f${*ZQ*u%OQ*v%QQ+R%^Q+S%_Q+W%cQ.n<qQ.o<sQ.q<wQ.r<yQ.s<{Q/a)zQ/i*SQ/k*UQ/m*WQ/x*bS0O*h/oQ0f*xQ0g*yl0x+h,X.h1k1s3e6U7Y8s9d:b:t;^;fQ1g,UQ3h=TQ3i=VQ3j=YS4P<n<oQ4T/RS4^/f4`Q4i/zQ4j/{Q4n/}Q5O0bQ5Q0dQ5T0kQ5U0lQ5Y0qQ5t1hQ7_=^Q7`=`Q7a=bQ7b=dQ7g<rQ7h<tQ7j<xQ7k<zQ7l<|Q7r4aQ7y4lQ7|4qQ8W5SQ8Z5^Q8]5aQ9j=ZQ9k=UQ9l=WQ9v7xQ:O8SQ:T8XQ:U8^Q:v=_Q:w=aQ:x=cQ:y=eQ:z9rQ;P9{Q;T:RQ;g=hQ;l;SQ;x;mQ;{=iQ=q>QQ>O>YQ>P>ZQ>[>^R>]>_Q+P%]Q.p<uR7i<vnpOXst!Z#d%m&r&t&u&w,u,z2^2aQ!fPS#fZ#oQ&|!`W'i!o*j0_4|Q(Q#SQ)R#{Q)s$nS,n&k&nQ,s&oQ-Q&{S-V'T/pQ-i'cQ.z)PQ/^)tQ0u+_Q0{+iQ2Y,rQ2{-kQ3c.iQ4Y/XQ5W0nQ6S1tQ6e2UQ6f2VQ6j2XQ6l2ZQ6q2cQ7]3fQ7o4VQ8u6VQ9R6gQ9S6hQ9U6kQ9h7^Q:c8vR:m9V#[cOPXZst!Z!`!o#d#o#{%m&k&n&o&r&t&u&w&{'T'c)P*j+_+i,r,u,z-k.i/p0_0n1t2U2V2X2Z2^2a2c3f4|6V6g6h6k7^8v9VQ#YWQ#eYQ%quQ%svS%uw!gS(T#W(WQ(Z#ZQ(u#uQ(z#xQ)S$OQ)T$PQ)U$QQ)V$RQ)W$SQ)X$TQ)Y$UQ)Z$VQ)[$WQ)]$XQ)_$ZQ)a$_Q)c$aQ)h$eW)r$n)t/X4VQ+f%tQ+z&RS-['X2qQ-z'sS.P(U.RQ.U(^Q.W(eQ.u(yQ.x({Q.|<WQ/O<ZQ/P<[Q/Q<_Q/d*OQ0r+YQ2o-YQ2t-aQ3Q-sQ3X.XQ3m.vQ3r<`Q3s<aQ3t<bQ3u<cQ3v<dQ3w<eQ3x<fQ3y<gQ3z<hQ3{<iQ3|<jQ3}.}Q4O<mQ4R<pQ4S<}Q4Z<kQ5Z0tQ5e1UQ6w=PQ6}3SQ7S3YQ7c3nQ7d=QQ7m=SQ7n=[Q8m5yQ9Z6uQ9_7OQ9i=]Q9o=fQ9p=gQ:q9aQ;Y:]Q;b:oQ<Y#SR=w>TR#[WR'Z!el!tQ!r!v!y!z'a'm'n'o-g-w1q5}6PS'V!e-^U*k$|*[*pS-Z'W'`S0W*l*rQ0`*sQ2w-eQ4x0^R4}0aR(|#xQ!fQT-f'a-g]!qQ!r'a-g1q5}Q#p]R'j<XR)g$dY!uQ'a-g1q5}Q'l!rS'v!v!yS'x!z6PS-v'm'nQ-x'oR3V-wT#kZ%eS#jZ%eS%km,qU(h#h#i#lS.[(i(jQ.`(kQ0v+`Q3[.]U3].^._.aS7U3^3_R9b7Vd#^W#W#Z%h(U(_*Z+[.V/or#gZm#h#i#l%e(i(j(k+`.].^._.a3^3_7VS*^$x*cQ/v*_Q2W,qQ2m-WQ4b/rQ6s2fQ7u4cQ9Y6tT=n'X+^V#aW%h*ZU#`W%h*ZS(V#W(_U([#Z+[/oS-]'X+^T.Q(U.VV'_!e%i*[Q$lfR)y$qT)n$l)oR4X/WT*`$x*cT*i${*ZQ0y+hQ1i,XQ3a.hQ5v1kQ6R1sQ7Z3eQ8t6UQ9e7YQ:`8sQ:r9dQ;]:bQ;e:tQ;p;^R;s;fnqOXst!Z#d%m&r&t&u&w,u,z2^2aQ&l!VR,j&itmOXst!U!V!Z#d%m&i&r&t&u&w,u,z2^2aR,q&oT%lm,qR1m,ZR,i&gQ&U|S,P&V&WR1`,QR+u&PT&p!W&sT&q!W&sT2`,z2a",
  nodeNames: "⚠ ArithOp ArithOp ?. JSXStartTag LineComment BlockComment Script Hashbang ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > < TypeParamList in out const TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewTarget new NewExpression ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression TypeArgList CompareOp < declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty VariableDefinition Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression InstantiationExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast < ArrowFunction TypeParamList SequenceExpression InstantiationExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate asserts is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var using TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration defer ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 381,
  context: jQ,
  nodeProps: [
    ["isolate", -8, 5, 6, 14, 37, 39, 51, 53, 55, ""],
    ["group", -26, 9, 17, 19, 68, 208, 212, 216, 217, 219, 222, 225, 235, 238, 244, 246, 248, 250, 253, 259, 265, 267, 269, 271, 273, 275, 276, "Statement", -34, 13, 14, 32, 35, 36, 42, 51, 54, 55, 57, 62, 70, 72, 76, 80, 82, 84, 85, 110, 111, 121, 122, 137, 140, 142, 143, 144, 145, 146, 148, 149, 168, 170, 172, "Expression", -23, 31, 33, 37, 41, 43, 45, 174, 176, 178, 179, 181, 182, 183, 185, 186, 187, 189, 190, 191, 202, 204, 206, 207, "Type", -3, 88, 103, 109, "ClassItem"],
    ["openedBy", 23, "<", 38, "InterpolationStart", 56, "[", 60, "{", 73, "(", 161, "JSXStartCloseTag"],
    ["closedBy", -2, 24, 169, ">", 40, "InterpolationEnd", 50, "]", 61, "}", 74, ")", 166, "JSXEndTag"]
  ],
  propSources: [YQ],
  skippedNodes: [0, 5, 6, 279],
  repeatNodeCount: 37,
  tokenData: "$Fq07[R!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tuEruvJSvwLkwx! Yxy!'iyz!(sz{!)}{|!,q|}!.O}!O!,q!O!P!/Y!P!Q!9j!Q!R#:O!R![#<_![!]#I_!]!^#Jk!^!_#Ku!_!`$![!`!a$$v!a!b$*T!b!c$,r!c!}Er!}#O$-|#O#P$/W#P#Q$4o#Q#R$5y#R#SEr#S#T$7W#T#o$8b#o#p$<r#p#q$=h#q#r$>x#r#s$@U#s$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$I|Er$I|$I}$Dk$I}$JO$Dk$JO$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr(n%d_$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$j&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$j&j([!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU([!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$j&j(XpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU(XpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX(Xp([!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z07[+rq$j&j(Xp([!b'}0/lOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z07[.ST(Y#S$j&j(O0/lO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c07[.n_$j&j(Xp([!b(O0/lOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)3p/x`$j&j!p),Q(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW1V`#w(Ch$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW2d_#w(Ch$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At3l_(W':f$j&j([!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k(^4r_$j&j([!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k&z5vX$j&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q&z6jT$e`$j&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c`6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y`7bO$e``7eP;=`<%l6y&z7kP;=`<%l5q(^7w]$e`$j&j([!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!r8uZ([!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p!r9oU$e`([!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!r:UP;=`<%l8p(^:[P;=`<%l4k%9[:hh$j&j(Xp([!bOY%ZYZ&cZq%Zqr<Srs&}st%ZtuCruw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr(r<__WS$j&j(Xp([!bOY<SYZ&cZr<Srs=^sw<Swx@nx!^<S!^!_Bm!_#O<S#O#P>`#P#o<S#o#pBm#p;'S<S;'S;=`Cl<%lO<S(Q=g]WS$j&j([!bOY=^YZ&cZw=^wx>`x!^=^!^!_?q!_#O=^#O#P>`#P#o=^#o#p?q#p;'S=^;'S;=`@h<%lO=^&n>gXWS$j&jOY>`YZ&cZ!^>`!^!_?S!_#o>`#o#p?S#p;'S>`;'S;=`?k<%lO>`S?XSWSOY?SZ;'S?S;'S;=`?e<%lO?SS?hP;=`<%l?S&n?nP;=`<%l>`!f?xWWS([!bOY?qZw?qwx?Sx#O?q#O#P?S#P;'S?q;'S;=`@b<%lO?q!f@eP;=`<%l?q(Q@kP;=`<%l=^'`@w]WS$j&j(XpOY@nYZ&cZr@nrs>`s!^@n!^!_Ap!_#O@n#O#P>`#P#o@n#o#pAp#p;'S@n;'S;=`Bg<%lO@ntAwWWS(XpOYApZrAprs?Ss#OAp#O#P?S#P;'SAp;'S;=`Ba<%lOAptBdP;=`<%lAp'`BjP;=`<%l@n#WBvYWS(Xp([!bOYBmZrBmrs?qswBmwxApx#OBm#O#P?S#P;'SBm;'S;=`Cf<%lOBm#WCiP;=`<%lBm(rCoP;=`<%l<S%9[C}i$j&j(p%1l(Xp([!bOY%ZYZ&cZr%Zrs&}st%ZtuCruw%Zwx(rx!Q%Z!Q![Cr![!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr%9[EoP;=`<%lCr07[FRk$j&j(Xp([!b$^#t(U,2j(f$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr+dHRk$j&j(Xp([!b$^#tOY%ZYZ&cZr%Zrs&}st%ZtuGvuw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Gv![!^%Z!^!_*g!_!c%Z!c!}Gv!}#O%Z#O#P&c#P#R%Z#R#SGv#S#T%Z#T#oGv#o#p*g#p$g%Z$g;'SGv;'S;=`Iv<%lOGv+dIyP;=`<%lGv07[JPP;=`<%lEr(KWJ_`$j&j(Xp([!b#q(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWKl_$j&j$R(Ch(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,#xLva({+JY$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sv%ZvwM{wx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWNW`$j&j#{(Ch(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At! c_(Z';W$j&j(XpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b'l!!i_$j&j(XpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b&z!#mX$j&jOw!#hwx6cx!^!#h!^!_!$Y!_#o!#h#o#p!$Y#p;'S!#h;'S;=`!$r<%lO!#h`!$]TOw!$Ywx7]x;'S!$Y;'S;=`!$l<%lO!$Y`!$oP;=`<%l!$Y&z!$uP;=`<%l!#h'l!%R]$e`$j&j(XpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r!Q!&PZ(XpOY!%zYZ!$YZr!%zrs!$Ysw!%zwx!&rx#O!%z#O#P!$Y#P;'S!%z;'S;=`!']<%lO!%z!Q!&yU$e`(XpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r!Q!'`P;=`<%l!%z'l!'fP;=`<%l!!b/5|!'t_!l/.^$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&U!)O_!k!Lf$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z-!n!*[b$j&j(Xp([!b(V%&f#r(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!+d{!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW!+o`$j&j(Xp([!b#o(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;x!,|`$j&j(Xp([!br+4YOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,$U!.Z_!]+Jf$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!/ec$j&j(Xp([!b!Q.2^OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!0p!P!Q%Z!Q![!3Y![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!0ya$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!2O!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!2Z_![!L^$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!3eg$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!3Y![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S!3Y#S#X%Z#X#Y!4|#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!5Vg$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!6n|}%Z}!O!6n!O!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!6wc$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!8_c$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!9uf$j&j(Xp([!b#p(ChOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcxz!;Zz{#-}{!P!;Z!P!Q#/d!Q!^!;Z!^!_#(i!_!`#7S!`!a#8i!a!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z?O!;fb$j&j(Xp([!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z>^!<w`$j&j([!b!X7`OY!<nYZ&cZw!<nwx!=yx!P!<n!P!Q!Eq!Q!^!<n!^!_!Gr!_!}!<n!}#O!KS#O#P!Dy#P#o!<n#o#p!Gr#p;'S!<n;'S;=`!L]<%lO!<n<z!>Q^$j&j!X7`OY!=yYZ&cZ!P!=y!P!Q!>|!Q!^!=y!^!_!@c!_!}!=y!}#O!CW#O#P!Dy#P#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!?Td$j&j!X7`O!^&c!_#W&c#W#X!>|#X#Z&c#Z#[!>|#[#]&c#]#^!>|#^#a&c#a#b!>|#b#g&c#g#h!>|#h#i&c#i#j!>|#j#k!>|#k#m&c#m#n!>|#n#o&c#p;'S&c;'S;=`&w<%lO&c7`!@hX!X7`OY!@cZ!P!@c!P!Q!AT!Q!}!@c!}#O!Ar#O#P!Bq#P;'S!@c;'S;=`!CQ<%lO!@c7`!AYW!X7`#W#X!AT#Z#[!AT#]#^!AT#a#b!AT#g#h!AT#i#j!AT#j#k!AT#m#n!AT7`!AuVOY!ArZ#O!Ar#O#P!B[#P#Q!@c#Q;'S!Ar;'S;=`!Bk<%lO!Ar7`!B_SOY!ArZ;'S!Ar;'S;=`!Bk<%lO!Ar7`!BnP;=`<%l!Ar7`!BtSOY!@cZ;'S!@c;'S;=`!CQ<%lO!@c7`!CTP;=`<%l!@c<z!C][$j&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#O!CW#O#P!DR#P#Q!=y#Q#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DWX$j&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DvP;=`<%l!CW<z!EOX$j&jOY!=yYZ&cZ!^!=y!^!_!@c!_#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!EnP;=`<%l!=y>^!Ezl$j&j([!b!X7`OY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#W&}#W#X!Eq#X#Z&}#Z#[!Eq#[#]&}#]#^!Eq#^#a&}#a#b!Eq#b#g&}#g#h!Eq#h#i&}#i#j!Eq#j#k!Eq#k#m&}#m#n!Eq#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}8r!GyZ([!b!X7`OY!GrZw!Grwx!@cx!P!Gr!P!Q!Hl!Q!}!Gr!}#O!JU#O#P!Bq#P;'S!Gr;'S;=`!J|<%lO!Gr8r!Hse([!b!X7`OY'}Zw'}x#O'}#P#W'}#W#X!Hl#X#Z'}#Z#[!Hl#[#]'}#]#^!Hl#^#a'}#a#b!Hl#b#g'}#g#h!Hl#h#i'}#i#j!Hl#j#k!Hl#k#m'}#m#n!Hl#n;'S'};'S;=`(f<%lO'}8r!JZX([!bOY!JUZw!JUwx!Arx#O!JU#O#P!B[#P#Q!Gr#Q;'S!JU;'S;=`!Jv<%lO!JU8r!JyP;=`<%l!JU8r!KPP;=`<%l!Gr>^!KZ^$j&j([!bOY!KSYZ&cZw!KSwx!CWx!^!KS!^!_!JU!_#O!KS#O#P!DR#P#Q!<n#Q#o!KS#o#p!JU#p;'S!KS;'S;=`!LV<%lO!KS>^!LYP;=`<%l!KS>^!L`P;=`<%l!<n=l!Ll`$j&j(Xp!X7`OY!LcYZ&cZr!Lcrs!=ys!P!Lc!P!Q!Mn!Q!^!Lc!^!_# o!_!}!Lc!}#O#%P#O#P!Dy#P#o!Lc#o#p# o#p;'S!Lc;'S;=`#&Y<%lO!Lc=l!Mwl$j&j(Xp!X7`OY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#W(r#W#X!Mn#X#Z(r#Z#[!Mn#[#](r#]#^!Mn#^#a(r#a#b!Mn#b#g(r#g#h!Mn#h#i(r#i#j!Mn#j#k!Mn#k#m(r#m#n!Mn#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r8Q# vZ(Xp!X7`OY# oZr# ors!@cs!P# o!P!Q#!i!Q!}# o!}#O#$R#O#P!Bq#P;'S# o;'S;=`#$y<%lO# o8Q#!pe(Xp!X7`OY)rZr)rs#O)r#P#W)r#W#X#!i#X#Z)r#Z#[#!i#[#])r#]#^#!i#^#a)r#a#b#!i#b#g)r#g#h#!i#h#i)r#i#j#!i#j#k#!i#k#m)r#m#n#!i#n;'S)r;'S;=`*Z<%lO)r8Q#$WX(XpOY#$RZr#$Rrs!Ars#O#$R#O#P!B[#P#Q# o#Q;'S#$R;'S;=`#$s<%lO#$R8Q#$vP;=`<%l#$R8Q#$|P;=`<%l# o=l#%W^$j&j(XpOY#%PYZ&cZr#%Prs!CWs!^#%P!^!_#$R!_#O#%P#O#P!DR#P#Q!Lc#Q#o#%P#o#p#$R#p;'S#%P;'S;=`#&S<%lO#%P=l#&VP;=`<%l#%P=l#&]P;=`<%l!Lc?O#&kn$j&j(Xp([!b!X7`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#W%Z#W#X#&`#X#Z%Z#Z#[#&`#[#]%Z#]#^#&`#^#a%Z#a#b#&`#b#g%Z#g#h#&`#h#i%Z#i#j#&`#j#k#&`#k#m%Z#m#n#&`#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z9d#(r](Xp([!b!X7`OY#(iZr#(irs!Grsw#(iwx# ox!P#(i!P!Q#)k!Q!}#(i!}#O#+`#O#P!Bq#P;'S#(i;'S;=`#,`<%lO#(i9d#)th(Xp([!b!X7`OY*gZr*grs'}sw*gwx)rx#O*g#P#W*g#W#X#)k#X#Z*g#Z#[#)k#[#]*g#]#^#)k#^#a*g#a#b#)k#b#g*g#g#h#)k#h#i*g#i#j#)k#j#k#)k#k#m*g#m#n#)k#n;'S*g;'S;=`+Z<%lO*g9d#+gZ(Xp([!bOY#+`Zr#+`rs!JUsw#+`wx#$Rx#O#+`#O#P!B[#P#Q#(i#Q;'S#+`;'S;=`#,Y<%lO#+`9d#,]P;=`<%l#+`9d#,cP;=`<%l#(i?O#,o`$j&j(Xp([!bOY#,fYZ&cZr#,frs!KSsw#,fwx#%Px!^#,f!^!_#+`!_#O#,f#O#P!DR#P#Q!;Z#Q#o#,f#o#p#+`#p;'S#,f;'S;=`#-q<%lO#,f?O#-tP;=`<%l#,f?O#-zP;=`<%l!;Z07[#.[b$j&j(Xp([!b(P0/l!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z07[#/o_$j&j(Xp([!bT0/lOY#/dYZ&cZr#/drs#0nsw#/dwx#4Ox!^#/d!^!_#5}!_#O#/d#O#P#1p#P#o#/d#o#p#5}#p;'S#/d;'S;=`#6|<%lO#/d06j#0w]$j&j([!bT0/lOY#0nYZ&cZw#0nwx#1px!^#0n!^!_#3R!_#O#0n#O#P#1p#P#o#0n#o#p#3R#p;'S#0n;'S;=`#3x<%lO#0n05W#1wX$j&jT0/lOY#1pYZ&cZ!^#1p!^!_#2d!_#o#1p#o#p#2d#p;'S#1p;'S;=`#2{<%lO#1p0/l#2iST0/lOY#2dZ;'S#2d;'S;=`#2u<%lO#2d0/l#2xP;=`<%l#2d05W#3OP;=`<%l#1p01O#3YW([!bT0/lOY#3RZw#3Rwx#2dx#O#3R#O#P#2d#P;'S#3R;'S;=`#3r<%lO#3R01O#3uP;=`<%l#3R06j#3{P;=`<%l#0n05x#4X]$j&j(XpT0/lOY#4OYZ&cZr#4Ors#1ps!^#4O!^!_#5Q!_#O#4O#O#P#1p#P#o#4O#o#p#5Q#p;'S#4O;'S;=`#5w<%lO#4O00^#5XW(XpT0/lOY#5QZr#5Qrs#2ds#O#5Q#O#P#2d#P;'S#5Q;'S;=`#5q<%lO#5Q00^#5tP;=`<%l#5Q05x#5zP;=`<%l#4O01p#6WY(Xp([!bT0/lOY#5}Zr#5}rs#3Rsw#5}wx#5Qx#O#5}#O#P#2d#P;'S#5};'S;=`#6v<%lO#5}01p#6yP;=`<%l#5}07[#7PP;=`<%l#/d)3h#7ab$j&j$R(Ch(Xp([!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;ZAt#8vb$[#t$j&j(Xp([!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z'Ad#:Zp$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#U%Z#U#V#?i#V#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#d#Bq#d#l%Z#l#m#Es#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#<jk$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#>j_$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#?rd$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#A]f$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Bzc$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Dbe$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#E|g$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Gpi$j&j(Xp([!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x#Il_!g$b$j&j$P)Lv(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Jv_al$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f#LS^h#)`#R-<U(Xp([!b$o7`OY*gZr*grs'}sw*gwx)rx!P*g!P!Q#MO!Q!^*g!^!_#Mt!_!`$ f!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#MXX$l&j(Xp([!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El#M}Z#s(Ch(Xp([!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Np!`#O*g#P;'S*g;'S;=`+Z<%lO*g(El#NyX$R(Ch(Xp([!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El$ oX#t(Ch(Xp([!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g*)x$!ga#`*!Y$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a$#l!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(K[$#w_#l(Cl$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x$%Vag!*r#t(Ch$g#|$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`$&[!`!a$'f!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$&g_#t(Ch$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$'qa#s(Ch$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`!a$(v!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$)R`#s(Ch$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(Kd$*`a(s(Ct$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!a%Z!a!b$+e!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$+p`$j&j#|(Ch(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`$,}_!|$Ip$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f$.X_!S0,v$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$/]Z$j&jO!^$0O!^!_$0f!_#i$0O#i#j$0k#j#l$0O#l#m$2^#m#o$0O#o#p$0f#p;'S$0O;'S;=`$4i<%lO$0O(n$0VT_#S$j&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$0kO_#S(n$0p[$j&jO!Q&c!Q![$1f![!^&c!_!c&c!c!i$1f!i#T&c#T#Z$1f#Z#o&c#o#p$3|#p;'S&c;'S;=`&w<%lO&c(n$1kZ$j&jO!Q&c!Q![$2^![!^&c!_!c&c!c!i$2^!i#T&c#T#Z$2^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$2cZ$j&jO!Q&c!Q![$3U![!^&c!_!c&c!c!i$3U!i#T&c#T#Z$3U#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$3ZZ$j&jO!Q&c!Q![$0O![!^&c!_!c&c!c!i$0O!i#T&c#T#Z$0O#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$4PR!Q![$4Y!c!i$4Y#T#Z$4Y#S$4]S!Q![$4Y!c!i$4Y#T#Z$4Y#q#r$0f(n$4lP;=`<%l$0O#1[$4z_!Y#)l$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$6U`#y(Ch$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;p$7c_$j&j(Xp([!b(b+4QOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$8qk$j&j(Xp([!b(U,2j$`#t(f$I[OY%ZYZ&cZr%Zrs&}st%Ztu$8buw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$8b![!^%Z!^!_*g!_!c%Z!c!}$8b!}#O%Z#O#P&c#P#R%Z#R#S$8b#S#T%Z#T#o$8b#o#p*g#p$g%Z$g;'S$8b;'S;=`$<l<%lO$8b+d$:qk$j&j(Xp([!b$`#tOY%ZYZ&cZr%Zrs&}st%Ztu$:fuw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$:f![!^%Z!^!_*g!_!c%Z!c!}$:f!}#O%Z#O#P&c#P#R%Z#R#S$:f#S#T%Z#T#o$:f#o#p*g#p$g%Z$g;'S$:f;'S;=`$<f<%lO$:f+d$<iP;=`<%l$:f07[$<oP;=`<%l$8b#Jf$<{X!_#Hb(Xp([!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g,#x$=sa(z+JY$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$+e#q;'S%Z;'S;=`+a<%lO%Z)>v$?V_!^(CdvBr$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z?O$@a_!q7`$j&j(Xp([!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$Aq|$j&j(Xp([!b'}0/l$^#t(U,2j(f$I[OX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr07[$D|k$j&j(Xp([!b(O0/l$^#t(U,2j(f$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr",
  tokenizers: [IQ, BQ, qQ, FQ, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, zQ, new Ys("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOx~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!U~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(d~~", 141, 341), new Ys("j~RQYZXz{^~^O(R~~aP!P!Qd~iO(S~~", 25, 324)],
  topRules: { Script: [0, 7], SingleExpression: [1, 277], SingleClassItem: [2, 278] },
  dialects: { jsx: 0, ts: 15179 },
  dynamicPrecedences: { 80: 1, 82: 1, 94: 1, 170: 1, 200: 1 },
  specialized: [{ term: 328, get: (n) => WQ[n] || -1 }, { term: 344, get: (n) => NQ[n] || -1 }, { term: 95, get: (n) => VQ[n] || -1 }],
  tokenPrec: 15205
}), xp = [
  /* @__PURE__ */ Ie("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie(`try {
	\${}
} catch (\${error}) {
	\${}
}`, {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie(`if (\${}) {
	\${}
} else {
	\${}
}`, {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie(`class \${name} {
	constructor(\${params}) {
		\${}
	}
}`, {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
], GQ = /* @__PURE__ */ xp.concat([
  /* @__PURE__ */ Ie("interface ${name} {\n	${}\n}", {
    label: "interface",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("type ${name} = ${type}", {
    label: "type",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Ie("enum ${name} {\n	${}\n}", {
    label: "enum",
    detail: "definition",
    type: "keyword"
  })
]), Tf = /* @__PURE__ */ new F0(), kp = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function Ii(n) {
  return (e, t) => {
    let i = e.node.getChild("VariableDefinition");
    return i && t(i, n), !0;
  };
}
const HQ = ["FunctionDeclaration"], KQ = {
  FunctionDeclaration: /* @__PURE__ */ Ii("function"),
  ClassDeclaration: /* @__PURE__ */ Ii("class"),
  ClassExpression: () => !0,
  EnumDeclaration: /* @__PURE__ */ Ii("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ Ii("type"),
  NamespaceDeclaration: /* @__PURE__ */ Ii("namespace"),
  VariableDefinition(n, e) {
    n.matchContext(HQ) || e(n, "variable");
  },
  TypeDefinition(n, e) {
    e(n, "type");
  },
  __proto__: null
};
function Sp(n, e) {
  let t = Tf.get(e);
  if (t)
    return t;
  let i = [], r = !0;
  function s(o, l) {
    let u = n.sliceString(o.from, o.to);
    i.push({ label: u, type: l });
  }
  return e.cursor(V.IncludeAnonymous).iterate((o) => {
    if (r)
      r = !1;
    else if (o.name) {
      let l = KQ[o.name];
      if (l && l(o, s) || kp.has(o.name))
        return !1;
    } else if (o.to - o.from > 8192) {
      for (let l of Sp(n, o.node))
        i.push(l);
      return !1;
    }
  }), Tf.set(e, i), i;
}
const Ef = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/, yp = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName",
  "JSXText",
  "JSXAttributeValue",
  "JSXOpenTag",
  "JSXCloseTag",
  "JSXSelfClosingTag",
  ".",
  "?."
];
function JQ(n) {
  let e = he(n.state).resolveInner(n.pos, -1);
  if (yp.indexOf(e.name) > -1)
    return null;
  let t = e.name == "VariableName" || e.to - e.from < 20 && Ef.test(n.state.sliceDoc(e.from, e.to));
  if (!t && !n.explicit)
    return null;
  let i = [];
  for (let r = e; r; r = r.parent)
    kp.has(r.name) && (i = i.concat(Sp(n.state.doc, r)));
  return {
    options: i,
    from: t ? e.from : n.pos,
    validFor: Ef
  };
}
const Rt = /* @__PURE__ */ mi.define({
  name: "javascript",
  parser: /* @__PURE__ */ UQ.configure({
    props: [
      /* @__PURE__ */ Cr.add({
        IfStatement: /* @__PURE__ */ gs({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ gs({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: Xk,
        SwitchBody: (n) => {
          let e = n.textAfter, t = /^\s*\}/.test(e), i = /^\s*(case|default)\b/.test(e);
          return n.baseIndent + (t ? 0 : i ? 1 : 2) * n.unit;
        },
        Block: /* @__PURE__ */ Ek({ closing: "}" }),
        ArrowFunction: (n) => n.baseIndent + n.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ gs({ except: /^\s*{/ }),
        JSXElement(n) {
          let e = /^\s*<\//.test(n.textAfter);
          return n.lineIndent(n.node.from) + (e ? 0 : n.unit);
        },
        JSXEscape(n) {
          let e = /\s*\}/.test(n.textAfter);
          return n.lineIndent(n.node.from) + (e ? 0 : n.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(n) {
          return n.column(n.node.from) + n.unit;
        }
      }),
      /* @__PURE__ */ Tr.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType": G0,
        BlockComment(n) {
          return { from: n.from + 2, to: n.to - 2 };
        },
        JSXElement(n) {
          let e = n.firstChild;
          if (!e || e.name == "JSXSelfClosingTag")
            return null;
          let t = n.lastChild;
          return { from: e.to, to: t.type.isError ? n.to : t.from };
        },
        "JSXSelfClosingTag JSXOpenTag"(n) {
          var e;
          let t = (e = n.firstChild) === null || e === void 0 ? void 0 : e.nextSibling, i = n.lastChild;
          return !t || t.type.isError ? null : { from: t.to, to: i.type.isError ? n.to : i.from };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
}), Qp = {
  test: (n) => /^JSX/.test(n.name),
  facet: /* @__PURE__ */ oa({ commentTokens: { block: { open: "{/*", close: "*/}" } } })
}, wp = /* @__PURE__ */ Rt.configure({ dialect: "ts" }, "typescript"), $p = /* @__PURE__ */ Rt.configure({
  dialect: "jsx",
  props: [/* @__PURE__ */ la.add((n) => n.isTop ? [Qp] : void 0)]
}), Pp = /* @__PURE__ */ Rt.configure({
  dialect: "jsx ts",
  props: [/* @__PURE__ */ la.add((n) => n.isTop ? [Qp] : void 0)]
}, "typescript");
let vp = (n) => ({ label: n, type: "keyword" });
const _p = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(vp), ew = /* @__PURE__ */ _p.concat(/* @__PURE__ */ ["declare", "implements", "private", "protected", "public"].map(vp));
function tw(n = {}) {
  let e = n.jsx ? n.typescript ? Pp : $p : n.typescript ? wp : Rt, t = n.typescript ? GQ.concat(ew) : xp.concat(_p);
  return new pr(e, [
    Rt.data.of({
      autocomplete: ry(yp, iy(t))
    }),
    Rt.data.of({
      autocomplete: JQ
    }),
    n.jsx ? rw : []
  ]);
}
function nw(n) {
  for (; ; ) {
    if (n.name == "JSXOpenTag" || n.name == "JSXSelfClosingTag" || n.name == "JSXFragmentTag")
      return n;
    if (n.name == "JSXEscape" || !n.parent)
      return null;
    n = n.parent;
  }
}
function Xf(n, e, t = n.length) {
  for (let i = e?.firstChild; i; i = i.nextSibling)
    if (i.name == "JSXIdentifier" || i.name == "JSXBuiltin" || i.name == "JSXNamespacedName" || i.name == "JSXMemberExpression")
      return n.sliceString(i.from, Math.min(i.to, t));
  return "";
}
const iw = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), rw = /* @__PURE__ */ j.inputHandler.of((n, e, t, i, r) => {
  if ((iw ? n.composing : n.compositionStarted) || n.state.readOnly || e != t || i != ">" && i != "/" || !Rt.isActiveAt(n.state, e, -1))
    return !1;
  let s = r(), { state: o } = s, l = o.changeByRange((u) => {
    var a;
    let { head: c } = u, h = he(o).resolveInner(c - 1, -1), f;
    if (h.name == "JSXStartTag" && (h = h.parent), !(o.doc.sliceString(c - 1, c) != i || h.name == "JSXAttributeValue" && h.to > c)) {
      if (i == ">" && h.name == "JSXFragmentTag")
        return { range: u, changes: { from: c, insert: "</>" } };
      if (i == "/" && h.name == "JSXStartCloseTag") {
        let d = h.parent, O = d.parent;
        if (O && d.from == c - 2 && ((f = Xf(o.doc, O.firstChild, c)) || ((a = O.firstChild) === null || a === void 0 ? void 0 : a.name) == "JSXFragmentTag")) {
          let m = `${f}>`;
          return { range: v.cursor(c + m.length, -1), changes: { from: c, insert: m } };
        }
      } else if (i == ">") {
        let d = nw(h);
        if (d && d.name == "JSXOpenTag" && !/^\/?>|^<\//.test(o.doc.sliceString(c, c + 2)) && (f = Xf(o.doc, d, c)))
          return { range: u, changes: { from: c, insert: `</${f}>` } };
      }
    }
    return { range: u };
  });
  return l.changes.empty ? !1 : (n.dispatch([
    s,
    o.update(l, { userEvent: "input.complete", scrollIntoView: !0 })
  ]), !0);
}), Bi = ["_blank", "_self", "_top", "_parent"], $l = ["ascii", "utf-8", "utf-16", "latin1", "latin1"], Pl = ["get", "post", "put", "delete"], vl = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], Ue = ["true", "false"], D = {}, sw = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: Bi,
      hreflang: null
    }
  },
  abbr: D,
  address: D,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: D,
  aside: D,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: D,
  base: { attrs: { href: null, target: Bi } },
  bdi: D,
  bdo: D,
  blockquote: { attrs: { cite: null } },
  body: D,
  br: D,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: vl,
      formmethod: Pl,
      formnovalidate: ["novalidate"],
      formtarget: Bi,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: { attrs: { width: null, height: null } },
  caption: D,
  center: D,
  cite: D,
  code: D,
  col: { attrs: { span: null } },
  colgroup: { attrs: { span: null } },
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: { attrs: { value: null } },
  datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
  datalist: { attrs: { data: null } },
  dd: D,
  del: { attrs: { cite: null, datetime: null } },
  details: { attrs: { open: ["open"] } },
  dfn: D,
  div: D,
  dl: D,
  dt: D,
  em: D,
  embed: { attrs: { src: null, type: null, width: null, height: null } },
  eventsource: { attrs: { src: null } },
  fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
  figcaption: D,
  figure: D,
  footer: D,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": $l,
      autocomplete: ["on", "off"],
      enctype: vl,
      method: Pl,
      novalidate: ["novalidate"],
      target: Bi
    }
  },
  h1: D,
  h2: D,
  h3: D,
  h4: D,
  h5: D,
  h6: D,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: D,
  hgroup: D,
  hr: D,
  html: {
    attrs: { manifest: null }
  },
  i: D,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: vl,
      formmethod: Pl,
      formnovalidate: ["novalidate"],
      formtarget: Bi,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: { attrs: { cite: null, datetime: null } },
  kbd: D,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: { attrs: { for: null, form: null } },
  legend: D,
  li: { attrs: { value: null } },
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: { attrs: { name: null } },
  mark: D,
  menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
  meta: {
    attrs: {
      content: null,
      charset: $l,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: { attrs: { value: null, min: null, low: null, high: null, max: null, optimum: null } },
  nav: D,
  noscript: D,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: { reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"] },
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: { attrs: { disabled: ["disabled"], label: null } },
  option: { attrs: { disabled: ["disabled"], label: null, selected: ["selected"], value: null } },
  output: { attrs: { for: null, form: null, name: null } },
  p: D,
  param: { attrs: { name: null, value: null } },
  pre: D,
  progress: { attrs: { value: null, max: null } },
  q: { attrs: { cite: null } },
  rp: D,
  rt: D,
  ruby: D,
  samp: D,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: $l
    }
  },
  section: D,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  slot: { attrs: { name: null } },
  small: D,
  source: { attrs: { src: null, type: null, media: null } },
  span: D,
  strong: D,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: D,
  summary: D,
  sup: D,
  table: D,
  tbody: D,
  td: { attrs: { colspan: null, rowspan: null, headers: null } },
  template: D,
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: D,
  th: { attrs: { colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"] } },
  thead: D,
  time: { attrs: { datetime: null } },
  title: D,
  tr: D,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  ul: { children: ["li", "script", "template", "ul", "ol"] },
  var: D,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: D
}, Ap = {
  accesskey: null,
  class: null,
  contenteditable: Ue,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: Ue,
  autocorrect: Ue,
  autocapitalize: Ue,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: /* @__PURE__ */ "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": Ue,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": Ue,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": Ue,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": Ue,
  "aria-hidden": Ue,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": Ue,
  "aria-multiselectable": Ue,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": Ue,
  "aria-relevant": null,
  "aria-required": Ue,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
}, Cp = /* @__PURE__ */ "beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload".split(" ").map((n) => "on" + n);
for (let n of Cp)
  Ap[n] = null;
class kr {
  constructor(e, t) {
    this.tags = { ...sw, ...e }, this.globalAttrs = { ...Ap, ...t }, this.allTags = Object.keys(this.tags), this.globalAttrNames = Object.keys(this.globalAttrs);
  }
}
kr.default = /* @__PURE__ */ new kr();
function Mn(n, e, t = n.length) {
  if (!e)
    return "";
  let i = e.firstChild, r = i && i.getChild("TagName");
  return r ? n.sliceString(r.from, Math.min(r.to, t)) : "";
}
function Si(n, e = !1) {
  for (; n; n = n.parent)
    if (n.name == "Element")
      if (e)
        e = !1;
      else
        return n;
  return null;
}
function Tp(n, e, t) {
  let i = t.tags[Mn(n, Si(e))];
  return i?.children || t.allTags;
}
function wa(n, e) {
  let t = [];
  for (let i = Si(e); i && !i.type.isTop; i = Si(i.parent)) {
    let r = Mn(n, i);
    if (r && i.lastChild.name == "CloseTag")
      break;
    r && t.indexOf(r) < 0 && (e.name == "EndTag" || e.from >= i.firstChild.to) && t.push(r);
  }
  return t;
}
const Ep = /^[:\-\.\w\u00b7-\uffff]*$/;
function Zf(n, e, t, i, r) {
  let s = /\s*>/.test(n.sliceDoc(r, r + 5)) ? "" : ">", o = Si(t, t.name == "StartTag" || t.name == "TagName");
  return {
    from: i,
    to: r,
    options: Tp(n.doc, o, e).map((l) => ({ label: l, type: "type" })).concat(wa(n.doc, t).map((l, u) => ({
      label: "/" + l,
      apply: "/" + l + s,
      type: "type",
      boost: 99 - u
    }))),
    validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function Df(n, e, t, i) {
  let r = /\s*>/.test(n.sliceDoc(i, i + 5)) ? "" : ">";
  return {
    from: t,
    to: i,
    options: wa(n.doc, e).map((s, o) => ({ label: s, apply: s + r, type: "type", boost: 99 - o })),
    validFor: Ep
  };
}
function ow(n, e, t, i) {
  let r = [], s = 0;
  for (let o of Tp(n.doc, t, e))
    r.push({ label: "<" + o, type: "type" });
  for (let o of wa(n.doc, t))
    r.push({ label: "</" + o + ">", type: "type", boost: 99 - s++ });
  return { from: i, to: i, options: r, validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/ };
}
function lw(n, e, t, i, r) {
  let s = Si(t), o = s ? e.tags[Mn(n.doc, s)] : null, l = o && o.attrs ? Object.keys(o.attrs) : [], u = o && o.globalAttrs === !1 ? l : l.length ? l.concat(e.globalAttrNames) : e.globalAttrNames;
  return {
    from: i,
    to: r,
    options: u.map((a) => ({ label: a, type: "property" })),
    validFor: Ep
  };
}
function uw(n, e, t, i, r) {
  var s;
  let o = (s = t.parent) === null || s === void 0 ? void 0 : s.getChild("AttributeName"), l = [], u;
  if (o) {
    let a = n.sliceDoc(o.from, o.to), c = e.globalAttrs[a];
    if (!c) {
      let h = Si(t), f = h ? e.tags[Mn(n.doc, h)] : null;
      c = f?.attrs && f.attrs[a];
    }
    if (c) {
      let h = n.sliceDoc(i, r).toLowerCase(), f = '"', d = '"';
      /^['"]/.test(h) ? (u = h[0] == '"' ? /^[^"]*$/ : /^[^']*$/, f = "", d = n.sliceDoc(r, r + 1) == h[0] ? "" : h[0], h = h.slice(1), i++) : u = /^[^\s<>='"]*$/;
      for (let O of c)
        l.push({ label: O, apply: f + O + d, type: "constant" });
    }
  }
  return { from: i, to: r, options: l, validFor: u };
}
function Xp(n, e) {
  let { state: t, pos: i } = e, r = he(t).resolveInner(i, -1), s = r.resolve(i);
  for (let o = i, l; s == r && (l = r.childBefore(o)); ) {
    let u = l.lastChild;
    if (!u || !u.type.isError || u.from < u.to)
      break;
    s = r = l, o = u.from;
  }
  return r.name == "TagName" ? r.parent && /CloseTag$/.test(r.parent.name) ? Df(t, r, r.from, i) : Zf(t, n, r, r.from, i) : r.name == "StartTag" || r.name == "IncompleteTag" ? Zf(t, n, r, i, i) : r.name == "StartCloseTag" || r.name == "IncompleteCloseTag" ? Df(t, r, i, i) : r.name == "OpenTag" || r.name == "SelfClosingTag" || r.name == "AttributeName" ? lw(t, n, r, r.name == "AttributeName" ? r.from : i, i) : r.name == "Is" || r.name == "AttributeValue" || r.name == "UnquotedAttributeValue" ? uw(t, n, r, r.name == "Is" ? i : r.from, i) : e.explicit && (s.name == "Element" || s.name == "Text" || s.name == "Document") ? ow(t, n, r, i) : null;
}
function aw(n) {
  return Xp(kr.default, n);
}
function cw(n) {
  let { extraTags: e, extraGlobalAttributes: t } = n, i = t || e ? new kr(e, t) : kr.default;
  return (r) => Xp(i, r);
}
const hw = /* @__PURE__ */ Rt.parser.configure({ top: "SingleExpression" }), Zp = [
  {
    tag: "script",
    attrs: (n) => n.type == "text/typescript" || n.lang == "ts",
    parser: wp.parser
  },
  {
    tag: "script",
    attrs: (n) => n.type == "text/babel" || n.type == "text/jsx",
    parser: $p.parser
  },
  {
    tag: "script",
    attrs: (n) => n.type == "text/typescript-jsx",
    parser: Pp.parser
  },
  {
    tag: "script",
    attrs(n) {
      return /^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(n.type);
    },
    parser: hw
  },
  {
    tag: "script",
    attrs(n) {
      return !n.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(n.type);
    },
    parser: Rt.parser
  },
  {
    tag: "style",
    attrs(n) {
      return (!n.lang || n.lang == "css") && (!n.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(n.type));
    },
    parser: Ns.parser
  }
], Dp = /* @__PURE__ */ [
  {
    name: "style",
    parser: /* @__PURE__ */ Ns.parser.configure({ top: "Styles" })
  }
].concat(/* @__PURE__ */ Cp.map((n) => ({ name: n, parser: Rt.parser }))), Rp = /* @__PURE__ */ mi.define({
  name: "html",
  parser: /* @__PURE__ */ D3.configure({
    props: [
      /* @__PURE__ */ Cr.add({
        Element(n) {
          let e = /^(\s*)(<\/)?/.exec(n.textAfter);
          return n.node.to <= n.pos + e[0].length ? n.continue() : n.lineIndent(n.node.from) + (e[2] ? 0 : n.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(n) {
          return n.column(n.node.from) + n.unit;
        },
        Document(n) {
          if (n.pos + /\s*/.exec(n.textAfter)[0].length < n.node.to)
            return n.continue();
          let e = null, t;
          for (let i = n.node; ; ) {
            let r = i.lastChild;
            if (!r || r.name != "Element" || r.to != i.to)
              break;
            e = i = r;
          }
          return e && !((t = e.lastChild) && (t.name == "CloseTag" || t.name == "SelfClosingTag")) ? n.lineIndent(e.from) + n.unit : null;
        }
      }),
      /* @__PURE__ */ Tr.add({
        Element(n) {
          let e = n.firstChild, t = n.lastChild;
          return !e || e.name != "OpenTag" ? null : { from: e.to, to: t.name == "CloseTag" ? t.from : n.to };
        }
      }),
      /* @__PURE__ */ H0.add({
        "OpenTag CloseTag": (n) => n.getChild("TagName")
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: "-_"
  }
}), ks = /* @__PURE__ */ Rp.configure({
  wrap: /* @__PURE__ */ fp(Zp, Dp)
});
function fw(n = {}) {
  let e = "", t;
  n.matchClosingTags === !1 && (e = "noMatch"), n.selfClosingTags === !0 && (e = (e ? e + " " : "") + "selfClosing"), (n.nestedLanguages && n.nestedLanguages.length || n.nestedAttributes && n.nestedAttributes.length) && (t = fp((n.nestedLanguages || []).concat(Zp), (n.nestedAttributes || []).concat(Dp)));
  let i = t ? Rp.configure({ wrap: t, dialect: e }) : e ? ks.configure({ dialect: e }) : ks;
  return new pr(i, [
    ks.data.of({ autocomplete: cw(n) }),
    n.autoCloseTags !== !1 ? Ow : [],
    tw().support,
    bQ().support
  ]);
}
const Rf = /* @__PURE__ */ new Set(/* @__PURE__ */ "area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(" "));
function dw(n, e, t) {
  for (var i; ; ) {
    if (((i = e.lastChild) === null || i === void 0 ? void 0 : i.name) != "CloseTag")
      return !1;
    let r = e.parent;
    if (!r || Mn(n, r) != t)
      return !0;
    e = r;
  }
}
const Ow = /* @__PURE__ */ j.inputHandler.of((n, e, t, i, r) => {
  if (n.composing || n.state.readOnly || e != t || i != ">" && i != "/" || !ks.isActiveAt(n.state, e, -1))
    return !1;
  let s = r(), { state: o } = s, l = o.changeByRange((u) => {
    var a;
    let c = o.doc.sliceString(u.from - 1, u.to) == i, { head: h } = u, f = he(o).resolveInner(h, -1), d;
    if (c && i == ">" && f.name == "EndTag") {
      let O = f.parent;
      if ((d = Mn(o.doc, O.parent, h)) && !Rf.has(d) && !dw(o.doc, O.parent, d)) {
        let m = h + (o.doc.sliceString(h, h + 1) === ">" ? 1 : 0), g = `</${d}>`;
        return { range: u, changes: { from: h, to: m, insert: g } };
      }
    } else if (c && i == "/" && f.name == "IncompleteCloseTag") {
      let O = f.parent;
      if (f.from == h - 2 && ((a = O.lastChild) === null || a === void 0 ? void 0 : a.name) != "CloseTag" && (d = Mn(o.doc, O, h)) && !Rf.has(d)) {
        let m = h + (o.doc.sliceString(h, h + 1) === ">" ? 1 : 0), g = `${d}>`;
        return {
          range: v.cursor(h + g.length, -1),
          changes: { from: h, to: m, insert: g }
        };
      }
    }
    return { range: u };
  });
  return l.changes.empty ? !1 : (n.dispatch([
    s,
    o.update(l, {
      userEvent: "input.complete",
      scrollIntoView: !0
    })
  ]), !0);
}), Mp = /* @__PURE__ */ oa({ commentTokens: { block: { open: "<!--", close: "-->" } } }), Lp = /* @__PURE__ */ new F(), jp = /* @__PURE__ */ Cy.configure({
  props: [
    /* @__PURE__ */ Tr.add((n) => !n.is("Block") || n.is("Document") || Cu(n) != null || pw(n) ? void 0 : (e, t) => ({ from: t.doc.lineAt(e.from).to, to: e.to })),
    /* @__PURE__ */ Lp.add(Cu),
    /* @__PURE__ */ Cr.add({
      Document: () => null
    }),
    /* @__PURE__ */ Gn.add({
      Document: Mp
    })
  ]
});
function Cu(n) {
  let e = /^(?:ATX|Setext)Heading(\d)$/.exec(n.name);
  return e ? +e[1] : void 0;
}
function pw(n) {
  return n.name == "OrderedList" || n.name == "BulletList";
}
function mw(n, e) {
  let t = n;
  for (; ; ) {
    let i = t.nextSibling, r;
    if (!i || (r = Cu(i.type)) != null && r <= e)
      break;
    t = i;
  }
  return t.to;
}
const gw = /* @__PURE__ */ Zk.of((n, e, t) => {
  for (let i = he(n).resolveInner(t, -1); i && !(i.from < e); i = i.parent) {
    let r = i.type.prop(Lp);
    if (r == null)
      continue;
    let s = mw(i, r);
    if (s > t)
      return { from: t, to: s };
  }
  return null;
});
function $a(n) {
  return new pt(Mp, n, [], "markdown");
}
const bw = /* @__PURE__ */ $a(jp), xw = /* @__PURE__ */ jp.configure([JO, By, Iy, qy, {
  props: [
    /* @__PURE__ */ Tr.add({
      Table: (n, e) => ({ from: e.doc.lineAt(n.from).to, to: n.to })
    })
  ]
}]), Vs = /* @__PURE__ */ $a(xw);
function kw(n, e) {
  return (t) => {
    if (t && n) {
      let i = null;
      if (t = /\S*/.exec(t)[0], typeof n == "function" ? i = n(t) : i = Ms.matchLanguageName(n, t, !0), i instanceof Ms)
        return i.support ? i.support.language.parser : Or.getSkippingParser(i.load());
      if (i)
        return i.parser;
    }
    return e ? e.parser : null;
  };
}
class _l {
  constructor(e, t, i, r, s, o, l) {
    this.node = e, this.from = t, this.to = i, this.spaceBefore = r, this.spaceAfter = s, this.type = o, this.item = l;
  }
  blank(e, t = !0) {
    let i = this.spaceBefore + (this.node.name == "Blockquote" ? ">" : "");
    if (e != null) {
      for (; i.length < e; )
        i += " ";
      return i;
    } else {
      for (let r = this.to - this.from - i.length - this.spaceAfter.length; r > 0; r--)
        i += " ";
      return i + (t ? this.spaceAfter : "");
    }
  }
  marker(e, t) {
    let i = this.node.name == "OrderedList" ? String(+Ip(this.item, e)[2] + t) : "";
    return this.spaceBefore + i + this.type + this.spaceAfter;
  }
}
function zp(n, e) {
  let t = [], i = [];
  for (let r = n; r; r = r.parent) {
    if (r.name == "FencedCode")
      return i;
    (r.name == "ListItem" || r.name == "Blockquote") && t.push(r);
  }
  for (let r = t.length - 1; r >= 0; r--) {
    let s = t[r], o, l = e.lineAt(s.from), u = s.from - l.from;
    if (s.name == "Blockquote" && (o = /^ *>( ?)/.exec(l.text.slice(u))))
      i.push(new _l(s, u, u + o[0].length, "", o[1], ">", null));
    else if (s.name == "ListItem" && s.parent.name == "OrderedList" && (o = /^( *)\d+([.)])( *)/.exec(l.text.slice(u)))) {
      let a = o[3], c = o[0].length;
      a.length >= 4 && (a = a.slice(0, a.length - 4), c -= 4), i.push(new _l(s.parent, u, u + c, o[1], a, o[2], s));
    } else if (s.name == "ListItem" && s.parent.name == "BulletList" && (o = /^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(l.text.slice(u)))) {
      let a = o[4], c = o[0].length;
      a.length > 4 && (a = a.slice(0, a.length - 4), c -= 4);
      let h = o[2];
      o[3] && (h += o[3].replace(/[xX]/, " ")), i.push(new _l(s.parent, u, u + c, o[1], a, h, s));
    }
  }
  return i;
}
function Ip(n, e) {
  return /^(\s*)(\d+)(?=[.)])/.exec(e.sliceString(n.from, n.from + 10));
}
function Al(n, e, t, i = 0) {
  for (let r = -1, s = n; ; ) {
    if (s.name == "ListItem") {
      let l = Ip(s, e), u = +l[2];
      if (r >= 0) {
        if (u != r + 1)
          return;
        t.push({ from: s.from + l[1].length, to: s.from + l[0].length, insert: String(r + 2 + i) });
      }
      r = u;
    }
    let o = s.nextSibling;
    if (!o)
      break;
    s = o;
  }
}
function Pa(n, e) {
  let t = /^[ \t]*/.exec(n)[0].length;
  if (!t || e.facet(Ar) != "	")
    return n;
  let i = Kt(n, 4, t), r = "";
  for (let s = i; s > 0; )
    s >= 4 ? (r += "	", s -= 4) : (r += " ", s--);
  return r + n.slice(t);
}
const Sw = (n = {}) => ({ state: e, dispatch: t }) => {
  let i = he(e), { doc: r } = e, s = null, o = e.changeByRange((l) => {
    if (!l.empty || !Vs.isActiveAt(e, l.from, -1) && !Vs.isActiveAt(e, l.from, 1))
      return s = { range: l };
    let u = l.from, a = r.lineAt(u), c = zp(i.resolveInner(u, -1), r);
    for (; c.length && c[c.length - 1].from > u - a.from; )
      c.pop();
    if (!c.length)
      return s = { range: l };
    let h = c[c.length - 1];
    if (h.to - h.spaceAfter.length > u - a.from)
      return s = { range: l };
    let f = u >= h.to - h.spaceAfter.length && !/\S/.test(a.text.slice(h.to));
    if (h.item && f) {
      if (h.item.from < a.from && !/^[\s>]*$/.test(a.text.slice(0, h.to)))
        return s = { range: l };
      let b = h.node.firstChild, w = h.node.getChild("ListItem", "ListItem");
      if (b.to >= u || w && w.to < u || a.from > 0 && !/[^\s>]/.test(r.lineAt(a.from - 1).text) || n.nonTightLists === !1) {
        let S = c.length > 1 ? c[c.length - 2] : null, Q, y = "";
        S && S.item ? (Q = a.from + S.from, y = S.marker(r, 1)) : Q = a.from + (S ? S.to : 0);
        let A = [{ from: Q, to: u, insert: y }];
        return h.node.name == "OrderedList" && Al(h.item, r, A, -2), S && S.node.name == "OrderedList" && Al(S.item, r, A), { range: v.cursor(Q + y.length), changes: A };
      } else {
        let S = Lf(c, e, a);
        return {
          range: v.cursor(u + S.length + 1),
          changes: { from: a.from, insert: S + e.lineBreak }
        };
      }
    }
    if (h.node.name == "Blockquote" && f && a.from) {
      let b = r.lineAt(a.from - 1), w = />\s*$/.exec(b.text);
      if (w && w.index == h.from) {
        let S = e.changes([
          { from: b.from + w.index, to: b.to },
          { from: a.from + h.from, to: a.to }
        ]);
        return { range: l.map(S), changes: S };
      }
    }
    let d = [];
    h.node.name == "OrderedList" && Al(h.item, r, d);
    let O = h.item && h.item.from < a.from, m = "";
    if (!O || /^[\s\d.)\-+*>]*/.exec(a.text)[0].length >= h.to)
      for (let b = 0, w = c.length - 1; b <= w; b++)
        m += b == w && !O ? c[b].marker(r, 1) : c[b].blank(b < w ? Kt(a.text, 4, c[b + 1].from) - m.length : null);
    let g = u;
    for (; g > a.from && /\s/.test(a.text.charAt(g - a.from - 1)); )
      g--;
    return m = Pa(m, e), Qw(h.node, e.doc) && (m = Lf(c, e, a) + e.lineBreak + m), d.push({ from: g, to: u, insert: e.lineBreak + m }), { range: v.cursor(g + m.length + 1), changes: d };
  });
  return s ? !1 : (t(e.update(o, { scrollIntoView: !0, userEvent: "input" })), !0);
}, yw = /* @__PURE__ */ Sw();
function Mf(n) {
  return n.name == "QuoteMark" || n.name == "ListMark";
}
function Qw(n, e) {
  if (n.name != "OrderedList" && n.name != "BulletList")
    return !1;
  let t = n.firstChild, i = n.getChild("ListItem", "ListItem");
  if (!i)
    return !1;
  let r = e.lineAt(t.to), s = e.lineAt(i.from), o = /^[\s>]*$/.test(r.text);
  return r.number + (o ? 0 : 1) < s.number;
}
function Lf(n, e, t) {
  let i = "";
  for (let r = 0, s = n.length - 2; r <= s; r++)
    i += n[r].blank(r < s ? Kt(t.text, 4, n[r + 1].from) - i.length : null, r < s);
  return Pa(i, e);
}
function ww(n, e) {
  let t = n.resolveInner(e, -1), i = e;
  Mf(t) && (i = t.from, t = t.parent);
  for (let r; r = t.childBefore(i); )
    if (Mf(r))
      i = r.from;
    else if (r.name == "OrderedList" || r.name == "BulletList")
      t = r.lastChild, i = t.to;
    else
      break;
  return t;
}
const $w = ({ state: n, dispatch: e }) => {
  let t = he(n), i = null, r = n.changeByRange((s) => {
    let o = s.from, { doc: l } = n;
    if (s.empty && Vs.isActiveAt(n, s.from)) {
      let u = l.lineAt(o), a = zp(ww(t, o), l);
      if (a.length) {
        let c = a[a.length - 1], h = c.to - c.spaceAfter.length + (c.spaceAfter ? 1 : 0);
        if (o - u.from > h && !/\S/.test(u.text.slice(h, o - u.from)))
          return {
            range: v.cursor(u.from + h),
            changes: { from: u.from + h, to: o }
          };
        if (o - u.from == h && // Only apply this if we're on the line that has the
        // construct's syntax, or there's only indentation in the
        // target range
        (c.item && u.from <= c.item.from || /^[\s>]*$/.test(u.text.slice(0, c.to)))) {
          let f = u.from + c.from;
          if (c.item && c.node.from < c.item.from && /\S/.test(u.text.slice(c.from, c.to))) {
            let d = c.blank(Kt(u.text, 4, c.to) - Kt(u.text, 4, c.from));
            return f == u.from && (d = Pa(d, n)), {
              range: v.cursor(f + d.length),
              changes: { from: f, to: u.from + c.to, insert: d }
            };
          }
          if (f < o)
            return { range: v.cursor(f), changes: { from: f, to: o } };
        }
      }
    }
    return i = { range: s };
  });
  return i ? !1 : (e(n.update(r, { scrollIntoView: !0, userEvent: "delete" })), !0);
}, Bp = [
  { key: "Enter", run: yw },
  { key: "Backspace", run: $w }
], qp = /* @__PURE__ */ fw({ matchClosingTags: !1 });
function Pw(n = {}) {
  let { codeLanguages: e, defaultCodeLanguage: t, addKeymap: i = !0, base: { parser: r } = bw, completeHTMLTags: s = !0, pasteURLAsLink: o = !0, htmlTagLanguage: l = qp } = n;
  if (!(r instanceof Oo))
    throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");
  let u = n.extensions ? [n.extensions] : [], a = [l.support, gw], c;
  o && a.push(Cw), t instanceof pr ? (a.push(t.support), c = t.language) : t && (c = t);
  let h = e || c ? kw(e, c) : void 0;
  u.push(Ey({ codeParser: h, htmlParser: l.language.parser })), i && a.push(to.high(lo.of(Bp)));
  let f = $a(r.configure(u));
  return s && a.push(f.data.of({ autocomplete: vw })), new pr(f, a);
}
function vw(n) {
  let { state: e, pos: t } = n, i = /<[:\-\.\w\u00b7-\uffff]*$/.exec(e.sliceDoc(t - 25, t));
  if (!i)
    return null;
  let r = he(e).resolveInner(t, -1);
  for (; r && !r.type.isTop; ) {
    if (r.name == "CodeBlock" || r.name == "FencedCode" || r.name == "ProcessingInstructionBlock" || r.name == "CommentBlock" || r.name == "Link" || r.name == "Image")
      return null;
    r = r.parent;
  }
  return {
    from: t - i[0].length,
    to: t,
    options: _w(),
    validFor: /^<[:\-\.\w\u00b7-\uffff]*$/
  };
}
let Cl = null;
function _w() {
  if (Cl)
    return Cl;
  let n = aw(new ty(H.create({ extensions: qp }), 0, !0));
  return Cl = n ? n.options : [];
}
const Aw = /code|horizontalrule|html|link|comment|processing|escape|entity|image|mark|url/i, Cw = /* @__PURE__ */ j.domEventHandlers({
  paste: (n, e) => {
    var t;
    let { main: i } = e.state.selection;
    if (i.empty)
      return !1;
    let r = (t = n.clipboardData) === null || t === void 0 ? void 0 : t.getData("text/plain");
    if (!r || !/^(https?:\/\/|mailto:|xmpp:|www\.)/.test(r) || (/^www\./.test(r) && (r = "https://" + r), !Vs.isActiveAt(e.state, i.from, 1)))
      return !1;
    let s = he(e.state), o = !1;
    return s.iterate({
      from: i.from,
      to: i.to,
      enter: (l) => {
        (l.from > i.from || Aw.test(l.name)) && (o = !0);
      },
      leave: (l) => {
        l.to < i.to && (o = !0);
      }
    }), o ? !1 : (e.dispatch({
      changes: [{ from: i.from, insert: "[" }, { from: i.to, insert: `](${r})` }],
      userEvent: "input.paste",
      scrollIntoView: !0
    }), !0);
  }
});
class Tw extends tn {
  toDOM() {
    const e = document.createElement("span");
    return e.textContent = "•", e.setAttribute("aria-hidden", "true"), e;
  }
}
class Ew extends tn {
  /** @param {string} markdown */
  constructor(e) {
    super(), this.markdown = e;
  }
  /** @param {ImageWidget} other */
  eq(e) {
    return this.markdown === e.markdown;
  }
  toDOM() {
    const e = document.createElement("span");
    e.className = "md-inline__image", e.innerHTML = eo(this.markdown);
    const t = e.querySelector("p");
    return t && t.replaceWith(...t.childNodes), e;
  }
  ignoreEvent() {
    return !1;
  }
}
class Xw extends tn {
  /** @param {string} markdown @param {number} from @param {number[][]} cells */
  constructor(e, t, i) {
    super(), this.markdown = e, this.from = t, this.cells = i;
  }
  /** @param {TableWidget} other */
  eq(e) {
    return this.markdown === e.markdown && this.from === e.from;
  }
  /** @param {EditorView} view */
  toDOM(e) {
    const t = e.dom.ownerDocument.createElement("div");
    return t.className = "md-inline__table", t.innerHTML = eo(this.markdown), t.addEventListener("mousedown", (i) => {
      if (i.button !== 0 || e.state.readOnly) return;
      i.preventDefault();
      const r = i.target, s = r instanceof Element ? r.closest("th, td") : null, o = Array.from(t.querySelectorAll("tr")), l = o.findIndex((c) => s && c.contains(s)), u = l < 0 || !s ? -1 : Array.from(o[l].children).indexOf(s), a = this.cells[l]?.[u] ?? this.from;
      e.dispatch({ selection: { anchor: a }, scrollIntoView: !0 }), e.focus();
    }), t;
  }
}
function Fp(n, e, t, i) {
  return e && !n.readOnly && n.selection.ranges.some((r) => r.from <= i && r.to >= t);
}
function jf(n, e) {
  const t = [];
  return he(n).iterate({
    enter(i) {
      if (i.name !== "Table") return;
      const { from: r, to: s } = i;
      if (!Fp(n, e, r, s)) {
        const o = [];
        for (let u = i.node.firstChild; u; u = u.nextSibling)
          if (u.name === "TableHeader" || u.name === "TableRow") {
            const a = [];
            let c = u.from;
            for (const h of u.getChildren("TableDelimiter")) {
              if (h.from > u.from) {
                const f = n.doc.sliceString(c, h.from);
                a.push(c + f.length - f.trimStart().length);
              }
              c = h.to;
            }
            if (c < u.to) {
              const h = n.doc.sliceString(c, u.to);
              a.push(c + h.length - h.trimStart().length);
            }
            o.push(a);
          }
        const l = new Xw(n.doc.sliceString(r, s), r, o);
        t.push(K.replace({ widget: l, block: !0 }).range(r, s));
      }
      return !1;
    }
  }), K.set(t, !0);
}
const Tu = le.define(), Zw = jt.define({
  /** @param {import('@codemirror/state').EditorState} state */
  create(n) {
    return { focused: !1, decorations: jf(n, !1) };
  },
  update(n, e) {
    let t = n.focused;
    for (const i of e.effects)
      i.is(Tu) && (t = i.value);
    return { focused: t, decorations: jf(e.state, t) };
  },
  provide: (n) => j.decorations.from(n, (e) => e.decorations)
});
function zf(n) {
  const { state: e } = n, t = [], i = n.hasFocus && !e.readOnly ? e.selection.ranges : [];
  function r(o, l) {
    const u = e.doc.lineAt(o).from, a = e.doc.lineAt(l).to;
    return i.some((c) => c.from <= a && c.to >= u);
  }
  function s(o, l, u) {
    t.push(K.mark({ class: u }).range(o, l));
  }
  return he(e).iterate({
    enter(o) {
      const { name: l, from: u, to: a } = o, c = o.node.parent;
      if (l === "Table" && !Fp(e, n.hasFocus, u, a)) return !1;
      if (/^ATXHeading[1-6]$/.test(l) && t.push(K.line({ class: `md-inline__heading md-inline__h${l.slice(-1)}` }).range(e.doc.lineAt(u).from)), l === "StrongEmphasis" && s(u, a, "md-inline__strong"), l === "Emphasis" && s(u, a, "md-inline__em"), l === "Strikethrough" && s(u, a, "md-inline__strike"), l === "InlineCode" && s(u, a, "md-inline__code"), l === "Link" && s(u, a, "md-inline__link"), l === "FencedCode" || l === "Blockquote")
        for (let h = e.doc.lineAt(u).from; h <= a; ) {
          const f = e.doc.lineAt(h);
          if (t.push(K.line({ class: l === "FencedCode" ? "md-inline__fence" : "md-inline__quote" }).range(f.from)), f.to >= a) break;
          h = f.to + 1;
        }
      if (!r(u, a)) {
        if (l === "Image" && e.doc.lineAt(u).number === e.doc.lineAt(a).number)
          return t.push(K.replace({ widget: new Ew(e.doc.sliceString(u, a)) }).range(u, a)), !1;
        if (l === "ListMark" && e.doc.sliceString(u, a).match(/^[-+*]$/))
          t.push(K.replace({ widget: new Tw() }).range(u, a));
        else if ((["HeaderMark", "EmphasisMark", "StrikethroughMark", "CodeMark", "QuoteMark", "LinkMark", "CodeInfo"].includes(l) || (l === "URL" || l === "LinkTitle") && c && /^\!?\[/.test(e.doc.sliceString(c.from, c.to))) && e.doc.lineAt(u).number === e.doc.lineAt(a).number) {
          const h = (l === "HeaderMark" || l === "QuoteMark") && e.doc.sliceString(a, a + 1) === " " ? 1 : 0;
          t.push(K.replace({}).range(u, a + h));
        }
      }
    }
  }), K.set(t, !0);
}
const Dw = kn.fromClass(class {
  /** @param {import('@codemirror/view').EditorView} view */
  constructor(n) {
    this.decorations = zf(n);
  }
  /** @param {import('@codemirror/view').ViewUpdate} update */
  update(n) {
    (n.docChanged || n.selectionSet || n.focusChanged || n.viewportChanged || he(n.startState) !== he(n.state) || n.startState.readOnly !== n.state.readOnly) && (this.decorations = zf(n.view));
  }
}, { decorations: (n) => n.decorations }), Rw = [
  Zw,
  j.domEventHandlers({
    focus(n, e) {
      e.dispatch({ effects: Tu.of(!0) });
    },
    blur(n, e) {
      e.dispatch({ effects: Tu.of(!1) });
    }
  }),
  Dw
];
function Mw(n) {
  const e = qf(n), t = e.element;
  wd(t);
  const i = t.ownerDocument, r = i.createElement("section");
  r.className = "md-editor md-inline", r.dataset.theme = e.theme, r.setAttribute("aria-label", "Inline live Markdown editor");
  const s = i.createElement("header");
  s.className = "md-editor__header", s.hidden = !e.header;
  const o = i.createElement("strong");
  o.textContent = "Inline live editor";
  const l = i.createElement("span");
  l.className = "md-inline__hint", l.textContent = "Markdown on the active line. Preview everywhere else.", s.append(o, l);
  const u = i.createElement("div");
  u.className = "md-editor__toolbar", u.hidden = !e.toolbar || e.toolbarCommands.length === 0, u.setAttribute("role", "group"), u.setAttribute("aria-label", "Inline formatting");
  const a = i.createElement("div"), c = i.createElement("footer");
  c.className = "md-editor__footer", c.hidden = !e.footer;
  const h = i.createElement("span"), f = i.createElement("span");
  f.setAttribute("role", "status"), f.textContent = "Changes are kept as Markdown", c.append(h, f), r.append(s, u, a, c);
  let d = !1, O = e.readOnly;
  const m = new wr(), g = [], b = [];
  function w(X, q) {
    if (O || X.composing || d) return !1;
    const { from: R, to: M } = X.state.selection.main, W = If(X.state.doc.toString(), R, M, q);
    return X.dispatch({
      changes: { from: 0, to: X.state.doc.length, insert: W.value },
      selection: { anchor: W.start, head: W.end },
      scrollIntoView: !0
    }), d || X.focus(), !0;
  }
  function S() {
    h.textContent = `${y.state.doc.length.toLocaleString()} characters`;
  }
  let Q = !1;
  const y = new j({
    parent: a,
    state: H.create({
      doc: e.value,
      extensions: [
        Pw({ extensions: JO }),
        Hk(),
        lo.of([
          { key: "Mod-b", run: (X) => w(X, "bold") },
          { key: "Mod-i", run: (X) => w(X, "italic") },
          ...Bp,
          ...JS,
          ...oS,
          ey
        ]),
        j.lineWrapping,
        ik(e.placeholder),
        m.of([H.readOnly.of(O), j.editable.of(!O)]),
        j.contentAttributes.of({ "aria-label": "Inline Markdown document", "aria-multiline": "true", role: "textbox", tabindex: "0" }),
        Rw,
        j.updateListener.of((X) => {
          X.docChanged && (S(), e.onChange?.(X.state.doc.toString()));
        })
      ]
    })
  });
  for (const X of e.toolbarCommands) {
    const q = i.createElement("button");
    q.type = "button", q.textContent = X.text, q.setAttribute("aria-label", X.label), q.title = X.label, q.dataset.command = X.id, q.disabled = O;
    const R = () => {
      w(y, X.id);
    };
    q.addEventListener("click", R), g.push(() => q.removeEventListener("click", R)), b.push(q), u.append(q);
  }
  const A = () => {
    Q || (Q = !0, e.onFocus?.());
  }, C = () => {
    queueMicrotask(() => {
      !d && Q && !r.contains(i.activeElement) && (Q = !1, e.onBlur?.());
    });
  };
  r.addEventListener("focusin", A), r.addEventListener("focusout", C), S(), t.append(r), $d(t);
  function z() {
    if (d) throw new Error("Markdown editor has been destroyed");
  }
  return {
    getValue() {
      return z(), y.state.doc.toString();
    },
    /** @param {string} value */
    setValue(X) {
      z(), Ss(X, "value");
      const q = y.state.toText(X);
      q.eq(y.state.doc) || y.dispatch({ changes: { from: 0, to: y.state.doc.length, insert: q } });
    },
    getHTML() {
      z();
      try {
        const X = eo(y.state.doc.toString());
        return f.textContent = "Changes are kept as Markdown", X;
      } catch (X) {
        throw f.textContent = "Unable to render Markdown. Check the document and try again.", X;
      }
    },
    /** @param {boolean} value */
    setReadOnly(X) {
      z(), Eu(X), O = X, y.dispatch({ effects: m.reconfigure([H.readOnly.of(X), j.editable.of(!X)]) }), b.forEach((q) => {
        q.disabled = X;
      });
    },
    focus() {
      z(), y.focus();
    },
    destroy() {
      d || (d = !0, r.removeEventListener("focusin", A), r.removeEventListener("focusout", C), g.forEach((X) => X()), y.destroy(), r.remove(), Pd(t));
    }
  };
}
const Fw = { create: jb, createInline: Mw };
export {
  Fw as MarkdownEditor,
  jb as create,
  Mw as createInline
};
