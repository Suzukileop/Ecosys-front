'use client';

type SecureMediaPlayerProps = {
  signedUrl: string;
  mediaType: 'video' | 'audio';
  title?: string;
};

export function SecureMediaPlayer({ signedUrl, mediaType, title }: SecureMediaPlayerProps) {
  if (mediaType === 'audio') {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        {title && <p className="mb-3 text-sm font-semibold text-gray-900">{title}</p>}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          controls
          controlsList="nodownload"
          preload="metadata"
          className="w-full"
          src={signedUrl}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-black shadow-sm">
      {title && (
        <p className="border-b border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-white">
          {title}
        </p>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        controls
        controlsList="nodownload"
        preload="metadata"
        className="aspect-video w-full"
        src={signedUrl}
      />
    </div>
  );
}
