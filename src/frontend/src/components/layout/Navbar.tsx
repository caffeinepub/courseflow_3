import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  GitMerge,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPath = location.pathname;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
  ];

  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0"
          data-ocid="nav.link"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            CourseFlow
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user?.role === "student" && (
            <Link
              to="/referral"
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                isActive("/referral") ? "text-primary" : "text-muted-foreground"
              }`}
              data-ocid="nav.link"
            >
              <GitMerge className="h-3.5 w-3.5" />
              Referrals
            </Link>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground"
            data-ocid="nav.toggle"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  data-ocid="nav.open_modal_button"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                data-ocid="nav.dropdown_menu"
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="nav.link"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 cursor-pointer"
                    data-ocid="nav.link"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user.role === "student" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/referral"
                      className="flex items-center gap-2 cursor-pointer"
                      data-ocid="nav.link"
                    >
                      <GitMerge className="h-4 w-4" />
                      Referrals
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 cursor-pointer"
                      data-ocid="nav.link"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                  data-ocid="nav.button"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-medium"
                  data-ocid="nav.link"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="sm"
                  className="font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-ocid="nav.primary_button"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.toggle"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === "student" && (
              <Link
                to="/referral"
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive("/referral")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid="nav.link"
              >
                <GitMerge className="h-4 w-4" /> Referrals
              </Link>
            )}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-2">
                <Link
                  to="/login"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-ocid="nav.link"
                  >
                    Log in
                  </Button>
                </Link>
                <Link
                  to="/signup"
                  className="flex-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    data-ocid="nav.primary_button"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
