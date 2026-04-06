import { Link } from "@tanstack/react-router";
import { BookOpen, Github, Linkedin, Twitter, Youtube } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="footer-bg text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                CourseFlow
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Empowering learners worldwide with world-class online education.
              Learn at your own pace, on your schedule.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Github"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white/50 hover:text-white transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Browse Courses", href: "/courses" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Login", href: "/login" },
                { label: "Sign Up", href: "/signup" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {[
                "Web Development",
                "Data Science",
                "Design",
                "Cloud & DevOps",
                "Finance",
                "Mobile Development",
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    to="/courses"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {currentYear} CourseFlow. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
