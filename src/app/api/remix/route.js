import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image_file');
    const prompt = formData.get('prompt');
    const imageWeight = formData.get('image_weight');
    const aspectRatio = formData.get('aspectRatio');

    const form = new FormData();
    form.append('image_request', JSON.stringify({
      prompt: prompt,
      aspect_ratio: aspectRatio,
      image_weight: parseInt(imageWeight),
      magic_prompt_option: "ON",
      model: "V_2"
    }));
    form.append('image_file', imageFile);

    const response = await fetch('https://api.ideogram.ai/remix', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
      },
      body: form
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore durante il remix dell\'immagine' }, 
      { status: 500 }
    );
  }
}
