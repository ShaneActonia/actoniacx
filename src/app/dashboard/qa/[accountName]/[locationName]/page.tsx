// src/app/dashboard/qa/[accountName]/[locationName]/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface GbpQuestion {
  name: string;
  displayName: string;
  text: string;
  createTime: string;
  answers?: GbpAnswer[];
}

interface GbpAnswer {
    name: string;
    text: string;
    createTime: string;
}

export default async function LocationQAPage({ params }: { params: { accountName: string, locationName: string } }) {
  const supabase = createServerComponentClient({ cookies: () => cookies() });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const accountName = decodeURIComponent(params.accountName);
  const locationName = decodeURIComponent(params.locationName);
  
  let questions: GbpQuestion[] = [];
  let fetchError: string | null = null;

  try {
    const googleAccessToken = session.provider_token;
    if (!googleAccessToken) {
      throw new Error("Google provider token not found.");
    }
    
    const fullLocationPath = `${accountName}/${locationName}`;
    
    const readMask = 'name,displayName,text,createTime,answers';
const response = await fetch(`https://mybusinessqanda.googleapis.com/v1/${locationName}/questions`, {
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
    questions = data.questions || [];

  } catch (error: any) {
    console.error("Error fetching GBP Q&A:", error);
    fetchError = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-24 bg-gray-50">
      <div className="w-full max-w-4xl">
        <Link href={`/dashboard/reviews/${params.accountName}/${params.locationName}`} className="text-blue-600 hover:underline mb-6 block">&larr; Back to Reviews</Link>
        <h1 className="text-3xl font-bold text-center">Location Q&A</h1>
        
        <div className="mt-8">
          {fetchError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              <p><strong>Error:</strong> {fetchError}</p>
            </div>
          )}

          {questions.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {questions.map((question) => (
                <li key={question.name} className="bg-white p-4 rounded-lg shadow-md">
                  <p className="font-semibold text-gray-800">Q: {question.text}</p>
                  <p className="text-sm text-gray-500 mt-1">Asked by: {question.displayName}</p>
                  {question.answers && question.answers.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-green-500">
                      <p className="font-semibold text-gray-700">A: {question.answers[0].text}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            !fetchError && <p className="mt-4 text-gray-500 text-center">No questions found for this location.</p>
          )}
        </div>
      </div>
    </div>
  );
}