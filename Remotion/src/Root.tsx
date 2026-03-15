import { Composition } from "remotion";

// === Active Projects (unrendered) ===
import {
  VideoWithSubtitles as StressHalfMythVideo,
  TOTAL_FRAMES as STRESS_HALF_MYTH_TOTAL_FRAMES,
} from "./projects/stress_half_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as BloodTypePersonalityVideo,
  TOTAL_FRAMES as BLOOD_TYPE_TOTAL_FRAMES,
} from "./projects/blood_type_personality/VideoWithSubtitles";
import {
  VideoWithSubtitles as JointCrackingArthritisVideo,
  TOTAL_FRAMES as JOINT_CRACKING_TOTAL_FRAMES,
} from "./projects/joint_cracking_arthritis/VideoWithSubtitles";
import {
  VideoWithSubtitles as ColdShowerVideo,
  TOTAL_FRAMES as COLD_SHOWER_TOTAL_FRAMES,
} from "./projects/cold_shower/VideoWithSubtitles";
import {
  VideoWithSubtitles as EinsteinGradesMythVideo,
  TOTAL_FRAMES as EINSTEIN_GRADES_MYTH_TOTAL_FRAMES,
} from "./projects/einstein_grades_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as ConcordeFallacyVideo,
  TOTAL_FRAMES as CONCORDE_FALLACY_TOTAL_FRAMES,
} from "./projects/concorde_fallacy/VideoWithSubtitles";
import {
  VideoWithSubtitles as MemoryReconsolidationVideo,
  TOTAL_FRAMES as MEMORY_RECONSOLIDATION_TOTAL_FRAMES,
} from "./projects/memory_reconsolidation/VideoWithSubtitles";
import {
  VideoWithSubtitles as EvolutionMisconceptionVideo,
  TOTAL_FRAMES as EVOLUTION_MISCONCEPTION_TOTAL_FRAMES,
} from "./projects/evolution_misconception/VideoWithSubtitles";
import {
  VideoWithSubtitles as ConfirmationBiasVideo,
  TOTAL_FRAMES as CONFIRMATION_BIAS_TOTAL_FRAMES,
} from "./projects/confirmation_bias/VideoWithSubtitles";
import {
  VideoWithSubtitles as SleepDebtMythVideo,
  TOTAL_FRAMES as SLEEP_DEBT_MYTH_TOTAL_FRAMES,
} from "./projects/sleep_debt_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as FreeWillVideo,
  TOTAL_FRAMES as FREE_WILL_TOTAL_FRAMES,
} from "./projects/free_will/VideoWithSubtitles";
import {
  VideoWithSubtitles as MaleFemaleBrainMythVideo,
  TOTAL_FRAMES as MALE_FEMALE_BRAIN_MYTH_TOTAL_FRAMES,
} from "./projects/male_female_brain_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as LieDetectorMythVideo,
  TOTAL_FRAMES as LIE_DETECTOR_MYTH_TOTAL_FRAMES,
} from "./projects/lie_detector_myth/VideoWithSubtitles";
import {
  VideoWithSubtitles as GutBrainAxisVideo,
  TOTAL_FRAMES as GUT_BRAIN_AXIS_TOTAL_FRAMES,
} from "./projects/gut_brain_axis/VideoWithSubtitles";
import "./index.css";

// Archived (rendered): attention_economy, fake_news_spread, addiction_brain_science,
//   mehrabian_rule, dunning_kruger, skipping_breakfast, placebo_effect, praise_parenting,
//   mozart_effect, brain_lateralization_myth, milgram_reexamination, brain_ten_percent_myth,
//   money_happiness, lactic_acid_myth, subliminal_effect_myth, detox_no_evidence,
//   human_selfishness, food_additive_misconception, photographic_memory_myth,
//   alcohol_sleep_myth, gluten_free_myth, brain_training_myth, sleep_growth_science,
//   spot_reduction_myth, 10000h_rule, iq_intelligence, dopamine_not_pleasure,
//   marshmallow_experiment, multitask, carb_restriction, 10000h_effort
// Archived (scrapped): diffusion_model

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="stress-half-myth-video-subtitles"
        component={StressHalfMythVideo}
        durationInFrames={STRESS_HALF_MYTH_TOTAL_FRAMES}
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
        id="joint-cracking-arthritis-video-subtitles"
        component={JointCrackingArthritisVideo}
        durationInFrames={JOINT_CRACKING_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="cold-shower-video-subtitles"
        component={ColdShowerVideo}
        durationInFrames={COLD_SHOWER_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="einstein-grades-myth-video-subtitles"
        component={EinsteinGradesMythVideo}
        durationInFrames={EINSTEIN_GRADES_MYTH_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="concorde-fallacy-video-subtitles"
        component={ConcordeFallacyVideo}
        durationInFrames={CONCORDE_FALLACY_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="memory-reconsolidation-video-subtitles"
        component={MemoryReconsolidationVideo}
        durationInFrames={MEMORY_RECONSOLIDATION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="evolution-misconception-video-subtitles"
        component={EvolutionMisconceptionVideo}
        durationInFrames={EVOLUTION_MISCONCEPTION_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="confirmation-bias-video-subtitles"
        component={ConfirmationBiasVideo}
        durationInFrames={CONFIRMATION_BIAS_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="sleep-debt-myth-video-subtitles"
        component={SleepDebtMythVideo}
        durationInFrames={SLEEP_DEBT_MYTH_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="free-will-video-subtitles"
        component={FreeWillVideo}
        durationInFrames={FREE_WILL_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="male-female-brain-myth-video-subtitles"
        component={MaleFemaleBrainMythVideo}
        durationInFrames={MALE_FEMALE_BRAIN_MYTH_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="lie-detector-myth-video-subtitles"
        component={LieDetectorMythVideo}
        durationInFrames={LIE_DETECTOR_MYTH_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="gut-brain-axis-video-subtitles"
        component={GutBrainAxisVideo}
        durationInFrames={GUT_BRAIN_AXIS_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
