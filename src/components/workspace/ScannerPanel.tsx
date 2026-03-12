import React, { useState, useRef, useCallback, useEffect } from "react";
import { useResourceScanner, ScanResult } from "@/hooks/useResourceScanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Globe, Upload, Camera, ScanBarcode, Loader2, Shield, AlertTriangle,
  Target, Percent, BookOpen, Wrench, XCircle, FileUp, Image as ImageIcon,
} from "lucide-react";

const ScannerPanel: React.FC = () => {
  const { scanUrl, scanFile, scanImage, scanBarcode, scanning, result, clearResult } = useResourceScanner();
  const [urlInput, setUrlInput] = useState("");
  const [activeTab, setActiveTab] = useState<"url" | "file" | "barcode">("url");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlScan = () => {
    if (!urlInput.trim()) return;
    let url = urlInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    scanUrl(url);
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      scanImage(file);
    } else {
      scanFile(file);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      // Fallback to manual input
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Barcode detection using BarcodeDetector API if available
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;
    let running = true;

    const detectBarcode = async () => {
      if (!running || !videoRef.current) return;
      try {
        if ("BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector();
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const value = barcodes[0].rawValue;
            setBarcodeInput(value);
            stopCamera();
            scanBarcode(value);
            return;
          }
        }
      } catch {
        // BarcodeDetector not supported
      }
      if (running) {
        requestAnimationFrame(detectBarcode);
      }
    };

    const timer = setTimeout(detectBarcode, 500);
    return () => {
      running = false;
      clearTimeout(timer);
    };
  }, [cameraActive, stopCamera, scanBarcode]);

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  const tabs = [
    { key: "url" as const, icon: Globe, label: "URL" },
    { key: "file" as const, icon: FileUp, label: "File/Image" },
    { key: "barcode" as const, icon: ScanBarcode, label: "Barcode" },
  ];

  return (
    <div className="flex-1 flex flex-col border-r border-border bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <h2 className="font-sans font-semibold text-foreground text-sm">Threat Scanner</h2>
        </div>
        {/* Tab selection */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => { setActiveTab(tab.key); clearResult(); }}
            >
              <tab.icon className="h-3 w-3 mr-1" /> {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* URL Scanner */}
          {activeTab === "url" && (
            <>
              <p className="text-xs text-muted-foreground">
                Enter a URL to scan for phishing, malware, and suspicious content with MITRE ATT&CK mapping.
              </p>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://suspicious-site.com"
                  className="text-sm bg-muted border-none"
                  onKeyDown={(e) => e.key === "Enter" && handleUrlScan()}
                />
                <Button onClick={handleUrlScan} disabled={scanning || !urlInput.trim()} size="sm">
                  {scanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
                </Button>
              </div>
            </>
          )}

          {/* File/Image Upload */}
          {activeTab === "file" && (
            <>
              <p className="text-xs text-muted-foreground">
                Upload a file or image to scan for threats, malware indicators, and suspicious content.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileDrop}
                accept="*/*"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click to upload a file or image</p>
                <p className="text-[10px] text-muted-foreground mt-1">Supports text files, configs, logs, images</p>
              </div>
              {scanning && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" /> Scanning file...
                </div>
              )}
            </>
          )}

          {/* Barcode Scanner */}
          {activeTab === "barcode" && (
            <>
              <p className="text-xs text-muted-foreground">
                Scan a barcode or QR code to analyze its data for threats. Use the camera or enter data manually.
              </p>
              {!cameraActive ? (
                <div className="space-y-3">
                  <Button onClick={startCamera} variant="outline" size="sm" className="w-full">
                    <Camera className="h-3 w-3 mr-2" /> Open Camera Scanner
                  </Button>
                  <div className="text-center text-[10px] text-muted-foreground">or enter manually</div>
                  <div className="flex gap-2">
                    <Input
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Paste barcode/QR data..."
                      className="text-sm bg-muted border-none"
                      onKeyDown={(e) => e.key === "Enter" && scanBarcode(barcodeInput)}
                    />
                    <Button onClick={() => scanBarcode(barcodeInput)} disabled={scanning || !barcodeInput.trim()} size="sm">
                      {scanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <ScanBarcode className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <video ref={videoRef} className="w-full aspect-video object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary/60 rounded-lg" />
                    </div>
                  </div>
                  <Button onClick={stopCamera} variant="outline" size="sm" className="w-full">
                    <XCircle className="h-3 w-3 mr-2" /> Stop Camera
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Point camera at barcode or QR code
                  </p>
                </div>
              )}
            </>
          )}

          {/* Results Display */}
          {result && <ScanResultCard result={result} />}
        </div>
      </ScrollArea>
    </div>
  );
};

const ScanResultCard: React.FC<{ result: ScanResult }> = ({ result }) => {
  const isHigh = result.threat_level === "High" || result.threat_level === "Critical";

  return (
    <div className={`border rounded-lg p-4 space-y-4 ${isHigh ? "border-destructive/50 bg-destructive/5" : "border-border"}`}>
      <div className="flex items-center gap-2">
        <Shield className={`h-4 w-4 ${isHigh ? "text-destructive" : "text-primary"}`} />
        <span className="font-semibold text-sm text-foreground">Scan Results</span>
      </div>

      {/* Threat Level */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
          <AlertTriangle className="h-3 w-3" /> Threat Level
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${isHigh ? "text-destructive" : "text-muted-foreground"}`}>
          {result.threat_level}
        </span>
      </div>

      {/* Attack Type */}
      {result.attack_type && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
            <Target className="h-3 w-3" /> Attack Type
          </div>
          <p className="text-xs text-foreground">{result.attack_type}</p>
        </div>
      )}

      {/* Probability */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
          <Percent className="h-3 w-3" /> Attack Probability
        </div>
        <div className="flex items-center gap-3">
          <Progress value={result.probability} className="h-1.5 flex-1" />
          <span className="text-xs font-mono text-foreground">{result.probability}%</span>
        </div>
      </div>

      {/* MITRE */}
      {result.mitre_mapping && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
            <BookOpen className="h-3 w-3" /> MITRE ATT&CK
          </div>
          <p className="text-xs text-primary font-mono">{result.mitre_mapping}</p>
        </div>
      )}

      {/* Malicious Indicators */}
      {result.malicious_indicators && result.malicious_indicators.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
            <XCircle className="h-3 w-3" /> Indicators
          </div>
          <ul className="space-y-1">
            {result.malicious_indicators.map((indicator, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                <span className="text-destructive mt-0.5">•</span>
                {indicator}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mitigation */}
      {result.mitigation && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
            <Wrench className="h-3 w-3" /> Mitigation
          </div>
          <p className="text-xs text-foreground leading-relaxed">{result.mitigation}</p>
        </div>
      )}
    </div>
  );
};

export default ScannerPanel;
