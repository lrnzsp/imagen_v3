import './globals.css'

export const metadata = {
  title: 'IMAGEN',
  description: 'Genera immagini con AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
