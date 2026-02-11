import { Geist, Geist_Mono } from "next/font/google";
import {AuthProvider} from "@/context/AuthContext";
import "./globals.css";
// In src/app/layout.js, add to <head>:
<script src="https://checkout.razorpay.com/v1/checkout.js" />

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Gym Management System',
  description: 'Ultra-fast gym management SaaS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}