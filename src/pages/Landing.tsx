import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Zap, Lock, ArrowRight, Quote, Users, FileText, Mail, Send, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "SOC Lead, CrowdShield",
    quote: "Vistahand AI transformed how our team processes threat intelligence. The MITRE ATT&CK mapping alone saves us hours every week.",
  },
  {
    name: "James Okoye",
    role: "CISO, FinSecure",
    quote: "The CVE analyzer gives us instant, actionable insights. We've cut our vulnerability response time by 40%.",
  },
  {
    name: "Maria Petrov",
    role: "Threat Analyst, NordDefense",
    quote: "Finally, a tool built for analysts — not managers. The note-to-intelligence pipeline is exactly what we needed.",
  },
];

const TEAM = [
  { name: "Alex Mercer", role: "Founder & CEO", desc: "Former threat intelligence lead with 12 years in cybersecurity." },
  { name: "Priya Nair", role: "CTO", desc: "Built security infrastructure at two Fortune 500 companies." },
  { name: "Daniel Reeves", role: "Head of AI", desc: "ML researcher specializing in NLP for security applications." },
];

const Landing = () => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-sans font-bold text-lg text-foreground">Vistahand AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          <a href="#policy" className="hover:text-foreground transition-colors">Policy</a>
        </nav>
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
      <section className="flex flex-col items-center justify-center px-6 text-center max-w-3xl mx-auto py-24">
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
            { icon: Shield, title: "Threat Analysis", desc: "Auto-analyze notes for threat level, attack type, and MITRE ATT&CK mapping." },
            { icon: Lock, title: "Secure Notes", desc: "Encrypted, role-isolated notes with RLS. Your intelligence stays yours." },
            { icon: Zap, title: "CVE Intelligence", desc: "Paste CVE data and get exploitation likelihood, affected systems, and patch guidance." },
          ].map((f) => (
            <div key={f.title} className="border border-border rounded-lg bg-card p-6 text-left">
              <f.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-sans font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-3">Trusted by Security Teams</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Analysts and CISOs rely on Vistahand AI to accelerate threat intelligence workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="bg-card border-border">
                <CardContent className="pt-6">
                  <Quote className="h-5 w-5 text-primary/40 mb-3" />
                  <p className="text-sm text-foreground/90 leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-sans text-3xl font-bold text-foreground mb-4">About Vistahand AI</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Founded by security practitioners, Vistahand AI was built to solve a problem we lived daily — the disconnect between raw intelligence notes and actionable threat analysis.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Our platform uses advanced AI to instantly analyze your notes for threat indicators, map them to MITRE ATT&CK frameworks, and provide CVE-level intelligence — all within a workspace designed for how analysts actually work.
              </p>
              <div className="flex gap-6 text-center">
                {[
                  { value: "10K+", label: "Threats Analyzed" },
                  { value: "500+", label: "Active Teams" },
                  { value: "99.9%", label: "Uptime" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {TEAM.map((member) => (
                <div key={member.name} className="border border-border rounded-lg bg-card p-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{member.name}</p>
                    <p className="text-xs text-primary mb-1">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact" className="px-6 py-20 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-sans text-3xl font-bold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground text-sm">Have questions or need a demo? We'd love to hear from you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <Textarea
                  placeholder="Your message..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  className="min-h-[120px] resize-none"
                />
                <Button type="submit" className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </Button>
              </form>
            </div>
            <div className="md:col-span-2 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground">support@vistahand.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Office</p>
                  <p className="text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Enterprise</p>
                  <p className="text-muted-foreground">enterprise@vistahand.ai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section id="policy" className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="font-sans text-3xl font-bold text-foreground">Privacy Policy</h2>
          </div>
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            {[
              {
                title: "Data Collection",
                content: "We collect only the information necessary to provide our services: your email address, display name, and the notes and analyses you create within the platform. We do not sell or share your data with third parties.",
              },
              {
                title: "Data Security",
                content: "All data is encrypted in transit (TLS 1.3) and at rest. Row-Level Security ensures your intelligence notes are isolated and accessible only by you. We conduct regular security audits and penetration testing.",
              },
              {
                title: "AI Processing",
                content: "Notes submitted for AI analysis are processed in real-time and not stored by our AI providers beyond the scope of the request. Analysis results are stored securely in your account database.",
              },
              {
                title: "Data Retention",
                content: "Your data is retained for as long as your account is active. Upon account deletion, all associated data — including notes, analyses, and profile information — is permanently removed within 30 days.",
              },
              {
                title: "Your Rights",
                content: "You have the right to access, export, modify, or delete your data at any time from within your account settings. For GDPR, CCPA, or other privacy-related requests, contact privacy@vistahand.ai.",
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-2">
                  <ChevronRight className="h-3 w-3 text-primary" />
                  <h3 className="font-sans font-semibold text-foreground text-base">{section.title}</h3>
                </div>
                <p className="pl-5">{section.content}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border">
              Last updated: March 2026. For questions, contact privacy@vistahand.ai
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-sans font-bold text-sm text-foreground">Vistahand AI</span>
          </div>
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Vistahand AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
