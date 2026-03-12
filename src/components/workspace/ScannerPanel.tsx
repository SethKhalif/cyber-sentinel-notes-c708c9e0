import React, { useState, useRef, useCallback, useEffect } from "react";
import { useResourceScanner, ScanResult } from "@/hooks/useResourceScanner";
import { useScanHistory, ScanHistoryItem } from "@/hooks/useScanHistory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Upload, Camera, ScanBarcode, Loader2, Shield, ShieldCheck, ShieldAlert, ShieldX,
  AlertTriangle, Target, BookOpen, Wrench, XCircle, FileUp, CheckCircle2,
  Info, ChevronDown, ChevronUp, Download, History, Trash2, Clock,
} from "lucide-react";
import { exportScanAsPdf } from "@/lib/exportScan";

/* ─── Helpers ─── */

const threatConfig = {
  None: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30", label: "Safe", emoji: "✅", summary: "No threats detected — this looks safe." },
  Low: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30", label: "Low Risk", emoji: "🟢", summary: "Minor concerns found, but unlikely to be harmful." },
  Medium: { icon: Shield, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", label: "Moderate Risk", emoji: "🟡", summary: "Some suspicious elements found. Be cautious." },
  High: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", label: "High Risk", emoji: "🔴", summary: "Likely dangerous. Avoid interacting with this." },
  Critical: { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", label: "Critical Danger", emoji: "🚨", summary: "Extremely dangerous. Do NOT interact with this." },
} as const;

function getRiskLabel(probability: number): string {
  if (probability <= 10) return "Very unlikely to cause harm";
  if (probability <= 30) return "Unlikely, but stay alert";
  if (probability <= 50) return "Possible — proceed with caution";
  if (probability <= 75) return "Likely dangerous";
  return "Almost certain threat";
}

function getRiskColor(probability: number): string {
  if (probability <= 30) return "bg-success";
  if (probability <= 60) return "bg-warning";
  return "bg-destructive";
}

/* ─── Main Panel ─── */

const ScannerPanel: React.FC = () => {
  const { scanUrl, scanFile, scanImage, scanBarcode, scanning, result, clearResult } = useResourceScanner();
  const { history, loading: historyLoading, refresh: refreshHistory, deleteItem } = useScanHistory();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ScanHistoryItem | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"url" | "file" | "barcode" | "history">("url");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlScan = () => {
    if (!urlInput.trim()) return;
    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
    scanUrl(url);
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.type.startsWith("image/") ? scanImage(file) : scanFile(file);
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
    } catch { setCameraActive(false); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;
    let running = true;
    const detect = async () => {
      if (!running || !videoRef.current) return;
      try {
        if ("BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector();
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) { const v = barcodes[0].rawValue; setBarcodeInput(v); stopCamera(); scanBarcode(v); return; }
        }
      } catch {}
      if (running) requestAnimationFrame(detect);
    };
    const t = setTimeout(detect, 500);
    return () => { running = false; clearTimeout(t); };
  }, [cameraActive, stopCamera, scanBarcode]);

  // Refresh history when a new scan completes
  useEffect(() => {
    if (result) refreshHistory();
  }, [result, refreshHistory]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const tabs = [
    { key: "url" as const, icon: Globe, label: "Website" },
    { key: "file" as const, icon: FileUp, label: "File / Image" },
    { key: "barcode" as const, icon: ScanBarcode, label: "Barcode" },
    { key: "history" as const, icon: History, label: "History" },
  ];

  return (
    <div className="flex-1 flex flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">Threat Scanner</h2>
            <p className="text-[11px] text-muted-foreground">Check if something is safe or dangerous</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 text-xs h-9"
              onClick={() => { setActiveTab(tab.key); clearResult(); }}
            >
              <tab.icon className="h-3.5 w-3.5 mr-1.5" /> {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-5">
          {/* URL Scanner */}
          {activeTab === "url" && (
            <>
              <div className="rounded-lg bg-muted/50 p-3.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <Info className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  Paste any website link to check if it's safe. We'll look for phishing, malware, and suspicious content.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="e.g. https://example.com"
                  className="text-sm h-10 bg-muted border-none"
                  onKeyDown={(e) => e.key === "Enter" && handleUrlScan()}
                />
                <Button onClick={handleUrlScan} disabled={scanning || !urlInput.trim()} size="sm" className="h-10 px-4">
                  {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
                </Button>
              </div>
            </>
          )}

          {/* File / Image Upload */}
          {activeTab === "file" && (
            <>
              <div className="rounded-lg bg-muted/50 p-3.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <Info className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  Upload any file or image to check for threats like hidden malware or suspicious content.
                </p>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileDrop} accept="*/*" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Text files, configs, logs, images — any file type</p>
              </div>
              {scanning && (
                <div className="flex items-center gap-2.5 text-sm text-primary p-3 rounded-lg bg-primary/5">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing file for threats...
                </div>
              )}
            </>
          )}

          {/* Barcode Scanner */}
          {activeTab === "barcode" && (
            <>
              <div className="rounded-lg bg-muted/50 p-3.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <Info className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                  Scan a barcode or QR code to check if it leads somewhere dangerous.
                </p>
              </div>
              {!cameraActive ? (
                <div className="space-y-3">
                  <Button onClick={startCamera} variant="outline" size="sm" className="w-full h-10">
                    <Camera className="h-4 w-4 mr-2" /> Open Camera
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">— or type it in —</div>
                  <div className="flex gap-2">
                    <Input
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Paste barcode / QR data..."
                      className="text-sm h-10 bg-muted border-none"
                      onKeyDown={(e) => e.key === "Enter" && scanBarcode(barcodeInput)}
                    />
                    <Button onClick={() => scanBarcode(barcodeInput)} disabled={scanning || !barcodeInput.trim()} size="sm" className="h-10 px-4">
                      {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <video ref={videoRef} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary/60 rounded-xl" />
                    </div>
                  </div>
                  <Button onClick={stopCamera} variant="outline" size="sm" className="w-full h-10">
                    <XCircle className="h-4 w-4 mr-2" /> Stop Camera
                  </Button>
                </div>
              )}
            </>
          )}

          {result && (
            <>
              <ScanResultCard result={result} />
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10"
                onClick={() => exportScanAsPdf(result)}
              >
                <Download className="h-4 w-4 mr-2" /> Download Full Report (PDF)
              </Button>
            </>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Past Scans</h3>
                <Button variant="ghost" size="sm" onClick={refreshHistory} disabled={historyLoading} className="text-xs h-8">
                  {historyLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
                </Button>
              </div>
              {historyLoading && history.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No scans yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Run your first scan to see it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => {
                    const cfg = threatConfig[item.threat_level as keyof typeof threatConfig] || threatConfig.None;
                    const ItemIcon = cfg.icon;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedHistoryItem?.id === item.id ? "border-primary bg-primary/5" : "border-border"
                        }`}
                        onClick={() => setSelectedHistoryItem(selectedHistoryItem?.id === item.id ? null : item)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                            <ItemIcon className={`h-4 w-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.source}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.scan_type}</Badge>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-mono font-bold text-foreground">{item.probability ?? 0}%</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.id); if (selectedHistoryItem?.id === item.id) setSelectedHistoryItem(null); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {selectedHistoryItem?.id === item.id && (
                          <div className="mt-3 pt-3 border-t border-border space-y-3">
                            <ScanResultCard
                              result={{
                                threat_level: item.threat_level,
                                attack_type: item.attack_type ?? "",
                                probability: item.probability ?? 0,
                                mitre_mapping: item.mitre_mapping ?? "",
                                mitigation: item.mitigation ?? "",
                                malicious_indicators: (item.malicious_indicators as string[]) ?? [],
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-9 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportScanAsPdf({
                                  threat_level: item.threat_level,
                                  attack_type: item.attack_type ?? "",
                                  probability: item.probability ?? 0,
                                  mitre_mapping: item.mitre_mapping ?? "",
                                  mitigation: item.mitigation ?? "",
                                  malicious_indicators: (item.malicious_indicators as string[]) ?? [],
                                });
                              }}
                            >
                              <Download className="h-3.5 w-3.5 mr-1.5" /> Download Report
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/* ─── Beginner-Friendly Results Card ─── */

const ScanResultCard: React.FC<{ result: ScanResult }> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);
  const config = threatConfig[result.threat_level as keyof typeof threatConfig] || threatConfig.None;
  const ThreatIcon = config.icon;
  const prob = result.probability ?? 0;

  return (
    <div className="space-y-4">
      {/* Big clear verdict */}
      <div className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`h-12 w-12 rounded-xl ${config.bg} flex items-center justify-center`}>
            <ThreatIcon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <h3 className={`text-lg font-bold ${config.color}`}>{config.label}</h3>
            </div>
            <p className="text-sm text-foreground/80 mt-0.5">{config.summary}</p>
          </div>
        </div>
      </div>

      {/* Risk Score — visual gauge */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-foreground mb-1">Risk Score</h4>
        <p className="text-xs text-muted-foreground mb-3">{getRiskLabel(prob)}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getRiskColor(prob)}`}
              style={{ width: `${prob}%` }}
            />
          </div>
          <span className="text-lg font-bold font-mono text-foreground min-w-[3rem] text-right">{prob}%</span>
        </div>
      </div>

      {/* What was found — plain language */}
      {result.attack_type && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">What We Found</h4>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.attack_type}</p>
        </div>
      )}

      {/* Warning signs — beginner friendly */}
      {result.malicious_indicators && result.malicious_indicators.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold text-foreground">Warning Signs</h4>
          </div>
          <ul className="space-y-2">
            {result.malicious_indicators.map((indicator, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                <span className="leading-relaxed">{indicator}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What to do — actionable advice */}
      {result.mitigation && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">What You Should Do</h4>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.mitigation}</p>
        </div>
      )}

      {/* Technical Details — collapsible */}
      {result.mitre_mapping && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Technical Details (for experts)</span>
            </div>
            {showDetails ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showDetails && (
            <div className="px-4 pb-4 border-t border-border pt-3 space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">MITRE ATT&CK Reference</p>
                <Badge variant="outline" className="font-mono text-xs">{result.mitre_mapping}</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Threat Level Classification</p>
                <Badge variant="outline" className="text-xs">{result.threat_level}</Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScannerPanel;
