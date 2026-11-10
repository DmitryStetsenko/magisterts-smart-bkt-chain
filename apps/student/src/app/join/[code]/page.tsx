import React from 'react';
import { JoinClassroomView } from '../../../features/classrooms/ui/JoinClassroomView';

interface JoinCodePageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinCodePage({ params }: JoinCodePageProps) {
  const { code } = await params;
  return <JoinClassroomView initialCode={code} />;
}
