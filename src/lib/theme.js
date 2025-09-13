export function applyTheme(themeSettings) {
  const root = document.documentElement;
  if (!themeSettings) return;

  const mapping = {
    background: "--theme-background",
    foreground: "--theme-foreground",
    primary: "--theme-primary",
    primaryForeground: "--theme-primary-foreground", 
    secondary: "--theme-secondary",
    secondaryForeground: "--theme-secondary-foreground",
    muted: "--theme-muted",
    mutedForeground: "--theme-muted-foreground",
    accent: "--theme-accent",
    accentForeground: "--theme-accent-foreground",
    destructive: "--theme-destructive",
    destructiveForeground: "--theme-destructive-foreground",
    border: "--theme-border",
    input: "--theme-input",
    ring: "--theme-ring",
    card: "--theme-card",
    cardForeground: "--theme-card-foreground",
    popover: "--theme-popover",
    popoverForeground: "--theme-popover-foreground",
  };

  for (const [key, cssVar] of Object.entries(mapping)) {
    if (themeSettings[key]) {
      root.style.setProperty(cssVar, themeSettings[key]);
    }
  }
}