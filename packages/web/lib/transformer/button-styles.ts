export function buttonStyles({
  successIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='rgba(128,128,128,1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24'%3E%3Crect width='8' height='4' x='8' y='2' rx='1'/%3E%3Cpath d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/%3E%3Cpath d='m9 14 2 2 4-4'/%3E%3C/svg%3E`,
  copyIcon = successIcon,
  display,
  enableDarkMode,
  cssVariables = `
:root {
  --button-border-color: #e2e2e3;
  --button-bg: oklch(98.5% 0.002 247.839);
  --button-bg-hover: #ffffff;

  --button-border-color-dark: #2e2e32;
  --button-bg-dark: transparent;
  --button-bg-hover-dark: #1b1b1f;

  --button-top: 11.5px;
  --button-right: 12px;
  --button-z-index: 999;
  --button-radius: 4px;
  --button-size: 30px;
  --icon-size: 20px;
}
`,
}: {
  successIcon?: string;
  copyIcon?: string;
  display?: "hover" | "ready";
  enableDarkMode?: boolean;
  cssVariables?: string;
}) {
  let styles = `
${cssVariables}

pre {
    position: relative;
    overflow: auto;
}

pre:has(code) code {
    overflow-x: auto;
    display: block;
  }


pre:has(code) button.shiki-transformer-button-copy {
  position: absolute;
  top: var(--button-top);
  right: var(--button-right);
  z-index: var(--button-z-index);

  width: var(--button-size);
  height: var(--button-size);
  border-radius: var(--button-radius);
  border: 1px solid var(--button-border-color);

  background-color: var(--button-bg);
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: background-color .2s, opacity .2s;
}

pre:has(code) button.shiki-transformer-button-copy:hover {
  background-color: var(--button-bg-hover);
}

pre:has(code) button.shiki-transformer-button-copy .ready,
pre:has(code) button.shiki-transformer-button-copy .success {
  width: var(--icon-size);
  height: var(--icon-size);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

pre:has(code) button.shiki-transformer-button-copy .ready {
  background-image: url("${copyIcon}");
}

pre:has(code) button.shiki-transformer-button-copy .success {
  display: none;
  background-image: url("${successIcon}");
}

pre:has(code) button.shiki-transformer-button-copy.shiki-transformer-button-copied .ready {
  display: none;
}

pre:has(code) button.shiki-transformer-button-copy.shiki-transformer-button-copied .success {
  display: block;
}
`;

  if (display === "hover") {
    styles += `
pre:has(code) button.shiki-transformer-button-copy {
  opacity: 0;
}
pre:has(code):hover button.shiki-transformer-button-copy {
  opacity: 1;
}
`;
  }

  if (enableDarkMode) {
    styles += `
html.dark pre:has(code) button.shiki-transformer-button-copy {
  background-color: var(--button-bg-dark);
  border-color: var(--button-border-color-dark);
}

html.dark pre:has(code) button.shiki-transformer-button-copy:hover {
  background-color: var(--button-bg-hover-dark);
}
`;
  }

  return styles;
}
