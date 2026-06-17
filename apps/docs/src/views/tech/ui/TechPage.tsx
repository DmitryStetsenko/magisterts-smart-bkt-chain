'use client';

import React from 'react';
import DocsLayout from '../../../widgets/docs-layout/ui/DocsLayout';
import DocStandardView from '../../../widgets/doc-standard-view/ui/DocStandardView';

export function TechPage() {
  return (
    <DocsLayout>
      {({ isDarkMode, filteredDoc, scrollTo }) => (
        <DocStandardView isDarkMode={isDarkMode} filteredDoc={filteredDoc} scrollTo={scrollTo} />
      )}
    </DocsLayout>
  );
}
