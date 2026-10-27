// Extra Mermaid options layered on top of Material's own initialisation.
// Material calls mermaid.initialize() itself (and re-renders on palette change),
// so we wrap it instead of calling it a second time.
(function () {
  if (typeof mermaid === "undefined") return;
  // Colours come from Material CSS variables, which inherit into Mermaid's
  // shadow DOM, so they follow the Light/Dark palette automatically.
  const themeCSS = `
    .pieTitleText, .pieOuterCircle ~ text { fill: var(--md-default-fg-color) !important; }
    .legend text { fill: var(--md-default-fg-color) !important; }
    .titleText, .sectionTitle, .taskTextOutsideRight, .taskTextOutsideLeft { fill: var(--md-default-fg-color) !important; }
    .branch-label0, .branch-label0 tspan { fill: #fff !important; }
    .branch-label1, .branch-label1 tspan { fill: #000 !important; }
    .commit-label, .tag-label { fill: var(--md-default-fg-color) !important; }
    .commit-label-bkg, .tag-label-bkg { fill: var(--md-default-bg-color) !important; opacity: 0.85; }
  `;
  const initialize = mermaid.initialize.bind(mermaid);
  mermaid.initialize = (config) =>
    initialize({
      ...config,
      securityLevel: "strict", // no HTML labels / click handlers from diagram source
      suppressErrorRendering: true, // keep the "Syntax error" bomb out of the page
      themeCSS: (config.themeCSS || "") + themeCSS,
    });
})();
