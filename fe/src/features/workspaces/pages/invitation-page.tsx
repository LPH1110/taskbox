import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  workspaceName: string;
  inviterName: string;
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation(["workspaces"]);
  
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvitationDetails() {
      try {
        const response = await api.get<any, { success: boolean; data: InvitationDetails }>(`/invitations/${token}`);
        setDetails(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load invitation details");
      } finally {
        setIsLoading(false);
      }
    }
    if (token) {
      fetchInvitationDetails();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setIsActionLoading(true);
    try {
      const response = await api.post<any, { success: boolean; data: { workspaceId: string } }>(
        `/invitations/${token}/accept`
      );
      addToast("Invitation accepted successfully!", "success");
      navigate(`/workspaces/${response.data.workspaceId}`);
    } catch (err: any) {
      addToast(err.message || "Failed to accept invitation", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to decline this invitation?")) return;
    setIsActionLoading(true);
    try {
      await api.post(`/invitations/${token}/decline`);
      addToast("Invitation declined.", "success");
      navigate("/");
    } catch (err: any) {
      addToast(err.message || "Failed to decline invitation", "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className="text-muted-foreground text-sm">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/30 bg-card shadow-2xl">
          <CardHeader className="text-center pb-2">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold tracking-tight">{t("workspaces:invalid_invitation")}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Button asChild className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-foreground w-full">
              <Link to="/">{t("workspaces:go_to_dashboard")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoggedIn = !!currentUser;
  const isCorrectEmail = currentUser?.email.toLowerCase() === details.email.toLowerCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg border-input/20 bg-card shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
        
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Mail className="h-7 w-7 text-cyan-400" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            Workspace Invitation
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base mt-2">
            Join <strong>{details.workspaceName}</strong> on Taskbox
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8 pt-4">
          <div className="bg-input/5 rounded-xl border border-input/10 p-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              <strong>{details.inviterName}</strong> has invited you to join the workspace{" "}
              <strong className="text-foreground">{details.workspaceName}</strong> as an{" "}
              <strong className="text-cyan-400 font-semibold">{details.role}</strong>.
            </p>
            
            <div className="border-t border-input/10 pt-4 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
              <span>Invited Email: <strong className="text-foreground">{details.email}</strong></span>
              <span>Expires on: {new Date(details.expires_at).toLocaleDateString()}</span>
            </div>
          </div>

          {!isLoggedIn ? (
            <div className="space-y-4 pt-2">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-500 text-center">
                You need to be logged in to accept this invitation.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-input/30 hover:bg-input/10"
                >
                  <Link to={`/?mode=login&invite_token=${token}&email=${encodeURIComponent(details.email)}`}>
                    Log In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  <Link to={`/?mode=register&invite_token=${token}&email=${encodeURIComponent(details.email)}`}>
                    Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : !isCorrectEmail ? (
            <div className="space-y-4 pt-2">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive text-center leading-relaxed">
                You are currently logged in as <strong className="text-foreground">{currentUser.email}</strong>, 
                but this invitation was sent to <strong className="text-foreground">{details.email}</strong>.
                <br />
                Please log out and log in with the correct account to accept.
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full border-input/30 hover:bg-input/10"
              >
                <Link to="/?mode=login">{t("workspaces:switch_account")}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleDecline}
                disabled={isActionLoading}
                variant="outline"
                className="w-full order-2 sm:order-1 border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="mr-2 h-4 w-4" /> Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isActionLoading}
                className="w-full order-1 sm:order-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
              >
                {isActionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Accept Invitation
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
