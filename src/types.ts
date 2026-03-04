export interface Employee {
  id: string;
  name: string;
}

export interface Org {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  title: string;
  employee?: Employee;
  org?: Org;
}

export interface DocFilterOptions {
  employeeId?: string;
  orgId?: string;
}
