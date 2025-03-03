"use client";

import { useRef } from "react";

interface Portal {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  isSource: boolean;
  pairId: string;
  isBorder?: boolean;
  width?: number;
  height?: number;
}

interface PortalProps {
  portals: Portal[];
  onPortalEffect: (portalId: string, boidId: number) => void;
}

export default function Portals({ portals, onPortalEffect }: PortalProps) {
  return (
    <>
      {portals.map((portal) => {
        if (portal.isBorder && portal.width && portal.height) {
          return (
            <div
              key={portal.id}
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
                zIndex: 5,
                pointerEvents: "none",
                border: `8px solid ${portal.color}`,
                borderRadius: "0px",
              }}
            />
          );
        }

        return (
          <div
            key={portal.id}
            style={{
              position: "absolute",
              left: `${portal.x - portal.radius}px`,
              top: `${portal.y - portal.radius}px`,
              width: `${portal.radius * 2}px`,
              height: `${portal.radius * 2}px`,
              // borderRadius: "50%",
              // background: `radial-gradient(circle, ${portal.color} 0%, ${portal.color}88 70%, transparent 100%)`,
              // boxShadow: `0 0 ${portal.radius / 2}px ${portal.color}55`,
              zIndex: 5,
            }}
          />
        );
      })}
    </>
  );
}
