import { LessonItem } from "@/components/courses/LessonItem";
import { AIAssistant } from "@/components/player/AIAssistant";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { CertificateSection } from "@/components/shared/CertificateSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  MessageSquare,
  Send,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function CoursePlayerPage() {
  const { courseId = "", lessonId = "" } = useParams({ strict: false }) as {
    courseId?: string;
    lessonId?: string;
  };
  const navigate = useNavigate();
  const {
    getCourse,
    hasAccess,
    getProgress,
    markLessonComplete,
    addComment,
    getComments,
    getQuiz,
    submitQuiz,
    getQuizSubmission,
    getCertificate,
    generateCertificate,
  } = useCourses();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<
    Record<number, number | string>
  >({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [certUserName, setCertUserName] = useState("");

  const course = getCourse(courseId);
  const isPurchased = user ? hasAccess(user.id, courseId) : false;
  const progress = user
    ? getProgress(user.id, courseId)
    : { userId: "", courseId, completedLessons: [] };

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const currentLesson = allLessons.find((l) => l.id === lessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const totalLessons = allLessons.length;
  const completedCount = progress.completedLessons.length;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCourseComplete = progressPct === 100;

  const comments = getComments(lessonId);
  const quizQuestions = getQuiz(lessonId);
  const existingSubmission = user
    ? getQuizSubmission(user.id, lessonId)
    : undefined;
  const existingCert =
    user && course ? getCertificate(user.id, courseId) : undefined;

  // Init cert user name
  useEffect(() => {
    if (user && !certUserName) {
      setCertUserName(user.name);
    }
  }, [user, certUserName]);

  // Redirect if lesson is locked
  useEffect(() => {
    if (!course || !currentLesson) return;
    if (!currentLesson.isFree && !isPurchased) {
      navigate({ to: "/courses/$id", params: { id: courseId } });
    }
  }, [course, currentLesson, isPurchased, courseId, navigate]);

  if (!course || !currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-semibold">Lesson not found</h2>
        <Link to="/courses">
          <Button variant="outline">Browse Courses</Button>
        </Link>
      </div>
    );
  }

  const handleVideoEnded = () => {
    if (user) {
      markLessonComplete(user.id, courseId, lessonId);
      toast.success("Lesson completed! ✓");
    }
    if (nextLesson && (nextLesson.isFree || isPurchased)) {
      setTimeout(() => {
        navigate({
          to: "/learn/$courseId/$lessonId",
          params: { courseId, lessonId: nextLesson.id },
        });
      }, 1500);
    }
  };

  const handleMarkComplete = () => {
    if (user) {
      markLessonComplete(user.id, courseId, lessonId);
      toast.success("Lesson marked as complete!");
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    await addComment({
      userId: user.id,
      userName: user.name,
      lessonId,
      courseId,
      text: commentText.trim(),
    });
    setCommentText("");
    setIsSubmittingComment(false);
    toast.success("Comment added!");
  };

  const handleSubmitQuiz = async () => {
    if (!user) {
      toast.error("Please login to take the quiz");
      return;
    }
    setIsSubmittingQuiz(true);

    const answers = quizQuestions.map(
      (_q, i) => quizAnswers[i] ?? (quizQuestions[i].type === "mcq" ? -1 : ""),
    );

    let score = 0;
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      const a = answers[i];
      if (q.type === "mcq" && typeof a === "number" && a === q.correctIndex) {
        score++;
      } else if (
        q.type === "fill-blank" &&
        typeof a === "string" &&
        q.correctAnswer &&
        a.trim().toLowerCase() === q.correctAnswer.toLowerCase()
      ) {
        score++;
      }
      // short-answer: not auto-graded, score stays 0
    }

    await submitQuiz({
      userId: user.id,
      lessonId,
      answers,
      score,
      total: quizQuestions.length,
    });
    setQuizSubmitted(true);
    setIsSubmittingQuiz(false);
    toast.success(`Quiz submitted! Score: ${score}/${quizQuestions.length}`);
  };

  const handleClaimCertificate = () => {
    if (!user) return;
    generateCertificate(user.id, courseId, certUserName || user.name);
    toast.success("Certificate generated! 🎉");
  };

  // Compute current submission for display
  const submission =
    existingSubmission ||
    (quizSubmitted
      ? {
          userId: user?.id ?? "",
          lessonId,
          answers: quizQuestions.map(
            (_q, i) =>
              quizAnswers[i] ?? (quizQuestions[i].type === "mcq" ? -1 : ""),
          ),
          score: (() => {
            let s = 0;
            quizQuestions.forEach((q, i) => {
              const a = quizAnswers[i];
              if (
                q.type === "mcq" &&
                typeof a === "number" &&
                a === q.correctIndex
              )
                s++;
              else if (
                q.type === "fill-blank" &&
                typeof a === "string" &&
                q.correctAnswer &&
                a.trim().toLowerCase() === q.correctAnswer.toLowerCase()
              )
                s++;
            });
            return s;
          })(),
          total: quizQuestions.length,
          submittedAt: new Date().toISOString(),
        }
      : undefined);

  const typeLabel = (type: string) => {
    if (type === "mcq") return "MCQ";
    if (type === "fill-blank") return "Fill in Blank";
    return "Short Answer";
  };

  const typeColor = (type: string) => {
    if (type === "mcq")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (type === "fill-blank")
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72 lg:w-80" : "w-0"
        } shrink-0 transition-all duration-300 overflow-hidden border-r border-border bg-card flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <Link
            to="/courses/$id"
            params={{ id: courseId }}
            className="flex-1 min-w-0"
          >
            <p className="text-xs font-semibold text-foreground truncate">
              {course.title}
            </p>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {completedCount}/{totalLessons} lessons
            </span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3">
            <Accordion
              type="multiple"
              defaultValue={course.modules.map((m) => m.id)}
              className="space-y-1"
            >
              {course.modules.map((module) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border-0"
                >
                  <AccordionTrigger className="hover:no-underline py-2 px-2 rounded-md hover:bg-muted text-left">
                    <span className="text-xs font-semibold text-foreground text-left">
                      {module.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-1">
                    <div className="space-y-0.5 pl-1">
                      {module.lessons.map((lesson) => {
                        const isLocked = !lesson.isFree && !isPurchased;
                        const isCompleted = progress.completedLessons.includes(
                          lesson.id,
                        );
                        return (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            isActive={lesson.id === lessonId}
                            isCompleted={isCompleted}
                            isLocked={isLocked}
                            onClick={() =>
                              navigate({
                                to: "/learn/$courseId/$lessonId",
                                params: { courseId, lessonId: lesson.id },
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background shrink-0">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
              data-ocid="player.toggle"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentLesson.title}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {prevLesson && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() =>
                  navigate({
                    to: "/learn/$courseId/$lessonId",
                    params: { courseId, lessonId: prevLesson.id },
                  })
                }
                disabled={!prevLesson.isFree && !isPurchased}
                data-ocid="player.pagination_prev"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
            )}
            {nextLesson && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() =>
                  navigate({
                    to: "/learn/$courseId/$lessonId",
                    params: { courseId, lessonId: nextLesson.id },
                  })
                }
                disabled={!nextLesson.isFree && !isPurchased}
                data-ocid="player.pagination_next"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {user && !progress.completedLessons.includes(lessonId) && (
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={handleMarkComplete}
                data-ocid="player.primary_button"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Done
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Video/PDF */}
            <div className="mb-6">
              {currentLesson.type === "video" ? (
                <VideoPlayer
                  url={currentLesson.contentUrl}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted flex flex-col items-center justify-center p-10 gap-3">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {currentLesson.title}
                  </p>
                  <a
                    href={currentLesson.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              )}
              {currentLesson.pdfUrl && (
                <div className="mt-3 flex">
                  <a
                    href={currentLesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start" data-ocid="player.tab">
                <TabsTrigger
                  value="overview"
                  className="text-sm"
                  data-ocid="player.tab"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Overview
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="text-sm"
                  data-ocid="player.tab"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Comments
                  {comments.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-[10px] px-1.5 py-0"
                    >
                      {comments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="quiz"
                  className="text-sm"
                  data-ocid="player.tab"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5" /> Quiz
                  {quizQuestions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-[10px] px-1.5 py-0"
                    >
                      {quizQuestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                {isCourseComplete && (
                  <TabsTrigger
                    value="certificate"
                    className="text-sm"
                    data-ocid="player.tab"
                  >
                    <Award className="h-3.5 w-3.5 mr-1.5" /> Certificate
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-5 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2">
                    {currentLesson.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentLesson.description}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Course Info
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Instructor
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {course.instructor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Level</p>
                      <p className="text-sm font-medium text-foreground">
                        {course.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="text-sm font-medium text-foreground">
                        {course.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Lesson Type
                      </p>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {currentLesson.type}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-5 space-y-4">
                {user ? (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="text-sm min-h-[70px] resize-none"
                        data-ocid="player.textarea"
                      />
                      <Button
                        size="icon"
                        className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground self-end"
                        onClick={handleSubmitComment}
                        disabled={isSubmittingComment || !commentText.trim()}
                        data-ocid="player.submit_button"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Log in
                    </Link>
                    {" to join the conversation"}
                  </div>
                )}

                <div className="space-y-4" data-ocid="player.list">
                  {comments.length === 0 ? (
                    <div
                      className="text-center py-8"
                      data-ocid="player.empty_state"
                    >
                      <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No comments yet. Be the first!
                      </p>
                    </div>
                  ) : (
                    comments.map((comment, i) => (
                      <div
                        key={comment.id}
                        className="flex gap-3"
                        data-ocid={`player.item.${i + 1}`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground text-xs font-bold shrink-0">
                          {comment.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {comment.userName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Quiz Tab */}
              <TabsContent value="quiz" className="mt-5">
                {quizQuestions.length === 0 ? (
                  <div
                    className="text-center py-8"
                    data-ocid="player.empty_state"
                  >
                    <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No quiz for this lesson
                    </p>
                  </div>
                ) : submission ? (
                  <div className="space-y-4">
                    {/* Score banner */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg border ${
                        submission.score / submission.total >= 0.7
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      }`}
                      data-ocid="player.success_state"
                    >
                      <Trophy
                        className={`h-6 w-6 shrink-0 ${
                          submission.score / submission.total >= 0.7
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Score: {submission.score}/{submission.total} (
                          {Math.round(
                            (submission.score / submission.total) * 100,
                          )}
                          %)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.score / submission.total >= 0.7
                            ? "Excellent work! You passed the quiz."
                            : "Keep practicing! Review the lesson and try again."}
                        </p>
                        {quizQuestions.some(
                          (q) => q.type === "short-answer",
                        ) && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            * Short answer questions are manually graded and not
                            counted in auto-score.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Results per question */}
                    {quizQuestions.map((q, i) => {
                      const answer = submission.answers[i];
                      let isCorrect = false;
                      let showCorrect = false;

                      if (q.type === "mcq") {
                        isCorrect =
                          typeof answer === "number" &&
                          answer === q.correctIndex;
                        showCorrect = true;
                      } else if (q.type === "fill-blank") {
                        isCorrect =
                          typeof answer === "string" &&
                          !!q.correctAnswer &&
                          answer.trim().toLowerCase() ===
                            q.correctAnswer.toLowerCase();
                        showCorrect = true;
                      }

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-start gap-2 mb-3">
                            <Badge
                              className={`text-[10px] px-1.5 py-0 border-0 shrink-0 mt-0.5 ${typeColor(q.type)}`}
                            >
                              {typeLabel(q.type)}
                            </Badge>
                            <p className="text-sm font-medium text-foreground">
                              {i + 1}. {q.question}
                            </p>
                          </div>

                          {q.type === "mcq" && (
                            <div className="space-y-2">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={`${q.id}-${oi}`}
                                  className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                                    oi === q.correctIndex
                                      ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                                      : answer === oi && oi !== q.correctIndex
                                        ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {oi === q.correctIndex ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                  ) : (
                                    <span className="h-3.5 w-3.5 shrink-0" />
                                  )}
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          {q.type === "fill-blank" && (
                            <div className="space-y-1.5">
                              <div
                                className={`p-2 rounded-md text-sm ${
                                  isCorrect
                                    ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                                    : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                                }`}
                              >
                                Your answer:{" "}
                                <span className="font-medium">
                                  {String(answer) || "(blank)"}
                                </span>
                              </div>
                              {showCorrect && !isCorrect && (
                                <div className="p-2 rounded-md text-xs bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400">
                                  Correct:{" "}
                                  <span className="font-medium">
                                    {q.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {q.type === "short-answer" && (
                            <div className="p-2 rounded-md bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Your answer:
                              </p>
                              <p className="text-sm text-foreground">
                                {String(answer) || "(no answer)"}
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                                ℹ️ This question is manually graded.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                      Answer all {quizQuestions.length} questions below.
                    </p>
                    {quizQuestions.map((q, i) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start gap-2 mb-3">
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border-0 shrink-0 mt-0.5 ${typeColor(q.type)}`}
                          >
                            {typeLabel(q.type)}
                          </Badge>
                          <p className="text-sm font-medium text-foreground">
                            {i + 1}. {q.question}
                          </p>
                        </div>

                        {/* MCQ */}
                        {q.type === "mcq" && (
                          <RadioGroup
                            value={quizAnswers[i]?.toString()}
                            onValueChange={(v) =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [i]: Number.parseInt(v),
                              }))
                            }
                            data-ocid="player.radio"
                          >
                            <div className="space-y-2">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={`${q.id}-${oi}`}
                                  className="flex items-center gap-2.5"
                                >
                                  <RadioGroupItem
                                    value={oi.toString()}
                                    id={`q${i}-o${oi}`}
                                    className="border-muted-foreground"
                                  />
                                  <Label
                                    htmlFor={`q${i}-o${oi}`}
                                    className="text-sm text-foreground cursor-pointer"
                                  >
                                    {opt}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        )}

                        {/* Fill in blank */}
                        {q.type === "fill-blank" && (
                          <Input
                            value={(quizAnswers[i] as string) ?? ""}
                            onChange={(e) =>
                              setQuizAnswers((prev) => ({
                                ...prev,
                                [i]: e.target.value,
                              }))
                            }
                            placeholder="Type your answer here..."
                            className="mt-1"
                            data-ocid="player.input"
                          />
                        )}

                        {/* Short answer */}
                        {q.type === "short-answer" && (
                          <div className="space-y-1">
                            <Textarea
                              value={(quizAnswers[i] as string) ?? ""}
                              onChange={(e) =>
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [i]: e.target.value,
                                }))
                              }
                              placeholder="Write your answer here..."
                              className="min-h-[80px] resize-none mt-1"
                              data-ocid="player.textarea"
                            />
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              This will be manually reviewed by the instructor.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleSubmitQuiz}
                      disabled={
                        isSubmittingQuiz ||
                        quizQuestions.some((q, i) =>
                          q.type === "mcq"
                            ? quizAnswers[i] === undefined
                            : false,
                        )
                      }
                      data-ocid="player.submit_button"
                    >
                      {isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Certificate Tab */}
              {isCourseComplete && (
                <TabsContent value="certificate" className="mt-5">
                  {existingCert ? (
                    <CertificateSection certificate={existingCert} />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800">
                        <Award className="h-6 w-6 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            You've completed this course! 🎉
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Claim your certificate below.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">
                          Your name on the certificate
                        </Label>
                        <Input
                          value={certUserName}
                          onChange={(e) => setCertUserName(e.target.value)}
                          placeholder="Enter your full name"
                          data-ocid="certificate.input"
                        />
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleClaimCertificate}
                        disabled={!certUserName.trim()}
                        data-ocid="certificate.primary_button"
                      >
                        <Award className="h-4 w-4 mr-2" /> Claim Certificate
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #certificate-print-area {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 9999;
          }
        }
      `}</style>
    </div>
  );
}
