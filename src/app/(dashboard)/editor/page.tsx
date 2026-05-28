import { Suspense } from 'react';
import { FlowEditor } from '@/features/flow-editor';

function EditorInner() {
  return <FlowEditor />;
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorInner />
    </Suspense>
  );
}
