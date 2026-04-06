import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  type Course,
  type Lesson,
  type Module,
  type ReferralSettings,
  useCourses,
} from "@/contexts/CourseContext";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  GitMerge,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type LessonDraft = Omit<Lesson, "id"> & { id: string };
type ModuleDraft = Omit<Module, "id" | "lessons"> & {
  id: string;
  lessons: LessonDraft[];
};

type SlabDraft = {
  minReferrals: number;
  maxReferrals: number | null;
  rate: number;
  _key: string;
};

const emptyLesson = (moduleId: string, order: number): LessonDraft => ({
  id: `new-lesson-${Date.now()}-${order}`,
  moduleId,
  title: "",
  type: "video",
  contentUrl: "",
  pdfUrl: "",
  duration: 600,
  isFree: order === 1,
  order,
  description: "",
});

const emptyModule = (order: number): ModuleDraft => ({
  id: `new-module-${Date.now()}-${order}`,
  courseId: "",
  title: "",
  description: "",
  order,
  lessons: [emptyLesson(`new-module-${Date.now()}-${order}`, 1)],
});

export function AdminCourseEditorPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const isEditing = !!params.id && params.id !== "new";
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    getCourse,
    createCourse,
    updateCourse,
    getReferralSettings,
    updateReferralSettings,
  } = useCourses();

  const existing = isEditing ? getCourse(params.id!) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    existing?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(existing?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existing?.thumbnailUrl ?? "",
  );
  const [price, setPrice] = useState(existing?.price.toString() ?? "0");
  const [instructor, setInstructor] = useState(existing?.instructor ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [level, setLevel] = useState<Course["level"]>(
    existing?.level ?? "Beginner",
  );
  const [tagsInput, setTagsInput] = useState(existing?.tags.join(", ") ?? "");
  const [isPublished, setIsPublished] = useState(
    existing?.isPublished ?? false,
  );
  const [modules, setModules] = useState<ModuleDraft[]>(
    existing?.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => ({ ...l })),
    })) ?? [emptyModule(1)],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set([modules[0]?.id]),
  );

  // Referral settings state
  const existingReferralSettings =
    isEditing && params.id
      ? getReferralSettings(params.id)
      : {
          courseId: "",
          enabled: true,
          slabs: [
            { minReferrals: 1, maxReferrals: 9, rate: 5 },
            { minReferrals: 10, maxReferrals: null, rate: 7 },
          ],
        };
  const [referralEnabled, setReferralEnabled] = useState(
    existingReferralSettings.enabled,
  );
  const [editableSlabs, setEditableSlabs] = useState<SlabDraft[]>(() =>
    existingReferralSettings.slabs.map((s, idx) => ({
      ...s,
      _key: String(idx),
    })),
  );
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, user, navigate]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addModule = () => {
    const m = emptyModule(modules.length + 1);
    setModules((prev) => [...prev, m]);
    setExpandedModules((prev) => new Set([...prev, m.id]));
  };

  const removeModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const updateModule = (
    id: string,
    field: keyof ModuleDraft,
    value: string,
  ) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const addLesson = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const lesson = emptyLesson(moduleId, m.lessons.length + 1);
        return { ...m, lessons: [...m.lessons, lesson] };
      }),
    );
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
      }),
    );
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    field: keyof LessonDraft,
    value: unknown,
  ) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, [field]: value } : l,
          ),
        };
      }),
    );
  };

  const updateSlab = (key: string, field: keyof SlabDraft, value: unknown) => {
    setEditableSlabs((prev) =>
      prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)),
    );
  };

  const removeSlab = (key: string) => {
    setEditableSlabs((prev) => prev.filter((s) => s._key !== key));
  };

  const addSlab = () => {
    setEditableSlabs((prev) => [
      ...prev,
      {
        minReferrals: 0,
        maxReferrals: null,
        rate: 5,
        _key: String(Date.now()),
      },
    ]);
  };

  const handleSaveReferral = async () => {
    if (!isEditing || !params.id) {
      toast.error("Save the course first before configuring referrals.");
      return;
    }
    setIsSavingReferral(true);
    await new Promise((r) => setTimeout(r, 400));
    const settings: ReferralSettings = {
      courseId: params.id,
      enabled: referralEnabled,
      slabs: editableSlabs.map(({ _key: _k, ...s }) => s),
    };
    updateReferralSettings(settings);
    setIsSavingReferral(false);
    toast.success("Referral settings saved!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      const courseData = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        price: Number.parseFloat(price) || 0,
        instructor: instructor.trim(),
        category: category.trim(),
        level,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublished,
        rating: existing?.rating ?? 4.5,
        reviewCount: existing?.reviewCount ?? 0,
        totalDuration: modules
          .flatMap((m) => m.lessons)
          .reduce((acc, l) => acc + l.duration, 0),
        modules: modules.map((m) => ({
          id: m.id,
          courseId: existing?.id ?? "",
          title: m.title,
          description: m.description,
          order: m.order,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            moduleId: m.id,
            title: l.title,
            type: l.type,
            contentUrl: l.contentUrl,
            duration: l.duration,
            isFree: l.isFree,
            order: l.order,
            description: l.description,
          })),
        })),
      };

      if (isEditing && params.id) {
        await updateCourse(params.id, courseData);
        toast.success("Course updated!");
      } else {
        await createCourse(courseData);
        toast.success("Course created!");
      }
      navigate({ to: "/admin" });
    } catch {
      toast.error("Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admin" })}
          className="-ml-2"
          data-ocid="admin_editor.link"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Admin
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Edit Course" : "Create Course"}
          </h1>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6" data-ocid="admin_editor.tab">
          <TabsTrigger
            value="details"
            className="text-sm"
            data-ocid="admin_editor.tab"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Course Details
          </TabsTrigger>
          {isEditing && (
            <TabsTrigger
              value="referral"
              className="text-sm"
              data-ocid="admin_editor.tab"
            >
              <GitMerge className="h-3.5 w-3.5 mr-1.5" /> Referral Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Course Details Tab */}
        <TabsContent value="details">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Course Details */}
            <section className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">
                Course Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete React Developer Course"
                    required
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="short-desc">Short Description</Label>
                  <Input
                    id="short-desc"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="One-line summary shown on course cards"
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed course description..."
                    className="min-h-[100px] resize-y"
                    data-ocid="admin_editor.textarea"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="instructor">Instructor Name</Label>
                  <Input
                    id="instructor"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0 for free"
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Web Development"
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Level</Label>
                  <Select
                    value={level}
                    onValueChange={(v) => setLevel(v as Course["level"])}
                  >
                    <SelectTrigger data-ocid="admin_editor.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="React, TypeScript, Node.js"
                    data-ocid="admin_editor.input"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    data-ocid="admin_editor.switch"
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    Published
                    <span className="ml-2">
                      <Badge
                        variant={isPublished ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isPublished ? "Live" : "Draft"}
                      </Badge>
                    </span>
                  </Label>
                </div>
              </div>
            </section>

            {/* Modules & Lessons */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">
                  Modules & Lessons
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addModule}
                  className="text-primary border-primary/30 hover:bg-primary/5"
                  data-ocid="admin_editor.secondary_button"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Module
                </Button>
              </div>

              <div className="space-y-3">
                {modules.map((module, mi) => (
                  <div
                    key={module.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary shrink-0">
                        {mi + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {module.title || "Untitled Module"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {module.lessons.length} lessons
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModule(module.id);
                          }}
                          data-ocid={`admin_editor.delete_button.${mi + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        {expandedModules.has(module.id) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expandedModules.has(module.id) && (
                      <div className="border-t border-border p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Module Title</Label>
                            <Input
                              value={module.title}
                              onChange={(e) =>
                                updateModule(module.id, "title", e.target.value)
                              }
                              placeholder="Module title"
                              className="h-8 text-sm"
                              data-ocid="admin_editor.input"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Module Description
                            </Label>
                            <Input
                              value={module.description}
                              onChange={(e) =>
                                updateModule(
                                  module.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Brief description"
                              className="h-8 text-sm"
                              data-ocid="admin_editor.input"
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Lessons
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary hover:text-primary/80"
                              onClick={() => addLesson(module.id)}
                              data-ocid="admin_editor.secondary_button"
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add Lesson
                            </Button>
                          </div>

                          {module.lessons.map((lesson, li) => (
                            <div
                              key={lesson.id}
                              className="p-3 bg-muted/40 rounded-lg border border-border space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Lesson {li + 1}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    removeLesson(module.id, lesson.id)
                                  }
                                  disabled={module.lessons.length === 1}
                                  data-ocid={`admin_editor.delete_button.${li + 1}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[11px] text-muted-foreground">
                                    Title
                                  </Label>
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) =>
                                      updateLesson(
                                        module.id,
                                        lesson.id,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Lesson title"
                                    className="h-7 text-xs"
                                    data-ocid="admin_editor.input"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[11px] text-muted-foreground">
                                    Type
                                  </Label>
                                  <Select
                                    value={lesson.type}
                                    onValueChange={(v) =>
                                      updateLesson(
                                        module.id,
                                        lesson.id,
                                        "type",
                                        v,
                                      )
                                    }
                                  >
                                    <SelectTrigger
                                      className="h-7 text-xs"
                                      data-ocid="admin_editor.select"
                                    >
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">
                                        Video
                                      </SelectItem>
                                      <SelectItem value="pdf">PDF</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                  <Label className="text-[11px] text-muted-foreground">
                                    Content URL
                                  </Label>
                                  <Input
                                    value={lesson.contentUrl}
                                    onChange={(e) =>
                                      updateLesson(
                                        module.id,
                                        lesson.id,
                                        "contentUrl",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={
                                      lesson.type === "video"
                                        ? "https://youtube.com/embed/..."
                                        : "https://..."
                                    }
                                    className="h-7 text-xs"
                                    data-ocid="admin_editor.input"
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                  <Label className="text-[11px] text-muted-foreground">
                                    PDF URL (optional)
                                  </Label>
                                  <Input
                                    value={lesson.pdfUrl ?? ""}
                                    onChange={(e) =>
                                      updateLesson(
                                        module.id,
                                        lesson.id,
                                        "pdfUrl",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="https://drive.google.com/... or any PDF link"
                                    className="h-7 text-xs"
                                    data-ocid="admin_editor.input"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[11px] text-muted-foreground">
                                    Duration (seconds)
                                  </Label>
                                  <Input
                                    type="number"
                                    value={lesson.duration}
                                    onChange={(e) =>
                                      updateLesson(
                                        module.id,
                                        lesson.id,
                                        "duration",
                                        Number.parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="h-7 text-xs"
                                    data-ocid="admin_editor.input"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                  <Switch
                                    checked={lesson.isFree}
                                    onCheckedChange={(v) =>
                                      updateLesson(
                                        module.id,
                                        lesson.id,
                                        "isFree",
                                        v,
                                      )
                                    }
                                    data-ocid="admin_editor.switch"
                                  />
                                  <Label className="text-xs cursor-pointer">
                                    Free preview
                                  </Label>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-[11px] text-muted-foreground">
                                  Lesson Description
                                </Label>
                                <Textarea
                                  value={lesson.description}
                                  onChange={(e) =>
                                    updateLesson(
                                      module.id,
                                      lesson.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="What students will learn..."
                                  className="min-h-[60px] text-xs resize-none"
                                  data-ocid="admin_editor.textarea"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Save */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/admin" })}
                data-ocid="admin_editor.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                disabled={isSaving}
                data-ocid="admin_editor.save_button"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? "Update Course" : "Create Course"}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Referral Settings Tab */}
        {isEditing && (
          <TabsContent value="referral">
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  Referral Program Settings
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure referral commissions for this course.
                </p>
              </div>

              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Enable Referrals
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Allow users to earn commission by referring others
                  </p>
                </div>
                <Switch
                  checked={referralEnabled}
                  onCheckedChange={setReferralEnabled}
                  data-ocid="admin_editor.switch"
                />
              </div>

              <Separator />

              {/* Commission slabs */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Commission Slabs
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Higher commission rate for more referrals
                  </p>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs font-medium w-32">
                          Min Referrals
                        </TableHead>
                        <TableHead className="text-xs font-medium w-44">
                          Max Referrals
                        </TableHead>
                        <TableHead className="text-xs font-medium w-36">
                          Rate (%)
                        </TableHead>
                        <TableHead className="text-xs font-medium w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableSlabs.map((slab, si) => (
                        <TableRow
                          key={slab._key}
                          data-ocid={`admin_editor.row.${si + 1}`}
                        >
                          <TableCell className="py-2">
                            <Input
                              type="number"
                              min="0"
                              value={slab.minReferrals}
                              onChange={(e) =>
                                updateSlab(
                                  slab._key,
                                  "minReferrals",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 w-20 text-sm"
                              disabled={!referralEnabled}
                              data-ocid="admin_editor.input"
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={slab.maxReferrals ?? ""}
                                placeholder={
                                  slab.maxReferrals === null ? "∞" : ""
                                }
                                onChange={(e) =>
                                  updateSlab(
                                    slab._key,
                                    "maxReferrals",
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                  )
                                }
                                className="h-8 w-20 text-sm"
                                disabled={
                                  !referralEnabled || slab.maxReferrals === null
                                }
                                data-ocid="admin_editor.input"
                              />
                              <div className="flex items-center gap-1.5">
                                <Checkbox
                                  id={`unlimited-${slab._key}`}
                                  checked={slab.maxReferrals === null}
                                  onCheckedChange={(checked) =>
                                    updateSlab(
                                      slab._key,
                                      "maxReferrals",
                                      checked ? null : 0,
                                    )
                                  }
                                  disabled={!referralEnabled}
                                  data-ocid="admin_editor.checkbox"
                                />
                                <label
                                  htmlFor={`unlimited-${slab._key}`}
                                  className="text-xs text-muted-foreground cursor-pointer select-none"
                                >
                                  Unlimited
                                </label>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={slab.rate}
                                onChange={(e) =>
                                  updateSlab(
                                    slab._key,
                                    "rate",
                                    Number(e.target.value),
                                  )
                                }
                                className="h-8 w-16 text-sm"
                                disabled={!referralEnabled}
                                data-ocid="admin_editor.input"
                              />
                              <span className="text-sm text-muted-foreground">
                                %
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeSlab(slab._key)}
                              disabled={!referralEnabled}
                              data-ocid={`admin_editor.delete_button.${si + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {editableSlabs.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-6 text-center text-sm text-muted-foreground"
                            data-ocid="admin_editor.empty_state"
                          >
                            No commission tiers yet. Add one below.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSlab}
                  disabled={!referralEnabled}
                  className="text-primary border-primary/30 hover:bg-primary/5"
                  data-ocid="admin_editor.secondary_button"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Tier
                </Button>
              </div>

              <Button
                onClick={handleSaveReferral}
                disabled={isSavingReferral}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="admin_editor.save_button"
              >
                {isSavingReferral ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Referral Settings
                  </span>
                )}
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}
