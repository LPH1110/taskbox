import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { clsx } from "clsx";

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const currentLanguage = i18n.language === "vi" ? "VI" : "EN";

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="relative rounded-md flex items-center justify-center gap-2 h-10 px-3 border border-border/50 bg-background/50 hover:bg-accent/50 text-foreground transition-all duration-300 ease-out outline-none overflow-hidden group"
          aria-label="Change Language"
        >
          {/* Subtle gradient glow behind the button on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

          <Globe className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="text-xs font-bold tracking-wider">{currentLanguage}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={clsx(
            "z-50 w-48 rounded-md border border-border/50 bg-background/95 backdrop-blur-md p-1 shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => changeLanguage("en")}
              className={clsx(
                "relative rounded-sm flex items-center w-full px-3 py-2 text-sm transition-colors outline-none",
                i18n.language === "en"
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <span className="z-10">{t("english")}</span>
            </button>
            <button
              onClick={() => changeLanguage("vi")}
              className={clsx(
                "relative rounded-sm flex items-center w-full px-3 py-2 text-sm transition-colors outline-none",
                i18n.language === "vi"
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <span className="z-10">{t("vietnamese")}</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
