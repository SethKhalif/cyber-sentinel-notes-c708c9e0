import { Link } from "react-router-dom";
import { Shield, Zap, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-sans font-bold text-lg text-foreground">Vistahand AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground mb-8">
          <Zap className="h-3 w-3 text-primary" />
          AI-Powered Cyber Intelligence
        </div>
        <h1 className="font-sans text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Intelligence notes<br />for cyber defense teams
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mb-10">
          Store cybersecurity notes. Get instant AI threat analysis with MITRE ATT&CK mapping, CVE intelligence, and attack probability scoring.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link to="/signup">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          {[
            {
              icon: Shield,
              title: "Threat Analysis",
              desc: "Auto-analyze notes for threat level, attack type, and MITRE ATT&CK mapping.",
            },
            {
              icon: Lock,
              title: "Secure Notes",
              desc: "Encrypted, role-isolated notes with RLS. Your intelligence stays yours.",
            },
            {
              icon: Zap,
              title: "CVE Intelligence",
              desc: "Paste CVE data and get exploitation likelihood, affected systems, and patch guidance.",
            },
          ].map((f) => (
            <div key={f.title} className="border border-border rounded-lg bg-card p-6 text-left">
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-sans font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vistahand AI. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
