'use client';

import { useState, useEffect } from 'react';
import {
  ReportData,
  DepartmentReport,
  PlateNumberReport,
  DriverReport,
} from '@/types/reports';

export default function AdminReportsPage() {
  const [grouping, setGrouping] = useState<
    'department' | 'plateNumber' | 'driver'
  >('department');
  const [reportData, setReportData] = useState<ReportData>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    fetchReportData(grouping, fromDate, toDate);
  }, [grouping, fromDate, toDate]);

  const fetchReportData = async (
    groupingOption: string,
    from: string,
    to: string
  ) => {
    setLoading(true);
    try {
      const url = new URL('/api/reports', window.location.origin);
      url.searchParams.append('groupBy', groupingOption);
      if (from) url.searchParams.append('from', from);
      if (to) url.searchParams.append('to', to);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const data: ReportData = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupingChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newGrouping = event.target.value as
      | 'department'
      | 'plateNumber'
      | 'driver';
    setGrouping(newGrouping);
  };

  const handleExportCSV = () => {
    const url = new URL('/api/reports', window.location.origin);
    url.searchParams.append('groupBy', grouping);
    url.searchParams.append('format', 'csv');
    if (fromDate) url.searchParams.append('from', fromDate);
    if (toDate) url.searchParams.append('to', toDate);
    window.location.href = url.toString();
  };

  const getTableHeaders = () => {
    const commonHeaders = [
      'Total Requests',
      'Total Amount',
      'Total Odometer',
      'Total Liters',
      'Odometer/liter',
    ];
    let keyHeader: string;
    if (grouping === 'department') keyHeader = 'Department';
    else if (grouping === 'plateNumber') keyHeader = 'Plate Number';
    else keyHeader = 'Driver Name';
    return [keyHeader, ...commonHeaders];
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={getTableHeaders().length}
            className="px-6 py-4 text-center text-sm"
          >
            Loading report...
          </td>
        </tr>
      );
    }
    if (!reportData || reportData.length === 0) {
      return (
        <tr>
          <td
            colSpan={getTableHeaders().length}
            className="px-6 py-4 text-center text-sm"
          >
            No data found for this grouping.
          </td>
        </tr>
      );
    }

    return reportData.map((row, index) => {
      if (grouping === 'department') {
        const typedRow = row as DepartmentReport;
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {typedRow.department}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalRequests}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${typedRow.totalAmount.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalOdometer.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalLiters?.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalOdometerPerLiter.toFixed(2)}
            </td>
          </tr>
        );
      } else if (grouping === 'plateNumber') {
        const typedRow = row as PlateNumberReport;
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {typedRow.plateNumber}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalRequests}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${typedRow.totalAmount.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalOdometer.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalLiters?.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalOdometerPerLiter.toFixed(2)}
            </td>
          </tr>
        );
      } else if (grouping === 'driver') {
        const typedRow = row as DriverReport;
        return (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {typedRow.driverName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalRequests}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${typedRow.totalAmount.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalOdometer.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalLiters?.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {typedRow.totalOdometerPerLiter.toFixed(2)}
            </td>
          </tr>
        );
      }
      return null;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fuel Request Report</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="grouping-select" className="mr-2">
              Group by:
            </label>
            <select
              id="grouping-select"
              value={grouping}
              onChange={handleGroupingChange}
              className="p-2 border rounded"
            >
              <option value="department">Department</option>
              <option value="plateNumber">Plate Number</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          <div>
            <label htmlFor="from-date" className="mr-2">
              From:
            </label>
            <input
              type="date"
              id="from-date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="mr-2">
              To:
            </label>
            <input
              type="date"
              id="to-date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Export to CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {getTableHeaders().map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderTableBody()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
