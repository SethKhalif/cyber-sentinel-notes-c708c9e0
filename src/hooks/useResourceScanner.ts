import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScanResult {
  threat_level: string;
  attack_type: string;
  probability: number;
  mitre_mapping: string;
  mitigation: string;
  malicious_indicators: string[];
}

export function useResourceScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const scanUrl = async (url: string) => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resource", {
        body: { scanType: "url", url },
      });
      if (error) {
        toast.error("Scan failed: " + error.message);
        return;
      }
      setResult(data);
      toast.success("URL scan complete");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const scanFile = async (file: File) => {
    setScanning(true);
    setResult(null);
    try {
      const text = await file.text();
      const { data, error } = await supabase.functions.invoke("analyze-resource", {
        body: { scanType: "file", content: text, fileName: file.name },
      });
      if (error) {
        toast.error("Scan failed: " + error.message);
        return;
      }
      setResult(data);
      toast.success("File scan complete");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const scanImage = async (file: File) => {
    setScanning(true);
    setResult(null);
    try {
      // Convert image to base64 description for analysis
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("analyze-resource", {
        body: {
          scanType: "image",
          content: `Image file: ${file.name}, size: ${file.size} bytes, type: ${file.type}. Base64 preview available.`,
          fileName: file.name,
        },
      });
      if (error) {
        toast.error("Scan failed: " + error.message);
        return;
      }
      setResult(data);
      toast.success("Image scan complete");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const scanBarcode = async (barcodeData: string) => {
    if (!barcodeData.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-resource", {
        body: { scanType: "barcode", content: barcodeData },
      });
      if (error) {
        toast.error("Scan failed: " + error.message);
        return;
      }
      setResult(data);
      toast.success("Barcode scan complete");
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return { scanUrl, scanFile, scanImage, scanBarcode, scanning, result, clearResult: () => setResult(null) };
}
