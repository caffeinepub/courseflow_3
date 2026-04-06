import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/courses/CourseCardSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export function HomePage() {
  const { courses, isLoading } = useCourses();
  const { user } = useAuth();

  const featured = courses.filter((c) => c.isPublished).slice(0, 4);

  return (
    <main>
      {/* Hero */}
      <section
        className="hero-gradient text-white py-20 md:py-28"
        data-ocid="home.section"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3.5 py-1.5 text-sm text-white/80 border border-white/20">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>The #1 platform for online learning</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Learn Without
                <span
                  className="block text-transparent bg-clip-text"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  }}
                >
                  Limits
                </span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                Access world-class courses taught by industry experts. Learn
                programming, design, data science, finance and more — at your
                own pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
                    data-ocid="home.primary_button"
                  >
                    Browse Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/signup">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto font-semibold"
                      data-ocid="home.secondary_button"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-white/60 pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Cancel anytime
                </span>
              </div>
            </div>

            {/* Abstract illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-3xl blur-2xl" />
                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        icon: BookOpen,
                        label: "50+ Courses",
                        color: "text-blue-400",
                      },
                      {
                        icon: Users,
                        label: "5K+ Students",
                        color: "text-purple-400",
                      },
                      {
                        icon: Star,
                        label: "4.8 Avg Rating",
                        color: "text-amber-400",
                      },
                      {
                        icon: TrendingUp,
                        label: "100% Satisfaction",
                        color: "text-green-400",
                      },
                    ].map(({ icon: Icon, label, color }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <Icon className={`h-6 w-6 ${color}`} />
                        <span className="text-xs text-white/70 text-center font-medium">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-white/60">
                        Currently learning
                      </span>
                    </div>
                    <p className="text-sm text-white/80 font-medium">
                      Complete Web Development Bootcamp
                    </p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                    </div>
                    <p className="text-xs text-white/40 mt-1">60% complete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary" data-ocid="home.section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/20">
            {[
              { value: "5,000+", label: "Active Students" },
              { value: "50+", label: "Expert Courses" },
              { value: "100%", label: "Satisfaction" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center py-4 px-4 sm:px-8"
              >
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {value}
                </span>
                <span className="text-xs sm:text-sm text-white/70 mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section
        className="py-16 md:py-20 bg-background"
        data-ocid="home.section"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Featured Courses
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Hand-picked by our education team
              </p>
            </div>
            <Link to="/courses">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80 font-medium"
                data-ocid="home.link"
              >
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
              data-ocid="home.list"
            >
              {featured.map((course, i) => (
                <div key={course.id} data-ocid={`home.item.${i + 1}`}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 bg-muted/30" data-ocid="home.section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Why CourseFlow?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
              Everything you need to learn effectively, in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Expert-Led Courses",
                desc: "Learn from industry professionals with years of real-world experience in their fields.",
              },
              {
                icon: TrendingUp,
                title: "Track Your Progress",
                desc: "Interactive progress tracking, quizzes, and completion certificates keep you motivated.",
              },
              {
                icon: Users,
                title: "Community Learning",
                desc: "Join a thriving community of learners. Ask questions, share projects, and grow together.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!user && (
        <section className="hero-gradient py-16" data-ocid="home.section">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to start learning?
            </h2>
            <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
              Join thousands of students already transforming their careers with
              CourseFlow.
            </p>
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
                data-ocid="home.primary_button"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
