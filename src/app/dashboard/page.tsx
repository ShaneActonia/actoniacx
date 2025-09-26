// src/app/dashboard/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SignOutButton from './SignOutButton'
import Link from 'next/link';

// Define a type for the GBP Account structure for better type-safety
interface GbpAccount {
  name: string; // e.g., "accounts/123456789"
  accountName: string;
  accountNumber: string;
}

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies: () => cookies() });

  // Get the session and user at the same time
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // --- Step 2: Fetch GBP Data ---
  let accounts: GbpAccount[] = [];
  let fetchError: string | null = null;

  try {
    // The provider_token is the Google OAuth access token
    const googleAccessToken = session.provider_token;

    if (!googleAccessToken) {
      throw new Error("Google provider token not found.");
    }

    const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
      },
    });

    if (!response.ok) {
      // If Google API returns an error, capture it
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'Failed to fetch accounts from Google.');
    }

    const data = await response.json();
    //console.log('Google Accounts Data:', JSON.stringify(data, null, 2));
    accounts = data.accounts || []; // Ensure accounts is always an array

  } catch (error: any) {
    console.error("Error fetching GBP accounts:", error);
    fetchError = error.message;
  }

  // --- Step 3: Display the Data ---
  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold">Welcome, {session.user.email}!</h1>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Your Google Business Profile Accounts</h2>
          {fetchError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p><strong>Error:</strong> {fetchError}</p>
            </div>
          )}

          {accounts.length > 0 ? (
            <ul className="mt-4 text-left bg-white p-6 rounded-lg shadow-md">
  {accounts.map((account) => {
    // Extract the numerical ID from the account name (e.g., "accounts/12345")
    const accountId = account.name.split('/')[1];
    return (
      <li key={account.name} className="py-2 border-b last:border-b-0 hover:bg-gray-50">
       <Link href={`/dashboard/locations/${encodeURIComponent(account.name)}`} className="block">
  <p className="font-medium text-lg text-blue-600 hover:underline">{account.accountName}</p>
</Link>
      </li>
    );
  })}
</ul>
          ) : (
            !fetchError && <p className="mt-4 text-gray-500">No accounts found.</p>
          )}
        </div>

        <SignOutButton />
      </div>
    </div>
  )
}