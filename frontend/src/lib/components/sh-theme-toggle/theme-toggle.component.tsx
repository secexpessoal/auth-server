import { Moon, Sun } from "lucide-react";
import { Button } from "@lib/components/sh-button/button.component";
import { useTheme } from "@lib/core/theme.provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className="rounded-md bg-card shadow-sm hover:bg-accent hover:text-accent-foreground transition-all border border-white/20 dark:border-white/10"
      aria-label="Trocar tema"
    >
      {theme === "light" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-400" />}
    </Button>
  );
}
