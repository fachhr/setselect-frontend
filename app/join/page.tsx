import { Metadata } from 'next';
import JoinForm from './JoinForm';

export const metadata: Metadata = {
  title: 'Join the Talent Pool | SetSelect',
  description: 'Create your profile and connect with top energy & commodities opportunities in Switzerland.',
};

export default function JoinRoute() {
  return <JoinForm />;
}