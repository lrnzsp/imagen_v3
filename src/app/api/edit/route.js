import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const maskFile = formData.get('mask');
    const imageUrl = formData.get('imageUrl');
    const prompt = formData.get('prompt');

    // Download immagine
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' });

    // Prepara formData per Ideogram
    const form = new FormData();
    form.append('image_file', imageFile);
    form.append('mask', maskFile);
    form.append('prompt', prompt);
    form.append('model', 'V_2');

    // Chiamata API Ideogram
    const response = await fetch('https://api.ideogram.ai/edit', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
      },
      body: form
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
