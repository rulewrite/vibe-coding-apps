import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '알케믹 퓨전 - Alchemic Fusion',
  description:
    '신비로운 연금술사의 실험실에서 펼쳐지는 원소들의 장대한 모험! 각자의 원소를 선택하고, 예측 불가능한 상호작용을 관찰하세요.',
  keywords: [
    '게임',
    '알케믹 퓨전',
    '연금술',
    '원소',
    '물리 시뮬레이션',
    '파티 게임',
  ],
  authors: [{ name: '천재 기획자' }],
  openGraph: {
    title: '알케믹 퓨전 - Alchemic Fusion',
    description:
      '신비로운 연금술사의 실험실에서 펼쳐지는 원소들의 장대한 모험!',
    type: 'website',
    locale: 'ko_KR',
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
