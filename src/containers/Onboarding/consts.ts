export const ONBOARDING = 'onboarding';
export const KNOW_RIVERY = 'know_rivery_step';
export const DATA_CONNECTIONS = 'data_connections_step';
export const DATA_PIPELINE = 'data_pipeline_step';
export const TRANSFORM_AND_ORCHESTRATE = 'transform_and_orchestrate_step';
export const PRE_BUILT_SOLUTIONS = 'pre_built_solutions_step';
export const INVITE_MEMBER = 'invite_member_step';
export const ONBOARDING_RIVERY_INTRODUCTION = `${ONBOARDING}_rivery_introduction`;
export const ONBOARDING_RIVER_TYPES = `${ONBOARDING}_river_types`;
export const ONBOARDING_ADD_CONNECTION = `${ONBOARDING}_add_connection`;
export const ONBOARDING_CREATE_S2T = `${ONBOARDING}_create_s2t`;
export const ONBOARDING_VIEW_ACTIVITIES = `${ONBOARDING}_view_activities`;
export const ONBOARDING_LOGIC_RIVER = `${ONBOARDING}_logic_river`;
export const ONBOARDING_CREATE_LOGIC_RIVER = `${ONBOARDING}_create_logic_river`;
export const ONBOARDING_USE_PYTHON = `${ONBOARDING}_use_python`;
export const ONBOARDING_KITS = `${ONBOARDING}_kits`;
export const ONBOARDING_INVITE = `${ONBOARDING}_invite`;

const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

export const imageSrc = name =>
  `${import.meta.env.VITE_IMAGES_PATH}/onboarding/${
    exoTheme ? `exo-${name}` : name
  }.svg`;
