'use client';

import StyledComponentsRegistry from '@/lib/styled-components-registry';
import { alchemyTheme } from '@/styles/theme';
import { Geist } from 'next/font/google';
import { ThemeProvider } from 'styled-components';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <title>알케믹 퓨전 - 연금술사의 실험실</title>
        <meta
          name="description"
          content="원소들의 신비로운 상호작용을 관찰하는 전략 파티 게임"
        />
      </head>
      <body style={{ fontFamily: `${geistSans.style.fontFamily}, sans-serif` }}>
        <StyledComponentsRegistry>
          <ThemeProvider theme={alchemyTheme}>{children}</ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
