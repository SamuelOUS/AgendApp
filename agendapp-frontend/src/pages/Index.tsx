import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { EPSSelector } from "@/components/EPSSelector";
import { EPSLoginForm } from "@/components/EPSLoginForm";
import { AuthSuccess } from "@/components/AuthSuccess";
import { AppointmentManager } from "@/components/AppointmentManager";
import type { EPSProvider } from "@/lib/eps-data";
import { logoutFromEPS, type AuthResponse } from "@/lib/auth-service";
import { getIntake, type IntakeContext } from "@/lib/intake-service";
import { toast } from "sonner";

type Step = "select" | "login" | "success" | "appointments";

const Index = () => {
  const [step, setStep] = useState<Step>("select");
  const [selectedEPS, setSelectedEPS] = useState<EPSProvider | null>(null);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [intake, setIntake] = useState<IntakeContext | null>(null);

  useEffect(() => {
    const intakeId = new URLSearchParams(window.location.search).get("intakeId");

    if (!intakeId) return;

    getIntake(intakeId).then((loadedIntake) => {
      if (loadedIntake) {
        setIntake(loadedIntake);
      }
    });
  }, []);

  const handleSelectEPS = (eps: EPSProvider) => {
    setSelectedEPS(eps);
    setStep("login");
  };

  const handleAuthSuccess = (response: AuthResponse) => {
    setAuthResponse(response);
    setStep("success");
    toast.success("Sesion iniciada correctamente");
  };

  const handleAuthError = (message: string) => {
    toast.error(message);
  };

  const handleDisconnect = async () => {
    if (authResponse?.sessionId) {
      await logoutFromEPS(authResponse.sessionId).catch(() => undefined);
    }

    setSelectedEPS(null);
    setAuthResponse(null);
    setStep("select");
  };

  const handleContinue = () => {
    setStep("appointments");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="px-4 py-12">
        {step === "select" && (
          <EPSSelector onSelect={handleSelectEPS} name={intake?.name} />
        )}

        {step === "login" && selectedEPS && (
          <EPSLoginForm
            eps={selectedEPS}
            intakeId={intake?.intakeId}
            onBack={() => setStep("select")}
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />
        )}

        {step === "success" && selectedEPS && (
          <AuthSuccess
            eps={selectedEPS}
            onContinue={handleContinue}
            onDisconnect={handleDisconnect}
          />
        )}

        {step === "appointments" && authResponse?.sessionId && (
          <AppointmentManager
            sessionId={authResponse.sessionId}
            onBack={() => setStep("success")}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
