# ClimaX Blockchain Integration Strategy

## Overview
The ClimaX Platform uses a **Hybrid (Web2.5) Architecture** to bring transparency and immutability to carbon credit trading, without sacrificing the speed and user experience of traditional web applications.

### Core Architecture
1. **Primary Database (MongoDB)**: All state (users, projects, transactions, balances) is instantly recorded in MongoDB. This ensures the frontend UI is snappy and responsive.
2. **Notary Layer (Ethereum/Polygon Smart Contract)**: Critical transactions are asynchronously anchored to an immutable smart contract (`ClimaxCarbonLedger.sol`).

## Smart Contract: `ClimaxCarbonLedger`
Located at `contracts/ClimaxCarbonLedger.sol`, this contract acts as a permanent, decentralized ledger.
- It is deployed on the Polygon Amoy testnet (or mainnet).
- Only the ClimaX Platform Backend (the `owner`) can write to it to ensure data integrity and prevent spam.
- It emits a `TransactionRecorded` event containing the MongoDB IDs for the transaction, project, and buyer, along with the amount and type.

## Fallback Mechanisms (Zero Breakdown Guarantee)
A core requirement of the platform is that **blockchain issues must never block user transactions**.

To achieve this, our interaction scripts (e.g., `utils/polygon.js`) implement a multi-tiered fallback strategy:

1. **Tier 1: Smart Contract Interaction (Primary)**
   - The backend attempts to call the `recordTransaction` function on the `ClimaxCarbonLedger` contract.
   - If successful, it returns the Polygon transaction hash.

2. **Tier 2: Data Self-Transfer (Fallback 1)**
   - If the `POLYGON_CONTRACT_ADDRESS` is missing from the `.env` file (e.g., in development), the backend falls back to sending a `0 MATIC` transaction to itself with the transaction metadata encoded as hex data in the transaction memo.

3. **Tier 3: Mock Hash Generation (Fallback 2)**
   - If the RPC node is down, the wallet is out of MATIC, or the private key is misconfigured, the `try/catch` block catches the error and generates a cryptographic mock hash (e.g., `mock_tx_abc123...`).
   - This mock hash is stored in MongoDB, allowing the frontend application to proceed without breaking the user flow.

## Setup Instructions
To enable Tier 1 functionality:
1. Compile and deploy `contracts/ClimaxCarbonLedger.sol` using Remix, Hardhat, or Truffle.
2. Add the following to your `.env` file:
   ```env
   POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"
   POLYGON_PRIVATE_KEY="your_wallet_private_key"
   POLYGON_CONTRACT_ADDRESS="your_deployed_contract_address"
   ```
3. Ensure the wallet associated with `POLYGON_PRIVATE_KEY` is the `owner` of the deployed contract.

## Future Upgrades
In the future, this architecture can be upgraded to fully tokenize carbon credits (e.g., ERC-1155) where balances are held directly in user Web3 wallets instead of MongoDB.
