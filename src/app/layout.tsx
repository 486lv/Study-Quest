import type { Metadata } from "next";
// 🟢 关键：引入所有需要的字体
import { 
  Inter, 
  Press_Start_2P, 
  Share_Tech_Mono, 
  Playfair_Display, 
  Noto_Serif_SC, 
  Nunito 
} from "next/font/google"; 
import "./globals.css";

// 配置字体加载
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: '--font-pixel' });
const mono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: '--font-mono' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const serifSC = Noto_Serif_SC({ weight: "700", subsets: ["latin"], variable: '--font-serif-sc' }); 
const nunito = Nunito({ subsets: ["latin"], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: "Study Quest",
  description: "Gamify your focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 🟢 关键：将变量注入到 body 中 */}
      <body className={`
        ${inter.variable} ${pixel.variable} ${mono.variable} 
        ${playfair.variable} ${serifSC.variable} ${nunito.variable} 
        font-sans antialiased
      `}>
        {children}
      </body>
    </html>
  );
}