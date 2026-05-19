import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type EPSProvider, DOCUMENT_TYPE_LABELS } from "@/lib/eps-data";
import { authenticateWithEPS, type AuthResponse } from "@/lib/auth-service";
import { ArrowLeft, Loader2, Lock } from "lucide-react";

interface EPSLoginFormProps {
  eps: EPSProvider;
  intakeId?: string;
  onBack: () => void;
  onSuccess: (response: AuthResponse) => void;
  onError: (message: string) => void;
}

export function EPSLoginForm({ eps, intakeId, onBack, onSuccess, onError }: EPSLoginFormProps) {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType || !documentNumber || !password) return;

    setLoading(true);
    try {
      const response = await authenticateWithEPS({
        epsId: eps.id,
        documentType,
        documentNumber,
        password,
        intakeId,
      });

      if (response.success) {
        onSuccess(response);
      } else {
        onError(response.message);
      }
    } catch {
      onError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Cambiar EPS
      </button>

      <div className="bg-card rounded-2xl shadow-card border border-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-heading font-bold"
            style={{
              backgroundColor: eps.color + "15",
              color: eps.color,
            }}
          >
            {eps.shortName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">
              {eps.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Ingresa tus credenciales
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docType">Tipo de documento</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="docType">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {eps.documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docNumber">Número de documento</Label>
            <Input
              id="docNumber"
              type="text"
              inputMode="numeric"
              placeholder="Ej: 1234567890"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña de la EPS"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !documentType || !documentNumber || !password}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Conectando con {eps.shortName}...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Iniciar sesión
              </>
            )}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
          Tus credenciales se envían directamente a {eps.name} a través de un canal cifrado.
          No almacenamos tu contraseña.
        </p>
      </div>
    </div>
  );
}
