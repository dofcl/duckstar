import { Address, beginCell, internal, toNano, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.TONCENTER_API_KEY;
const endpoint = process.env.TONCENTER_ENDPOINT;

// Initialize the TonClient
const client = new TonClient({ endpoint, apiKey });

async function transferJetton(userWallet: string, qty: number, msg: string) {
    try {
        // Addresses and Jetton details
        const jettonWalletAddress = Address.parse(process.env.JETTON_ADDRESS!);
        const destinationAddress = Address.parse(userWallet);
        const jettonAmount = toNano(qty);

        // Forward payload with a comment
        const forwardPayload = beginCell()
            .storeUint(0, 32)               // 0 opcode means a comment payload
            .storeStringTail(msg)           // Comment message
            .endCell();

        // Construct the Jetton transfer message body
        const messageBody = beginCell()
            .storeUint(0x0f8a7ea5, 32)       // Opcode for Jetton transfer
            .storeUint(0, 64)                // Query ID, usually 0
            .storeCoins(jettonAmount)        // Jetton amount in nano units
            .storeAddress(destinationAddress) // Recipient address
            .storeAddress(destinationAddress) // Response destination
            .storeBit(0)                     // No custom payload
            .storeCoins(toNano('0.02'))      // Forward amount in TON for notification
            .storeBit(1)                     // Forward payload as reference
            .storeRef(forwardPayload)        // Attach forward payload cell
            .endCell();

        // Convert mnemonic to private key
        const mnemonics = process.env.MNEMONIC!.split(" ");
        const keyPair = await mnemonicToPrivateKey(mnemonics);

        // Set up the wallet contract
        const workchain = 0;  // Usually workchain 0
        const wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
        const walletContract = client.open(wallet);
        const seqno = await walletContract.getSeqno();

        // Send the Jetton transfer transaction
        await walletContract.sendTransfer({
            seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({
                to: jettonWalletAddress,
                value: toNano('0.1'),   // Transaction fee
                bounce: true,
                body: messageBody
            })]
        });

        console.log('Jetton transfer sent successfully');
    } catch (error) {
        console.error('Failed to transfer Jetton:', error);
    }
}

// Usage
const userWallet = 'AkQDuy_Zc***************'; // Recipient address
const qty = 1;  // Amount in smallest units (nanoJettons)
const msg = 'test2'; // Text message to be sent with the transfer
transferJetton(userWallet, qty, msg).finally(() => console.log("Exiting..."));