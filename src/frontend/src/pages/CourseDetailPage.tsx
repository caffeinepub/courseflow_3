import { PaymentDialog } from "@/components/shared/PaymentDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CourseDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { getCourse, hasAccess, getProgress } = useCourses();
  const { user } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const course = getCourse(id);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          Course not found
        </h2>
        <Link to="/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const isPurchased = user ? hasAccess(user.id, course.id) : false;
  const progress = user
    ? getProgress(user.id, course.id)
    : { completedLessons: [] };
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = progress.completedLessons.length;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const firstLesson = allLessons[0];
  const firstFreeLesson = allLessons.find((l) => l.isFree);

  const handleStartCourse = () => {
    const lessonId = (isPurchased ? firstLesson : firstFreeLesson)?.id;
    if (lessonId) {
      navigate({
        to: "/learn/$courseId/$lessonId",
        params: { courseId: course.id, lessonId },
      });
    }
  };

  const handlePaymentSuccess = () => {
    navigate({
      to: "/learn/$courseId/$lessonId",
      params: { courseId: course.id, lessonId: firstLesson?.id ?? "" },
    });
  };

  return (
    <main className="bg-background">
      {/* Hero */}
      <div className="hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/courses">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white mb-6 -ml-2"
              data-ocid="course_detail.link"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
            </Button>
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-white/15 text-white border-0">
                  {course.category}
                </Badge>
                <Badge className="bg-white/15 text-white border-0">
                  {course.level}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">
                {course.title}
              </h1>
              <p className="text-white/70 text-sm leading-relaxed mb-5">
                {course.shortDescription}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-medium">
                    {course.rating}
                  </span>
                  <span>({course.reviewCount.toLocaleString()} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.totalDuration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.instructor}
                </span>
              </div>

              {isPurchased && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                    <span>Your progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2 bg-white/20" />
                </div>
              )}
            </div>

            {/* Sticky buy card */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-xl">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 text-foreground">
                  {course.price === 0 ? (
                    <p className="text-2xl font-bold text-primary mb-4">Free</p>
                  ) : (
                    <p className="text-2xl font-bold text-foreground mb-4">
                      ₹{course.price.toLocaleString("en-IN")}
                    </p>
                  )}

                  {isPurchased ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      onClick={handleStartCourse}
                      data-ocid="course_detail.primary_button"
                    >
                      Continue Learning
                    </Button>
                  ) : course.price === 0 ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      onClick={handleStartCourse}
                      data-ocid="course_detail.primary_button"
                    >
                      Enroll Free
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mb-2"
                        onClick={() => {
                          if (!user) {
                            navigate({ to: "/login" });
                          } else {
                            setPaymentOpen(true);
                          }
                        }}
                        data-ocid="course_detail.primary_button"
                      >
                        Buy Course
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        onClick={handleStartCourse}
                        data-ocid="course_detail.secondary_button"
                      >
                        Preview Free Lesson
                      </Button>
                    </>
                  )}

                  <ul className="mt-4 space-y-2">
                    {[
                      `${totalLessons} lessons across ${course.modules.length} modules`,
                      `${formatDuration(course.totalDuration)} total content`,
                      "Completion certificate",
                      "Lifetime access",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">
                About this course
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {course.description}
              </p>
            </section>

            {/* Tags */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">
                Topics Covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Course Curriculum
              </h2>
              <Accordion
                type="multiple"
                defaultValue={[course.modules[0]?.id]}
                className="space-y-2"
              >
                {course.modules.map((module) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {module.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {module.lessons.length} lessons
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => {
                          const isLocked = !lesson.isFree && !isPurchased;
                          const isCompleted = (
                            progress.completedLessons as string[]
                          ).includes(lesson.id as string);
                          return (
                            <button
                              type="button"
                              key={lesson.id}
                              disabled={isLocked}
                              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-md text-left ${
                                isLocked
                                  ? "opacity-60 cursor-not-allowed"
                                  : "hover:bg-muted cursor-pointer"
                              }`}
                              onClick={() => {
                                if (!isLocked) {
                                  navigate({
                                    to: "/learn/$courseId/$lessonId",
                                    params: {
                                      courseId: course.id,
                                      lessonId: lesson.id,
                                    },
                                  });
                                }
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              ) : isLocked ? (
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                              ) : lesson.type === "video" ? (
                                <PlayCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground">
                                  {lesson.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {lesson.isFree && (
                                    <span className="text-green-600 dark:text-green-400 mr-1">
                                      Free
                                    </span>
                                  )}
                                  {formatDuration(lesson.duration)}
                                </p>
                              </div>
                              {isLocked && (
                                <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Instructor card (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="p-5 rounded-xl border border-border bg-card">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Your Instructor
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {course.instructor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {course.instructor}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.category} Expert
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentDialog
        course={course}
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        onSuccess={handlePaymentSuccess}
      />
    </main>
  );
}
