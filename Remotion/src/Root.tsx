import { Composition } from "remotion";
import { VideoWithSubtitles, TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES } from "./projects/10000h_effort/VideoWithSubtitles";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="10000h-video-subtitles"
        component={VideoWithSubtitles}
        durationInFrames={VIDEO_SUB_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
