import { CertificateCard } from "@/components/shared/CertificateCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/contexts/CourseContext";
import { useSearch } from "@tanstack/react-router";
import { AlertCircle, Award, CheckCircle2, Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export function CertificateVerifyPage() {
  const { getCertificateById } = useCourses();
  const searchParams = useSearch({ strict: false }) as { certId?: string };

  const [certIdInput, setCertIdInput] = useState(searchParams?.certId ?? "");
  const [searchedId, setSearchedId] = useState(searchParams?.certId ?? "");
  const [hasSearched, setHasSearched] = useState(!!searchParams?.certId);

  const cert = hasSearched ? getCertificateById(searchedId) : undefined;

  // Auto-search if certId in URL
  useEffect(() => {
    if (searchParams?.certId) {
      setSearchedId(searchParams.certId);
      setCertIdInput(searchParams.certId);
      setHasSearched(true);
    }
  }, [searchParams?.certId]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certIdInput.trim()) return;
    setSearchedId(certIdInput.trim().toUpperCase());
    setHasSearched(true);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Certificate Verification
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Enter a certificate ID to verify its authenticity and view the
          certificate details.
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleVerify}
        className="flex gap-3 max-w-xl mx-auto mb-10"
      >
        <Input
          value={certIdInput}
          onChange={(e) => setCertIdInput(e.target.value)}
          placeholder="e.g. CERT-AB12-CD34-XYZ"
          className="font-mono text-sm"
          data-ocid="verify.input"
        />
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          data-ocid="verify.primary_button"
        >
          <Search className="h-4 w-4 mr-1.5" /> Verify
        </Button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {cert ? (
            <>
              {/* Valid banner */}
              <div
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                data-ocid="verify.success_state"
              >
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Certificate Valid ✓
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    This certificate was issued by CourseFlow and is authentic.
                  </p>
                </div>
                <Badge className="ml-auto bg-green-600 text-white text-xs">
                  Verified
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Student Name", value: cert.userName },
                  { label: "Course", value: cert.courseName },
                  { label: "Instructor", value: cert.instructor },
                  {
                    label: "Completion Date",
                    value: new Date(cert.completionDate).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    ),
                  },
                  { label: "Certificate ID", value: cert.id },
                  {
                    label: "Issued At",
                    value: new Date(cert.issuedAt).toLocaleString("en-IN"),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Certificate preview */}
              <div className="overflow-hidden rounded-xl border border-border">
                <CertificateCard certificate={cert} />
              </div>
            </>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border border-destructive/30 bg-destructive/5"
              data-ocid="verify.error_state"
            >
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">
                  Certificate Not Found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  No certificate found with ID:{" "}
                  <span className="font-mono font-medium">{searchedId}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please check the certificate ID and try again.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      {!hasSearched && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground max-w-xl mx-auto">
          <Award className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
          <p>
            CourseFlow certificates have IDs in the format{" "}
            <span className="font-mono font-medium text-foreground">
              CERT-XXXX-XXXX-XXXXX
            </span>
            . You can find the ID at the bottom of any certificate.
          </p>
        </div>
      )}
    </main>
  );
}
