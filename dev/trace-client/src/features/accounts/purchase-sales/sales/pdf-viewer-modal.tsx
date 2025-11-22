import { useEffect } from 'react';
import { CustomModalDialog } from '../../../../controls/components/custom-modal-dialog';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlobUrl: string | null;
  title?: string;
}

export function PDFViewerModal({ isOpen, onClose, pdfBlobUrl, title = 'Sales Invoice' }: PDFViewerModalProps) {
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const handleDownload = () => {
    if (!pdfBlobUrl) return;

    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!pdfBlobUrl) return;

    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  const customControls = (
    <div className="flex gap-2 mr-4">
      <button
        type="button"
        onClick={handleDownload}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Download
      </button>
      <button
        type="button"
        onClick={handlePrint}
        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Print
      </button>
    </div>
  );

  const pdfContent = (
    <div className="w-full h-full">
      {pdfBlobUrl ? (
        <iframe
          id="pdf-iframe"
          src={pdfBlobUrl}
          className="w-full h-full border-0"
          title={title}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No PDF available</p>
        </div>
      )}
    </div>
  );

  return (
    <CustomModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      element={pdfContent}
      customControl={customControls}
    />
  );
}
