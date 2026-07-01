export type Metadata = any[];
export type MetadataType =
  | 'get_databases'
  | 'get_schemas'
  | 'get_db_metadata'
  | 'get_buckets'
  | 'get_containers'
  | 'get_datasets'
  | 'get_source_metadata'
  | 'preview_data'
  | 'get_repositories'
  | 'get_knowledge_bases';
export type TaskType = 'source' | 'target';

export type MetadataQuery = {
  pull_request_inputs: {
    connection_id: string;
    database_name?: string;
    schema_name?: string;
    date_range?: Record<string, any>;
    interface_parameters?: Record<string, any>;
    recipe_id?: string;
    // Multi-report blueprint: scope a Reload Metadata call to a subset of reports.
    // Omit / undefined / empty array -> backend reloads every report in the YAML.
    report_names?: string[];
    // Multi-report blueprint test run: target a single report for preview_data.
    report_name?: string;
    table_name?: string; //For MongoDB, this is the collection name
    column_mapping_settings?: Record<string, any>; // For MongoDB, this is the mapping settings
  };
  task_type: TaskType;
  datasource_id: string;
  task: MetadataType;
  poll?: boolean;
};
