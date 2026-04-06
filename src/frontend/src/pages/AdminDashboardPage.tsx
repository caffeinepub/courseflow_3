import { QuizBuilder } from "@/components/admin/QuizBuilder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  DollarSign,
  Edit,
  FileQuestion,
  GitMerge,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    courses,
    deleteCourse,
    getAllPurchases,
    getQuiz,
    saveQuiz,
    getAllUsers,
    getAllWithdrawals,
    updateWithdrawalStatus,
    getAllReferralRecords,
    getCourse,
    getGlobalCommissionTiers,
    updateGlobalCommissionTiers,
  } = useCourses();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quizBuilderState, setQuizBuilderState] = useState<{
    lessonId: string;
    lessonTitle: string;
  } | null>(null);
  const [editableTiers, setEditableTiers] = useState(() =>
    getGlobalCommissionTiers().map((t, idx) => ({ ...t, _key: String(idx) })),
  );

  if (!isAuthenticated || user?.role !== "admin") {
    navigate({ to: "/" });
    return null;
  }

  const purchases = getAllPurchases();
  const totalRevenue = purchases.reduce((acc, p) => {
    const course = courses.find((c) => c.id === p.courseId);
    return acc + (course?.price ?? 0);
  }, 0);

  const uniqueStudents = new Set(purchases.map((p) => p.userId)).size;
  const allUsers = getAllUsers();
  const allWithdrawals = getAllWithdrawals();
  const allReferrals = getAllReferralRecords();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteCourse(id);
    setDeletingId(null);
    toast.success("Course deleted");
  };

  const handleMarkWithdrawalPaid = (id: string) => {
    updateWithdrawalStatus(id, "paid");
    toast.success("Withdrawal marked as paid");
  };

  const stats = [
    {
      label: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      label: "Total Students",
      value: uniqueStudents,
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Total Sales",
      value: purchases.length,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "Revenue",
      value: `₹${(totalRevenue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: "text-amber-500",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your courses and students
          </p>
        </div>
        <Link to="/admin/courses/new">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-ocid="admin.primary_button"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses">
        <TabsList className="mb-6 flex-wrap h-auto gap-1" data-ocid="admin.tab">
          <TabsTrigger
            value="courses"
            className="text-xs"
            data-ocid="admin.tab"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Courses
          </TabsTrigger>
          <TabsTrigger value="quiz" className="text-xs" data-ocid="admin.tab">
            <FileQuestion className="h-3.5 w-3.5 mr-1.5" /> Quiz Manager
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs" data-ocid="admin.tab">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Users
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="text-xs"
            data-ocid="admin.tab"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Purchases
          </TabsTrigger>
          <TabsTrigger
            value="referrals"
            className="text-xs"
            data-ocid="admin.tab"
          >
            <GitMerge className="h-3.5 w-3.5 mr-1.5" /> Referrals
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            className="text-xs"
            data-ocid="admin.tab"
          >
            <Wallet className="h-3.5 w-3.5 mr-1.5" /> Withdrawals
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                All Courses
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course, i) => (
                    <TableRow key={course.id} data-ocid={`admin.row.${i + 1}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="h-9 w-14 object-cover rounded-md"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-xs">
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.instructor}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {course.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {course.price === 0
                            ? "Free"
                            : `₹${course.price.toLocaleString("en-IN")}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={course.isPublished ? "default" : "secondary"}
                          className={`text-xs ${
                            course.isPublished
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                              : ""
                          }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">
                          {course.rating} ★
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to="/admin/courses/$id/edit"
                            params={{ id: course.id }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              data-ocid={`admin.edit_button.${i + 1}`}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                data-ocid={`admin.delete_button.${i + 1}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-ocid="admin.dialog">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Course?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{course.title}"
                                  and all its content.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(course.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                  disabled={deletingId === course.id}
                                  data-ocid="admin.confirm_button"
                                >
                                  {deletingId === course.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Quiz Manager Tab */}
        <TabsContent value="quiz">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                Quiz Manager
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add or edit quizzes for each lesson
              </p>
            </div>
            <div className="divide-y divide-border">
              {courses.map((course, ci) => (
                <div key={course.id} className="p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    {course.title}
                  </p>
                  <div className="space-y-2">
                    {course.modules.flatMap((mod) =>
                      mod.lessons.map((lesson, li) => {
                        const quizQuestions = getQuiz(lesson.id);
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                            data-ocid={`admin.item.${ci * 10 + li + 1}`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {mod.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant="secondary" className="text-xs">
                                {quizQuestions.length} questions
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() =>
                                  setQuizBuilderState({
                                    lessonId: lesson.id,
                                    lessonTitle: lesson.title,
                                  })
                                }
                                data-ocid={`admin.edit_button.${ci * 10 + li + 1}`}
                              >
                                <Edit className="h-3 w-3 mr-1" /> Edit Quiz
                              </Button>
                            </div>
                          </div>
                        );
                      }),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Builder Dialog */}
          <Dialog
            open={!!quizBuilderState}
            onOpenChange={(open) => !open && setQuizBuilderState(null)}
          >
            <DialogContent
              className="max-w-2xl w-full"
              data-ocid="admin.dialog"
            >
              {quizBuilderState && (
                <QuizBuilder
                  lessonId={quizBuilderState.lessonId}
                  lessonTitle={quizBuilderState.lessonTitle}
                  initialQuestions={getQuiz(quizBuilderState.lessonId)}
                  onSave={(questions) =>
                    saveQuiz(quizBuilderState.lessonId, questions)
                  }
                  onClose={() => setQuizBuilderState(null)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                All Users
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {allUsers.length} registered users
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u, i) => (
                    <TableRow key={u.id} data-ocid={`admin.row.${i + 1}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {u.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : ""
                          }`}
                        >
                          {u.role === "admin" ? (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            "Student"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {u.referralCode || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {u.id.startsWith("user-")
                            ? new Date(
                                Number(u.id.split("-")[1]),
                              ).toLocaleDateString()
                            : "Seed user"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                All Purchases
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {purchases.length} total purchases
              </p>
            </div>
            {purchases.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No purchases yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Referral</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((p, i) => {
                      const course = getCourse(p.courseId);
                      const buyer = allUsers.find((u) => u.id === p.userId);
                      return (
                        <TableRow
                          key={`${p.userId}-${p.courseId}`}
                          data-ocid={`admin.row.${i + 1}`}
                        >
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">
                              {buyer?.name ?? p.userId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {buyer?.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {course?.title ?? p.courseId}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-foreground">
                              ₹{course?.price.toLocaleString("en-IN") ?? "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {p.referralCode ? (
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {p.referralCode}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {new Date(p.purchasedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          {/* Commission Tiers Manager */}
          <Card className="mb-6" data-ocid="commission_tiers.card">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Commission Tiers
              </CardTitle>
              <CardDescription className="text-sm">
                Set global referral commission rates based on number of
                referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table data-ocid="commission_tiers.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]">Min Referrals</TableHead>
                      <TableHead className="w-[200px]">Max Referrals</TableHead>
                      <TableHead className="w-[160px]">
                        Commission Rate
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editableTiers.map((tier, i) => (
                      <TableRow
                        key={tier._key}
                        data-ocid={`commission_tiers.row.${i + 1}`}
                      >
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={tier.minReferrals}
                            onChange={(e) =>
                              setEditableTiers((prev) =>
                                prev.map((t, idx) =>
                                  idx === i
                                    ? {
                                        ...t,
                                        minReferrals: Number(e.target.value),
                                      }
                                    : t,
                                ),
                              )
                            }
                            className="w-24 h-8 text-sm"
                            data-ocid={`commission_tiers.input.${i + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min={0}
                              value={tier.maxReferrals ?? ""}
                              disabled={tier.maxReferrals === null}
                              placeholder={
                                tier.maxReferrals === null ? "∞" : ""
                              }
                              onChange={(e) =>
                                setEditableTiers((prev) =>
                                  prev.map((t, idx) =>
                                    idx === i
                                      ? {
                                          ...t,
                                          maxReferrals:
                                            e.target.value === ""
                                              ? null
                                              : Number(e.target.value),
                                        }
                                      : t,
                                  ),
                                )
                              }
                              className="w-24 h-8 text-sm"
                              data-ocid={`commission_tiers.input.${i + 1}`}
                            />
                            <div className="flex items-center gap-1.5">
                              <Checkbox
                                id={`unlimited-${i}`}
                                checked={tier.maxReferrals === null}
                                onCheckedChange={(checked) =>
                                  setEditableTiers((prev) =>
                                    prev.map((t, idx) =>
                                      idx === i
                                        ? {
                                            ...t,
                                            maxReferrals: checked ? null : 0,
                                          }
                                        : t,
                                    ),
                                  )
                                }
                                data-ocid={`commission_tiers.checkbox.${i + 1}`}
                              />
                              <Label
                                htmlFor={`unlimited-${i}`}
                                className="text-xs text-muted-foreground cursor-pointer"
                              >
                                Unlimited
                              </Label>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={tier.rate}
                              onChange={(e) =>
                                setEditableTiers((prev) =>
                                  prev.map((t, idx) =>
                                    idx === i
                                      ? { ...t, rate: Number(e.target.value) }
                                      : t,
                                  ),
                                )
                              }
                              className="w-20 h-8 text-sm"
                              data-ocid={`commission_tiers.input.${i + 1}`}
                            />
                            <span className="text-sm text-muted-foreground">
                              %
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setEditableTiers((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            data-ocid={`commission_tiers.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditableTiers((prev) => [
                      ...prev,
                      {
                        minReferrals: 0,
                        maxReferrals: null,
                        rate: 5,
                        _key: String(Date.now()),
                      },
                    ])
                  }
                  data-ocid="commission_tiers.secondary_button"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Tier
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    updateGlobalCommissionTiers(
                      editableTiers.map(({ _key: _k, ...t }) => t),
                    );
                    toast.success("Commission tiers saved successfully");
                  }}
                  data-ocid="commission_tiers.save_button"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Tiers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Total Referrals", value: allReferrals.length },
              {
                label: "Total Commission",
                value: `₹${allReferrals.reduce((a, r) => a + r.commission, 0)}`,
              },
              {
                label: "Pending",
                value: `₹${allReferrals.filter((r) => r.status === "pending").reduce((a, r) => a + r.commission, 0)}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
              >
                <div>
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                All Referral Records
              </h2>
            </div>
            {allReferrals.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <GitMerge className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No referrals yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referee</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReferrals.map((r, i) => {
                      const referrer = allUsers.find(
                        (u) => u.id === r.referrerId,
                      );
                      const referee = allUsers.find(
                        (u) => u.id === r.refereeId,
                      );
                      const course = getCourse(r.courseId);
                      return (
                        <TableRow key={r.id} data-ocid={`admin.row.${i + 1}`}>
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">
                              {referrer?.name ?? r.referrerId}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground">
                              {referee?.name ?? r.refereeId}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground truncate max-w-[160px]">
                              {course?.title ?? r.courseId}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-green-600">
                              +₹{r.commission}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                r.status === "paid"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
                              }
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                Withdrawal Requests
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {allWithdrawals.filter((w) => w.status === "pending").length}{" "}
                pending requests
              </p>
            </div>
            {allWithdrawals.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.empty_state"
              >
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No withdrawal requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>UPI ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allWithdrawals.map((w, i) => {
                      const wUser = allUsers.find((u) => u.id === w.userId);
                      return (
                        <TableRow key={w.id} data-ocid={`admin.row.${i + 1}`}>
                          <TableCell>
                            <p className="text-sm font-medium text-foreground">
                              {wUser?.name ?? w.userId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {wUser?.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-foreground">
                              {w.upiId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-foreground">
                              ₹{w.amount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                w.status === "paid"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs"
                              }
                            >
                              {w.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {new Date(w.requestedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {w.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
                                onClick={() => handleMarkWithdrawalPaid(w.id)}
                                data-ocid={`admin.confirm_button.${i + 1}`}
                              >
                                Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
