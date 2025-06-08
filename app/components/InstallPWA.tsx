"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptInstall(e as BeforeInstallPromptEvent);
      setSupportsPWA(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!promptInstall) {
      return;
    }
    try {
      await promptInstall.prompt();
      const { outcome } = await promptInstall.userChoice;
      if (outcome === "accepted") {
        setSupportsPWA(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'installation:", error);
    }
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
      aria-label="Installer l'application"
    >
      Installer l&apos;application
    </button>
  );
};
