import { NextResponse } from 'next/server';

export const runtime = 'edge';

async function convertToJpeg(blob) {
  // Create ImageData from blob
  const arrayBuffer = await blob.arrayBuffer();
  const response = await fetch('data:' + blob.type + ';base64,' + Buffer.from(arrayBuffer).toString('base64'));
  const imageData = await response.blob();
  
  // Convert to JPEG
  const jpegBlob = new Blob([imageData], { type: 'image/jpeg' });
  return new File([jpegBlob], 'image.jpeg', {
    type: 'image/jpeg',
    lastModified: new Date().getTime()
  });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const maskFile = formData.get('mask');
    const imageUrl = formData.get('imageUrl');
    const prompt = formData.get('prompt');

    // Download image
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    console.log('Original image type:', imageBlob.type);

    // Convert image to JPEG
    const imageFile = await convertToJpeg(imageBlob);
    console.log('Converted image type:', imageFile.type);

    // Handle mask
    const maskBlob = await maskFile.arrayBuffer();
    const maskUint8 = new Uint8Array(maskBlob);
    for (let i = 0; i < maskUint8.length; i++) {
      maskUint8[i] = 255 - maskUint8[i];
    }
    const invertedMaskBlob = new Blob([maskUint8], { type: 'image/png' });
    const invertedMaskFile = new File([invertedMaskBlob], 'mask.png', { 
      type: 'image/png',
      lastModified: new Date().getTime()
    });

    // Prepare FormData
    const form = new FormData();
    form.append('image_file', imageFile);
    form.append('mask', invertedMaskFile);
    form.append('prompt', prompt);
    form.append('model', 'V_2');
    form.append('style_type', 'REALISTIC');

    // Enhanced logging
    console.log('Sending to Ideogram:', {
      hasImageFile: !!form.get('image_file'),
      imageFileType: imageFile.type,
      imageFileName: imageFile.name,
      imageFileSize: imageFile.size,
      hasMask: !!form.get('mask'),
      maskFileType: invertedMaskFile.type,
      maskFileSize: invertedMaskFile.size,
      prompt: prompt
    });

    const response = await fetch('https://api.ideogram.ai/edit', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
      },
      body: form
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return NextResponse.json({ error: `API Error: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('Ideogram response data:', JSON.stringify(data, null, 2));
    
    if (!data || !data.image_url) {
      console.error('Invalid API response format:', data);
      return NextResponse.json({ error: 'Invalid API response format' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
