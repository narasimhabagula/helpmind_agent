import { useEffect, useState } from "react";

const KEY_NAME = "helpmind:customer-name";
const KEY_CUSTOMER_ID = "helpmind:customer-id";
const KEY_SESSION = "helpmind:session-id";

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function deriveCustomerId(name?: string, explicitId?: string): string {
  if (explicitId && explicitId.trim().length > 0) {
    return explicitId.trim();
  }
  const cleanName = (name || "").toLowerCase().trim();
  if (cleanName.includes("priya")) return "CUST-1024";
  if (cleanName.includes("rahul")) return "CUST-2048";

  const prefix =
    cleanName
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase() || "CUST";
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = (hash << 5) - hash + cleanName.charCodeAt(i);
    hash |= 0;
  }
  const idNum = Math.abs(hash % 9000) + 1000;
  return `CUST-${prefix}-${idNum}`;
}

export function useCustomerName() {
  const [name, setName] = useState<string>("Customer");
  const [customerId, setCustomerIdState] = useState<string>("CUST-1024");
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = window.localStorage.getItem(KEY_NAME) || "Customer";
      const storedCustId = window.localStorage.getItem(KEY_CUSTOMER_ID);
      const computedCustId = storedCustId || deriveCustomerId(storedName);

      setName(storedName);
      setCustomerIdState(computedCustId);

      let storedSession = window.localStorage.getItem(KEY_SESSION);
      if (!storedSession) {
        storedSession = generateSessionId();
        window.localStorage.setItem(KEY_SESSION, storedSession);
      }
      setSessionId(storedSession);
    }
  }, []);

  const save = (value: string, explicitId?: string) => {
    const nextId = deriveCustomerId(value, explicitId);
    setName(value);
    setCustomerIdState(nextId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY_NAME, value);
      window.localStorage.setItem(KEY_CUSTOMER_ID, nextId);
    }
  };

  const switchCustomer = (newName: string, newId: string) => {
    const nextSession = generateSessionId();
    setName(newName);
    setCustomerIdState(newId);
    setSessionId(nextSession);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY_NAME, newName);
      window.localStorage.setItem(KEY_CUSTOMER_ID, newId);
      window.localStorage.setItem(KEY_SESSION, nextSession);
    }
  };

  const newSession = () => {
    const nextSession = generateSessionId();
    setSessionId(nextSession);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY_SESSION, nextSession);
    }
    return nextSession;
  };

  return {
    name,
    setName: save,
    customerId,
    setCustomerId: setCustomerIdState,
    sessionId,
    startNewSession: newSession,
    switchCustomer,
  };
}

export function storeCustomerName(value: string, explicitId?: string) {
  if (typeof window !== "undefined") {
    const finalId = deriveCustomerId(value, explicitId);
    window.localStorage.setItem(KEY_NAME, value);
    window.localStorage.setItem(KEY_CUSTOMER_ID, finalId);
    // When starting with a customer, always initialize a fresh session ID
    const newSession = generateSessionId();
    window.localStorage.setItem(KEY_SESSION, newSession);
  }
}

export function getStoredCustomerId(): string {
  if (typeof window !== "undefined") {
    const id = window.localStorage.getItem(KEY_CUSTOMER_ID);
    if (id) return id;
    const name = window.localStorage.getItem(KEY_NAME) || "Customer";
    const derived = deriveCustomerId(name);
    window.localStorage.setItem(KEY_CUSTOMER_ID, derived);
    return derived;
  }
  return "CUST-1024";
}

export function getStoredSessionId(): string {
  if (typeof window !== "undefined") {
    let id = window.localStorage.getItem(KEY_SESSION);
    if (!id) {
      id = generateSessionId();
      window.localStorage.setItem(KEY_SESSION, id);
    }
    return id;
  }
  return generateSessionId();
}

export function clearCustomerName() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY_NAME);
    window.localStorage.removeItem(KEY_CUSTOMER_ID);
    window.localStorage.removeItem(KEY_SESSION);
  }
}
