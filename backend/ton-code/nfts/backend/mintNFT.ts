import {AssetsSDK, createApi, createSender, importKey, PinataStorageParams} from "@ton-community/assets-sdk";
import {Address} from "@ton/core";
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

        // mint NFT
        console.log('NFT_COLLECTION_ADDRESS:', process.env.NFT_COLLECTION_ADDRESS);
        const collection = sdk.openNftCollection(Address.parse(process.env.NFT_COLLECTION_ADDRESS));

        console.log('Created collection with address', collection.address);
        console.log('collection:', collection);


        //TODO: create dynamically from initial firebase fata for each equipement
        const content = JSON.stringify({
            name: "SOC Test NFT 6",
            description: "This is a test NFT 6 SOC",
            image: 'https://dev.soc-on-ton.com/logo.png',
            "attributes": [{"trait_type": "Awesomeness", "value": "Super cool"}],
        })

        const metadataURL = await sdk.storage.uploadFile(content);
        console.log(metadataURL)

        const {nextItemIndex: index} = await collection.getData();
        const userAddress = process.env.RECEIVER_ADDRESS!
        console.log('Receiving user Address:', userAddress);
        await collection.sendMint(sender, {
            index: index,
            owner: Address.parse(userAddress),//  parse from aeon completed payment
            individualContent: metadataURL // dynamic metadata
        });

        return sdk;
    } catch (error) {
        console.error('Failed to initialize SDK:', error);
        throw error;
    }
}

// Call the function to initialize the SDK and then transfer NFT
initializeSDK().then(async (sdk) => {
    console.log('SDK initialized:', sdk);
}).catch(error => {
    console.error('Failed to initialize SDK:', error);
});