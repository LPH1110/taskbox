import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkAuthSession } from "@/features/auth/authSlice";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, LayoutTemplate, Lock, Workflow } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const { t } = useTranslation("landing");
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");

  // Handle OAuth token from Google redirect
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("taskbox_token", token);
      dispatch(checkAuthSession()).unwrap().then(() => {
        const invite = searchParams.get("invite_token");
        if (invite) {
          api.post<any, { success: boolean; data: { workspaceId: string } }>(`/invitations/${invite}/accept`)
            .then((res) => {
              addToast(t("invite_success"), "success");
              navigate(`/workspaces/${res.data.workspaceId}`, { replace: true });
            })
            .catch((err) => {
              addToast(err.message || t("invite_failed"), "error");
              navigate("/workspaces", { replace: true });
            });
        }
        // Redirect will happen via the isAuthenticated effect below
      }).catch((err: any) => {
        console.error("Session check after OAuth redirect failed:", err);
      });
    }
  }, [searchParams, dispatch, navigate, addToast, t]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/workspaces", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* LEFT PANEL*/}
      <div className="relative hidden lg:flex flex-col justify-between flex-1 h-screen p-8 lg:p-12 xl:p-16 border-r border-border/50 bg-muted/10 overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px]"></div>

          {/* Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutTemplate className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Taskbox</span>
        </div>

        {/* Main Value Proposition */}
        <div className="relative z-10 max-w-2xl mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              {t("hero_title_1")} <br />
              {t("hero_title_2")} <br />
              <span className="text-muted-foreground">{t("hero_title_3")}</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed mb-8 xl:mb-12">
              {t("hero_subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8 max-w-xl"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Workflow className="w-5 h-5 text-primary" />
                {t("feature_1_title")}
              </div>
              <p className="text-sm text-muted-foreground">{t("feature_1_desc")}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <LayoutTemplate className="w-5 h-5 text-primary" />
                {t("feature_2_title")}
              </div>
              <p className="text-sm text-muted-foreground">{t("feature_2_desc")}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t("feature_3_title")}
              </div>
              <p className="text-sm text-muted-foreground">{t("feature_3_desc")}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Lock className="w-5 h-5 text-primary" />
                {t("feature_4_title")}
              </div>
              <p className="text-sm text-muted-foreground">{t("feature_4_desc")}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Gateway */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 h-screen sticky top-0 bg-background/95 backdrop-blur-md shadow-2xl z-20 flex flex-col border-l border-border/50">
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-24 pb-8 sm:py-12 flex flex-col justify-center relative">

          {/* Top Header: Brand (Mobile) + Toggle */}
          <div className="absolute top-6 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 flex items-center justify-between">
            {/* Mobile Brand (Hidden on desktop) */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <LayoutTemplate className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">Taskbox</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <LanguageSwitcher />

              {/* Animated Toggle Switch */}
              <div className="relative flex items-center p-1 bg-muted rounded-lg w-[140px] sm:w-[180px]">
                {/* Sliding Indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-md shadow-sm border border-border/50"
                  layoutId="authTabIndicator"
                  initial={false}
                  animate={{
                    x: isLogin ? 0 : "100%",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />

                <button
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "relative z-10 flex-1 py-1.5 text-xs sm:text-sm font-medium transition-colors text-center rounded-md cursor-pointer",
                    isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("auth_login")}
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "relative z-10 flex-1 py-1.5 text-xs sm:text-sm font-medium transition-colors text-center rounded-md cursor-pointer",
                    !isLogin ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("auth_signup")}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8 mt-12 text-center lg:text-left max-w-md mx-auto lg:mx-0 w-full">
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {isLogin ? t("welcome_back") : t("create_account")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isLogin ? t("welcome_back_desc") : t("create_account_desc")}
            </p>
          </div>

          {/* Smooth Transitions for Forms */}
          <div className="relative auth-gateway-container min-h-[400px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -15, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 15, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 15, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -15, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>



      <style>{`
        /* Override shadcn card styles inside the gateway to blend seamlessly */
        .auth-gateway-container .shadow-lg {
          box-shadow: none;
        }
        .auth-gateway-container .bg-card {
          background-color: transparent;
          border: none;
        }
        .auth-gateway-container .card-content {
          padding-left: 0;
          padding-right: 0;
        }
        .auth-gateway-container .card-header {
          display: none; /* Hide internal card header since we have a custom one */
        }
      `}</style>
    </div>
  );
}
