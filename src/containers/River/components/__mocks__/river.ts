export const mockedRiver = {
  cross_id: {
    $oid: '607ecb991150420744a98b1b',
  },
  river_definitions: {
    version_id: {
      $oid: '607ecb991150420744a98b1d',
    },
    account: {
      $oid: '55bf7c4270fdca16cac18761',
    },
    group_id: {
      _id: {
        $oid: '607d304adc72cc001c48c153',
      },
    },
    updated_by: {
      $oid: '5e68e3cba5b384310dddedef',
    },
    is_locked: false,
    shared_params: {
      notifications: {
        on_warning: {},
        on_failure: {},
      },
      fz_connection: {},
    },
    river_date_updated: {
      $date: 1618922393127,
    },
    is_sub_river: false,
    river_name: 'test',
    source_type: 'logic',
    is_scheduled: false,
    river_date_inserted: {
      $date: 1618922393127,
    },
    river_desc: '',
    created_by: {
      $oid: '5e68e3cba5b384310dddedef',
    },
    river_type: 'logic',
    cross_id: {
      $oid: '607ecb991150420744a98b1b',
    },
    env_id: {
      $oid: '563fa39cdf14e54426d464ea',
    },
    _id: {
      $oid: '607ecb991150420744a98b1b',
    },
    updated_by_name: 'Romi Rozhansky',
  },
  tasks_definitions: [
    {
      task_label: 'logic',
      related: {
        connections: [],
        rivers: [
          {
            $oid: '607eb60156d9ee7cd45335e8',
          },
          '607d5d21507b6d001c6f8544',
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
            hash_key_init: 'object_hashkey_1808',
            isEnabled: true,
            container_running: 'run_once',
            content: {
              execute_sql_command: false,
              target_loading: 'append',
              block_type: 'river',
              compression: 'none',
              file_type: 'csv',
              block_primary_type: 'river',
              fzConnection: {},
              connection_id: {},
              drop_after: false,
              target_type: 'table',
              gConnection: {},
              block_db_type: 'big_query_sql',
              split_interval: 'd',
              query_priority: 'interactive',
              split_tables: 'no',
              use_standard_sql: false,
              type: 'RECORD',
              river_id: {
                $oid: '607eb60156d9ee7cd45335e8',
              },
              fields: [],
            },
            hideBlock: false,
            step_name: 'Logic step 1',
            nodes: [],
          },
          {
            hash_key_init: 'object_hashkey_1810',
            isEnabled: true,
            container_running: 'run_once',
            content: {
              execute_sql_command: false,
              target_loading: 'append',
              block_type: 'action',
              compression: 'none',
              file_type: 'csv',
              block_primary_type: 'action',
              fzConnection: {},
              connection_id: {},
              drop_after: false,
              target_type: 'table',
              action_vars: {
                action_variables: {},
                connection_details: {},
                interval_params: {},
              },
              gConnection: {},
              block_db_type: 'big_query_sql',
              split_interval: 'd',
              fields: [],
              split_tables: 'no',
              use_standard_sql: false,
              query_priority: 'interactive',
              type: 'RECORD',
              action_id: '607d5d21507b6d001c6f8544',
            },
            hideBlock: false,
            step_name: 'Logic step 2',
            nodes: [],
            loadActionRiver: true,
          },
        ],
        condition_name_counter: 0,
        variables: {},
        datasource_id: 'logic',
        fz_batched: true,
        container_name_counter: 0,
        step_name_counter: 2,
      },
      task_type_id: 'logic',
      task_process_module: '{processes_path}.logic_process',
      is_target_task: false,
      river_id: {
        $oid: '607ecb991150420744a98b1b',
      },
      ordinal: 0,
      move_as_is: true,
      datasource_id: 'logic',
      schedule: {
        sched: {
          hour: 15,
          min: 39,
          year: {
            radioYear: 0,
            days: 1,
          },
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
          showCrontab: false,
          minutes: 15,
        },
        isEnabled: false,
        endDate: {},
        cronExp: '0 0 0/1 * * * *',
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
        $oid: '607ecb991150420744a98b1d',
      },
      is_synchronized: true,
      task_date_inserted: {
        $date: 1618922393131,
      },
      account: {
        $oid: '55bf7c4270fdca16cac18761',
      },
      task_name: 'Logic process',
      task_display_name: 'Logic Process',
      pull_target: 'logic',
      _id: {
        $oid: '607ecb991150420744a98b1c',
      },
    },
  ],
  _id: {
    $oid: '607ecb991150420744a98b1b',
  },
};
