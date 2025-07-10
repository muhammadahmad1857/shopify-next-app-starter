"use client";

import { AppProvider, Link } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import SessionProvider from "./session-provider";
import { TanstackProvider } from "./tanstack-provider";
import { NavMenu } from "@shopify/app-bridge-react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={translations}>
      <NavMenu>
        <Link url="/new">New Page</Link>
      </NavMenu>
      <TanstackProvider>
        <SessionProvider>{children}</SessionProvider>
      </TanstackProvider>
    </AppProvider>
  );
}

export function ExitProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider i18n={translations}>
      {/* <NavMenu>
        <Link url="/new">New Page</Link>
      </NavMenu> */}

      {children}
    </AppProvider>
  );
}
