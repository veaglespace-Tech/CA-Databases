import "./globals.css";

export const metadata = {
  title: "Valuexpert Database Dashboard",
  description: "Secure read-only dashboard for all MySQL databases containing valuexpert in the name",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
