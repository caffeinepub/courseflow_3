import { CertificateCard } from "@/components/shared/CertificateCard";
import { ReferralCard } from "@/components/shared/ReferralCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, Clock, TrendingUp } from "lucide-react";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { getPurchases, getCourse, getProgress, getUserCertificates } =
    useCourses();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate({ to: "/login" });
    return null;
  }

  const purchases = getPurchases(user.id);
  const enrolledCourses = purchases
    .map((p) => getCourse(p.courseId))
    .filter(Boolean) as NonNullable<ReturnType<typeof getCourse>>[];

  const certificates = getUserCertificates(user.id);

  const totalHours = enrolledCourses.reduce(
    (acc, c) => acc + Math.floor(c.totalDuration / 3600),
    0,
  );

  const avgProgress =
    enrolledCourses.length > 0
      ? `${Math.round(
          (enrolledCourses.reduce((acc, c) => {
            const p = getProgress(user.id, c.id);
            const total = c.modules.flatMap((m) => m.lessons).length;
            return acc + (total > 0 ? p.completedLessons.length / total : 0);
          }, 0) /
            enrolledCourses.length) *
            100,
        )}%`
      : "0%";

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrolledCourses.length,
      icon: BookOpen,
    },
    { label: "Hours Learned", value: `${totalHours}h`, icon: Clock },
    { label: "Avg Progress", value: avgProgress, icon: TrendingUp },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {enrolledCourses.length > 0
            ? `You're enrolled in ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? "s" : ""}.`
            : "Start your learning journey today."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-foreground">My Courses</h2>
          <Link to="/courses">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              data-ocid="dashboard.link"
            >
              Browse More <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl"
            data-ocid="dashboard.empty_state"
          >
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">
              No courses yet
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Enroll in a course to start your learning journey
            </p>
            <Link to="/courses">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="dashboard.primary_button"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            data-ocid="dashboard.list"
          >
            {enrolledCourses.map((course, i) => {
              const prog = getProgress(user.id, course.id);
              const allLessons = course.modules.flatMap((m) => m.lessons);
              const total = allLessons.length;
              const completed = prog.completedLessons.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const nextLesson = allLessons.find(
                (l) => !prog.completedLessons.includes(l.id),
              );

              return (
                <div
                  key={course.id}
                  className="flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-shadow"
                  data-ocid={`dashboard.item.${i + 1}`}
                >
                  <div className="relative">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {pct === 100 && (
                      <div className="absolute top-2 right-2">
                        <span className="flex items-center gap-1 bg-green-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          <Award className="h-2.5 w-2.5" /> Complete
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      By {course.instructor}
                    </p>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>
                          {completed}/{total} lessons
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(course.totalDuration)} total</span>
                    </div>

                    <div className="mt-auto">
                      <Link
                        to="/learn/$courseId/$lessonId"
                        params={{
                          courseId: course.id,
                          lessonId: nextLesson?.id ?? allLessons[0]?.id ?? "",
                        }}
                      >
                        <Button
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                          data-ocid="dashboard.primary_button"
                        >
                          {pct === 100
                            ? "Review Course"
                            : pct === 0
                              ? "Start Learning"
                              : "Continue"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Certificates */}
      {certificates.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">
              My Certificates
            </h2>
            <Link to="/verify">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                data-ocid="dashboard.link"
              >
                Verify Certificate <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            data-ocid="dashboard.list"
          >
            {certificates.map((cert, i) => (
              <div
                key={cert.id}
                className="overflow-hidden rounded-xl border border-border hover:shadow-card-hover transition-shadow"
                data-ocid={`dashboard.item.${i + 1}`}
              >
                <CertificateCard certificate={cert} />
                <div className="p-3 bg-card border-t border-border flex items-center justify-between">
                  <p className="text-xs font-mono text-muted-foreground">
                    {cert.id}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(cert.id);
                    }}
                  >
                    Copy ID
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referral Program Card */}
      {user.role === "student" && (
        <div className="mb-6">
          <ReferralCard userId={user.id} />
        </div>
      )}
    </main>
  );
}
