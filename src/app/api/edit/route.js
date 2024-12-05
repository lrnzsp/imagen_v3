export async function POST(req) {
  try {
    const formData = await req.formData();
    const maskFile = formData.get('mask');
    const imageUrl = formData.get('imageUrl');
    const prompt = formData.get('prompt');

    // Verifichiamo che la maschera sia presente
    console.log('Received mask:', maskFile);
    console.log('Mask type:', maskFile?.type);
    console.log('Mask size:', maskFile?.size);

    // Creiamo il nuovo FormData per Ideogram
    const ideogramFormData = new FormData();
    ideogramFormData.append('image_file', imageBlob, 'image.jpg');
    ideogramFormData.append('mask', maskFile, 'mask.png'); // Aggiungiamo un nome file
    ideogramFormData.append('prompt', prompt);
    ideogramFormData.append('model', 'V_2');

    // Log della richiesta a Ideogram
    console.log('Sending to Ideogram:', {
      hasImageFile: !!ideogramFormData.get('image_file'),
      hasMask: !!ideogramFormData.get('mask'),
      prompt,
      model: 'V_2'
    });

    const response = await fetch('https://api.ideogram.ai/edit', {
      method: 'POST',
      headers: {
        'Api-Key': 'cTwZUoIc3Pse-EImC28fix8cWUWtB6CBdbRBRUny5KXjC00REAircBryE7r30G2fUxyk--vDBksFyB0BwnSAUg'
      },
      body: ideogramFormData
    });

    const data = await response.json();
    // Log della risposta
    console.log('Ideogram response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in edit API:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'editing dell\'immagine' }, 
      { status: 500 }
    );
  }
}
