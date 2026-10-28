'use client';

import React from 'react';
import DocsLayout from '../../widgets/docs-layout/ui/DocsLayout';
import GoogleHelpView from '../../widgets/google-help-view/ui/GoogleHelpView';

export default function HelpRoute() {
  return (
    <DocsLayout>
      {({ isDarkMode, filteredDoc, scrollTo }) => (
        <GoogleHelpView isDarkMode={isDarkMode} filteredDoc={filteredDoc} scrollTo={scrollTo} />
      )}
    </DocsLayout>
  );
}
