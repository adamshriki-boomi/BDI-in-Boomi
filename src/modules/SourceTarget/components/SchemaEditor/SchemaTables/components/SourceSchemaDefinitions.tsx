import { SourceTypes } from 'api/types';
import OracleSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/Oracle';
import MSSQLSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceMSSQL';
import MySQLSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceMySQL';
import VerticaSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceVertica';
import PostgresSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourcePostgres';
import MongoSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceMongo';
import MariaDBSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceMariaDB';
import NetsuiteAnalyticsSource from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceNetsuiteAnalytics';
import { DefinitionsCollapse } from './SchemaDefinitionsCollapse';
import SalesforceV3Source from 'modules/SourceTarget/components/SelectDataSource/DataSourceDefinitions/SourceSalesforceV3';

export function SourceDefinitions({ formApi }) {
  const source = formApi?.watch('river.properties.source.name');
  return (
    <DefinitionsCollapse type="source">
      {SelectedSourceDefinitions[source]}
    </DefinitionsCollapse>
  );
}

const SelectedSourceDefinitions = {
  [SourceTypes.MYSQL]: <MySQLSource />,
  [SourceTypes.MARIADB]: <MariaDBSource />,
  [SourceTypes.MSSQL]: <MSSQLSource />,
  [SourceTypes.VERTICA]: <VerticaSource />,
  [SourceTypes.POSTGRES]: <PostgresSource />,
  [SourceTypes.ORACLE]: <OracleSource />,
  [SourceTypes.MONGO]: <MongoSource />,
  [SourceTypes.NETSUITE_ANALYTICS]: <NetsuiteAnalyticsSource />,
  [SourceTypes.SALESFORCE]: <SalesforceV3Source />,
};
