import { Button } from "@/components/ui/button";
import { type EPSProvider } from "@/lib/eps-data";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";

interface AuthSuccessProps {
  eps: EPSProvider;
  onContinue: () => void;
  onDisconnect: () => void;
}

export function AuthSuccess({ eps, onContinue, onDisconnect }: AuthSuccessProps) {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="bg-card rounded-2xl shadow-card border border-border p-8">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>

        <h2 className="text-xl font-heading font-bold text-foreground mb-1">
          ¡Conectado!
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tu sesión con <strong style={{ color: eps.color }}>{eps.name}</strong> está activa
        </p>

        <div className="bg-secondary rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-heading font-bold"
                style={{
                  backgroundColor: eps.color + "15",
                  color: eps.color,
                }}
              >
                {eps.shortName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{eps.name}</p>
                <p className="text-xs text-success font-medium">Sesión activa</p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          </div>
        </div>

        <Button onClick={onContinue} className="w-full mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          Agendar cita
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <button
          onClick={onDisconnect}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Desconectar y cambiar de EPS
        </button>
      </div>
    </div>
  );
}
