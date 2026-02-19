'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client app to avoid SSR issues with react-router-dom
const ClientApp = dynamic(() => import('@/app/ClientApp'), { ssr: false });

export default function Home() {
  return <ClientApp />;
}
