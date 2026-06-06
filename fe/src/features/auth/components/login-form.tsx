import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { GoogleAuthButton } from "@/components/ui/google-auth-btn";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../authSlice";
import { useTranslation } from "react-i18next";

// 1. Define validation schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

// 2. Define the type based on the schema (Automatic type inference)
type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const dispatch = useAppDispatch();
  const [loading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const inviteToken = searchParams.get("invite_token");
  const emailParam = searchParams.get("email");
  const { t } = useTranslation(["auth", "landing"]);

  // 3. Initialize the form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam || "",
      password: "",
    },
  });

  // 4. Handle form submission
  async function onSubmit(values: LoginFormValues) {
    try {
      await dispatch(login(values)).unwrap();
      if (inviteToken) {
        try {
          const response = await api.post<any, { success: boolean; data: { workspaceId: string } }>(
            `/invitations/${inviteToken}/accept`
          );
          addToast("Successfully joined the workspace!", "success");
          navigate(`/workspaces/${response.data.workspaceId}`);
          return;
        } catch (inviteErr: any) {
          addToast(inviteErr.message || "Failed to auto-accept invitation", "error");
        }
      }
      navigate("/");
    } catch (err: any) {
      console.error("Login failed:", err);
    }
  }

  const { error } = useAppSelector((state) => state.auth);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="mb-4 p-3 rounded bg-destructive/15 text-destructive text-sm font-medium">
                {error}
              </div>
            )}
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:email")}</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:password")}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>
        {/* Sign in with Google */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t("auth:or")}</span>
          </div>
        </div>

        <GoogleAuthButton />
      </CardContent>
    </Card>
  );
}
