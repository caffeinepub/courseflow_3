import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Certificate } from "@/contexts/CourseContext";
import { Award, BookOpen, Calendar, Shield } from "lucide-react";

interface CertificateCardProps {
  certificate: Certificate;
  editable?: boolean;
  onNameChange?: (name: string) => void;
}

export function CertificateCard({
  certificate,
  editable = false,
  onNameChange,
}: CertificateCardProps) {
  const date = new Date(certificate.completionDate).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div
      id="certificate-print-area"
      data-certificate
      className="relative bg-white rounded-2xl overflow-hidden w-full max-w-2xl mx-auto"
      style={{
        boxShadow: "0 0 0 1px #e5e7eb, 0 8px 40px rgba(0,0,0,0.12)",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Decorative top border */}
      <div
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(90deg, #1e40af, #3b82f6, #6366f1, #8b5cf6)",
        }}
      />

      {/* Corner decorations */}
      <div
        className="absolute top-4 left-4 w-16 h-16 opacity-10"
        style={{ border: "3px solid #1e40af", borderRadius: "50% 50% 0 50%" }}
      />
      <div
        className="absolute top-4 right-4 w-16 h-16 opacity-10"
        style={{ border: "3px solid #6366f1", borderRadius: "50% 50% 50% 0" }}
      />
      <div
        className="absolute bottom-4 left-4 w-16 h-16 opacity-10"
        style={{ border: "3px solid #6366f1", borderRadius: "0 50% 50% 50%" }}
      />
      <div
        className="absolute bottom-4 right-4 w-16 h-16 opacity-10"
        style={{ border: "3px solid #1e40af", borderRadius: "50% 0 50% 50%" }}
      />

      <div className="px-10 py-8 text-center relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #1e40af, #6366f1)" }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "#1e40af", fontFamily: "sans-serif" }}
          >
            CourseFlow
          </span>
        </div>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award className="h-5 w-5" style={{ color: "#f59e0b" }} />
            <p
              className="text-xs tracking-[0.25em] uppercase"
              style={{ color: "#6b7280", fontFamily: "sans-serif" }}
            >
              Certificate of Completion
            </p>
            <Award className="h-5 w-5" style={{ color: "#f59e0b" }} />
          </div>
          <div
            className="h-px w-24 mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, #d1d5db, transparent)",
            }}
          />
        </div>

        {/* Presented to */}
        <p
          className="text-sm mb-2"
          style={{ color: "#6b7280", fontFamily: "sans-serif" }}
        >
          This certificate is proudly presented to
        </p>

        {/* Student name */}
        {editable ? (
          <div className="my-4">
            <Input
              value={certificate.userName}
              onChange={(e) => onNameChange?.(e.target.value)}
              className="text-center text-2xl font-bold border-b-2 border-t-0 border-x-0 rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-blue-500"
              style={{ color: "#111827", fontFamily: "Georgia, serif" }}
              data-ocid="certificate.input"
            />
          </div>
        ) : (
          <h2 className="text-3xl font-bold my-4" style={{ color: "#111827" }}>
            {certificate.userName}
          </h2>
        )}

        {/* Has completed */}
        <p
          className="text-sm mb-2"
          style={{ color: "#6b7280", fontFamily: "sans-serif" }}
        >
          has successfully completed the course
        </p>

        {/* Course name */}
        <h3
          className="text-xl font-semibold my-3 px-4"
          style={{ color: "#1e40af", fontFamily: "sans-serif" }}
        >
          {certificate.courseName}
        </h3>

        {/* Date */}
        <div
          className="flex items-center justify-center gap-1.5 mb-6"
          style={{ color: "#6b7280" }}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-sm" style={{ fontFamily: "sans-serif" }}>
            Completed on {date}
          </span>
        </div>

        {/* Instructor signature */}
        <div
          className="flex items-end justify-between mt-6 pt-6"
          style={{ borderTop: "1px solid #e5e7eb" }}
        >
          <div className="text-left">
            <div
              className="h-8 mb-1"
              style={{ borderBottom: "2px solid #374151", width: "120px" }}
            />
            <p
              className="text-xs"
              style={{ color: "#374151", fontFamily: "sans-serif" }}
            >
              {certificate.instructor}
            </p>
            <p
              className="text-xs"
              style={{ color: "#9ca3af", fontFamily: "sans-serif" }}
            >
              Instructor
            </p>
          </div>

          <div className="text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-1"
              style={{
                background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
                border: "2px solid #93c5fd",
              }}
            >
              <Shield className="h-6 w-6" style={{ color: "#1e40af" }} />
            </div>
            <p
              className="text-xs"
              style={{ color: "#6b7280", fontFamily: "sans-serif" }}
            >
              Verified
            </p>
          </div>

          <div className="text-right">
            <div
              className="h-8 mb-1"
              style={{ borderBottom: "2px solid #374151", width: "120px" }}
            />
            <p
              className="text-xs"
              style={{ color: "#374151", fontFamily: "sans-serif" }}
            >
              CourseFlow Team
            </p>
            <p
              className="text-xs"
              style={{ color: "#9ca3af", fontFamily: "sans-serif" }}
            >
              Platform
            </p>
          </div>
        </div>

        {/* Certificate ID */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px dashed #e5e7eb" }}>
          <Badge
            variant="outline"
            className="text-[10px] tracking-wider font-mono"
            style={{ color: "#9ca3af", borderColor: "#e5e7eb" }}
          >
            <Shield className="h-2.5 w-2.5 mr-1" />
            ID: {certificate.id}
          </Badge>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6, #1e40af)",
        }}
      />
    </div>
  );
}

// Print button helper
export function CertificatePrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
      data-ocid="certificate.primary_button"
    >
      <Award className="h-4 w-4 mr-2" />
      Download as PDF
    </Button>
  );
}
