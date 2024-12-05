import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const maskFile = formData.get('mask');
    const imageUrl = formData.get('imageUrl'); // Ora riceviamo l'URL invece del file
    const prompt = formData.get('prompt');

    // Scarichiamo l'immagine nel backend
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Creiamo il nuovo FormData per Ideogram
    const ideogramFormData = new FormData();
    ideogramFormData.append('image_file', imageBlob, 'image.jpg');
    ideogramFormData.append('mask', maskFile);
    ideogramFormData.append('prompt', prompt);
    ideogramFormData.append('model', 'V_2');
    ideogramFormData.append('magic_prompt_option', 'ON');
    ideogramFormData.append('style_type', 'REALISTIC');

    const response = await fetch('https://api.ideogram.ai/edit', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
      },
      body: ideogramFormData
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
