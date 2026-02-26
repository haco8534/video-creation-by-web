import { Composition } from "remotion";
import { VideoWithSubtitles, TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES } from "./projects/10000h_effort/VideoWithSubtitles";
import { VideoWithSubtitles as DiffusionVideo, TOTAL_FRAMES as DIFFUSION_TOTAL_FRAMES } from "./projects/diffusion_model/VideoWithSubtitles";
import { VideoWithSubtitles as MarshmallowVideo, TOTAL_FRAMES as MARSHMALLOW_TOTAL_FRAMES } from "./projects/marshmallow_experiment/VideoWithSubtitles";
import { VideoWithSubtitles as TenKRuleVideo, TOTAL_FRAMES as TENK_RULE_TOTAL_FRAMES } from "./projects/10000h_rule/VideoWithSubtitles";
import { VideoWithSubtitles as DunningKrugerVideo, TOTAL_FRAMES as DK_TOTAL_FRAMES } from "./projects/dunning_kruger/VideoWithSubtitles";
import { VideoWithSubtitles as CarbRestrictionVideo, TOTAL_FRAMES as CARB_TOTAL_FRAMES } from "./projects/carb_restriction/VideoWithSubtitles";
import { VideoWithSubtitles as IqIntelligenceVideo, TOTAL_FRAMES as IQ_TOTAL_FRAMES } from "./projects/iq_intelligence/VideoWithSubtitles";
import { VideoWithSubtitles as MultitaskVideo, TOTAL_FRAMES as MULTITASK_TOTAL_FRAMES } from "./projects/multitask/VideoWithSubtitles";
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
      <Composition
        id="dunning-kruger-video-subtitles"
        component={DunningKrugerVideo}
        durationInFrames={DK_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="carb-restriction-video-subtitles"
        component={CarbRestrictionVideo}
        durationInFrames={CARB_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="iq-intelligence-video-subtitles"
        component={IqIntelligenceVideo}
        durationInFrames={IQ_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="multitask-video-subtitles"
        component={MultitaskVideo}
        durationInFrames={MULTITASK_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
