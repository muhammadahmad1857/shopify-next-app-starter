"use client";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { doWebhookRegistration, storeToken } from "../actions";
import Script from "next/script";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  <Script
    src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
    strategy="beforeInteractive"
  />;
  const app = useAppBridge();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const token = await app.idToken();

        try {
          await storeToken(token);
          console.log("Token stored");
        } catch (error) {
          console.error("Error storing token", error);
        }

        try {
          await doWebhookRegistration(token);
          console.log("Webhook registered");
        } catch (error) {
          console.error("Error registering webhook", error);
        }
      } catch (error) {
        console.error("Error getting token", error);
      }
    };

    initializeSession();
  }, [app]);

  return <>{children}</>;
}
