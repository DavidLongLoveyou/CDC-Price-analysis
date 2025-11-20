
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700 shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
      <div className="flex-shrink-0 h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center text-cyan-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
