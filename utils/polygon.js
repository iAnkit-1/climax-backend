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

    if (!rpcUrl || !privateKey) {
      console.warn('Polygon RPC URL or Private Key not found in .env. Falling back to mock hash.');
      return generateMockHash();
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Encode the transaction data as a hex string to attach as data (memo)
    const dataString = JSON.stringify({
      climax_tx: true,
      timestamp: Date.now(),
      ...transactionData
    });
    const hexData = ethers.hexlify(ethers.toUtf8Bytes(dataString));

    // Send a 0 MATIC transaction to ourselves, containing the metadata
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: 0,
      data: hexData
    });

    console.log('Polygon transaction sent:', tx.hash);
    
    // Wait for 1 confirmation to ensure it's mined
    await tx.wait(1);
    
    return tx.hash;
  } catch (error) {
    console.error('Polygon transaction failed:', error.message);
    // Fallback to a mock hash so the application continues to function even if the wallet has no funds or RPC fails
    return generateMockHash();
  }
};

const generateMockHash = () => {
  return 'mock_tx_' + crypto.randomBytes(28).toString('hex');
};
