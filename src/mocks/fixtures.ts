/**
 * BDI prototype — mock backend fixtures.
 *
 * These response bodies are shaped to satisfy the Rivery auth + bootstrap flow
 * so the app boots straight into its AUTHENTICATED shell with no real backend:
 *   POST /api/login  -> IUserLogin   (one account, so the single-account path runs)
 *   POST /api/token  -> IAccountDetails (account_name flips isAuthenticated=true)
 *   GET  /v1/accounts/:id/environments -> paginated IEnvironment[]
 *
 * Intentionally untyped (plain objects) — they are serialized to JSON at runtime,
 * so we avoid coupling to the (large) auth interfaces and any enum churn.
 */

const oid = (id: string) => ({ $oid: id });

// Stable identifiers shared across fixtures (24-char hex, Mongo-style).
export const ACCOUNT_ID = '6620a1b2c3d4e5f600000a01';
export const USER_ID = '6620a1b2c3d4e5f6000000u1'.replace('u', '0');
export const ENV_PROD_ID = '6620a1b2c3d4e5f600000e01';
export const ENV_DEV_ID = '6620a1b2c3d4e5f600000e02';

export const ACCOUNT_NAME = 'Boomi Data Integration';
export const USER_EMAIL = 'adam.shriki@boomi.com';
const FIXED_TS = 1717200000000; // deterministic timestamp

// POST /login
export const userLogin = {
  first_name: 'Adam',
  last_name: 'Shriki',
  user_email: USER_EMAIL,
  refresh_token: 'mock-refresh-token',
  user_id: oid(USER_ID),
  last_login: { $date: FIXED_TS },
  registration_enabled: false,
  login_type: 'password',
  status_code: 200,
  is_super_admin: false,
  is_super_admin_creator: false,
  // Exactly one account -> triggers the single-account token fetch + home redirect.
  user_accounts: [
    {
      _id: oid(ACCOUNT_ID),
      account_id: ACCOUNT_ID,
      env_id: oid(ENV_PROD_ID),
      account_name: ACCOUNT_NAME,
      owner_email: USER_EMAIL,
      role: 'admin',
      account_type: 'active',
      active_account_type: 'active',
      is_active: true,
      main_target: 'snowflake',
      disable_targets: false,
      running_workers: 0,
      max_workers: 10,
      registration_events: 0,
      environments_enabled: true,
      snowflake_disable_merge_method: false,
      disabled_environments_at: { $date: 0 },
      environments_enabled_at: { $date: FIXED_TS },
      plan: 'enterprise',
      days_trial: 0,
    },
  ],
};

// POST /token  (account_name is what flips selectAuthenticated -> true)
export const accountDetails = {
  boomi_account_id: 'boomi-acct-bdi-0001',
  account_type: 'active',
  is_active: true,
  is_super_admin: false,
  is_global_operator: false,
  env_id: ENV_PROD_ID, // string (already normalized)
  owner_email: USER_EMAIL,
  account_name: ACCOUNT_NAME,
  max_runs: 100000,
  role: 'admin',
  disable_targets: false,
  scopes: [],
  main_target: 'snowflake',
  partner: null,
  token: 'mock-account-token',
  plan: 'enterprise',
  days_trial: 0,
  registration_date: FIXED_TS,
  activated_at: FIXED_TS / 1000,
  account_settings: {
    max_allowed_environments: 5,
    enable_bq_standard_sql: true,
    enable_copy_rivers_here: null,
    allow_sub_rivers: true,
    enable_kits: true,
    allow_logic_python: true,
    enable_data_quality: true,
    allow_audit_log: true,
    allow_new_environments: true,
    use_new_river_list: true,
    show_copilot: true,
  },
  subscription_metadata: {
    plan: 'enterprise_2025',
    plan_name: 'Enterprise',
    billing_type: 'annual',
    subscription_start_date: { $date: FIXED_TS },
    subscription_date: '2024-06-01',
    subscription_end_date: '2027-06-01',
    purchased_rpus: 100000,
    last_modified_date: '2024-06-01',
    account_id: ACCOUNT_ID,
  },
  show_welcome: false,
  is_trial: false,
  environments_expiration_date: { $date: 4102444800000 }, // year 2100
};

// Two environments so the env switcher in the nav is meaningful.
const environments = [
  {
    _id: ENV_PROD_ID,
    account: ACCOUNT_ID,
    // Env color must be a Rivery color token (not hex) — the sidebar env
    // switcher resolves it via colors[token].background under VITE_EXO_THEME.
    color: 'cPurples',
    variables: {},
    environment_name: 'Production',
    updated_at: FIXED_TS,
    is_default: true,
    cross_id: 'cross-prod',
    description: 'Production environment',
  },
  {
    _id: ENV_DEV_ID,
    account: ACCOUNT_ID,
    color: 'tagGreen',
    variables: {},
    environment_name: 'Development',
    updated_at: FIXED_TS,
    is_default: false,
    cross_id: 'cross-dev',
    description: 'Development environment',
  },
];

// GET /v1/accounts/:id/environments — shaped for fetchAllPages (single page).
export const environmentsPage = {
  items: environments,
  account_id: ACCOUNT_ID,
  current_page_size: environments.length,
  environment_id: ENV_PROD_ID,
  next_page: '', // empty -> fetchAllPages terminates after page 1
  page: 1,
};
