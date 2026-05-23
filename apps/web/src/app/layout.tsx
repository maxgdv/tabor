// Layout raíz mínimo: el verdadero layout (con <html lang>) vive en [locale]/layout.tsx.
// Next.js exige un layout raíz aunque sea fino.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
