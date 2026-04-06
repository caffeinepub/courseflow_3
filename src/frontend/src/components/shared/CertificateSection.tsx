import { CertificateCard } from "@/components/shared/CertificateCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Certificate } from "@/contexts/CourseContext";
import { Award, Download, Printer, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CertificateSectionProps {
  certificate: Certificate;
}

export function CertificateSection({
  certificate: initialCert,
}: CertificateSectionProps) {
  const [cert, setCert] = useState<Certificate>(initialCert);

  const handlePrint = () => {
    toast.info('A print dialog will open. Choose "Save as PDF" to download.');
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 shrink-0">
          <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">
            Congratulations! Course Completed 🎉
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Your certificate is ready. Edit your name below if needed, then
            download.
          </p>
        </div>
      </div>

      {/* Cert preview */}
      <div className="overflow-hidden rounded-xl border border-border">
        <CertificateCard
          certificate={cert}
          editable
          onNameChange={(name) =>
            setCert((prev) => ({ ...prev, userName: name }))
          }
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">
            Certificate ID (for verification)
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-mono text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {cert.id}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary"
              onClick={() => {
                navigator.clipboard.writeText(cert.id);
                toast.success("Certificate ID copied!");
              }}
            >
              Copy
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            data-ocid="certificate.secondary_button"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / Save PDF
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-ocid="certificate.primary_button"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download Certificate
          </Button>
        </div>
      </div>
    </div>
  );
}
