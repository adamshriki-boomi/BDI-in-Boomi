/**
 * GET /api/connections/list → IConnection[]  (bare array, not paginated)
 *
 * The Connections table renders name, a type icon (<img src={`/${icon}`}>),
 * and modified time. `icon` is a real asset path; `connection_type` doubles as
 * the modal header + type. The store keys connections by cross_id.
 */
import { ACCOUNT_ID, ENV_PROD_ID } from '../fixtures';
import { connectorById, iconRel, oid } from './_shared';
import { CONNECTIONS } from './seed';

export const connectionsList = CONNECTIONS.map(c => {
  const connector = connectorById(c.connector);
  return {
    _id: oid(c.cross),
    cross_id: oid(c.cross),
    account: oid(ACCOUNT_ID),
    env_id: ENV_PROD_ID,
    connection_name: c.label,
    connection_type: connector.id,
    connection_type_id: connector.id,
    connection_type_name: connector.name,
    connection_creation_time: { $date: c.created },
    connection_update_time: { $date: c.updated },
    connection_update_by: c.modifiedBy,
    updated_by_name: c.modifiedBy,
    icon: iconRel(connector.icon),
    size: 28,
    valid: c.valid,
    is_test_connection: false,
    is_test_connection_list: false,
    last_test_date: { $date: c.updated },
  };
});
