import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const maskFile = formData.get('mask');
    const imageUrl = formData.get('imageUrl');
    const prompt = formData.get('prompt');

    // Download image
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' });

    // Process mask
    const maskBlob = await maskFile.arrayBuffer();
    const maskUint8 = new Uint8Array(maskBlob);
    for (let i = 0; i < maskUint8.length; i++) {
      maskUint8[i] = 255 - maskUint8[i];
    }
    const invertedMaskFile = new File([maskUint8], 'mask.png', { type: 'image/png' });

    // Create form data exactly as in the documentation
    const form = new FormData();
    form.append('image_file', imageFile);
    form.append('mask', invertedMaskFile);
    form.append('prompt', prompt);
    form.append('model', 'V_1');
    form.append('magic_prompt_option', '');
    form.append('seed', '');
    form.append('style_type', '');

    console.log('Sending to Ideogram:', {
      hasImageFile: !!form.get('image_file'),
      imageType: imageFile.type,
      hasMask: !!form.get('mask'),
      maskType: invertedMaskFile.type,
      prompt
    });

    const response = await fetch('https://api.ideogram.ai/edit', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return NextResponse.json({ error: `API Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
