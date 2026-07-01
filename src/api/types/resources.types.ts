export interface IResource {
  compute_units_sec: number;
  cpu: number;
  description: string;
  name: string;
  alias: string;
  network_units_sec: number;
  ram: number;
  _id: string;
  code?: string;
}
export interface ResponseResources {
  logicode: IResource[];
}
