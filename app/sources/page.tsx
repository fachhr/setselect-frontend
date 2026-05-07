import { Metadata } from 'next';
import SourcesContent from '@/components/sources/SourcesContent';

export const metadata: Metadata = {
  title: 'Tracked Sources — SetSelect',
};

export default function SourcesPage() {
  return <SourcesContent />;
}
