import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Records a transaction on the Polygon network (Amoy Testnet).
 * 
 * @param {Object} transactionData - Details about the transaction
 * @returns {Promise<string>} The transaction signature (hash)
 */
export const recordTransactionOnPolygon = async (transactionData) => {
  try {
    const rpcUrl = process.env.POLYGON_RPC_URL;
    const privateKey = process.env.POLYGON_PRIVATE_KEY;
    const contractAddress = process.env.POLYGON_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey) {
      console.warn('Polygon RPC URL or Private Key not found in .env. Falling back to mock hash.');
      return generateMockHash();
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // If we have a deployed smart contract, use it to record the transaction securely
    if (contractAddress) {
      console.log('Interacting with ClimaxCarbonLedger Smart Contract...');
      // Minimal ABI for the recordTransaction function
      const abi = [
        "function recordTransaction(string txId, string projectId, string buyerId, uint256 amount, string txType) public"
      ];
      const contract = new ethers.Contract(contractAddress, abi, wallet);

      const txId = transactionData.id ? transactionData.id.toString() : 'unknown_tx';
      const projectId = transactionData.project ? transactionData.project.toString() : 'unknown_project';
      const buyerId = transactionData.buyer ? transactionData.buyer.toString() : 'unknown_buyer';
      const amount = transactionData.amount || 0;
      const txType = transactionData.type || 'buy';

      const tx = await contract.recordTransaction(txId, projectId, buyerId, amount, txType);
      console.log('Polygon contract transaction sent:', tx.hash);
      
      // We don't block the backend waiting for confirmations to keep UX fast
      // But we can wait for 1 confirmation to ensure it's mined if needed.
      // For fallback safety, if this fails, the catch block will trigger the mock hash.
      return tx.hash;
    } 
    
    // Fallback 1: If no contract address is provided, send a self-transfer with hex data (legacy method)
    console.log('No contract address found. Falling back to data self-transfer...');
    const dataString = JSON.stringify({
      climax_tx: true,
      timestamp: Date.now(),
      ...transactionData
    });
    const hexData = ethers.hexlify(ethers.toUtf8Bytes(dataString));

    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      data: hexData
    });

    console.log('Polygon transaction sent:', tx.hash);
    return tx.hash;
  } catch (error) {
    console.error('Polygon transaction failed (Fallback Triggered):', error.message);
    // Fallback 2: Generate a mock hash so the application continues to function even if the wallet has no funds or RPC fails
    return generateMockHash();
  }
};

const generateMockHash = () => {
  return 'mock_tx_' + crypto.randomBytes(28).toString('hex');
};
