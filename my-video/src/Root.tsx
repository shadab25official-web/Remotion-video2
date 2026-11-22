import React from "react";
import { Composition } from "remotion";
import { CatverseReel } from "./Catverse";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CatverseReel"
        component={CatverseReel}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
