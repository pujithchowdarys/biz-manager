
import React from 'react';

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}

const Table = <T,>({ headers, data, renderRow }: TableProps<T>) => {
  return (
    <div className="overflow-x-auto bg-surface rounded-lg shadow">
      <table className="w-full min-w-max text-left">
        <thead>
          <tr className="border-b border-border bg-table-header">
            {headers.map((header) => (
              <th key={header} className="p-4 text-sm font-semibold text-textSecondary uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <React.Fragment key={index}>
                {renderRow(item)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;