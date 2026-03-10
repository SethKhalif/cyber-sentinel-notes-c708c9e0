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
    <div className="min-h-screen bg-background flex flex-col scroll-smooth">
      {/* Nav — larger touch targets */}
      <header className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <Link to="/" className="flex items-center gap-2 min-h-[44px] min-w-[44px]">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-sans font-bold text-lg text-foreground">Vistahand AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          {[
            { href: "#about", label: "About" },
            { href: "#testimonials", label: "Testimonials" },
            { href: "#contact", label: "Contact" },
            { href: "#policy", label: "Policy" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-3 min-h-[44px] flex items-center rounded-md hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px] text-sm sm:text-base sm:size-default" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" className="min-h-[44px] min-w-[44px] text-sm sm:text-base sm:size-default" asChild>
            <Link to="/signup"><span className="hidden sm:inline">Get Started</span><span className="sm:hidden">Start</span></Link>
          </Button>
        </div>
      </header>

      {/* Hero — focused, clear hierarchy, single CTA emphasis */}
      <section className="flex flex-col items-center justify-center px-4 sm:px-6 text-center max-w-3xl mx-auto py-16 sm:py-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground mb-8">
          <Zap className="h-4 w-4 text-primary" />
          AI-Powered Cyber Intelligence
        </div>
        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
          Intelligence notes<br />for cyber defense teams
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Store cybersecurity notes. Get instant AI threat analysis with MITRE ATT&CK mapping, CVE intelligence, and attack probability scoring.
        </p>

        {/* Single primary CTA + subtle secondary */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button size="lg" className="min-h-[52px] px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow w-full sm:w-auto" asChild>
            <Link to="/signup">
              Start Free — No Card Required <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="min-h-[52px] px-8 text-base w-full sm:w-auto" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-muted-foreground">
          {[
            { value: "500+", label: "Teams" },
            { value: "40%", label: "Faster Response" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{stat.value}</span>
              <span className="text-xs">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Features — 3 cards, generous tap area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-16 w-full">
          {[
            { icon: Shield, title: "Threat Analysis", desc: "Auto-analyze notes for threat level, attack type, and MITRE ATT&CK mapping." },
            { icon: Lock, title: "Secure Notes", desc: "Encrypted, role-isolated notes with RLS. Your intelligence stays yours." },
            { icon: Zap, title: "CVE Intelligence", desc: "Paste CVE data and get exploitation likelihood, affected systems, and patch guidance." },
          ].map((f) => (
            <div key={f.title} className="border border-border rounded-xl bg-card p-6 sm:p-8 text-left hover:border-primary/30 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — cleaner cards */}
      <section id="testimonials" className="px-4 sm:px-6 py-16 sm:py-20 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground mb-3">Trusted by Security Teams</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Analysts and CISOs rely on Vistahand AI to accelerate threat intelligence workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="bg-card border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-6 sm:pt-6">
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
      <section id="about" className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground mb-4">About Vistahand AI</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Founded by security practitioners, Vistahand AI was built to solve a problem we lived daily — the disconnect between raw intelligence notes and actionable threat analysis.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Our platform uses advanced AI to instantly analyze your notes for threat indicators, map them to MITRE ATT&CK frameworks, and provide CVE-level intelligence — all within a workspace designed for how analysts actually work.
              </p>
              <div className="flex gap-8">
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
            <div className="space-y-3">
              {TEAM.map((member) => (
                <div key={member.name} className="border border-border rounded-xl bg-card p-5 flex items-start gap-4">
                  <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{member.name}</p>
                    <p className="text-xs text-primary mb-1">{member.role}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{member.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us — larger inputs */}
      <section id="contact" className="px-4 sm:px-6 py-16 sm:py-20 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground mb-3">Contact Us</h2>
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
                    className="min-h-[48px] text-base"
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className="min-h-[48px] text-base"
                  />
                </div>
                <Textarea
                  placeholder="Your message..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                  className="min-h-[140px] resize-none text-base"
                />
                <Button type="submit" size="lg" className="min-h-[48px] w-full sm:w-auto px-8 text-base">
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </Button>
              </form>
            </div>
            <div className="md:col-span-2 space-y-5 text-sm">
              {[
                { icon: Mail, title: "Email", detail: "support@vistahand.ai" },
                { icon: MapPin, title: "Office", detail: "San Francisco, CA" },
                { icon: Shield, title: "Enterprise", detail: "enterprise@vistahand.ai" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section id="policy" className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground">Privacy Policy</h2>
          </div>
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            {[
              { title: "Data Collection", content: "We collect only the information necessary to provide our services: your email address, display name, and the notes and analyses you create within the platform. We do not sell or share your data with third parties." },
              { title: "Data Security", content: "All data is encrypted in transit (TLS 1.3) and at rest. Row-Level Security ensures your intelligence notes are isolated and accessible only by you. We conduct regular security audits and penetration testing." },
              { title: "AI Processing", content: "Notes submitted for AI analysis are processed in real-time and not stored by our AI providers beyond the scope of the request. Analysis results are stored securely in your account database." },
              { title: "Data Retention", content: "Your data is retained for as long as your account is active. Upon account deletion, all associated data — including notes, analyses, and profile information — is permanently removed within 30 days." },
              { title: "Your Rights", content: "You have the right to access, export, modify, or delete your data at any time from within your account settings. For GDPR, CCPA, or other privacy-related requests, contact privacy@vistahand.ai." },
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

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to accelerate your threat intelligence?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            Join 500+ security teams already using Vistahand AI. Free to start, no credit card required.
          </p>
          <Button size="lg" className="min-h-[52px] px-10 text-base font-semibold shadow-lg shadow-primary/25" asChild>
            <Link to="/signup">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer — bigger tap targets */}
      <footer className="border-t border-border px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 min-h-[44px]">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-sans font-bold text-sm text-foreground">Vistahand AI</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {[
              { href: "#about", label: "About" },
              { href: "#testimonials", label: "Testimonials" },
              { href: "#contact", label: "Contact" },
              { href: "#policy", label: "Privacy" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 min-h-[44px] flex items-center rounded-md hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Vistahand AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
