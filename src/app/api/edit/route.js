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

    // Inverti i colori della maschera
    const maskBuffer = await maskFile.arrayBuffer();
    const maskData = new Uint8Array(maskBuffer);
    for (let i = 0; i < maskData.length; i++) {
      maskData[i] = 255 - maskData[i];
    }
    const invertedMask = new File([maskData], 'mask.png', { type: 'image/png' });

    // Prepara formData per Ideogram esattamente come nella documentazione
    const form = new FormData();
    form.append('image_file', imageFile);
    form.append('mask', invertedMask);  // Usa la maschera invertita
    form.append('prompt', prompt);
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
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
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
