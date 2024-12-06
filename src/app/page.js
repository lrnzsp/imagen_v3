'use client';

import { useState } from 'react';

const FIXED_PREFIX = "a fashion photograph of";

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageWeight, setImageWeight] = useState(50);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('ASPECT_1_1');
  const [colorPalette, setColorPalette] = useState('');
  const [isOpenPalette, setIsOpenPalette] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [maskFile, setMaskFile] = useState(null);
  const [maskPreviewUrl, setMaskPreviewUrl] = useState(null);

  const aspectRatioOptions = {
    'ASPECT_1_1': '1:1 Quadrato',
    'ASPECT_10_16': '10:16 Verticale',
    'ASPECT_16_10': '16:10 Panoramico',
    'ASPECT_9_16': '9:16 Mobile',
    'ASPECT_16_9': '16:9 Widescreen',
    'ASPECT_3_2': '3:2 Fotografia',
    'ASPECT_2_3': '2:3 Ritratto',
    'ASPECT_4_3': '4:3 Standard',
    'ASPECT_3_4': '3:4 Verticale',
    'ASPECT_1_3': '1:3 Banner Verticale',
    'ASPECT_3_1': '3:1 Banner Orizzontale'
  };

  const colorPalettes = {
    '': { 
      name: 'Nessuna palette', 
      colors: [] 
    },
    'EMBER': { 
      name: 'Ember',
      colors: ['#FF4400', '#FF7744', '#FF9977', '#FFBB99']
    },
    'FRESH': {
      name: 'Fresh',
      colors: ['#00CC77', '#00DDAA', '#00BBFF', '#0099FF']
    },
    'JUNGLE': {
      name: 'Jungle',
      colors: ['#228833', '#55AA44', '#88CC66', '#AADD88']
    },
    'MAGIC': {
      name: 'Magic',
      colors: ['#6600FF', '#9944FF', '#CC88FF', '#EECCFF']
    },
    'MELON': {
      name: 'Melon',
      colors: ['#FF6677', '#FF99AA', '#FFCCDD', '#FFEEFF']
    },
    'MOSAIC': {
      name: 'Mosaic',
      colors: ['#FF4444', '#44FF44', '#4444FF', '#FFFF44']
    },
    'PASTEL': {
      name: 'Pastel',
      colors: ['#FFB3B3', '#B3FFB3', '#B3B3FF', '#FFFFB3']
    },
    'ULTRAMARINE': {
      name: 'Ultramarine',
      colors: ['#0033CC', '#0044FF', '#4477FF', '#99BBFF']
    }
  };

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  }

  function clearImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
    setIsEditMode(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('image_file', imageFile);
        formData.append('prompt', `${FIXED_PREFIX} ${prompt}`);
        formData.append('image_weight', imageWeight.toString());
        formData.append('aspectRatio', aspectRatio);

        res = await fetch('/api/remix', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image_request: {
              prompt: `${FIXED_PREFIX} ${prompt}`,
              aspect_ratio: aspectRatio,
              model: "V_2",
              magic_prompt_option: "ON",
              style_type: "REALISTIC",
              color_palette: colorPalette ? { name: colorPalette } : undefined
            }
          })
        });
      }

      const data = await res.json();
      console.log('API Response:', data);
      
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'elaborazione');
      
      if (!data || !data.data || !data.data[0] || !data.data[0].url) {
        throw new Error('Risposta API non valida: formato inatteso');
      }
      
      setImageUrl(data.data[0].url);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCanvasToMask() {
    const canvas = document.getElementById('maskCanvas');
    const tempCanvas = document.createElement('canvas');
    
    // Get the original image dimensions
    const img = new Image();
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageUrl;
    });
    
    // Set the canvas to the exact dimensions of the original image
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    
    // Copy and scale the content from our drawing canvas
    const tempCtx = tempCanvas.getContext('2d');
    
    // Riempi prima tutto di bianco (area da preservare)
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Disegna il contenuto del canvas originale in nero
    tempCtx.globalCompositeOperation = 'difference';
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const maskBlob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    return maskFile;
  }

  async function handleGenerativeFill() {
    if (!imageUrl || !editPrompt) {
      setError('Sono necessari l\'immagine e il prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const maskFile = await handleCanvasToMask();
      console.log("Sending mask file:", maskFile);
      console.log("Mask file type:", maskFile.type);
      console.log("Mask file size:", maskFile.size);

      const formData = new FormData();
      formData.append('imageUrl', imageUrl);
      formData.append('mask', maskFile);
      formData.append('prompt', `${FIXED_PREFIX} ${editPrompt}`);

      const res = await fetch('/api/edit', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log('Edit API Response:', data);
      
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'elaborazione');
      
      if (!data || !data.data || !data.data[0] || !data.data[0].url) {
        throw new Error('Risposta API non valida: formato inatteso');
      }
      
      setImageUrl(data.data[0].url);
      setIsEditMode(false);
      setEditPrompt('');
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedPalette = colorPalettes[colorPalette] || colorPalettes[''];

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center title-font">
          IMAGE GENERATOR
        </h1>

        {!isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-black border border-white/20 rounded-2xl p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">
                Immagine di riferimento (opzionale)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300"
                >
                  Carica immagine
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="px-3 py-2 text-white border border-white rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    Rimuovi
                  </button>
                )}
              </div>
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Anteprima"
                    className="w-full max-h-48 object-contain rounded-xl border border-white/20"
                  />
                </div>
              )}
            </div>

            {imageFile && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Peso dell&apos;immagine: {imageWeight}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={imageWeight}
                    onChange={(e) => setImageWeight(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Formato Output
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2 bg-black border border-white rounded-lg text-white focus:ring-2 focus:ring-white transition-all duration-300"
                  >
                    {Object.entries(aspectRatioOptions).map(([value, label]) => (
                      <option key={value} value={value} className="bg-black">{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {!imageFile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Formato
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full p-2 bg-black border border-white rounded-lg text-white focus:ring-2 focus:ring-white transition-all duration-300"
                    >
                      {Object.entries(aspectRatioOptions).map(([value, label]) => (
                        <option key={value} value={value} className="bg-black">{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Palette Colori
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsOpenPalette(!isOpenPalette)}
                        className="w-full p-2 bg-black border border-white rounded-lg text-white cursor-pointer hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
                      >
                        <div className="flex gap-1">
                          {selectedPalette.colors.map((color, index) => (
                            <span 
                              key={index} 
                              className="inline-block w-3 h-3 rounded-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span>{selectedPalette.name}</span>
                      </div>
                      
                      {isOpenPalette && (
                        <div className="absolute z-50 w-full mt-1 bg-black border border-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {Object.entries(colorPalettes).map(([value, palette]) => (
                            <div
                              key={value}
                              onClick={() => {
                                setColorPalette(value);
                                setIsOpenPalette(false);
                              }}
                              className="p-2 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                            >
                              <div className="flex gap-1">
                                {palette.colors.map((color, index) => (
                                  <span 
                                    key={index}
                                    className="inline-block w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span>{palette.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descrivi l'immagine che vuoi generare..."
                className="w-full p-4 bg-black border border-white rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white transition-all duration-300"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black p-4 rounded-lg font-medium 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-gray-200 
                       transform transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generazione in corso...
                </span>
              ) : (
                imageFile ? 'Remix Immagine' : 'Genera Immagine'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 bg-black border border-white/20 rounded-2xl p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Modalità Editing</h2>
              
              <div className="mt-4 relative">
                <img
                  src={imageUrl}
                  alt="Immagine da modificare"
                  className="w-full rounded-lg"
                  onLoad={(e) => {
                    // Otteniamo le dimensioni reali dell'immagine
                    const img = e.target;
                    const tempImg = new Image();
                    tempImg.onload = () => {
                      const canvas = document.getElementById('maskCanvas');
                      canvas.width = tempImg.naturalWidth;
                      canvas.height = tempImg.naturalHeight;
                      canvas.style.width = '100%';
                      canvas.style.height = '100%';
                      canvas.style.position = 'absolute';
                      canvas.style.left = '0';
                      canvas.style.top = '0';

                      const ctx = canvas.getContext('2d');
                      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
                      ctx.lineWidth = 20;
                      ctx.lineCap = 'round';

                      let isDrawing = false;
                      let lastX = 0;
                      let lastY = 0;

                      const getCoordinates = (e) => {
                        const rect = canvas.getBoundingClientRect();
                        const scaleX = canvas.width / rect.width;
                        const scaleY = canvas.height / rect.height;
                        return [
                          (e.clientX - rect.left) * scaleX,
                          (e.clientY - rect.top) * scaleY
                        ];
                      };

                      canvas.onmousedown = (e) => {
                        isDrawing = true;
                        [lastX, lastY] = getCoordinates(e);
                      };

                      canvas.onmousemove = (e) => {
                        if (!isDrawing) return;
                        const [currentX, currentY] = getCoordinates(e);
                        ctx.beginPath();
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(currentX, currentY);
                        ctx.stroke();
                        [lastX, lastY] = [currentX, currentY];
                      };

                      canvas.onmouseup = () => isDrawing = false;
                      canvas.onmouseleave = () => isDrawing = false;
                    };
                    tempImg.src = imageUrl;
                  }}
                />
                <canvas
                  id="maskCanvas"
                  className="absolute top-0 left-0 cursor-crosshair z-10"
                  style={{ 
                    backgroundColor: 'transparent',
                    touchAction: 'none'
                  }}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const canvas = document.getElementById('maskCanvas');
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300"
                >
                  Pulisci Maschera
                </button>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm whitespace-nowrap">Dimensione:</span>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    defaultValue="100"
                    onChange={(e) => {
                      const canvas = document.getElementById('maskCanvas');
                      const ctx = canvas.getContext('2d');
                      ctx.lineWidth = e.target.value;
                    }}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Descrivi cosa vuoi generare nella zona mascherata..."
                  className="w-full p-4 bg-black border border-white rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white transition-all duration-300"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGenerativeFill}
                  disabled={loading || !editPrompt}
                  className="flex-1 bg-white text-black p-4 rounded-lg font-medium 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-200 transition-all duration-300"
                >
                  {loading ? 'Elaborazione...' : 'Generative Fill'}
                </button>
                <button
                  onClick={() => {
                    setIsEditMode(false);
                    setEditPrompt('');
                  }}
                  className="px-6 py-4 text-white border border-white rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 border border-red-500 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        {!isEditMode && imageUrl && (
          <div className="mt-8 bg-black border border-white/20 rounded-2xl p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setEditPrompt('');
                }}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                Edit
              </button>
            </div>
            <img 
              src={imageUrl} 
              alt="Immagine generata"
              className="w-full rounded-lg" 
            />
          </div>
        )}
      </div>
    </main>
  );
}
