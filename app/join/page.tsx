import JoinForm from './JoinForm';
import { joinPageMetadata } from '@/lib/markets/metadata';

export const metadata = joinPageMetadata('CH');

export default function JoinRoute() {
  return <JoinForm />;
}
