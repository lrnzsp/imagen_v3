// src/app/api/edit/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image_file');
    const maskFile = formData.get('mask');
    const prompt = formData.get('prompt');

    const form = new FormData();
    form.append('image_file', imageFile);
    form.append('mask', maskFile);
    form.append('prompt', prompt);
    form.append('model', 'V_2');
    form.append('magic_prompt_option', 'ON');
    form.append('style_type', 'REALISTIC');

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
    console.error('Error in edit API:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'editing dell\'immagine' }, 
      { status: 500 }
    );
  }
}
