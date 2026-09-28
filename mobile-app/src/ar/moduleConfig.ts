export interface ArObjectConfig {
  tagId: string;
  shape: 'box' | 'sphere';
  colorHex: string;
  offset: [number, number, number]; // metres relative to the tapped point
  /** Immediate feedback correctness during Guided/Independent Practice — a
   * practice interaction, independent from the graded ar_task question below. */
  practiceCorrect: boolean;
}

export interface ModuleArConfig {
  moduleId: string;
  objects: ArObjectConfig[];
  /** Which question in the module's question bank is graded via an AR tap
   * (see backend/src/seed/*.data.js — the single `ar_task` question per module). */
  arTaskQuestionId: string;
  arTaskCorrectTagId: string;
  guidedHintKey: string;
}

// Simple primitives (box/sphere), not photorealistic 3D — functionality over
// graphics, per the brief. Fire hazard uses a red sphere; extinguishers are
// boxes; exits/hazard-zone markers are boxes coloured green (correct) / grey
// (incorrect) so the demo reads clearly on a phone screen.
export const FIRE_MODULE_AR_CONFIG: ModuleArConfig = {
  moduleId: 'fire-explosion',
  arTaskQuestionId: 'fire-q6',
  arTaskCorrectTagId: 'exit_a',
  guidedHintKey: 'identify_hazard_prompt',
  objects: [
    { tagId: 'fire', shape: 'sphere', colorHex: '#FF4D00', offset: [0, 0.1, 0], practiceCorrect: true },
    { tagId: 'co2_dcp', shape: 'box', colorHex: '#D32F2F', offset: [0.4, 0.1, 0], practiceCorrect: true },
    { tagId: 'water', shape: 'box', colorHex: '#1565C0', offset: [-0.4, 0.1, 0], practiceCorrect: false },
    { tagId: 'exit_a', shape: 'box', colorHex: '#2E7D32', offset: [0, 0.1, 0.6], practiceCorrect: true },
    { tagId: 'exit_b', shape: 'box', colorHex: '#757575', offset: [0.3, 0.1, -0.6], practiceCorrect: false },
  ],
};

export const GAS_MODULE_AR_CONFIG: ModuleArConfig = {
  moduleId: 'gas-confined-space',
  arTaskQuestionId: 'gas-q7',
  arTaskCorrectTagId: 'hazard_zone',
  guidedHintKey: 'hazard_zone_prompt',
  objects: [
    { tagId: 'confined_space', shape: 'box', colorHex: '#616161', offset: [0, 0.1, 0], practiceCorrect: true },
    { tagId: 'gas_indicator', shape: 'sphere', colorHex: '#FDD835', offset: [0, 0.2, 0.2], practiceCorrect: true },
    { tagId: 'hazard_zone', shape: 'box', colorHex: '#2E7D32', offset: [0.5, 0.1, 0], practiceCorrect: true },
    { tagId: 'open_walkway', shape: 'box', colorHex: '#757575', offset: [-0.5, 0.1, 0], practiceCorrect: false },
    { tagId: 'scba', shape: 'sphere', colorHex: '#00ACC1', offset: [0.3, 0.1, 0.5], practiceCorrect: true },
    { tagId: 'sunglasses', shape: 'sphere', colorHex: '#8E24AA', offset: [-0.3, 0.1, 0.5], practiceCorrect: false },
    { tagId: 'attendant', shape: 'box', colorHex: '#1565C0', offset: [0, 0.1, -0.5], practiceCorrect: true },
  ],
};

export function getModuleArConfig(moduleId: string): ModuleArConfig {
  return moduleId === 'gas-confined-space' ? GAS_MODULE_AR_CONFIG : FIRE_MODULE_AR_CONFIG;
}
