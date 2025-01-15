import {AssetsSDK, createApi, createSender, importKey, PinataStorageParams} from "@ton-community/assets-sdk";
import {Address, toNano} from '@ton/ton';
import { beginCell } from '@ton/core';
import * as dotenv from 'dotenv';

dotenv.config();

async function burnJettons() {
    // Set up the network and initialize the TON API
    const NETWORK = 'testnet';
    const api = await createApi(NETWORK);

    // Create a sender from the wallet (Highload Wallet V2)
    const keyPair = await importKey(process.env.MNEMONIC!);
    const sender = await createSender('highload-v2', keyPair, api);

    // Define the storage parameters (Pinata)
    const storage: PinataStorageParams = {
        pinataApiKey: process.env.PINATA_API_KEY!,
        pinataSecretKey: process.env.PINATA_SECRET_KEY!
    };

    // Create the SDK instance
    const sdk = AssetsSDK.create({
        api,          // The TonClient4 instance
        storage,      // Storage instance (Pinata)
        sender        // The sender instance (Wallet)
    });

    console.log('Using wallet:', sdk.sender?.address);

    // Open the existing Jetton
    const JETTON_ADDRESS = Address.parse('kQBjffX11r7BT51aZ-Bn036XYnBgVcJ1UNw9sssfb2FIhFLu');
    const jetton = sdk.openJetton(JETTON_ADDRESS);

    // Get jetton wallet address
    const jettonWallet = await jetton.getWallet(sdk.sender!.address);
    console.log('Jetton Wallet Address:', jettonWallet.address);

    // Amount to burn (in TON - will be converted to nanotons)
    const BURN_AMOUNT = '60'; // adjust this value to how many tokens you want to burn

    // Create burn message body
    const burnMessageBody = beginCell()
        .storeUint(0x595f07bc, 32)  // burn operation
        .storeUint(0, 64)           // query id
        .storeCoins(toNano(BURN_AMOUNT))
        .storeAddress(sdk.sender!.address)  // response address
        .endCell();

    // Send transaction using the sender
    await sender.send({
        to: jettonWallet.address,
        value: toNano('0.05'),  // gas fees
        body: burnMessageBody
    });

    console.log(`Burn message sent for ${BURN_AMOUNT} jettons`);
    console.log('From wallet:', sdk.sender?.address);
    console.log('Jetton contract:', jetton.address);
    console.log('Jetton wallet:', jettonWallet.address);
}

// Execute the burn operation
burnJettons().catch(console.error);