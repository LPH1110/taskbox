import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { Unplug } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons/github-icon";

export function GithubIntegrationSection() {
  const { t } = useTranslation(["settings", "common"]);
  const { addToast } = useToast();
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check connection status
    const fetchStatus = async () => {
      try {
        const res = await api.get("/github/status");
        setIsLinked(res.data?.linked || false);
      } catch (err) {
        console.error("Failed to fetch GitHub status", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // Check for success/error from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("github_success") === "true") {
      addToast(t("github_linked_success"), "success");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("github_error")) {
      addToast(t("github_link_failed", { error: params.get("github_error") }), "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast, t]);

  const handleConnect = async () => {
    try {
      const res = await api.get("/github/auth");
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      addToast(err.message || t("github_init_failed"), "error");
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.delete("/github/auth");
      setIsLinked(false);
      addToast(t("github_disconnect_success"), "info");
    } catch (err: any) {
      addToast(err.message || t("github_disconnect_failed"), "error");
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground animate-pulse">{t("loading_github_status")}</div>;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Github className="h-5 w-5 text-slate-900 dark:text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{t("github_identity")}</h3>
          <p className="text-sm text-muted-foreground">
            {isLinked
              ? t("github_linked_desc")
              : t("github_unlinked_desc")}
          </p>
        </div>
      </div>
      <div>
        {isLinked ? (
          <button
            onClick={handleDisconnect}
            className="flex items-center space-x-2 rounded-md border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Unplug className="h-4 w-4" />
            <span>{t("disconnect")}</span>
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center space-x-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Github className="h-4 w-4" />
            <span>{t("connect_github")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
