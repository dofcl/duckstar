import {AssetsSDK, createApi, createSender, importKey, PinataStorageParams} from "@ton-community/assets-sdk";
import {Address, toNano} from '@ton/ton';
import * as dotenv from 'dotenv';

dotenv.config();

// For in-game Inflationary Token"Cydons"
// this will mint a jetton and send it to another wallet increasing max supply

async function initializeSDK() {
    try {
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

        // Deploy a new Jetton and mint directly to a specific address
        const JETTON_ADDRESS = Address.parse(process.env.JETTON_ADDRESS!);
        const jetton = sdk.openJetton(JETTON_ADDRESS);

        const RECEIVER_ADDRESS = Address.parse('0QAkiKMvXm1nkjH1PPxt6zQt8q35dQMTTu7R2fWLYlFeW5F0');
        await jetton.sendMint(sender, RECEIVER_ADDRESS, toNano('12'));

        console.log('minted  jetton with address:', jetton.address)

        console.log('to address:', RECEIVER_ADDRESS);
        return sdk;
    } catch (error) {
        console.error('Failed to initialize SDK:', error);
        throw error;
    }
}

// Initialize the SDK and deploy the jetton
initializeSDK()
    .then(async (sdk) => {
        console.log('SDK initialized:', sdk);
    })
    .catch(error => {
        console.error('Failed to initialize SDK:', error);
    });
