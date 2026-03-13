import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Helper to create order on backend
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const createOrder = async (ticketId: number, amount: string) => {
    const response = await axios.post(`${API_URL}/payments/create-order`, {
        ticketId,
        amount
    }, { withCredentials: true });
    return response.data.id;
};

// Helper to capture order on backend
const onApprove = async (data: any, ticketId: number) => {
    const response = await axios.post(`${API_URL}/payments/capture-order`, {
        orderID: data.orderID,
        ticketId
    }, { withCredentials: true });
    return response.data;
};

interface PaymentButtonProps {
    ticketId: number;
    amount: string;
    onSuccess: () => void;
}

export const PaymentButton = ({ ticketId, amount, onSuccess }: PaymentButtonProps) => {
    const [{ isPending }] = usePayPalScriptReducer();
    const { t } = useTranslation();

    if (isPending) return <div className="animate-pulse h-10 bg-slate-700 rounded-lg w-full"></div>;

    return (
        <PayPalButtons
            style={{ layout: "horizontal", color: "blue", tagline: false, height: 40 }}
            createOrder={(data, actions) => {
                return createOrder(ticketId, amount);
            }}
            onApprove={async (data, actions) => {
                try {
                    await onApprove(data, ticketId);
                    toast.success(t('payments.success'));
                    onSuccess();
                } catch (error) {
                    console.error("Payment Error:", error);
                    toast.error(t('payments.error'));
                }
            }}
            onError={(err) => {
                console.error("PayPal Error:", err);
                toast.error(t('payments.error'));
            }}
        />
    );
};
