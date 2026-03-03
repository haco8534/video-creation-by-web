import { Composition } from "remotion";

// === Active Projects ===
import {
  VideoWithSubtitles as AttentionEconomyVideo,
  TOTAL_FRAMES as ATTENTION_TOTAL_FRAMES,
} from "./projects/attention_economy/VideoWithSubtitles";
import {
  VideoWithSubtitles as FakeNewsSpreadVideo,
  TOTAL_FRAMES as FAKE_NEWS_TOTAL_FRAMES,
} from "./projects/fake_news_spread/VideoWithSubtitles";
import {
  VideoWithSubtitles as AddictionBrainScienceVideo,
  TOTAL_FRAMES as ADDICTION_TOTAL_FRAMES,
} from "./projects/addiction_brain_science/VideoWithSubtitles";
import {
  VideoWithSubtitles as MehrabianRuleVideo,
  TOTAL_FRAMES as MEHRABIAN_TOTAL_FRAMES,
} from "./projects/mehrabian_rule/VideoWithSubtitles";
import {
  VideoWithSubtitles as DunningKrugerVideo,
  TOTAL_FRAMES as DK_TOTAL_FRAMES,
} from "./projects/dunning_kruger/VideoWithSubtitles";
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
  VideoWithSubtitles as BrainLateralizationMythVideo,
  TOTAL_FRAMES as BRAIN_LATERALIZATION_TOTAL_FRAMES,
} from "./projects/brain_lateralization_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as MilgramReexaminationVideo,
  TOTAL_FRAMES as MILGRAM_TOTAL_FRAMES,
} from "./projects/milgram_reexamination/VideoWithSubtitles";
import {
  VideoWithSubtitles as BrainTenPercentMythVideo,
  TOTAL_FRAMES as BRAIN_TEN_PERCENT_TOTAL_FRAMES,
} from "./projects/brain_ten_percent_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as StressHalfMythVideo,
  TOTAL_FRAMES as STRESS_HALF_MYTH_TOTAL_FRAMES,
} from "./projects/stress_half_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as MoneyHappinessVideo,
  TOTAL_FRAMES as MONEY_HAPPINESS_TOTAL_FRAMES,
} from "./projects/money_happiness/VideoWithSubtitles";
import {
  VideoWithSubtitles as BloodTypePersonalityVideo,
  TOTAL_FRAMES as BLOOD_TYPE_TOTAL_FRAMES,
} from "./projects/blood_type_personality/VideoWithSubtitles";
import {
  VideoWithSubtitles as LacticAcidMythVideo,
  TOTAL_FRAMES as LACTIC_ACID_TOTAL_FRAMES,
} from "./projects/lactic_acid_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as SubliminalEffectMythVideo,
  TOTAL_FRAMES as SUBLIMINAL_TOTAL_FRAMES,
} from "./projects/subliminal_effect_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as DetoxNoEvidenceVideo,
  TOTAL_FRAMES as DETOX_TOTAL_FRAMES,
} from "./projects/detox_no_evidence/VideoWithSubtitles";
import {
  VideoWithSubtitles as HumanSelfishnessVideo,
  TOTAL_FRAMES as HUMAN_SELFISHNESS_TOTAL_FRAMES,
} from "./projects/human_selfishness/VideoWithSubtitles";
import {
  VideoWithSubtitles as FoodAdditiveMisconceptionVideo,
  TOTAL_FRAMES as FOOD_ADDITIVE_TOTAL_FRAMES,
} from "./projects/food_additive_misconception/VideoWithSubtitles";
import "./index.css";

// Archived (rendered): 10000h_rule, iq_intelligence, dopamine_not_pleasure,
//   marshmallow_experiment, multitask, carb_restriction, 10000h_effort
// Archived (scrapped): diffusion_model

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
        id="addiction-brain-science-video-subtitles"
        component={AddictionBrainScienceVideo}
        durationInFrames={ADDICTION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="mehrabian-rule-video-subtitles"
        component={MehrabianRuleVideo}
        durationInFrames={MEHRABIAN_TOTAL_FRAMES}
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

      <Composition
        id="brain-lateralization-myth-video-subtitles"
        component={BrainLateralizationMythVideo}
        durationInFrames={BRAIN_LATERALIZATION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="milgram-reexamination-video-subtitles"
        component={MilgramReexaminationVideo}
        durationInFrames={MILGRAM_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="brain-ten-percent-myth-video-subtitles"
        component={BrainTenPercentMythVideo}
        durationInFrames={BRAIN_TEN_PERCENT_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="stress-half-myth-video-subtitles"
        component={StressHalfMythVideo}
        durationInFrames={STRESS_HALF_MYTH_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="money-happiness-video-subtitles"
        component={MoneyHappinessVideo}
        durationInFrames={MONEY_HAPPINESS_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="blood-type-personality-video-subtitles"
        component={BloodTypePersonalityVideo}
        durationInFrames={BLOOD_TYPE_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="lactic-acid-myth-video-subtitles"
        component={LacticAcidMythVideo}
        durationInFrames={LACTIC_ACID_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="subliminal-effect-myth-video-subtitles"
        component={SubliminalEffectMythVideo}
        durationInFrames={SUBLIMINAL_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="detox-no-evidence-video-subtitles"
        component={DetoxNoEvidenceVideo}
        durationInFrames={DETOX_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="human-selfishness-video-subtitles"
        component={HumanSelfishnessVideo}
        durationInFrames={HUMAN_SELFISHNESS_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="food-additive-misconception-video-subtitles"
        component={FoodAdditiveMisconceptionVideo}
        durationInFrames={FOOD_ADDITIVE_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
