import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from "react-i18next";

interface PayPalButtonProps {
    amount: string;
    ticketId: number;
    onSuccess: (details: any) => void;
    onError?: (err: any) => void;
    currency?: string;
}

// TODO: Replace with env variable
const PAYPAL_CLIENT_ID = "sb"; // Sandbox

export default function PayPalPayment({ amount, ticketId, onSuccess, onError, currency = "USD" }: PayPalButtonProps) {
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const { t } = useTranslation();

    const handleApprove = async (data: any, actions: any) => {
        try {
            const response = await axios.post('http://localhost:3000/api/payments/capture-order', {
                orderID: data.orderID,
                ticketId
            }, { withCredentials: true });

            setStatus('SUCCESS');
            onSuccess(response.data);
        } catch (error) {
            console.error("Capture Error:", error);
            handleError(error);
        }
    };

    const createOrder = async (data: any, actions: any) => {
        const response = await axios.post('http://localhost:3000/api/payments/create-order', {
            ticketId,
            amount
        }, { withCredentials: true });
        return response.data.id;
    };

    const handleError = (err: any) => {
        console.error("PayPal Error:", err);
        setStatus('ERROR');
        if (onError) onError(err);
    };

    if (status === 'SUCCESS') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col items-center gap-4 text-center"
            >
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-blue-400">{t('payments.success')}</h3>
                    <p className="text-sm text-slate-400">{t('payments.success_desc')}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency, intent: "capture" }}>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="mb-6 text-center">
                        <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">{t('payments.total_to_pay')}</p>
                        <p className="text-3xl font-bold text-white">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))}
                        </p>
                    </div>

                    <PayPalButtons
                        style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                        createOrder={createOrder}
                        onApprove={handleApprove}
                        onError={handleError}
                    />
                </div>
            </PayPalScriptProvider>

            {status === 'ERROR' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{t('payments.error')}</p>
                </div>
            )}
        </div>
    );
}
