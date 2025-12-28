import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "../../components/ConvexClientProvider";
import {Toaster} from "sonner";
// For nice notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Real-Time Chat App",
    description: "Built with Next.js and Convex",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={inter.className}>
            <ConvexClientProvider>
                {children}
                <Toaster /> {/* Shows toast notifications */}
            </ConvexClientProvider>
            </body>
            </html>
        </ClerkProvider>
    );
}