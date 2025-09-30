// types/reports.ts

export type DepartmentReport = {
  department: string | null;
  totalRequests: number;
  totalAmount: number; // New column
  totalOdometer: number; // New column
  totalLiters: number | null;
  totalOdometerPerLiter: number; // New column
};

export type PlateNumberReport = {
  plateNumber: string | null;
  totalRequests: number;
  totalAmount: number; // Added
  totalOdometer: number; // Added
  totalLiters: number | null;
  totalOdometerPerLiter: number; // Added
};

export type DriverReport = {
  driverName: string | null;
  totalRequests: number;
  totalAmount: number; // Added
  totalOdometer: number; // Added
  totalLiters: number | null;
  totalOdometerPerLiter: number; // Added
};

// Use a union type to represent the different report possibilities
export type ReportData =
  | DepartmentReport[]
  | PlateNumberReport[]
  | DriverReport[];
export type AllReportTypes =
  | DepartmentReport
  | PlateNumberReport
  | DriverReport;
export type DateFilter = {
  gte?: Date;
  lt?: Date;
};
