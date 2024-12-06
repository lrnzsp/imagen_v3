import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image_file');

    // Invia l'immagine a Ideogram o a un altro servizio di storage
    const uploadFormData = new FormData();
    uploadFormData.append('image_file', imageFile);

    const response = await fetch('https://api.ideogram.ai/upload', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY
      },
      body: uploadFormData
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
