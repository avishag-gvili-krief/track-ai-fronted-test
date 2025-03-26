import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

interface MapIframeProps {
  containerId: string | null;
  isFull?: boolean;
  isCompact?: boolean;
  onLoadChange?: (isLoaded: boolean) => void;
}

export default function MapIframe({
  containerId,
  isFull = false,
  isCompact = false,
  onLoadChange,
}: MapIframeProps) {
  const src = containerId
    ? `http://localhost:57677/blazor/mapbox/${containerId}`
    : `http://localhost:57677/blazor/mapbox`;

  useEffect(() => {
    onLoadChange?.(false); // reset loading on URL change
  }, [src]);

  let width = "100%";
  if (!isFull && isCompact) width = "50%";

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        width,
        height: "100%",
        zIndex: 1,
        transition: "width 0.3s ease-in-out",
      }}
    >
      <iframe
        key={src}
        src={src}
        title="Map"
        width="100%"
        height="100%"
        onLoad={() => onLoadChange?.(true)}
        style={{ border: "none" }}
      />
    </Box>
  );
}
