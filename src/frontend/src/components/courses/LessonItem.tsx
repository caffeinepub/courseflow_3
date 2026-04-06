import type { Lesson } from "@/contexts/CourseContext";
import { CheckCircle2, FileText, Lock, PlayCircle } from "lucide-react";

interface LessonItemProps {
  lesson: Lesson;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onClick: () => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h ${rem}m`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LessonItem({
  lesson,
  isActive,
  isCompleted,
  isLocked,
  onClick,
}: LessonItemProps) {
  return (
    <button
      type="button"
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : isLocked
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-muted cursor-pointer"
      }`}
    >
      {/* Icon */}
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : isLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : lesson.type === "video" ? (
          <PlayCircle
            className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
          />
        ) : (
          <FileText
            className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
          />
        )}
      </div>

      {/* Title & duration */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-medium truncate ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
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
    </button>
  );
}
