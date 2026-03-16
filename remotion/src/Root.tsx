// === Active Projects (unrendered) ===
import "./index.css";
import { Composition } from "remotion";
import { VideoWithSubtitles as BrainCleaningSleep, TOTAL_FRAMES as BCS_FRAMES } from "./projects/brain_cleaning_sleep/VideoWithSubtitles";
import { VideoWithSubtitles as ChronicPainBrain, TOTAL_FRAMES as CPB_FRAMES } from "./projects/chronic_pain_brain/VideoWithSubtitles";

// Archived (rendered): attention_economy, fake_news_spread, addiction_brain_science,
//   mehrabian_rule, dunning_kruger, skipping_breakfast, placebo_effect, praise_parenting,
//   mozart_effect, brain_lateralization_myth, milgram_reexamination, brain_ten_percent_myth,
//   money_happiness, lactic_acid_myth, subliminal_effect_myth, detox_no_evidence,
//   human_selfishness, food_additive_misconception, photographic_memory_myth,
//   alcohol_sleep_myth, gluten_free_myth, brain_training_myth, sleep_growth_science,
//   spot_reduction_myth, 10000h_rule, iq_intelligence, dopamine_not_pleasure,
//   marshmallow_experiment, multitask, carb_restriction, 10000h_effort,
//   stress_half_myth, blood_type_personality, joint_cracking_arthritis,
//   cold_shower, einstein_grades_myth, concorde_fallacy, memory_reconsolidation,
//   evolution_misconception, confirmation_bias, sleep_debt_myth, free_will,
//   male_female_brain_myth, lie_detector_myth, gut_brain_axis
// Archived (scrapped): diffusion_model

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="brain-cleaning-sleep-video-subtitles"
        component={BrainCleaningSleep}
        durationInFrames={BCS_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="chronic-pain-brain-video-subtitles"
        component={ChronicPainBrain}
        durationInFrames={CPB_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

