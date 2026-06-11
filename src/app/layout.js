import "./globals.css";

export const metadata = {
  title: "Valuexpert Database Dashboard",
  description: "Secure read-only dashboard for the valuexpert MySQL database",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
