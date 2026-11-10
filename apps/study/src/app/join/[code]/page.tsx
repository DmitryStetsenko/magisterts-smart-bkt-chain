import React from 'react';
import { StudyJoinClassroomView } from '../../../features/classrooms/ui/StudyJoinClassroomView';

interface StudyJoinCodePageProps {
  params: Promise<{ code: string }>;
}

export default async function StudyJoinCodePage({ params }: StudyJoinCodePageProps) {
  const { code } = await params;
  return <StudyJoinClassroomView initialCode={code} />;
}
