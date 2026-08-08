import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, QrCode, Sparkles, Camera, CheckCircle2, Package, Search } from "lucide-react";
import { VIRTUAL_BARCODE_DATABASE } from "../utils/sampleData";
import { BarcodeProduct, CategoryType, CURRENCIES, CurrencyConfig } from "../types";
import { sounds } from "../utils/soundEffects";
import confetti from "canvas-confetti";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedItem: (item: {
    name: string;
    price: number;
    quantity: number;
    category: CategoryType;
    unit: string;
    barcode?: string;
  }) => void;
  currency: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScannedItem,
  currency,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scannedResult, setScannedResult] = useState<BarcodeProduct | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const currentCurr: CurrencyConfig = CURRENCIES[currency] || CURRENCIES.PKR;

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError("");
    setCameraActive(true);

    try {
      const html5Qrcode = new Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleBarcodeFound(decodedText);
          stopCamera();
        },
        (errorMessage) => {
          // ignore scan frame errors
        }
      );
    } catch (err: any) {
      setCameraError("Could not access camera. Please allow camera access or use the barcode simulator below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
        })
        .catch(() => {});
    }
    setCameraActive(false);
  };

  const handleBarcodeFound = (code: string) => {
    sounds.playCashRegister();

    // Check database
    const found = VIRTUAL_BARCODE_DATABASE.find((p) => p.barcode === code);
    if (found) {
      setScannedResult(found);
      onScannedItem({
        name: found.name,
        price: found.price,
        quantity: 1,
        category: found.category,
        unit: found.unit,
        barcode: found.barcode,
      });

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    } else {
      // Unknown barcode - create default fallback
      const newItem = {
        name: `Scanned Item #${code.slice(-4)}`,
        price: 250,
        quantity: 1,
        category: "Other" as CategoryType,
        unit: "pack",
        barcode: code,
      };
      onScannedItem(newItem);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeFound(manualCode.trim());
    setManualCode("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-lg rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-extrabold text-slate-100">Smart Barcode Scanner</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-indigo-500/20 text-center flex flex-col items-center justify-center min-h-[220px]">
          {cameraActive ? (
            <div className="w-full flex flex-col items-center">
              <div id="reader" className="w-full max-w-xs overflow-hidden rounded-xl border border-indigo-500/40"></div>
              <button
                onClick={stopCamera}
                className="mt-3 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 transition-all"
              >
                Stop Camera
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Point Camera at Product Barcode</h3>
                <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                  Scans automatically and adds the product with real prices!
                </p>
              </div>
              <button
                onClick={startCamera}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Start Camera Scan
              </button>
              {cameraError && <p className="text-[11px] text-rose-400 mt-1">{cameraError}</p>}
            </div>
          )}
        </div>

        {/* Manual Code Input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Type barcode digits manually (e.g. 896400010011)..."
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Lookup
          </button>
        </form>

        {/* Virtual Barcode Simulator Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>⚡ Virtual Barcode Test Simulator</span>
            <span className="text-[10px] text-slate-500">(Click to test barcode scan)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VIRTUAL_BARCODE_DATABASE.map((prod) => (
              <button
                key={prod.barcode}
                onClick={() => handleBarcodeFound(prod.barcode)}
                className="bg-slate-800/80 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/40 p-2.5 rounded-xl text-left transition-all cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    {prod.barcode.slice(-6)}
                  </span>
                  <Package className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                </div>
                <div className="text-xs font-bold text-slate-200 mt-1 truncate">{prod.name}</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                  {currentCurr.symbol} {prod.price} / {prod.unit}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
