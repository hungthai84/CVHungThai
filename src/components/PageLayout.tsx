import React from 'react';

interface PageLayoutProps {
  id?: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ id, children }) => {
  return (
    <div id={id} className="page-layout-wrapper" style={{ height: '100%' }}>
      {children}
    </div>
  );
};

export default PageLayout;
