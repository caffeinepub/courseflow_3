import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { type Course, useCourses } from "@/contexts/CourseContext";
import { CreditCard, Lock, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type PaymentMethod = "upi" | "card";

export function PaymentDialog({
  course,
  open,
  onOpenChange,
  onSuccess,
}: PaymentDialogProps) {
  const { user } = useAuth();
  const { purchaseCourse } = useCourses();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("success@upi");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/27");
  const [cvv, setCvv] = useState("123");
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async () => {
    if (!user) {
      toast.error("Please login to purchase this course");
      return;
    }
    setIsPaying(true);
    try {
      await purchaseCourse(user.id, course.id);
      toast.success("Course unlocked! Happy learning 🎉");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="payment.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentMethod === "upi" ? (
              <Smartphone className="h-5 w-5 text-primary" />
            ) : (
              <CreditCard className="h-5 w-5 text-primary" />
            )}
            Complete Purchase
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Course summary */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-14 w-20 object-cover rounded-md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-2">
                {course.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                By {course.instructor}
              </p>
              <p className="text-base font-bold text-primary mt-1">
                ₹{course.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Payment method selector */}
          <div className="grid grid-cols-2 gap-2" data-ocid="payment.select">
            <Button
              type="button"
              variant={paymentMethod === "upi" ? "default" : "outline"}
              className="flex items-center gap-2 w-full"
              onClick={() => setPaymentMethod("upi")}
              data-ocid="payment.upi.toggle"
            >
              <Smartphone className="h-4 w-4" />
              UPI
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "card" ? "default" : "outline"}
              className="flex items-center gap-2 w-full"
              onClick={() => setPaymentMethod("card")}
              data-ocid="payment.card.toggle"
            >
              <CreditCard className="h-4 w-4" />
              Debit / Credit Card
            </Button>
          </div>

          {/* UPI form */}
          {paymentMethod === "upi" && (
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="upi-id"
                  className="text-xs text-muted-foreground"
                >
                  UPI ID
                </Label>
                <Input
                  id="upi-id"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="text-sm mt-1"
                  data-ocid="payment.input"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Enter your UPI ID (e.g. name@upi, 9876543210@paytm)
                </p>
              </div>
            </div>
          )}

          {/* Card form */}
          {paymentMethod === "card" && (
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="card-number"
                  className="text-xs text-muted-foreground"
                >
                  Card Number
                </Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="font-mono text-sm mt-1"
                  data-ocid="payment.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="expiry"
                    className="text-xs text-muted-foreground"
                  >
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="font-mono text-sm mt-1"
                    data-ocid="payment.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="cvv"
                    className="text-xs text-muted-foreground"
                  >
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={3}
                    type="password"
                    className="font-mono text-sm mt-1"
                    data-ocid="payment.input"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>
              {paymentMethod === "upi"
                ? "Simulated UPI payment — use any UPI ID"
                : "Simulated payment — use any card details"}
            </span>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={handlePay}
            disabled={isPaying}
            data-ocid="payment.submit_button"
          >
            {isPaying ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ₹${course.price.toLocaleString("en-IN")}`
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
            disabled={isPaying}
            data-ocid="payment.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
