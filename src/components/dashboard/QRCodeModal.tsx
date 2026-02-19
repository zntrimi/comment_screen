import { Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback } from 'react';

interface QRCodeModalProps {
  url: string;
  sessionName: string;
  onClose: () => void;
}

export function QRCodeModal({ url, sessionName, onClose }: QRCodeModalProps) {
  const handleDownload = useCallback(() => {
    const svg = document.querySelector('#qr-code-svg') as SVGElement | null;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.download = `${sessionName}-qrcode.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [sessionName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">QRコード</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <QRCodeSVG id="qr-code-svg" value={url} size={256} />
        </div>

        <p className="text-center text-xs text-gray-500 mb-4 break-all">{url}</p>

        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            URLをコピー
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
          >
            <Download className="h-4 w-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
