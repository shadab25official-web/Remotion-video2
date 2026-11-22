import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type SceneConfig = {
  id: string;
  image: string;
  audio: string;
  durationInSeconds: number;
  motion: "zoomIn" | "zoomOut" | "panRight" | "panLeft";
};

// Apni har audio clip ki asli length (seconds me) yahan adjust kar lena:
export const CATVERSE_SCENES: SceneConfig[] = [
  { id: "1", image: "p1.jpg", audio: "s1.mp3", durationInSeconds: 10, motion: "zoomIn" },
  { id: "2", image: "p2.webp", audio: "s2.mp3", durationInSeconds: 5, motion: "panRight" },
  { id: "3a", image: "p3.webp", audio: "s3.mp3", durationInSeconds: 3, motion: "panLeft" },
  { id: "3b", image: "p4.webp", audio: "s4.mp3", durationInSeconds: 3, motion: "zoomIn" },
  { id: "3c", image: "p5.webp", audio: "s5.mp3", durationInSeconds: 3, motion: "panRight" },
  { id: "4", image: "p6.webp", audio: "s6.mp3", durationInSeconds: 6, motion: "zoomOut" },
  { id: "5", image: "p7.webp", audio: "s7.mp3", durationInSeconds: 15, motion: "panLeft" },
  { id: "6", image: "p8.webp", audio: "s8.mp3", durationInSeconds: 15, motion: "zoomIn" },
];

const AliveScene: React.FC<{ scene: SceneConfig }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  let scale = 1.04;
  let translateX = 0;

  if (scene.motion === "zoomIn") {
    scale = interpolate(frame, [0, durationInFrames], [1.02, 1.13], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (scene.motion === "zoomOut") {
    scale = interpolate(frame, [0, durationInFrames], [1.14, 1.03], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (scene.motion === "panRight") {
    scale = 1.1;
    translateX = interpolate(frame, [0, durationInFrames], [-28, 28], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (scene.motion === "panLeft") {
    scale = 1.1;
    translateX = interpolate(frame, [0, durationInFrames], [28, -28], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // Organic breathing & subtle sway
  const breathingY = Math.sin(frame * 0.08) * 6;
  const microTilt = Math.sin(frame * 0.05) * 0.35;

  // Golden-amber moody light pulse
  const amberPulse = interpolate(
    Math.sin(frame * 0.09),
    [-1, 1],
    [0.08, 0.22]
  );

  const opacity = interpolate(
    frame,
    [0, 8, Math.max(9, durationInFrames - 8), durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#090706",
        opacity,
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile(scene.audio)} />

      <Img
        src={staticFile(scene.image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate3d(${translateX}px, ${breathingY}px, 0) scale(${scale}) rotate(${microTilt}deg)`,
          transformOrigin: "center center",
        }}
      />

      {/* Warm golden-amber light pulse */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(255, 176, 66, 0.45) 0%, rgba(120, 58, 12, 0.14) 55%, rgba(0, 0, 0, 0.65) 100%)",
          opacity: amberPulse,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* Moody edge vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle, transparent 52%, rgba(0, 0, 0, 0.72) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const CatverseReel: React.FC = () => {
  const { fps } = useVideoConfig();
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {CATVERSE_SCENES.map((scene) => {
        const from = currentFrame;
        const durationInFrames = Math.max(
          1,
          Math.round(scene.durationInSeconds * fps)
        );
        currentFrame += durationInFrames;

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={durationInFrames}
          >
            <AliveScene scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
          
