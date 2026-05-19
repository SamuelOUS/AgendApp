import { EPS_PROVIDERS, type EPSProvider } from "@/lib/eps-data";
import { Shield } from "lucide-react";

interface EPSSelectorProps {
  onSelect: (eps: EPSProvider) => void;
  name?: string;
}

export function EPSSelector({ onSelect, name }: EPSSelectorProps) {
  const displayName = name?.trim();
  const hasName = Boolean(displayName);

  return (
    <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col justify-start">
      <div className="text-center mb-40 mt-20">
        <h1 className="text-7xl font-heading font-bold text-foreground">
          {hasName ? (
            <>
              Hola, <span className="text-primary">{displayName}</span>
            </>
          ) : (
            "Bienvenido"
          )}
        </h1>
      </div>
    
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-foreground">
          Selecciona tu EPS
        </h2>
        <p className="text-muted-foreground mt-2">
          Elige tu entidad para iniciar sesión de forma segura
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 ">
        {EPS_PROVIDERS.map((eps) => (
          <button
            key={eps.id}
            onClick={() => onSelect(eps)}
            className="group relative flex flex-col items-center gap-3 p-6 rounded-xl bg-card shadow-card border border-border hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 cursor-pointer"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-heading font-bold transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: eps.color + "15",
                color: eps.color,
              }}
            >
              {eps.shortName.charAt(0)}
            </div>
            <span className="text-sm font-medium text-foreground text-center">
              {eps.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>Conexión cifrada · Tus credenciales no se almacenan</span>
      </div>
    </div>
  );
}
