// Shared design system for the PVE+K8s training decks.
// Palette: PVE orange accent + K8s blue, on deep navy (title/section) and light (content).

const C = {
  navy: "0E1B33",     // deep navy - background (title/section)
  navyDark: "0A1428",
  ice: "CADCFC",      // ice blue - body text on dark
  orange: "FF7300",   // PVE orange - accent
  orangeLight: "FFA94D",
  blue: "326CE5",     // K8s blue - supporting
  sky: "7FB0FF",
  white: "FFFFFF",
  body: "1F2A3D",     // body text on light
  sub: "5A6B85",      // muted text on light
  card: "F3F6FC",     // light card fill
  line: "D8E0EE",
  soft: "EAF1FF",
};

const FONT_HEAD = "Cambria";   // serif header (safe)
const FONT_BODY = "Calibri";   // sans body (safe)

// Standard slide size 16:9
const W = 10;
const H = 5.625;

function darkSlide(pptx, opts = {}) {
  const s = pptx.addSlide();
  s.background = { color: C.navy };
  if (!opts.noKicker) {
    s.addText(opts.kicker || "PVE × Kubernetes 工程師訓練", {
      x: 0.6, y: 0.28, w: 8.8, h: 0.3,
      fontFace: FONT_BODY, fontSize: 12, color: C.orange, bold: true,
      charSpacing: 2, margin: 0,
    });
  }
  if (opts.title) {
    s.addText(opts.title, {
      x: 0.6, y: opts.noKicker ? 0.5 : 0.7, w: 8.8, h: 1.1,
      fontFace: FONT_HEAD, fontSize: opts.titleSize || 40, color: C.white,
      bold: true, margin: 0,
    });
  }
  if (opts.sub) {
    s.addText(opts.sub, {
      x: 0.6, y: (opts.titleY || 1.75), w: 8.6, h: 0.9,
      fontFace: FONT_BODY, fontSize: 18, color: C.ice, margin: 0, lineSpacing: 30,
    });
  }
  return s;
}

function contentSlide(pptx, title, opts = {}) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  // small orange square kicker (motif)
  s.addShape("roundRect", { x: 0.55, y: 0.42, w: 0.16, h: 0.5, fill: { color: C.orange }, rectRadius: 0.05 });
  s.addText(title, {
    x: 0.85, y: 0.3, w: 8.6, h: 0.6,
    fontFace: FONT_HEAD, fontSize: 28, color: C.navy, bold: true, margin: 0,
  });
  if (opts.page) {
    s.addText(opts.page, { x: 9.2, y: 0.35, w: 0.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.sub, align: "right", margin: 0 });
  }
  return s;
}

// card with icon circle
function card(slide, x, y, w, h, circleColor, title, bodyText, opts = {}) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: opts.fill || C.card }, rectRadius: 0.08, line: { color: C.line, width: 0.75 } });
  slide.addShape("ellipse", { x: x + 0.2, y: y + 0.18, w: 0.4, h: 0.4, fill: { color: circleColor } });
  slide.addShape("ellipse", { x: x + 0.26, y: y + 0.24, w: 0.28, h: 0.28, fill: { color: C.white } });
  slide.addText(title, {
    x: x + 0.62, y: y + 0.16, w: w - 0.75, h: 0.4,
    fontFace: FONT_BODY, fontSize: 14, color: C.navy, bold: true, margin: 0,
  });
  slide.addText(bodyText, {
    x: x + 0.2, y: y + 0.62, w: w - 0.4, h: h - 0.72,
    fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacing: 15, valign: "top",
  });
}

function bullets(slide, x, y, w, h, items, opts = {}) {
  const arr = items.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < items.length - 1, indentLevel: 0, paraSpaceAfter: opts.gap || 10 },
  }));
  slide.addText(arr, {
    x, y, w, h, fontFace: FONT_BODY, fontSize: opts.size || 15,
    color: C.body, valign: "top", margin: 0, lineSpacing: opts.line || 24,
  });
}

function footer(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 5.35, w: 9, h: 0.25, fontFace: FONT_BODY, fontSize: 9, color: C.sub, margin: 0,
  });
}

module.exports = { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer };
