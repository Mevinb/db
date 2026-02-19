import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-end pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
        <p className="text-slate-500 mt-2">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;
