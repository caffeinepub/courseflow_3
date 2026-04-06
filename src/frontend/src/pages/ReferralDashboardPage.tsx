import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  DollarSign,
  Share2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReferralDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const {
    getUserReferralCode,
    getUserReferrals,
    getUserEarnings,
    getUserWithdrawals,
    requestWithdrawal,
    getCourse,
  } = useCourses();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!isAuthenticated || !user) {
    navigate({ to: "/login" });
    return null;
  }

  const code = getUserReferralCode(user.id);
  const referrals = getUserReferrals(user.id);
  const earnings = getUserEarnings(user.id);
  const withdrawals = getUserWithdrawals(user.id);
  const shareUrl = `${window.location.origin}/?ref=${code}`;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (amount < 50) {
      toast.error("Minimum withdrawal amount is ₹50");
      return;
    }
    if (amount > earnings.pending) {
      toast.error("Insufficient pending balance");
      return;
    }
    setIsWithdrawing(true);
    await requestWithdrawal(user.id, upiId.trim(), amount);
    setIsWithdrawing(false);
    setWithdrawAmount("");
    setUpiId("");
    toast.success(
      "Withdrawal request submitted. Payouts processed within 7 days.",
    );
  };

  const stats = [
    {
      label: "Total Referrals",
      value: referrals.length,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Earnings",
      value: `₹${earnings.total}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Pending Earnings",
      value: `₹${earnings.pending}`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Paid Earnings",
      value: `₹${earnings.paid}`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Referral Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn commissions by referring friends to courses.
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-between bg-muted rounded-xl px-5 py-3.5">
              <span className="text-2xl font-mono font-bold tracking-widest text-foreground">
                {code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleCopyCode}
                data-ocid="referral.primary_button"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Share Link</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                readOnly
                value={shareUrl}
                className="text-xs font-mono bg-muted"
                data-ocid="referral.input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                data-ocid="referral.secondary_button"
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>
          </div>

          {/* Commission info */}
          <div className="flex items-center gap-4 pt-1">
            <Badge variant="secondary" className="text-xs">
              1–9 referrals: 5% commission
            </Badge>
            <Badge variant="secondary" className="text-xs">
              10+ referrals: 7% commission
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg} shrink-0`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Referral Records */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Referral History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="referral.empty_state"
                >
                  <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No referrals yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share your code to start earning!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto" data-ocid="referral.table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((r, i) => {
                        const course = getCourse(r.courseId);
                        return (
                          <TableRow
                            key={r.id}
                            data-ocid={`referral.row.${i + 1}`}
                          >
                            <TableCell>
                              <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
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
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                }
                              >
                                {r.status === "paid" ? "Paid" : "Pending"}
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
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Request withdrawal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Request Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (min ₹50)</Label>
                  <Input
                    type="number"
                    min="50"
                    max={earnings.pending}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                    data-ocid="referral.input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: ₹{earnings.pending}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    required
                    data-ocid="referral.input"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isWithdrawing || !withdrawAmount || !upiId}
                  data-ocid="referral.submit_button"
                >
                  {isWithdrawing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5" /> Request Payout
                    </span>
                  )}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">
                  Payouts processed within 7 days
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Withdrawal history */}
          {withdrawals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2" data-ocid="referral.list">
                  {withdrawals.map((w, i) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                      data-ocid={`referral.item.${i + 1}`}
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          ₹{w.amount}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {w.upiId}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(w.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
