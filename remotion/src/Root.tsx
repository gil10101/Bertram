import { Composition } from "remotion";
import { LandingTrailer } from "./compositions/LandingTrailer";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LandingTrailer"
        component={LandingTrailer}
        durationInFrames={45 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
