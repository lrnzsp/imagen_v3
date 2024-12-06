import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const maskFile = formData.get('mask');
    const imageUrl = formData.get('imageUrl');
    const imageFile = formData.get('image_file');
    const prompt = formData.get('prompt');

    // Se abbiamo un imageFile, lo usiamo direttamente
    let finalImageFile;
    if (imageFile) {
      finalImageFile = imageFile;
    } else {
      // Altrimenti scarica l'immagine dall'URL come prima
      const imageRes = await fetch(imageUrl);
      const imageBlob = await imageRes.blob();
      finalImageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' });
    }

    // Prepara formData per Ideogram
    const form = new FormData();
    form.append('image_file', finalImageFile);
    if (maskFile) {
      form.append('mask', maskFile);
    }
    if (prompt) {
      form.append('prompt', prompt);
    }
    form.append('model', 'V_2');
    form.append('style_type', 'REALISTIC');

    console.log('Sending to Ideogram:', {
      hasImageFile: !!form.get('image_file'),
      hasMask: !!form.get('mask'),
      prompt: prompt
    });

    const response = await fetch('https://api.ideogram.ai/edit', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY
      },
      body: form
    });

    const data = await response.json();
    console.log('Ideogram response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
