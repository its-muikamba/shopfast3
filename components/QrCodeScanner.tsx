
import React, { useRef, useEffect, useState } from 'react';
import { XIcon } from './Icons';

interface QrCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const scanLoop = async (barcodeDetector: any, videoEl: HTMLVideoElement) => {
      try {
        const barcodes = await barcodeDetector.detect(videoEl);
        if (barcodes.length > 0) {
          onScanSuccess(barcodes[0].rawValue);
        } else {
          animationFrameId = requestAnimationFrame(() => scanLoop(barcodeDetector, videoEl));
        }
      } catch (e) {
        console.error('Detection failed:', e);
        // Continue scanning even if one frame fails
        animationFrameId = requestAnimationFrame(() => scanLoop(barcodeDetector, videoEl));
      }
    };

    const startCamera = async () => {
      // Use of @ts-ignore is necessary because BarcodeDetector is not yet in the default TS DOM library.
      // @ts-ignore
      if (!('BarcodeDetector' in window) || !window.BarcodeDetector) {
        setError('QR code scanning is not supported by your browser.');
        return;
      }

      if (!videoRef.current) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        const videoEl = videoRef.current;
        videoEl.srcObject = stream;
        await videoEl.play();

        // @ts-ignore
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        scanLoop(barcodeDetector, videoEl);

      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access the camera. Please check permissions.');
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center" aria-modal="true" role="dialog">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-8 pointer-events-none">
        <div className="w-full max-w-xs aspect-square border-4 border-dashed border-white/70 rounded-2xl shadow-lg" />
        <p className="text-white mt-6 text-center font-medium bg-black/30 px-4 py-2 rounded-lg">
            Point the camera at a QR code
        </p>
        {error && <p className="text-red-300 mt-4 bg-black/50 p-3 rounded-lg text-sm max-w-sm text-center">{error}</p>}
      </div>
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 bg-black/50 rounded-full p-3 text-white hover:bg-black/70 transition-colors"
        aria-label="Close scanner"
      >
        <XIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default QrCodeScanner;
