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

    // Inverti la maschera
    const maskBlob = await maskFile.arrayBuffer();
    const maskUint8 = new Uint8Array(maskBlob);
    for (let i = 0; i < maskUint8.length; i++) {
      maskUint8[i] = 255 - maskUint8[i];
    }
    const invertedMaskBlob = new Blob([maskUint8], { type: maskFile.type });
    const invertedMaskFile = new File([invertedMaskBlob], 'mask.png', { type: maskFile.type });

    // Prepara formData per Ideogram
    const form = new FormData();
    form.append('image_file', imageFile);
    form.append('mask', invertedMaskFile);
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
