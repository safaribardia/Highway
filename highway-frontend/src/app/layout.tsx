"use client";

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ColorSchemeScript, createTheme } from "@mantine/core";
import { MantineProvider, AppShell, Burger, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";

import Link from "next/link";
import styles from "./layout.module.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const theme = createTheme({
  black: "#0c0d21",
  colors: {
    dark: [
      "#d5d7e0",
      "#acaebf",
      "#8c8fa3",
      "#666980",
      "#4d4f66",
      "#34354a",
      "#2b2c3d",
      "#1d1e30",
      "#0c0d21",
      "#01010a",
    ],
  },
  primaryColor: "dark",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProvider theme={theme}>
          <AppShell
            navbar={{
              width: 300,
              breakpoint: "sm",
              collapsed: { mobile: !opened },
            }}
            padding="md"
            styles={(theme) => ({
              main: {
                backgroundColor: theme.colors?.dark?.[8],
                color: theme.colors?.dark?.[0],
              },
              navbar: {
                borderRight: `2px solid ${theme.colors?.dark?.[6]}`,
              },
            })}
          >
            <AppShell.Navbar
              style={{
                backgroundColor: theme.colors?.dark?.[7],
                padding: "20px",
              }}
            >
              <h1
                style={{
                  fontWeight: "bold",
                  fontSize: "25px",
                  color: "white",
                }}
              >
                HIGHWAY
              </h1>
              <h2 style={{ color: theme.colors?.dark?.[0], fontSize: "12px" }}>
                Test Console
              </h2>
              <h2 style={{ color: theme.colors?.dark?.[0], fontSize: "12px" }}>
                Version 0.1
              </h2>

              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Link
                    className={`${styles.link} ${
                      pathname === "/" ? styles.activeLink : ""
                    }`}
                    href="/"
                  >
                    Dashboard
                  </Link>
                  <Link
                    className={`${styles.link} ${
                      pathname === "/calls" ? styles.activeLink : ""
                    }`}
                    href="/calls"
                  >
                    Verification Call Logs
                  </Link>
                </div>
              </div>

              <div style={{ marginTop: "auto" }}>
                <Button
                  component="a"
                  href="mailto:bardias@stanford.edu"
                  variant="white"
                >
                  Support
                </Button>
              </div>
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
