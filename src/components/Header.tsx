import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img 
            src="/serverspark-logo.png" 
            alt="ServerSpark Logo" 
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-xl font-semibold">ServerSpark</h1>
            <span className="text-xs text-muted-foreground">Test</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#modules" className="text-foreground/80 hover:text-foreground transition-colors">
            Modules
          </a>
          <a href="#docs" className="text-foreground/80 hover:text-foreground transition-colors">
            Docs
          </a>
          <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-9 h-9 p-0"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:inline-flex"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          
          <Button size="sm">
            Login with Discord
          </Button>

          <Button variant="ghost" size="sm" className="md:hidden w-9 h-9 p-0">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;