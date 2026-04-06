import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/contexts/CourseContext";
import { Check, Copy, ExternalLink, Share2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReferralCardProps {
  userId: string;
}

export function ReferralCard({ userId }: ReferralCardProps) {
  const { getUserReferralCode, getUserReferrals, getUserEarnings } =
    useCourses();
  const [copied, setCopied] = useState(false);

  const code = getUserReferralCode(userId);
  const referrals = getUserReferrals(userId);
  const earnings = getUserEarnings(userId);
  const shareUrl = `${window.location.origin}/?ref=${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Referral Program
            </h3>
            <p className="text-xs text-muted-foreground">
              Earn up to 7% commission
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {referrals.length} referrals
        </Badge>
      </div>

      {/* Code */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center justify-between bg-muted rounded-lg px-4 py-2.5">
          <span className="text-sm font-mono font-bold tracking-widest text-foreground">
            {code}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleCopy}
            data-ocid="referral.primary_button"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Earnings quick stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-base font-bold text-foreground">
            ₹{earnings.total}
          </p>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-base font-bold text-amber-600">
            ₹{earnings.pending}
          </p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Share link */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={handleCopyLink}
          data-ocid="referral.secondary_button"
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" /> Copy Share Link
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs"
          data-ocid="referral.link"
        >
          <a href="/referral">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}
