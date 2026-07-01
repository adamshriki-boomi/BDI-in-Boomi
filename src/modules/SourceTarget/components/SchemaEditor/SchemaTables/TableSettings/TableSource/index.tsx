import { DefaultSettings } from './DefaultSourceSettings';
import { GenericSourceSettings } from './GenericUISettings';
import { MongoSettings } from './MongoSettings';
import { MSSQLSettings } from './MSSQLSettings';
import { PostgresSettings } from './PostgresSettings';
import { GenericUIPredefined } from './PredefinedReport';
import { MariaDBSettings } from './MariaDBSettings';
import { SalesforceV3Settings } from './SalesforceV3Settings';

export const SelectedSource = {
  postgresql: PostgresSettings,
  mssql: MSSQLSettings,
  mongodb: MongoSettings,
  mariadb: MariaDBSettings,
  salesforce: SalesforceV3Settings,
  hubspot: GenericSourceSettings,
  shopify_graphql: GenericSourceSettings,
  datahub: GenericSourceSettings,
};

export default function TableSource({
  sourceDefinition,
  targetDefinition,
  isPredefined,
}) {
  const Component = SelectedSource[sourceDefinition.name];

  if (isPredefined) {
    return <GenericUIPredefined sourceDefinition={sourceDefinition} />;
  }

  if (Component) {
    return (
      <Component
        sourceDefinition={sourceDefinition}
        targetDefinition={targetDefinition}
      />
    );
  }

  return (
    <DefaultSettings
      sourceDefinition={sourceDefinition}
      targetDefinition={targetDefinition}
    />
  );
}
