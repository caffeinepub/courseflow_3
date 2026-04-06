import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Mail, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  if (!isAuthenticated || !user) {
    navigate({ to: "/login" });
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    updateUser({ name: name.trim() });
    setIsSaving(false);
    toast.success("Profile updated!");
  };

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account details
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Change avatar"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {user.name}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span
              className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                user.role === "admin"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {user.role === "admin" ? "Admin" : "Student"}
            </span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="display-name"
              className="text-sm flex items-center gap-1.5"
            >
              <User className="h-3.5 w-3.5" /> Display Name
            </Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              data-ocid="profile.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </Label>
            <Input
              value={user.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSaving || !name.trim() || name.trim() === user.name}
            data-ocid="profile.save_button"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </span>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
