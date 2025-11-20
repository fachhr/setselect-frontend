import { Metadata } from 'next';
import JoinForm from './JoinForm';

export const metadata: Metadata = {
  title: 'Join the Talent Pool | Silvia\'s List',
  description: 'Create your profile and connect with top opportunities in Switzerland.',
};

export default function JoinRoute() {
  return <JoinForm />;
}