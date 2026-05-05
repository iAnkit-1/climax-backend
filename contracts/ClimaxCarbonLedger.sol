// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ClimaxCarbonLedger
 * @dev Immutable ledger for recording carbon credit transactions on the ClimaX Platform.
 * Acts as a notary to provide transparent, verifiable proof of off-chain transactions.
 */
contract ClimaxCarbonLedger {
    address public owner;

    // Event emitted when a new transaction is recorded
    event TransactionRecorded(
        string indexed txId,
        string indexed projectId,
        string buyerId,
        uint256 amount,
        string txType,
        uint256 timestamp
    );

    // Modifier to restrict access to the platform backend
    modifier onlyOwner() {
        require(msg.sender == owner, "ClimaxCarbonLedger: Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Records a transaction on the blockchain.
     * @param txId The unique transaction ID from MongoDB
     * @param projectId The unique project ID from MongoDB
     * @param buyerId The unique buyer ID from MongoDB
     * @param amount The amount of credits transacted (or fiat equivalent, depending on txType)
     * @param txType The type of transaction (e.g., "buy", "retire")
     */
    function recordTransaction(
        string memory txId,
        string memory projectId,
        string memory buyerId,
        uint256 amount,
        string memory txType
    ) public onlyOwner {
        emit TransactionRecorded(txId, projectId, buyerId, amount, txType, block.timestamp);
    }
    
    /**
     * @dev Transfer ownership of the contract to a new wallet
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "ClimaxCarbonLedger: New owner is the zero address");
        owner = newOwner;
    }
}
