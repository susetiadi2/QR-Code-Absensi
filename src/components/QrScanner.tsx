import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { AlertTriangle } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const [hasError, setHasError] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const onScanSuccessRef = useRef(onScanSuccess);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader-custom");
    scannerRef.current = scanner;
    
    let isMounted = true;

    const startScanner = async () => {
      // Delay to avoid double-invocation issues in React Strict Mode
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!isMounted) return;
      
      try {
        setHasError(false);
        await scanner.start(
          { facingMode: facingMode },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().then(() => {
                onScanSuccessRef.current(decodedText);
              }).catch(console.error);
            } else {
              onScanSuccessRef.current(decodedText);
            }
          },
          () => {} // suppress constant frame errors
        );
      } catch (err) {
        if (isMounted) {
          console.error("Camera error:", err);
          setHasError(true);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error);
          }
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
    };
  }, [facingMode]);

  const toggleCamera = (mode: "environment" | "user") => {
    if (facingMode === mode) return;
    setFacingMode(mode);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
      <div className="bg-[#111827] px-6 py-4">
        <h3 className="text-xl font-bold text-white text-center">Scanner</h3>
      </div>
      
      <div className="p-4 flex-1 flex flex-col items-center">
        <div className="w-full aspect-square bg-black rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
          <div id="qr-reader-custom" className="w-full h-full object-cover"></div>
          {/* Overlay corner markers */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/50 rounded-tl-lg pointer-events-none"></div>
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/50 rounded-tr-lg pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/50 rounded-bl-lg pointer-events-none"></div>
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/50 rounded-br-lg pointer-events-none"></div>
          {/* Animated Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.6)] animate-scan pointer-events-none z-10"></div>
        </div>

        {hasError && (
          <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col items-center justify-center mb-4 text-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-sm font-bold text-red-600">Gagal mengakses kamera.</p>
          </div>
        )}

        <div className="w-full grid grid-cols-2 gap-3 mb-3 mt-auto">
          <button 
            onClick={() => toggleCamera("environment")}
            className={`py-3 rounded-lg text-sm font-bold transition flex justify-center items-center ${facingMode === "environment" ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-500'}`}
          >
            Belakang
          </button>
          <button 
            onClick={() => toggleCamera("user")}
            className={`py-3 rounded-lg text-sm font-bold transition flex justify-center items-center ${facingMode === "user" ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-500'}`}
          >
            Depan
          </button>
        </div>

        <button 
          className="w-full py-3 bg-gray-100/80 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-bold transition"
          onClick={() => {
             // Let the parent handle back action or we could reload
             window.history.back();
          }}
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
