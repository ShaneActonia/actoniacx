// src/app/dashboard/locations/[accountId]/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Define types for the Location data for better type-safety
interface GbpLocation {
  name: string;
  title: string;
  storeCode?: string;
}

// This page receives params because it's a dynamic route
export default async function LocationsPage({ params }: { params: { accountName: string } }) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });

  // First, get the authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // THEN, get the session which contains the provider token
  const { data: { session } } = await supabase.auth.getSession();

   let locations: GbpLocation[] = [];
  let fetchError: string | null = null;
  const accountName = decodeURIComponent(params.accountName);

  try {
    // Note: We use session! because we've already confirmed a user exists, so a session must exist.
    const googleAccessToken = session!.provider_token;
    if (!googleAccessToken) {
      throw new Error("Google provider token not found.");
    }

   const readMask = 'name,title,storeCode';
const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
      },
    });

    // IMPROVED ERROR HANDLING
    if (!response.ok) {
      // Don't assume the response is JSON. Read it as text first.
      const errorText = await response.text();
      console.error("Google API Error Response:", errorText); // Log the actual HTML/text response
      // Try to parse as JSON, but have a fallback.
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error.message || 'Failed to fetch locations from Google.');
      } catch (e) {
        throw new Error(`Google API returned a non-JSON error (status ${response.status}): ${errorText.substring(0, 200)}...`);
      }
    }

    const data = await response.json();
    locations = data.locations || [];

  } catch (error: any) {
    console.error("Error fetching GBP locations:", error.message);
    fetchError = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
      <div className="w-full max-w-4xl">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 block">&larr; Back to Accounts</Link>
        <h1 className="text-3xl font-bold text-center">Business Locations</h1>
        
        <div className="mt-8">
          {fetchError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p><strong>Error:</strong> {fetchError}</p>
            </div>
          )}

          {locations.length > 0 ? (
            <ul className="mt-4 text-left bg-white p-6 rounded-lg shadow-md">
  {locations.map((location) => (
    <li key={location.name} className="py-3 border-b last:border-b-0 hover:bg-gray-50">
      <Link href={`/dashboard/reviews/${encodeURIComponent(accountName)}/${encodeURIComponent(location.name)}`}>
  <p className="font-medium text-lg text-blue-600 hover:underline">{location.title}</p>
  {location.storeCode && <p className="text-sm text-gray-500">Store Code: {location.storeCode}</p>}
</Link>
    </li>
  ))}
</ul>
          ) : (
            !fetchError && <p className="mt-4 text-gray-500 text-center">No locations found for this account.</p>
          )}
        </div>
      </div>
    </div>
  );
}