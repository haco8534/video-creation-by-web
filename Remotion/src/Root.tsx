import { Composition } from "remotion";
import { VideoWithSubtitles, TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES } from "./projects/10000h_effort/VideoWithSubtitles";
import { VideoWithSubtitles as DiffusionVideo, TOTAL_FRAMES as DIFFUSION_TOTAL_FRAMES } from "./projects/diffusion_model/VideoWithSubtitles";
import { VideoWithSubtitles as MarshmallowVideo, TOTAL_FRAMES as MARSHMALLOW_TOTAL_FRAMES } from "./projects/marshmallow_experiment/VideoWithSubtitles";
import { VideoWithSubtitles as TenKRuleVideo, TOTAL_FRAMES as TENK_RULE_TOTAL_FRAMES } from "./projects/10000h_rule/VideoWithSubtitles";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="10000h-rule-video-subtitles"
        component={TenKRuleVideo}
        durationInFrames={TENK_RULE_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="10000h-video-subtitles"
        component={VideoWithSubtitles}
        durationInFrames={VIDEO_SUB_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="diffusion-model-video-subtitles"
        component={DiffusionVideo}
        durationInFrames={DIFFUSION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="marshmallow-experiment-video-subtitles"
        component={MarshmallowVideo}
        durationInFrames={MARSHMALLOW_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
