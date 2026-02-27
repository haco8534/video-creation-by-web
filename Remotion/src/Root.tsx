import { Composition } from "remotion";
import {
  VideoWithSubtitles,
  TOTAL_FRAMES as VIDEO_SUB_TOTAL_FRAMES,
} from "./projects/10000h_effort/VideoWithSubtitles";

import {
  VideoWithSubtitles as MarshmallowVideo,
  TOTAL_FRAMES as MARSHMALLOW_TOTAL_FRAMES,
} from "./projects/marshmallow_experiment/VideoWithSubtitles";
import {
  VideoWithSubtitles as TenKRuleVideo,
  TOTAL_FRAMES as TENK_RULE_TOTAL_FRAMES,
} from "./projects/10000h_rule/VideoWithSubtitles";
import {
  VideoWithSubtitles as DunningKrugerVideo,
  TOTAL_FRAMES as DK_TOTAL_FRAMES,
} from "./projects/dunning_kruger/VideoWithSubtitles";
import {
  VideoWithSubtitles as CarbRestrictionVideo,
  TOTAL_FRAMES as CARB_TOTAL_FRAMES,
} from "./projects/carb_restriction/VideoWithSubtitles";
import {
  VideoWithSubtitles as IqIntelligenceVideo,
  TOTAL_FRAMES as IQ_TOTAL_FRAMES,
} from "./projects/iq_intelligence/VideoWithSubtitles";
import {
  VideoWithSubtitles as MultitaskVideo,
  TOTAL_FRAMES as MULTITASK_TOTAL_FRAMES,
} from "./projects/multitask/VideoWithSubtitles";
import {
  VideoWithSubtitles as DopamineVideo,
  TOTAL_FRAMES as DOPAMINE_TOTAL_FRAMES,
} from "./projects/dopamine_not_pleasure/VideoWithSubtitles";
import {
  VideoWithSubtitles as AttentionEconomyVideo,
  TOTAL_FRAMES as ATTENTION_TOTAL_FRAMES,
} from "./projects/attention_economy/VideoWithSubtitles";
import {
  VideoWithSubtitles as SkippingBreakfastVideo,
  TOTAL_FRAMES as BREAKFAST_TOTAL_FRAMES,
} from "./projects/skipping_breakfast/VideoWithSubtitles";
import {
  VideoWithSubtitles as PlaceboEffectVideo,
  TOTAL_FRAMES as PLACEBO_TOTAL_FRAMES,
} from "./projects/placebo_effect/VideoWithSubtitles";
import {
  VideoWithSubtitles as PraiseParentingVideo,
  TOTAL_FRAMES as PRAISE_TOTAL_FRAMES,
} from "./projects/praise_parenting/VideoWithSubtitles";
import {
  VideoWithSubtitles as MozartEffectVideo,
  TOTAL_FRAMES as MOZART_TOTAL_FRAMES,
} from "./projects/mozart_effect/VideoWithSubtitles";
import {
  VideoWithSubtitles as FakeNewsSpreadVideo,
  TOTAL_FRAMES as FAKE_NEWS_TOTAL_FRAMES,
} from "./projects/fake_news_spread/VideoWithSubtitles";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="attention-economy-video-subtitles"
        component={AttentionEconomyVideo}
        durationInFrames={ATTENTION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="fake-news-spread-video-subtitles"
        component={FakeNewsSpreadVideo}
        durationInFrames={FAKE_NEWS_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
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
      <Composition
        id="dopamine-not-pleasure-video-subtitles"
        component={DopamineVideo}
        durationInFrames={DOPAMINE_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="skipping-breakfast-video-subtitles"
        component={SkippingBreakfastVideo}
        durationInFrames={BREAKFAST_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="placebo-effect-video-subtitles"
        component={PlaceboEffectVideo}
        durationInFrames={PLACEBO_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="praise-parenting-video-subtitles"
        component={PraiseParentingVideo}
        durationInFrames={PRAISE_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="mozart-effect-video-subtitles"
        component={MozartEffectVideo}
        durationInFrames={MOZART_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
