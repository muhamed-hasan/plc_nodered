import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "PLC Vision Control | Dashboard",
  description: "Advanced PLC Configuration & Modbus Trigger Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Navigation />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
