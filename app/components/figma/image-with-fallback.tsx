"use client";

import { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Rya2Utd2lkdGg9IjMuNyI+PHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI2Ii8+PHBhdGggZD0ibTE2IDU4IDE2LTE4IDMyIDMyIi8+PGNpcmNsZSBjeD0iNTMiIGN5PSIzNSIgcj0iNyIvPjwvc3ZnPgoK";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function ImageWithFallback({ src, alt, style, className, ...rest }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  if (didError || !src) {
    return (
      <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`} style={style}>
        <div className="flex h-full w-full items-center justify-center">
          <img src={ERROR_IMG_SRC} alt={alt ?? "Error loading image"} {...rest} data-original-url={src} />
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} style={style} onError={() => setDidError(true)} {...rest} />;
}
