import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, FileText, AlertTriangle, Bug, ArrowLeft, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";

const THREAT_COLORS: Record<string, string> = {
  Critical: "hsl(0, 84%, 60%)",
  High: "hsl(20, 90%, 55%)",
  Medium: "hsl(45, 93%, 47%)",
  Low: "hsl(142, 71%, 45%)",
  None: "hsl(215, 20%, 65%)",
};

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notes: 0, threats: 0, cves: 0, plan: "free" });
  const [threatLevelData, setThreatLevelData] = useState<{ name: string; value: number }[]>([]);
  const [cveHistory, setCveHistory] = useState<{ date: string; count: number }[]>([]);
  const [noteActivity, setNoteActivity] = useState<{ date: string; created: number; updated: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [notesRes, threatsRes, cvesRes, subRes] = await Promise.all([
        supabase.from("notes").select("id", { count: "exact", head: true }),
        supabase.from("threat_analysis").select("id", { count: "exact", head: true }),
        supabase.from("cve_analyses").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("plan").maybeSingle(),
      ]);
      setStats({
        notes: notesRes.count ?? 0,
        threats: threatsRes.count ?? 0,
        cves: cvesRes.count ?? 0,
        plan: subRes.data?.plan ?? "free",
      });
    };

    const loadThreatLevels = async () => {
      const { data } = await supabase.from("threat_analysis").select("threat_level");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((d) => {
          const level = d.threat_level || "None";
          counts[level] = (counts[level] || 0) + 1;
        });
        setThreatLevelData(
          Object.entries(counts).map(([name, value]) => ({ name, value }))
        );
      }
    };

    const loadCveHistory = async () => {
      const { data } = await supabase
        .from("cve_analyses")
        .select("created_at")
        .order("created_at", { ascending: true });
      if (data) {
        const byDate: Record<string, number> = {};
        data.forEach((d) => {
          const date = new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          byDate[date] = (byDate[date] || 0) + 1;
        });
        setCveHistory(Object.entries(byDate).map(([date, count]) => ({ date, count })));
      }
    };

    const loadNoteActivity = async () => {
      const { data } = await supabase
        .from("notes")
        .select("created_at, updated_at")
        .order("created_at", { ascending: true });
      if (data) {
        const byDate: Record<string, { created: number; updated: number }> = {};
        data.forEach((d) => {
          const createdDate = new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const updatedDate = new Date(d.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (!byDate[createdDate]) byDate[createdDate] = { created: 0, updated: 0 };
          byDate[createdDate].created += 1;
          if (updatedDate !== createdDate) {
            if (!byDate[updatedDate]) byDate[updatedDate] = { created: 0, updated: 0 };
            byDate[updatedDate].updated += 1;
          }
        });
        setNoteActivity(
          Object.entries(byDate).map(([date, v]) => ({ date, ...v }))
        );
      }
    };

    load();
    loadThreatLevels();
    loadCveHistory();
    loadNoteActivity();
  }, [user]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[11px] text-muted-foreground">
            {p.name}: <span className="font-bold text-foreground">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/workspace"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-sans text-2xl font-bold text-foreground">Overview</h1>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: "Notes", value: stats.notes, color: "text-primary" },
            { icon: AlertTriangle, label: "Threat Analyses", value: stats.threats, color: "text-yellow-500" },
            { icon: Bug, label: "CVE Analyses", value: stats.cves, color: "text-red-500" },
            { icon: Shield, label: "Plan", value: stats.plan.toUpperCase(), color: "text-emerald-500" },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Threat Levels Pie */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <CardTitle className="text-sm text-foreground">Threat Levels</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {threatLevelData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No threat data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={threatLevelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {threatLevelData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={THREAT_COLORS[entry.name] || THREAT_COLORS.None}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* CVE History Bar */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-red-500" />
                <CardTitle className="text-sm text-foreground">CVE Analysis History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {cveHistory.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No CVE analyses yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={cveHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Analyses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Note Activity Area */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm text-foreground">Note Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {noteActivity.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No note activity yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={noteActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.15)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="updated"
                      name="Updated"
                      stroke="hsl(142, 71%, 45%)"
                      fill="hsl(142, 71%, 45%, 0.15)"
                      strokeWidth={2}
                    />
                    <Legend iconType="line" iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;
