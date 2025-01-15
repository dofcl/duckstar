# DuckStar TON backend

This directory contains the backend implementation for the DuckStar project, focusing on seamless integration with the TON blockchain.

---

## Directory Structure

- **ton/nfts/**: Scripts and documentation for managing NFT collections on the TON blockchain.
- **ton/jettons/**: Scripts and documentation for managing Jettons on the TON blockchain.
- **ton/contracts/**: Contains NFT, FT, and DAO contracts for the TON blockchain.

---

## Prerequisites

To use this backend, ensure you have the following installed and configured:

- **Node.js**: For script execution and dependency management
- **TypeScript**: For TypeScript compilation
- **ts-node**: (Optional) For running TypeScript files directly
- **Python**: Required for deploying cloud functions
- **Google Cloud SDK**: For deploying functions to Google Cloud

---

## Setup

### 1. Configure Environment Variables
- Copy the `envTemplate` file and rename it to `.env`
- Add your API keys and other required environment variables

### 2. Install Dependencies
Run the following command to install all required packages:
```bash
npm install
```

### 3. Running TypeScript Files
You have two options for running the TypeScript files:

Option 1 - Using ts-node (recommended for development):
```bash
ts-node deployJetton.ts
```

Option 2 - Compile and run with Node.js:
```bash
tsc deployJetton.ts
node deployJetton.js
```

> **Note:** Adjust "export" and "entry points" if hosting on platforms other than Google Cloud.

---

## Assets CLI Usage Guide

The `assets-cli` tool enables interaction with NFT collections on the TON blockchain, including retrieval, deployment, and management.

Refer to the [TON Community Assets SDK Repository](https://github.com/ton-community/assets-sdk) for additional details.

---

## NFT Commands

### **1. Retrieve an NFT Collection**
Fetch details of an existing NFT collection using:
```bash
assets-cli get-nft-collection
```

#### Example Output:
```plaintext
╭ DuckStar Collection ──────────────────────────────────────────────────────────────────────────────────────────────╮
│ Description: DuckStar collection description                                                                     │
│ Image: https://{{static_domain}}/image.png                                                                      │
│ Owner: ***********************  https://testnet.tonviewer.com/{{address}}                                       │
│ Items: 0                                                                                                        │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

---

### **2. Deploy a Collection**

#### Deploy a Soulbound Token (SBT) Collection
To deploy non-transferable NFTs (SBTs):
```bash
assets-cli deploy-nft-collection
```

Prompts:
- **Type:** `sbt`
- **Name:** `duckstar sbt`
- **Description:** `Testing SBT for DuckStar`
- **Image Path or URL:** `https://{{static_domain}}/logo.png`

#### Deploy a Standard NFT Collection
For transferable NFTs:
```bash
assets-cli deploy-nft-collection
```

Prompts:
- **Type:** `nft`
- **Name:** `DuckStar NFT Collections`
- **Description:** `NFTs for DuckStar in-game assets`
- **Image Path or URL:** `https://{{static_domain}}/logo.png`
- **Royalty Percentage:** `5%`
- **Recipient Address:** `**************************`

---

## Jettons

Jettons are fungible tokens in the TON ecosystem, used for various in-game activities and assets.


## Jetton Usage

### Deploy a Jetton
To deploy a new Jetton, update the `deployJetton.ts` script with your desired parameters:
```typescript
const jetton = await sdk.deployJetton({
  name: 'Coin Name',
  decimals: 18,
  description: 'Coin Description.',
  symbol: 'CON', //short coin ticker symbol
  image: 'https://{{static_domain}}/images/duckstarmusic-coin.png',
}, {
  adminAddress: sdk.sender?.address!,
  premintAmount: toNano('1000'),
});
```

To deploy:

Option 1 - Using ts-node:
```bash
ts-node deployJetton.ts
```

Option 2 - Compile and run with Node.js:
```bash
tsc deployJetton.ts
node deployJetton.js
```

---

### Mint Jettons
Mint Jettons to a specific address:

Using ts-node:
```bash
ts-node mintJetton.ts <receiver_address> <amount>
```

Or compile and run:
```bash
tsc mintJetton.ts
node mintJetton.js <receiver_address> <amount>
```

Replace `<receiver_address>` with the recipient's address and `<amount>` with the number of Jettons.

---

### Transfer Jettons
To transfer Jettons:

Using ts-node:
```bash
ts-node transferJetton.ts <receiver_address> <amount>
```

Or compile and run:
```bash
tsc transferJetton.ts
node transferJetton.js <receiver_address> <amount>
```

Replace `<receiver_address>` and `<amount>` as needed.

---

### Burn Jettons
Burn a specific amount of Jettons:

Using ts-node:
```bash
ts-node burnJetton.ts <amount>
```

Or compile and run:
```bash
tsc burnJetton.ts
node burnJetton.js <amount>
```

---

## Support

For assistance, contact [DuckStar Support](mailto:contact@duckstar.app).

---