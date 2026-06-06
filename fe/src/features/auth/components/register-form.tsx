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
import { register } from "../authSlice";
import { useTranslation } from "react-i18next";

// 1. Define validation schema using Zod
// We will translate Zod errors dynamically using t() if possible or keep them as fallback,
// but since the schema is created outside the React component, we can use react-i18next directly inside the component for custom errors,
// or we can translate the errors dynamically during display. Let's make the schema define keys or just use translation.
// Wait! Zod resolver passes validation errors to FormMessage. FormMessage displays the message defined in Zod.
// We can use translation keys in the Zod messages, and then translate them inside a custom FormMessage, OR we can define the schema inside the component (which is fine in React),
// or we can translate the message key dynamically if we pass keys like "auth:invalid_email" etc.
// Let's pass the translation keys directly to the Zod message, and inside the Form, if the error message matches a key, translate it!
// Or even simpler, let's redefine the schema inside the component so it has access to the `t` function!
// Wait, moving the schema inside the component is standard and extremely easy:
// "const formSchema = z.object({ email: z.string().email({ message: t('auth:invalid_email') }) })"
// Let's do that! That is extremely elegant and doesn't require any custom form component wrappers.

interface LoginFormValues {
  email: string;
  fullName: string;
  password: string;
}

export function RegisterForm() {
  const { t } = useTranslation(["auth"]);
  const dispatch = useAppDispatch();
  const [loading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const formSchema = z.object({
    email: z.string().email({ message: t("invalid_email") }),
    fullName: z.string().min(1, { message: t("fullname_required") }),
    password: z
      .string()
      .min(6, { message: t("password_length") }),
  });

  const inviteToken = searchParams.get("invite_token");
  const emailParam = searchParams.get("email");

  // 3. Initialize the form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam || "",
      fullName: "",
      password: "",
    },
  });

  // 4. Handle form submission
  async function onSubmit(values: LoginFormValues) {
    try {
      await dispatch(register(values)).unwrap();
      if (inviteToken) {
        try {
          const response = await api.post<any, { success: boolean; data: { workspaceId: string } }>(
            `/invitations/${inviteToken}/accept`
          );
          addToast(t("invite_success"), "success");
          navigate(`/workspaces/${response.data.workspaceId}`);
          return;
        } catch (inviteErr: any) {
          addToast(inviteErr.message || t("invite_failed"), "error");
        }
      }
      navigate("/");
    } catch (err: any) {
      console.error("Registration failed:", err);
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
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("email_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Fullname Field */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullname")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fullname_placeholder")} {...field} />
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
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t("creating_account") : t("create_account")}
            </Button>
          </form>
        </Form>
        {/* Sign in with Google */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t("or")}</span>
          </div>
        </div>

        <GoogleAuthButton />
      </CardContent>
    </Card>
  );
}
