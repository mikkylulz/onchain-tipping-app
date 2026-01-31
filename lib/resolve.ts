import { isAddress, getAddress } from 'viem';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
    chain: base,
    transport: http(),
});

export interface ResolutionResult {
    address: string | null;
    type: 'address' | 'farcaster' | 'basename' | 'unknown';
    avatar?: string;
    displayName?: string;
    error?: string;
}

/**
 * Validates if a string is a valid Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
    return isAddress(address.trim());
};

/**
 * Resolves a Farcaster username to an Ethereum address using Neynar API
 */
export const resolveFarcaster = async (username: string): Promise<ResolutionResult> => {
    const cleanUsername = username.replace('@', '').trim().toLowerCase();
    const apiKey = process.env.NEXT_PUBLIC_NEYNAR_API_KEY;

    if (!apiKey) {
        return { address: null, type: 'farcaster', error: 'Neynar API key not configured' };
    }

    try {
        const response = await fetch(
            `https://api.neynar.com/v2/farcaster/user/by_username?username=${cleanUsername}`,
            {
                headers: { api_key: apiKey },
            }
        );

        if (!response.ok) {
            if (response.status === 404) return { address: null, type: 'farcaster', error: 'User not found' };
            throw new Error('Neynar API error');
        }

        const data = await response.json();
        const user = data.user;
        const verifiedAddress = user?.verified_addresses?.eth_addresses?.[0];

        if (!verifiedAddress) {
            return { address: null, type: 'farcaster', error: 'No verified Ethereum address found' };
        }

        return {
            address: getAddress(verifiedAddress),
            type: 'farcaster',
            avatar: user.pfp_url,
            displayName: user.display_name || user.username
        };
    } catch (error) {
        return { address: null, type: 'farcaster', error: 'Failed to resolve Farcaster username' };
    }
};

/**
 * Resolves a .base.eth name to an Ethereum address
 */
export const resolveBasename = async (name: string): Promise<ResolutionResult> => {
    const cleanName = name.trim().toLowerCase();

    if (!cleanName.endsWith('.base.eth')) {
        return { address: null, type: 'basename', error: 'Invalid Basename format' };
    }

    try {
        const address = await publicClient.getEnsAddress({
            name: cleanName,
        });

        if (!address) {
            return { address: null, type: 'basename', error: 'Basename not found' };
        }

        return { address: getAddress(address), type: 'basename' };
    } catch (error) {
        return { address: null, type: 'basename', error: 'Failed to resolve Basename' };
    }
};

/**
 * Main resolution router
 */
export const resolveRecipient = async (input: string): Promise<ResolutionResult> => {
    const cleanInput = input.trim();

    if (!cleanInput) return { address: null, type: 'unknown' };

    // 1. Check if it's a raw address
    if (cleanInput.startsWith('0x') && isValidAddress(cleanInput)) {
        return { address: getAddress(cleanInput), type: 'address' };
    }

    // 2. Check if it's a Basename
    if (cleanInput.toLowerCase().endsWith('.base.eth')) {
        return await resolveBasename(cleanInput);
    }

    // 3. Treat as Farcaster username
    return await resolveFarcaster(cleanInput);
};
