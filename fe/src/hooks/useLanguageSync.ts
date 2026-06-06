import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateLanguage } from "@/features/auth/authSlice";

export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // Track initial sync to avoid redundant API calls during hydration
  const initialSyncRef = useRef(false);

  // Sync DB language to i18n when user logs in/loads
  useEffect(() => {
    if (isAuthenticated && user?.language && user.language !== i18n.language) {
      i18n.changeLanguage(user.language);
      initialSyncRef.current = true;
    }
  }, [isAuthenticated, user?.language, i18n]);

  // Sync i18n language changes to DB (triggered by manual LanguageSwitcher changes)
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      // Don't sync if this is the initial load from DB
      if (initialSyncRef.current) {
        initialSyncRef.current = false;
        return;
      }

      if (isAuthenticated && user && user.language !== lng) {
        dispatch(updateLanguage(lng));
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, isAuthenticated, user, dispatch]);
};
