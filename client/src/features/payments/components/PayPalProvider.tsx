import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

// This should ideally come from an env var, but for MVP we can hardcode 'sb' (sandbox)
// or fetch it from an API endpoint configuration.
const initialOptions = {
    clientId: "sb", // Replace with import.meta.env.VITE_PAYPAL_CLIENT_ID in real app
    currency: "USD",
    intent: "capture",
};

export const PayPalProvider = ({ children }: { children: ReactNode }) => {
    return (
        <PayPalScriptProvider options={initialOptions}>
            {children}
        </PayPalScriptProvider>
    );
};
