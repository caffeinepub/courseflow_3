import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/contexts/CourseContext";
import { Link } from "@tanstack/react-router";
import { Clock, Lock, Star, Users } from "lucide-react";

interface CourseCardProps {
  course: Course;
  isPurchased?: boolean;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatPrice(price: number) {
  if (price === 0) return "Free";
  return `₹${price.toLocaleString("en-IN")}`;
}

export function CourseCard({ course, isPurchased }: CourseCardProps) {
  const firstFreeLesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isFree);

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5">
          <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs font-medium px-2 py-0.5">
            {course.category}
          </Badge>
        </div>
        {course.price > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <Badge
              variant="secondary"
              className="text-xs font-medium px-2 py-0.5"
            >
              {course.level}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          By {course.instructor}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{course.rating}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.totalDuration)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.reviewCount.toLocaleString()}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer: price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            {course.price === 0 ? (
              <span className="text-base font-bold text-primary">Free</span>
            ) : (
              <span className="text-base font-bold text-foreground">
                {formatPrice(course.price)}
              </span>
            )}
          </div>

          {isPurchased ? (
            <Link
              to="/learn/$courseId/$lessonId"
              params={{
                courseId: course.id,
                lessonId:
                  firstFreeLesson?.id ??
                  course.modules[0]?.lessons[0]?.id ??
                  "",
              }}
            >
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium"
              >
                Continue
              </Button>
            </Link>
          ) : (
            <Link to="/courses/$id" params={{ id: course.id }}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-medium border-primary/40 text-primary hover:bg-primary/5"
                data-ocid="courses.button"
              >
                View Details
              </Button>
            </Link>
          )}
        </div>

        {!isPurchased && course.price > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>1 free preview lesson</span>
          </div>
        )}
      </div>
    </div>
  );
}
