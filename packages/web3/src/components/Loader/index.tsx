import React, { FC, useEffect, useState } from 'react';
// import { useMeta } from '@oyster/common';

export const LoaderProvider: FC = ({ children }) => {
  // const { isLoading } = useMeta();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  });

  return (
    <>
      <div className={`loader-container ${isLoading ? 'active' : ''}`}>
        <div className="loader-block">
          <div className="loader-title">Please wait</div>
          <Spinner />
        </div>
      </div>
      {children}
    </>
  );
};

export const Spinner = () => {
  return (
    <div className="spinner">
      <span className="line line-1" />
      <span className="line line-2" />
      <span className="line line-3" />
      <span className="line line-4" />
      <span className="line line-5" />
      <span className="line line-6" />
      <span className="line line-7" />
      <span className="line line-8" />
      <span className="line line-9" />
    </div>
  );
};
