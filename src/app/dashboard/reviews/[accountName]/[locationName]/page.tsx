// src/app/dashboard/reviews/[accountName]/[locationName]/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface GbpReview {
  name: string;
  starRating: string;
  comment: string;
  reviewer: {
    displayName: string;
  };
}

// Receive both accountName and locationName from the URL
export default async function LocationReviewPage({ params }: { params: { accountName: string, locationName: string } }) {
  // Fix the cookie warning
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const accountName = decodeURIComponent(params.accountName);
  const locationName = decodeURIComponent(params.locationName);
  
  let reviews: GbpReview[] = [];
  let fetchError: string | null = null;

  try {
    const googleAccessToken = session.provider_token;
    if (!googleAccessToken) {
      throw new Error("Google provider token not found.");
    }
    
    // Build the full, correct path using both parameters
    const fullLocationPath = `${accountName}/${locationName}`;
    
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${fullLocationPath}/reviews`, {
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Error Response:", errorText);
      throw new Error(`Google API returned an error (status ${response.status})`);
    }

    const data = await response.json();
    reviews = data.reviews || [];

  } catch (error: any) {
    console.error("Error fetching GBP reviews:", error);
    fetchError = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
      <div className="w-full max-w-4xl">
  <Link href={`/dashboard/locations/${params.accountName}`} className="text-blue-600 hover:underline mb-6 block">&larr; Back to Locations</Link>
  {/* ADD THIS NEW LINK */}
  <Link href={`/dashboard/qa/${params.accountName}/${params.locationName}`} className="text-green-600 hover:underline mb-6 block">View Q&A for this Location &rarr;</Link>
  <h1 className="text-3xl font-bold text-center">Location Reviews</h1>
        
        <div className="mt-8">
          {fetchError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p><strong>Error:</strong> {fetchError}</p>
            </div>
          )}

          {reviews.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {reviews.map((review) => (
                <li key={review.name} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{review.reviewer.displayName}</p>
                    <p className="text-sm font-bold text-yellow-500">{review.starRating}</p>
                  </div>
                  {review.comment && <p className="mt-2 text-gray-600">{review.comment}</p>}
                </li>
              ))}
            </ul>
          ) : (
            !fetchError && <p className="mt-4 text-gray-500 text-center">No reviews found for this location.</p>
          )}
        </div>
      </div>
    </div>
  );
}