import "./globals.css";
import Navigation from "../components/Navigation";
import LicenseGate from "../components/LicenseGate";

export const metadata = {
  title: "PLC Vision Control | Dashboard",
  description: "Advanced PLC Configuration & Modbus Trigger Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LicenseGate>
          <div className="app-container">
            <Navigation />
            <main className="main-content">
              {children}
            </main>
          </div>
        </LicenseGate>
      </body>
    </html>
  );
}
