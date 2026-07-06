/**
 * GET /api/river_groups  → { groups: IGroup[] }
 *
 * The Groups tab renders name + colored dot + #flows + last modified. The
 * groups store also backs the "Data Flow Group" column on the Data Flows and
 * Activities tables (resolved by cross_id), so ids MUST match FLOWS.groupCross.
 */
import { GROUPS, oid } from './_shared';
import { FLOWS } from './seed';

const countFor = (groupKey: string) =>
  FLOWS.filter(f => f.group === groupKey).length;

export const riverGroups = {
  groups: GROUPS.map((g, i) => ({
    name: g.name,
    color: g.color,
    icon: g.icon,
    is_default: i === 0,
    insert_time: Date.now() - (200 - i) * 86_400_000,
    update_time: Date.now() - (20 - i) * 86_400_000,
    cross_id: oid(g.cross),
    _id: oid(g.cross),
    river_count: countFor(g.key),
  })),
};
