import {AssetsSDK, createApi, createSender, importKey, PinataStorageParams} from "@ton-community/assets-sdk";
import {toNano} from "@ton/core";
import * as dotenv from 'dotenv';

dotenv.config();

async function initializeSDK() {
    try {
        // Create an instance of the TonClient4
        const NETWORK = 'testnet';
        const api = await createApi(NETWORK);

        // Create a sender from the wallet (in this case, Highload Wallet V2)
        const keyPair = await importKey(process.env.MNEMONIC!);
        const sender = await createSender('highload-v2', keyPair, api);

        // Define the storage parameters (in this case, Pinata)
        const storage: PinataStorageParams = {
            pinataApiKey: process.env.PINATA_API_KEY!,
            pinataSecretKey: process.env.PINATA_SECRET_KEY!
        };

        // Create the SDK instance
        const sdk = AssetsSDK.create({
            api: api,          // Required, the TonClient4 instance
            storage: storage,  // Optional, the storage instance (Pinata, S3 or your own)
            sender: sender,    // Optional, the sender instance (WalletV4, TonConnect or your own)
        });
        console.log('Using wallet', sdk.sender?.address);

        // Open a Jetton instance
        //const jetton = sdk.openJetton(sdk.sender?.address!);

        // Deploy a new NFT Collection
        const collection = await sdk.deployNftCollection({
            collectionContent: {
                name: 'Soc Test collection',
                description: 'Test collection description',
            },
            commonContent: 'https://dev-settlers-of-cydonia.pages.dev/nfts/metadata/nfts/',
        });

        console.log('Created collection with address', collection.address);
        console.log('Collection:', collection);

        return sdk;
    } catch (error) {
        console.error('Failed to initialize SDK:', error);
        throw error;
    }
}

// Call the function to initialize the SDK and then transfer Jettons
initializeSDK().then(async (sdk) => {
    console.log('SDK initialized:', sdk);
}).catch(error => {
    console.error('Failed to initialize SDK:', error);
});