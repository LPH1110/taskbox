import { useState } from "react";
import { FloatingActionBar } from "@/components/ui/floating-action-bar";
import { useAppSelector } from "@/store/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  // Use user from redux store
  const { user } = useAppSelector((state) => state.auth);
  // dispatch could be used to save data later
  // const dispatch = useAppDispatch();
  const { t } = useTranslation("profile");

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "User");
  const [email, setEmail] = useState(user?.email || "user@example.com");

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
    }, 800);
  };

  const handleDiscard = () => {
    setFullName(user?.fullName || "User");
    setEmail(user?.email || "user@example.com");
    setIsDirty(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32">
      <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-center">
        <Avatar className="h-24 w-24 rounded-full border-4 border-background shadow-lg">
          <AvatarImage src={user?.avatarUrl || ""} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">{fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {fullName}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Workspace Member
          </p>
        </div>
      </div>

      <div className="space-y-0">
        <section className="border-t border-border py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("personal_info")}</h2>
            </div>
            <div className="md:col-span-3 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("full_name")}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("email_address")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <FloatingActionBar
        isVisible={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
