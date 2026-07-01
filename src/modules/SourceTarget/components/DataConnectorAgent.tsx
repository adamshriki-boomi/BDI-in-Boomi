const dataConnectorAgentConnection = {
  id: 'connector_executor',
  name: 'Data Connector Agent',
  description: 'Custom Yaml Executor',
  documentation_url: 'https://help.boomi.com/docs/category/blueprint',
  section_id: 'sec_boomi',
  status: 'enabled',
  segment: ['source', 'connections', 'not_technical'],
  icon: 'https://static-assets.console.rivery.io/connector_agent.svg',
  hoverIcon:
    'https://static-assets.console.rivery.io/connector_agent_hover.svg',
  connection_type: 'blueprint_custom',
  data_source_type_settings: {
    support_high_frequency: false,
    support_custom_table: true,
    support_predefined_reports: false,
    support_generic_ui: true,
    is_new_interface: true,
    in_section_ordinal: 5,
    is_connection_generic_pattern: true,
    supported_file_types_per_data_warehouse: {
      bq: ['csv', 'json'],
    },
    logs_settings: {
      support_logs: true,
      logs_start_time: '1661944368000',
    },
    increment_defaults: {
      time_period: 'date_range',
      relative_delta: 4,
      last_days_back: 3,
    },
    support_sub_rivers: false,
  },
  labels: ['new'],
  feature_flags: {
    supported_executor_versions: ['0.3.0rc'],
    latest_executor_version: '0.3.0rc',
  },
  api_name: 'blueprint_copilot',
};

export default dataConnectorAgentConnection;
