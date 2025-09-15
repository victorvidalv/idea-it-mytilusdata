import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calculator, BarChart3, ShieldCheck, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight">IT25I0032</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Acceder</Link>
            </Button>
            <Button asChild>
              <Link href="/login?tab=register">Registrarse</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-8 bg-gradient-to-b from-background to-primary/5">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-outfit font-black tracking-tighter leading-tight translate-y-2 tw-animate-fade-in-up">
            Sistema <span className="text-primary decoration-primary underline decoration-8 underline-offset-8">IT25I0032</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto tw-animate-fade-in-up md:delay-100">
            Gestiona, registra y audita todas tus mediciones en una plataforma moderna, segura y fácil de usar.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 tw-animate-fade-in-up md:delay-200">
          <Button size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg shadow-primary/20" asChild>
            <Link href="/login">Comenzar Ahora</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-semibold" asChild>
            <Link href="#features">Saber Más</Link>
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 w-full max-w-5xl tw-animate-fade-in-up md:delay-300">
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-outfit">Análisis en Tiempo Real</h3>
            <p className="text-muted-foreground">Visualiza tus datos con gráficos dinámicos y reportes detallados.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-outfit">Auditoría Completa</h3>
            <p className="text-muted-foreground">Cada cambio queda registrado en nuestra bitácora para total transparencia.</p>
          </div>
          <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-outfit">Gestión de Activos</h3>
            <p className="text-muted-foreground">Controla tus lugares, unidades y tipos de registro desde un solo lugar.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} IT25I0032. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
