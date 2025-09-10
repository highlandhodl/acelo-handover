import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { useThemeContext } from '../../context/ThemeContext';
import { cycleTheme } from '../../lib/themeUtils';

export const ThemeToggle = () => {
  const { theme, setTheme } = useThemeContext();

  const handleToggle = () => {
    const nextTheme = cycleTheme(theme);
    setTheme(nextTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
      default:
        return 'Light mode';
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="h-9 w-9"
      title={`Current: ${getLabel()}. Click to switch theme.`}
    >
      {getIcon()}
    </Button>
  );
};