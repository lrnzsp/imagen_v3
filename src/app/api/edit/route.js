// src/app/api/edit/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req) {
 try {
   const formData = await req.formData();
   const imageUrl = formData.get('imageUrl');
   const maskFile = formData.get('mask');
   const prompt = formData.get('prompt');

   const imageRes = await fetch(imageUrl);
   const imageBlob = await imageRes.blob();
   const imageFile = new File([imageBlob], 'image.jpg', { type: 'image/jpeg' });

   const form = new FormData();
   form.append('image_file', imageFile);
   form.append('mask', maskFile);
   form.append('prompt', prompt);
   form.append('model', 'V_2');
   form.append('magic_prompt_option', 'ON');
   form.append('style_type', 'REALISTIC');

   console.log('Sending to Ideogram:', {
     hasImage: !!form.get('image_file'),
     hasMask: !!form.get('mask'),
     prompt
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
   
   if (!response.ok) {
     throw new Error(data.error || data.errors?.[0] || 'API Error');
   }

   return NextResponse.json(data);
 } catch (error) {
   console.error('Error:', error);
   return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
