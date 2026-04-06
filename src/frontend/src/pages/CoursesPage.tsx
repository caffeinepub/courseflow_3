import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/courses/CourseCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const CATEGORIES = [
  "All Categories",
  "Web Development",
  "Data Science",
  "Design",
  "Cloud & DevOps",
  "Finance",
  "Mobile Development",
];

const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export function CoursesPage() {
  const { courses, isLoading, getPurchases } = useCourses();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [level, setLevel] = useState("All Levels");

  const purchases = user ? getPurchases(user.id) : [];

  const filtered = useMemo(() => {
    return courses
      .filter((c) => c.isPublished)
      .filter((c) => {
        const q = search.toLowerCase();
        return (
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .filter((c) => category === "All Categories" || c.category === category)
      .filter((c) => level === "All Levels" || c.level === level);
  }, [courses, search, category, level]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setLevel("All Levels");
  };

  const hasFilters =
    search || category !== "All Categories" || level !== "All Levels";

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Browse Courses</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {courses.filter((c) => c.isPublished).length} courses available
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 mb-8"
        data-ocid="courses.section"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="courses.search_input"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48" data-ocid="courses.select">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-40" data-ocid="courses.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="shrink-0 text-muted-foreground"
            data-ocid="courses.button"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="courses.empty_state"
        >
          <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            No courses found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button
            onClick={clearFilters}
            variant="outline"
            data-ocid="courses.button"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          data-ocid="courses.list"
        >
          {filtered.map((course, i) => (
            <div key={course.id} data-ocid={`courses.item.${i + 1}`}>
              <CourseCard
                course={course}
                isPurchased={purchases.some((p) => p.courseId === course.id)}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
