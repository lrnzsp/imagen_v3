import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const requestData = await req.json();
    console.log('Received request:', requestData);

    const res = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    const data = await res.json();
    console.log('API Response:', data);

    if (!res.ok) {
      throw new Error(data.error || 'API Error');
    }

    return NextResponse.json(data);
    
  } catch (e) {
    console.error('Error in API route:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
