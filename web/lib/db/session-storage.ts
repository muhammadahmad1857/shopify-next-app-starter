import { Session as ShopifySession } from "@shopify/shopify-api";
import axios from "axios";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
class BackendSessionStorage {
  constructor(private baseUrl: string) {}

  async storeSession(session: ShopifySession) {
    const timestamp = new Date().toISOString();
    console.log(
      `[BackendSessionStorage] storeSession called at ${timestamp} for session ID: ${session.id}, shop: ${session.shop}`,
    );
    console.log(
      `[BackendSessionStorage] Call stack:`,
      new Error().stack?.split("\n").slice(1, 4),
    );

    try {
      await axios.post(`${this.baseUrl}/sessions`, session, {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      });
      console.log(
        `[BackendSessionStorage] storeSession completed successfully for session ID: ${session.id}`,
      );
    } catch (error) {
      console.error(
        `[BackendSessionStorage] storeSession failed for session ID: ${session.id}`,
        error,
      );
      throw error;
    }
    return true;
  }

  async loadSession(id: string) {
    console.log(`[BackendSessionStorage] loadSession called for ID: ${id}`);
    try {
      const { data } = await axios.get(`${this.baseUrl}/sessions/${id}`, {
        timeout: 5000,
      });

      const session = new ShopifySession({
        id: data.id,
        shop: data.shop,
        state: data.state,
        isOnline: data.isOnline,
      });

      session.accessToken = data.accessToken;
      session.scope = data.scope;
      session.expires = data.expires ? new Date(data.expires) : undefined;
      session.onlineAccessInfo = data.onlineAccessInfo || undefined;

      console.log(
        `[BackendSessionStorage] loadSession wrapped session for ID: ${id}`,
      );
      return session;
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log(
          `[BackendSessionStorage] loadSession - session not found for ID: ${id}`,
        );
        return undefined;
      }
      console.error(
        `[BackendSessionStorage] loadSession error for ID: ${id}`,
        err,
      );
      throw err;
    }
  }

  async deleteSession(id: string) {
    console.log(`[BackendSessionStorage] deleteSession called for ID: ${id}`);
    try {
      await axios.delete(`${this.baseUrl}/sessions/${id}`, {
        timeout: 5000,
      });
      console.log(
        `[BackendSessionStorage] deleteSession completed for ID: ${id}`,
      );
    } catch (error) {
      console.error(
        `[BackendSessionStorage] deleteSession failed for ID: ${id}`,
        error,
      );
      throw error;
    }
    return true;
  }

  async deleteSessions(ids: string[]) {
    console.log(
      `[BackendSessionStorage] deleteSessions called for ${ids.length} IDs: ${ids.join(", ")}`,
    );
    try {
      await axios.delete(`${this.baseUrl}/sessions`, {
        data: { ids },
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      });
      console.log(
        `[BackendSessionStorage] deleteSessions completed for ${ids.length} sessions`,
      );
    } catch (error) {
      console.error(
        `[BackendSessionStorage] deleteSessions failed for ${ids.length} sessions`,
        error,
      );
      throw error;
    }
    return true;
  }

  async findSessionsByShop(shop: string) {
    console.log(
      `[BackendSessionStorage] findSessionsByShop called for shop: ${shop}`,
    );
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/sessions/shop/${shop}`,
        {
          timeout: 5000,
        },
      );

      const sessions = data.map((raw: any) => {
        const session = new ShopifySession({
          id: raw.id,
          shop: raw.shop,
          state: raw.state,
          isOnline: raw.isOnline,
        });

        session.accessToken = raw.accessToken;
        session.scope = raw.scope;
        session.expires = raw.expires ? new Date(raw.expires) : undefined;
        session.onlineAccessInfo = raw.onlineAccessInfo || undefined;
        return session;
      });

      console.log(
        `[BackendSessionStorage] findSessionsByShop found ${sessions.length} sessions for shop: ${shop}`,
      );
      return sessions;
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log(
          `[BackendSessionStorage] findSessionsByShop - no sessions found for shop: ${shop}`,
        );
        return [];
      }
      console.error(
        `[BackendSessionStorage] findSessionsByShop error for shop: ${shop}`,
        err,
      );
      throw err;
    }
  }
}

// Export the individual functions that were previously exported
// These will now use the BackendSessionStorage class
const backendStorage = new BackendSessionStorage(BASE_URL);

export async function storeSession(session: ShopifySession) {
  return await backendStorage.storeSession(session);
}

export async function loadSession(id: string) {
  return await backendStorage.loadSession(id);
}

export async function deleteSession(id: string) {
  return await backendStorage.deleteSession(id);
}

export async function deleteSessions(ids: string[]) {
  return await backendStorage.deleteSessions(ids);
}

export async function findSessionsByShop(shop: string) {
  return await backendStorage.findSessionsByShop(shop);
}

// Legacy function from the original implementation
// export async function cleanUpSession(shop: string, accessToken: string) {
//   console.log(
//     `[BackendSessionStorage] cleanUpSession called for shop: ${shop}`,
//   );
//   try {
//     await axios.delete(`${backendStorage["baseUrl"]}/sessions/cleanup`, {
//       data: { shop, accessToken },
//       headers: { "Content-Type": "application/json" },
//       timeout: 5000,
//     });
//     console.log(
//       `[BackendSessionStorage] cleanUpSession completed for shop: ${shop}`,
//     );
//   } catch (error) {
//     console.error(
//       `[BackendSessionStorage] cleanUpSession failed for shop: ${shop}`,
//       error,
//     );
//     throw error;
//   }
// }

export class SessionNotFoundError extends Error {
  constructor() {
    super("Session not found");
    this.name = "SessionNotFoundError";
  }
}

// Export the class as well if needed elsewhere
export default BackendSessionStorage;
