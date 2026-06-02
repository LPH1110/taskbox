import { FloatingActionBar } from "@/components/ui/floating-action-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function SettingsPage() {

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Example settings state
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
    }, 800);
  };

  const handleDiscard = () => {
    setTheme("system");
    setNotifications(true);
    setIsDirty(false);
  };


  return (
    <div className="mx-auto max-w-4xl px-4 pb-32">
      <h1 className="mb-12 text-3xl font-bold tracking-tight text-foreground">
        Configuration
      </h1>

      <div className="space-y-0">
        {/* Section 1 */}
        <section className="border-t border-border py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Appearance</h2>
              <p className="mt-2 text-sm text-muted-foreground">Modify the visual interface of your workspace.</p>
            </div>
            <div className="space-y-6 md:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-semibold">Interface Theme</label>
                  <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
                </div>
                <Select value={theme} onValueChange={(val) => { setTheme(val); setIsDirty(true); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="border-t border-border py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Notifications</h2>
              <p className="mt-2 text-sm text-muted-foreground">Manage your alerts and webhooks.</p>
            </div>
            <div className="space-y-6 md:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-semibold">Email Alerts</label>
                  <p className="text-sm text-muted-foreground">Receive daily digests.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotifications(!notifications);
                    setIsDirty(true);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${notifications ? "translate-x-6" : "translate-x-1"}`} />
                </button>
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
