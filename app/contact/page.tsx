import { Metadata } from 'next';
import ContactPage from './ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us | Silvia\'s List',
  description: 'Get in touch with our team for hiring, joining, or partnerships.',
};

export default function ContactRoute() {
  return <ContactPage />;
}
