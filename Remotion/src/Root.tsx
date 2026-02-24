import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { MathLayoutShowcase } from "./projects/test/MathLayoutShowcase";
import { AccumulateDemo } from "./projects/demo/AccumulateDemo";
import { DataBasicsVideo, TOTAL_FRAMES } from "./projects/data_basics/index";
import { ComponentShowcaseVideo } from "./projects/component_showcase/index";
import { TenThousandHoursEffort, TOTAL_FRAMES as EFFORT_TOTAL_FRAMES } from "./projects/10000h_effort/index";
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
      <Composition
        id="10000h-effort"
        component={TenThousandHoursEffort}
        durationInFrames={EFFORT_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="data-basics"
        component={DataBasicsVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="component-showcase"
        component={ComponentShowcaseVideo}
        durationInFrames={610}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AccumulateDemo"
        component={AccumulateDemo}
        durationInFrames={400}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LayoutCheck"
        component={MathLayoutShowcase}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
