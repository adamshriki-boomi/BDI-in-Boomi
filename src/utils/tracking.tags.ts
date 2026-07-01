export const ActivitiesTags = {
  VIEW_PAGE: 'view_page_activities',
  SEARCH_RIVER_BY_NAME: 'activities-search-input',
  SEARCH_RIVER_BY_TYPE: 'activities-rivertype-dropdown',
  SEARCH_RIVER_BY_STATUS: 'activities-status-dropdown',
  SEARCH_INNER_RIVER_BY_STATUS: `activities_inner_page_status`,
  SEARCH_RIVER_BY_GROUP: 'activities-groups-dropdown',
  SEARCH_RIVER_BY_DATE: 'activities-date-datepicker',
  SEARCH_INNER_RIVER_BY_DATE: `activities_inner_page_date`,
  CLEAR_BUTTON_CLICK: 'activities-clear-button',
  INNER_CLEAR_BUTTON_CLICK: 'activities_inner_page_clear_button',
  REFRESH_BUTTON_CLICK: 'activities-refresh-button',
  INNER_REFRESH_BUTTON_CLICK: 'activities_inner_page_refresh_button',
  SORT_BY_NAME: 'activities_sort_name',
  SORT_BY_RPU: 'activities_sort_rpu',
  SORT_BY_DATE_INNER: 'activities_inner_page_sort_by_date',
  SORT_BY_DURATION_INNER: 'activities_inner_page_sort_by_duration',
  SORT_BY_RPU_INNER: 'activities_inner_page_sort_by_rpu',
  GO_TO_RIVER_ACTION: 'activities_main_goto_river',
  GO_TO_ACTIVITIES_ACTION: 'activities_main_view_activities',
  RETRY_BUTTON_CLICKED: 'activities_inner_page_retry',
  CANCEL_BUTTON_CLICKED: 'activities_inner_page_cancel',
  OPEN_INNER_RUN_DRAWER_LOGIC: 'activities_run_info_table_click_logic',
  OPEN_INNER_RUN_DRAWER_S2T: 'activities_run_info_table_click_s2t',
  DOWNLOAD_LOGIC_LOG: 'activities_logic_inner_page_download_button',
  DOWNLOAD_PYTHON_LOG: 'activities_logic_inner_page_download_python_button',
  DOWNLOAD_ACTION_LOG: 'activities_action_inner_page_download_button',
  DOWNLOAD_S2T_LOG: 'activities_s2t_inner_page_download_button',
};

// Environments Tags
export const EnvironmentsTags = {
  MANAGER_TAB: 'environments-manager-tab',
  DEPLOYMENTS_TAB: 'environments-deployments-tab',
  VARIABLES_TAB: 'environments-variables-tab',
  SETTINGS_TAB: 'environments-settings-tab',
  ADD_ENVIRONMENT_BUTTON: 'environments-addenvironment-button',
  SEARCH_INPUT: 'environments-search-input',
};

// Sidebar / Global Tags
export const SidebarTags = {
  ASK_AI_BUTTON: 'sidebar-askai-button',
  CREATE_BUTTON: 'sidebar-create-button',
  BLUEPRINTS_LINK: 'sidebar-blueprints-link',
  CONNECTIONS_LINK: 'sidebar-connections-link',
  VARIABLES_LINK: 'sidebar-variables-link',
  WHATS_NEW_BUTTON: 'sidebar-whatsnew-button',
};

// Blueprints Tags
export const BlueprintsTags = {
  SEARCH_INPUT: 'blueprints-search-input',
  ADD_BLUEPRINT_BUTTON: 'blueprints-addblueprint-button',
  EDIT_YAML_BUILDER_BUTTON: 'blueprints-edit-yamlbuilder-button',
  EDIT_YAML_TEMPLATE_DROPDOWN: 'blueprints-edit-yamltemplate-dropdown',
  EDIT_TEST_BLUEPRINT_BUTTON: 'blueprints-edit-testblueprint-button',
  EDIT_APPLY_CHANGES_BUTTON: 'blueprints-edit-applychanges-button',
  EDIT_CANCEL_BUTTON: 'blueprints-edit-cancel-button',
  VALIDATE_BUTTON: 'blueprints-validate-button',
  CREATE_SOURCE_TO_TARGET_BUTTON: 'blueprints-createsourcetotarget-button',
  DO_IT_LATER_BUTTON: 'blueprints-doitlater-button',
};

// Rivers Tags
export const RiversTags = {
  ADD_RIVER_BUTTON: 'rivers-addriver-button',
  LIST_TAB: 'rivers-list-tab',
  GROUPS_TAB: 'rivers-groups-tab',
  SEARCH_INPUT: 'rivers-search-input',
  RIVER_TYPE_DROPDOWN: 'rivers-rivertype-dropdown',
  RIVER_GROUP_DROPDOWN: 'rivers-rivergroup-dropdown',
  SCHEDULED_DROPDOWN: 'rivers-scheduled-dropdown',
  STATUS_DROPDOWN: 'rivers-status-dropdown',
};

// Troubleshoot (AI Fix)
export const TroubleshootTags = {
  HELP_ME_FIX_IT_BUTTON: 'ai-troubleshoot-helpmefixit-button',
  ENABLE_AGENT_BANNER_BUTTON: 'ai-troubleshoot-enableagent-banner-button',
  SETTINGS_TOGGLE: 'ai-troubleshoot-settings-toggle',
  FEEDBACK_THUMBS_UP_BUTTON: 'ai-troubleshoot-feedback-thumbsup-button',
  FEEDBACK_THUMBS_DOWN_BUTTON: 'ai-troubleshoot-feedback-thumbsdown-button',
  DIAGNOSE_RESPONSE: 'ai-troubleshoot-diagnose-response',
};

// River Creation Tags
export const RIVER_CREATION_TAG_ACTIONS = {
  SOURCE_TO_TARGET: 'source-to-target',
  LOGIC_RIVER: 'logic-river',
  BUILD_YOUR_OWN: 'build-your-own',
  KITS: 'kits',
  BUILD_MY_OWN: 'build-my-own',
  REQUEST_DATA_SOURCE: 'request-new-data-source',
} as const;

export const getRiverCreationTag = (
  location: 'home' | 'drawer',
  action: string,
) => {
  const prefix = location === 'home' ? 'home-button' : 'drawer-create-river';
  return `${prefix}-${action}-click`;
};

export const RiverCreationTags = {
  HOME_BUILD_MY_OWN: getRiverCreationTag(
    'home',
    RIVER_CREATION_TAG_ACTIONS.BUILD_MY_OWN,
  ),
  HOME_REQUEST_DATA_SOURCE: getRiverCreationTag(
    'home',
    RIVER_CREATION_TAG_ACTIONS.REQUEST_DATA_SOURCE,
  ),
  BLUEPRINT_GENERATE_CLICK_ENABLED:
    'blueprint-prompt-button-generate-click-enabled',
};

// Action Selector (Blueprint creation flow) Tags
export const ActionSelectorTags = {
  START_WITH_AI_BUTTON: 'action-selector-startwithai-button',
  REST_ACTION_CARD: 'action-selector-restaction-card',
  MULTI_ACTION_FLOW_CARD: 'action-selector-multiactionflow-card',
  BUILD_FROM_SCRATCH_CARD: 'action-selector-buildfromscratch-card',
  SELECT_EXISTING_CARD: 'action-selector-selectexisting-card',
};

// Source to Target (S2T) Tags
export const S2TTags = {
  DATA_CONNECTOR_AGENT_BUTTON: 's2t-dataconnectoragent-button',
  SAP_BUTTON: 's2t-sap-button',
  CDC_BUTTON: 's2t-cdc-button',
};

// Dashboard — Create Cards
export const DashboardCreateTags = {
  SOURCE_TO_TARGET_CARD: 'dashboard-create-sourcetotarget-card',
  LOGIC_RIVER_CARD: 'dashboard-create-logicriver-card',
  BUILD_YOUR_OWN_CARD: 'dashboard-create-buildyourown-card',
  KITS_CARD: 'dashboard-create-kits-card',
};

// Dashboard — Filters
export const DashboardFilterTags = {
  ENVIRONMENT_DROPDOWN: 'dashboard-filter-environment-dropdown',
  SOURCES_DROPDOWN: 'dashboard-filter-sources-dropdown',
  RIVER_GROUP_DROPDOWN: 'dashboard-filter-rivergroup-dropdown',
  DATE_RANGE_PICKER: 'dashboard-filter-daterange-picker',
  TIMEZONE_DROPDOWN: 'dashboard-filter-timezone-dropdown',
};

// Dashboard — Chart Toggles
export const DashboardChartTags = {
  GENERAL_VIEW_TOGGLE: 'dashboard-chart-generalview-toggle',
  SOURCE_VIEW_TOGGLE: 'dashboard-chart-sourceview-toggle',
};

// Dashboard — Recommended Section
export const DashboardRecommendedTags = {
  POPULAR_RIVERS_TAB: 'dashboard-recommended-popularrivers-tab',
  RECOMMENDED_RIVERS_TAB: 'dashboard-recommended-recommendedrivers-tab',
  RIVER_TEMPLATE_CARD: 'dashboard-recommended-rivertemplate-card',
};

// Dashboard — Recent Activities Filters
export const DashboardRecentActivitiesTags = {
  ALL_FILTER: 'dashboard-recentactivities-all-filter',
  SUCCESS_FILTER: 'dashboard-recentactivities-success-filter',
  FAILED_FILTER: 'dashboard-recentactivities-failed-filter',
};

// Dashboard — Metric Cards
export const DashboardMetricTags = {
  EXECUTIONS_CARD: 'dashboard-metric-executions-card',
  SUCCESS_RATE_CARD: 'dashboard-metric-successrate-card',
  BDU_CARD: 'dashboard-metric-bdu-card',
};

// Settings — Notifications
export const SettingsNotificationsTags = {
  TAB: 'settings-notifications-tab',
  LEARN_MORE_LINK: 'settings-notifications-learnmore-link',
  ADD_BUTTON: 'settings-notifications-add-button',
  ROW_ACTIONS_MENU: 'settings-notifications-row-actions-menu',
  ROW_EDIT_ACTION: 'settings-notifications-row-edit-action',
  ROW_DELETE_ACTION: 'settings-notifications-row-delete-action',
};
