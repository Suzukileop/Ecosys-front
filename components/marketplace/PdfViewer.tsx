'use client';

type PdfViewerProps = {
  signedUrl: string;
  title?: string;
};

export function PdfViewer({ signedUrl, title }: PdfViewerProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {title && (
        <p className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">{title}</p>
      )}
      <iframe
        src={signedUrl}
        title={title ?? 'Document preview'}
        className="h-[70vh] w-full bg-gray-50"
      />
    </div>
  );
}
