import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Customer } from '@/types/api';

const TOKEN_KEY = 'fbt_auth_token';
const CUSTOMER_KEY = 'fbt_auth_customer';

export interface StoredSession {
    token: string | null;
    customer: Customer | null;
}

export async function saveAuthSession(token: string, customer: Customer): Promise<void> {
    const customerJson = JSON.stringify(customer);

    if (Platform.OS === 'web') {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(CUSTOMER_KEY, customerJson);
        } catch (e) {
            console.warn('[secureStorage] Erro ao salvar sessão no localStorage:', e);
        }
        return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(CUSTOMER_KEY, customerJson);
}

export async function getAuthSession(): Promise<StoredSession> {
    if (Platform.OS === 'web') {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            const customerStr = localStorage.getItem(CUSTOMER_KEY);
            return {
                token,
                customer: customerStr ? (JSON.parse(customerStr) as Customer) : null,
            };
        } catch {
            return { token: null, customer: null };
        }
    }

    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const customerStr = await SecureStore.getItemAsync(CUSTOMER_KEY);

        return {
            token,
            customer: customerStr ? (JSON.parse(customerStr) as Customer) : null,
        };
    } catch (e) {
        console.warn('[secureStorage] Erro ao recuperar sessão do SecureStore:', e);
        return { token: null, customer: null };
    }
}

export async function clearAuthSession(): Promise<void> {
    if (Platform.OS === 'web') {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(CUSTOMER_KEY);
        } catch (e) {
            console.warn('[secureStorage] Erro ao remover sessão do localStorage:', e);
        }
        return;
    }

    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(CUSTOMER_KEY);
    } catch (e) {
        console.warn('[secureStorage] Erro ao limpar sessão do SecureStore:', e);
    }
}
