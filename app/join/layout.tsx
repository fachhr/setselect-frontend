import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Join SetSelect - Submit Your Profile",
  description: "Connect with top opportunities in Switzerland. Upload your CV and join our exclusive talent pool to get matched with premium employers.",
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
