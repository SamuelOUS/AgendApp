import logo from "@/assets/logo.png";
import favicon from "@/assets/favicon.ico";

export function AppHeader() {
  return (
    <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <img src={favicon} alt="MiCita Salud" className="w-8 h-8" />
        <span className="font-heading font-bold text-foreground text-lg tracking-tight">
          Agend<span className="text-primary">App</span>
        </span>
      </div>
    </header>
  );
}
