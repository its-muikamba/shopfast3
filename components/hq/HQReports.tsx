import React from 'react';
import { FileTextIcon } from '../Icons';

const HQReports: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
      <FileTextIcon className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-2xl font-bold text-brand-charcoal">Escalations & Reports</h2>
      <p className="mt-2 text-gray-500 max-w-md">
        This section will house tools for managing customer support escalations, tenant-reported issues, and generating platform-wide performance reports.
      </p>
    </div>
  );
};

export default HQReports;
