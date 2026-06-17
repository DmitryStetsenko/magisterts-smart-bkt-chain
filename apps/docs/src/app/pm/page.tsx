'use client';

import React from 'react';
import DocsShell from '../../components/DocsShell';
import DocStandardView from '../../components/DocStandardView';

export default function PMPage() {
  return (
    <DocsShell>
      {({ isDarkMode, filteredDoc, scrollTo }) => (
        <DocStandardView isDarkMode={isDarkMode} filteredDoc={filteredDoc} scrollTo={scrollTo} />
      )}
    </DocsShell>
  );
}
