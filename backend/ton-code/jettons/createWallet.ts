import TonWeb from "tonweb";
import * as bip39 from "bip39";

const tonweb = new TonWeb();

// Generate a new key pair and mnemonic
async function generateWallet() {
    // Generate a 24-word mnemonic phrase
    const mnemonic = bip39.generateMnemonic(256); // 256 bits of entropy for 24 words
    // Convert mnemonic to seed
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Generate key pair (public and secret keys) from the seed
    const keyPair = TonWeb.utils.keyPairFromSeed(seed.slice(0, 32)); // Use the first 32 bytes of the seed

    console.log("mnemonic:", mnemonic); // Uint8Array
    console.log("Admin Public Key:", keyPair.publicKey); // Uint8Array
    console.log("Admin Secret Key:", keyPair.secretKey); // Uint8Array

    // Initialize the wallet with the new keys
    const WalletClass = tonweb.wallet.all.v4R2; // Use v4R2 for Wallet V4
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0, // Workchain ID, usually 0 for TON
    });

    // Get the wallet address
    const walletAddress = await wallet.getAddress();
    console.log("Admin Wallet Address:", walletAddress.toString(true, true, true));

    return { mnemonic, keyPair, walletAddress };
}

// Generate the wallet and log the keys
generateWallet().catch((error) => {
    console.error("Failed to generate wallet:", error);
});