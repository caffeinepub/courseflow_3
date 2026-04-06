import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { QuizQuestion } from "@/contexts/CourseContext";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuizBuilderProps {
  lessonId: string;
  lessonTitle?: string;
  initialQuestions: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onClose: () => void;
}

type QuestionDraft = Omit<QuizQuestion, "id"> & { id: string; tempId?: string };

const emptyQuestion = (lessonId: string): QuestionDraft => ({
  id: `new-q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  lessonId,
  question: "",
  type: "mcq",
  options: ["", "", "", ""],
  correctIndex: 0,
  correctAnswer: "",
});

export function QuizBuilder({
  lessonId,
  lessonTitle,
  initialQuestions,
  onSave,
  onClose,
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initialQuestions.length > 0
      ? initialQuestions.map((q) => ({
          ...q,
          options: q.options.length > 0 ? q.options : ["", "", "", ""],
        }))
      : [],
  );
  const [editingId, setEditingId] = useState<string | null>(
    questions.length === 0 ? null : null,
  );
  const [isSaving, setIsSaving] = useState(false);

  // editingQuestion unused - editing state tracked by editingId

  const handleAddQuestion = () => {
    const q = emptyQuestion(lessonId);
    setQuestions((prev) => [...prev, q]);
    setEditingId(q.id);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleUpdateField = (
    id: string,
    field: keyof QuestionDraft,
    value: unknown,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const handleUpdateOption = (id: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const opts = [...q.options];
        opts[index] = value;
        return { ...q, options: opts };
      }),
    );
  };

  const handleTypeChange = (id: string, type: QuizQuestion["type"]) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        return {
          ...q,
          type,
          options:
            type === "mcq"
              ? q.options.length >= 4
                ? q.options
                : ["", "", "", ""]
              : [],
          correctIndex: type === "mcq" ? (q.correctIndex ?? 0) : undefined,
          correctAnswer:
            type === "fill-blank" ? (q.correctAnswer ?? "") : undefined,
        };
      }),
    );
  };

  const handleSave = async () => {
    // Validate
    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error("All questions must have a question text");
        return;
      }
      if (q.type === "mcq" && q.options.some((o) => !o.trim())) {
        toast.error("All MCQ options must be filled");
        return;
      }
      if (q.type === "fill-blank" && !q.correctAnswer?.trim()) {
        toast.error("Fill-in-blank questions must have a correct answer");
        return;
      }
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave(questions as QuizQuestion[]);
    setIsSaving(false);
    toast.success(`Quiz saved with ${questions.length} questions`);
    onClose();
  };

  const typeLabel = (type: QuizQuestion["type"]) => {
    if (type === "mcq") return "MCQ";
    if (type === "fill-blank") return "Fill in Blank";
    return "Short Answer";
  };

  const typeColor = (type: QuizQuestion["type"]) => {
    if (type === "mcq")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (type === "fill-blank")
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Quiz Builder
          </h2>
          {lessonTitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {lessonTitle}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {questions.length === 0 && (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="quiz_builder.empty_state"
          >
            No questions yet. Add your first question below.
          </div>
        )}

        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`rounded-lg border p-3 transition-colors ${
              editingId === q.id
                ? "border-primary/50 bg-primary/5"
                : "border-border bg-card"
            }`}
            data-ocid={`quiz_builder.item.${i + 1}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Q{i + 1}
                  </span>
                  <Badge
                    className={`text-[10px] px-1.5 py-0 border-0 ${typeColor(q.type)}`}
                  >
                    {typeLabel(q.type)}
                  </Badge>
                </div>
                {editingId === q.id ? (
                  <p className="text-xs text-muted-foreground italic truncate">
                    {q.question || "Enter question text..."}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {q.question || (
                      <span className="text-muted-foreground italic">
                        Untitled question
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditingId(editingId === q.id ? null : q.id)}
                  data-ocid={`quiz_builder.edit_button.${i + 1}`}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteQuestion(q.id)}
                  data-ocid={`quiz_builder.delete_button.${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Edit form */}
            {editingId === q.id && (
              <div className="mt-3 space-y-3 pt-3 border-t border-border">
                {/* Type */}
                <div className="space-y-1">
                  <Label className="text-xs">Question Type</Label>
                  <Select
                    value={q.type}
                    onValueChange={(v) =>
                      handleTypeChange(q.id, v as QuizQuestion["type"])
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-xs"
                      data-ocid="quiz_builder.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="fill-blank">
                        Fill in the Blank
                      </SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question text */}
                <div className="space-y-1">
                  <Label className="text-xs">Question Text</Label>
                  <Input
                    value={q.question}
                    onChange={(e) =>
                      handleUpdateField(q.id, "question", e.target.value)
                    }
                    placeholder="Enter question text..."
                    className="h-8 text-sm"
                    data-ocid="quiz_builder.input"
                  />
                </div>

                {/* MCQ options */}
                {q.type === "mcq" && (
                  <div className="space-y-2">
                    <Label className="text-xs">
                      Options (select correct answer)
                    </Label>
                    {q.options.map((opt, oi) => (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: options are static
                        key={`opt-${oi}`}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateField(q.id, "correctIndex", oi)
                          }
                          className={`h-5 w-5 rounded-full border-2 shrink-0 transition-colors ${
                            q.correctIndex === oi
                              ? "border-green-500 bg-green-500"
                              : "border-muted-foreground hover:border-primary"
                          }`}
                          title="Mark as correct"
                        />
                        <Input
                          value={opt}
                          onChange={(e) =>
                            handleUpdateOption(q.id, oi, e.target.value)
                          }
                          placeholder={`Option ${oi + 1}`}
                          className="h-7 text-xs flex-1"
                          data-ocid="quiz_builder.input"
                        />
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground">
                      Click the circle to mark the correct answer
                    </p>
                  </div>
                )}

                {/* Fill-blank correct answer */}
                {q.type === "fill-blank" && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Correct Answer (case-insensitive)
                    </Label>
                    <Input
                      value={q.correctAnswer ?? ""}
                      onChange={(e) =>
                        handleUpdateField(q.id, "correctAnswer", e.target.value)
                      }
                      placeholder="Accepted answer..."
                      className="h-8 text-sm"
                      data-ocid="quiz_builder.input"
                    />
                  </div>
                )}

                {q.type === "short-answer" && (
                  <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-md px-2.5 py-1.5">
                    Short answer questions are manually graded. Students will
                    see their response as submitted.
                  </p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setEditingId(null)}
                >
                  Done editing
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddQuestion}
          className="text-primary border-primary/30 hover:bg-primary/5"
          data-ocid="quiz_builder.secondary_button"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          data-ocid="quiz_builder.save_button"
        >
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save Quiz ({questions.length} questions)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
