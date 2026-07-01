export const riverLogicWithNesting = {
  cross_id: {
    $oid: '60755555548271001df7a3c4',
  },
  river_definitions: {
    version_id: {
      $oid: '609aba871150426e5f25fd85',
    },
    account: {
      $oid: '55bf7c4270fdca16cac18761',
    },
    group_id: {
      _id: {
        $oid: '607432da8b14d2001c32f6ce',
      },
    },
    updated_by: {
      $oid: '60152e0b115042307858a5b5',
    },
    is_locked: false,
    shared_params: {
      notifications: {
        on_warning: {},
        on_failure: {},
        on_run_threshold: {},
      },
      fz_connection: {},
    },
    river_date_updated: {
      $date: 1620753040300,
    },
    is_sub_river: false,
    river_name: 'Oren 2021-04-13 11:17',
    source_type: 'logic',
    is_scheduled: false,
    river_date_inserted: {
      $date: 1618302293444,
    },
    river_desc: '',
    created_by: {
      $oid: '5e68e3cba5b384310dddedef',
    },
    river_type: 'logic',
    cross_id: {
      $oid: '60755555548271001df7a3c4',
    },
    env_id: {
      $oid: '563fa39cdf14e54426d464ea',
    },
    _id: {
      $oid: '60755555548271001df7a3c4',
    },
    updated_by_name: 'Farhi Oren',
  },
  tasks_definitions: [
    {
      task_label: 'logic',
      related: {
        connections: [
          {
            $oid: '587f9f27c762714fe9cb68fa',
          },
        ],
        rivers: [
          {
            $oid: '609a8d91d410df001eda181f',
          },
          '607d3181dc72cc001c48c15d',
        ],
      },
      global_keys: {
        target_name: 'Logic',
      },
      task_type_name: 'Logic Process',
      env_id: {
        $oid: '563fa39cdf14e54426d464ea',
      },
      created_by: {
        $oid: '5e68e3cba5b384310dddedef',
      },
      feeder_module: '{feeders_path}.logic_feeder',
      task_config: {
        logic_steps: [
          {
            hash_key_init: 'object_hashkey_13921',
            isEnabled: true,
            container_running: 'run_once',
            nodes: [
              {
                hash_key_init: 'object_hashkey_13956',
                isEnabled: true,
                container_running: 'run_once',
                content: {
                  execute_sql_command: false,
                  target_loading: 'append',
                  block_type: 'big_query_sql',
                  compression: 'none',
                  is_global_variable: true,
                  file_type: 'csv',
                  fields: [],
                  variable_name: 'aws_file_zone',
                  fzConnection: {},
                  connection_id: {},
                  drop_after: false,
                  target_type: 'variable',
                  gConnection: {
                    $oid: '587f9f27c762714fe9cb68fa',
                  },
                  block_db_type: 'big_query_sql',
                  split_interval: 'd',
                  block_primary_type: 'sql',
                  split_tables: 'no',
                  use_standard_sql: false,
                  type: 'RECORD',
                  query_priority: 'interactive',
                },
                hideBlock: false,
                step_name: 'Logic step 1',
                nodes: [],
              },
              {
                hash_key_init: 'object_hashkey_13957',
                isEnabled: true,
                container_running: 'run_once',
                content: {
                  sql_query: 'jnvviklw',
                  execute_sql_command: false,
                  block_type: 'river',
                  compression: 'none',
                  file_type: 'csv',
                  fields: [],
                  block_primary_type: 'river',
                  fzConnection: {},
                  connection_id: {},
                  drop_after: false,
                  target_type: 'table',
                  gConnection: {},
                  block_db_type: 'big_query_sql',
                  split_interval: 'd',
                  type: 'RECORD',
                  split_tables: 'no',
                  use_standard_sql: false,
                  target_loading: 'overwrite',
                  river_id: {
                    $oid: '609a8d91d410df001eda181f',
                  },
                  query_priority: 'interactive',
                },
                hideBlock: false,
                step_name: 'Logic step 2',
                nodes: [],
              },
            ],
            step_name: 'Container 1',
          },
          {
            hash_key_init: 'object_hashkey_13922',
            isEnabled: true,
            container_running: 'run_once',
            content: {
              target_loading: 'append',
              block_type: 'action',
              compression: 'none',
              file_type: 'csv',
              fields: [],
              block_primary_type: 'action',
              fzConnection: {},
              connection_id: {},
              drop_after: false,
              target_type: 'table',
              gConnection: {},
              block_db_type: 'big_query_sql',
              split_interval: 'd',
              type: 'RECORD',
              query_priority: 'interactive',
              split_tables: 'no',
              use_standard_sql: false,
              action_vars: {
                action_variables: {},
                connection_details: {},
                interval_params: {},
              },
              action_id: '607d3181dc72cc001c48c15d',
            },
            hideBlock: false,
            step_name: 'Logic Step 4',
            nodes: [],
            loadActionRiver: true,
          },
        ],
        condition_name_counter: 0,
        variables: {},
        datasource_id: 'logic',
        fz_batched: true,
        container_name_counter: 1,
        step_name_counter: 4,
      },
      task_type_id: 'logic',
      task_process_module: '{processes_path}.logic_process',
      is_target_task: false,
      river_id: {
        $oid: '60755555548271001df7a3c4',
      },
      ordinal: 0,
      move_as_is: true,
      datasource_id: 'logic',
      updated_by: {
        $oid: '60152e0b115042307858a5b5',
      },
      schedule: {
        endDate_beforeSave: '2021-05-11T17:08:53.968Z',
        endDate: {},
        job_id: '60755555548271001df7a3c5',
        isEnabled: false,
        cronExp: '0 0 0/1 * * * *',
        sched: {
          hour: 8,
          min: 24,
          showCrontab: false,
          days: {
            days: 1,
          },
          month: {
            radioMon: 0,
            months: 1,
            days: 1,
            month: 1,
          },
          hours: {
            hours: 1,
            radioHour: 0,
          },
          year: {
            radioYear: 0,
            days: 1,
          },
          minutes: 15,
        },
      },
      task_method: 'logic_v3',
      pull_translate: {
        fields: 'get_result_columns',
        databases: 'get_databases',
        datasets: 'get_datasets',
        results: 'get_results',
        schemas: 'get_schemas',
      },
      connection_id: {},
      version_id: {
        $oid: '609aba871150426e5f25fd85',
      },
      is_synchronized: true,
      task_date_inserted: {
        $date: 1618302293446,
      },
      account: {
        $oid: '55bf7c4270fdca16cac18761',
      },
      task_date_updated: {
        $date: 1620753040298,
      },
      is_deleted: false,
      task_name: 'Logic process',
      task_display_name: 'Logic Process',
      pull_target: 'logic',
      _id: {
        $oid: '60755555548271001df7a3c5',
      },
    },
  ],
  _id: {
    $oid: '60755555548271001df7a3c4',
  },
};
