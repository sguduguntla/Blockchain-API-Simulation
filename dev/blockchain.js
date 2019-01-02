const sha256 = require('sha256');
const uuid = require('uuid');
const nodeURL = process.argv[3];

class Blockchain {
    constructor() {
        this.chain = []
        this.pendingTransactions = []

        this.nodeURL = nodeURL;
        this.networkNodes = [];
        //Genesis Block
        this.createBlock(0, '0', '0');
    }

    createBlock(nonce, prevHash, hash) {
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce,
            hash,
            prevHash
        };

        this.pendingTransactions = [];
        this.chain.push(block);

        return block;
    }

    getPrevBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(amount, sender, recipient) {

        return {
            amount,
            sender,
            recipient,
            id: uuid().split('-').join('')
        };
    }

    addTransactionToPendingTransactions(transaction) {
        this.pendingTransactions.push(transaction);

        return this.getPrevBlock()['index'] + 1;
    }

    hash(prevHash, curBlockData, nonce) {
        const dataAsString = `${prevHash}${nonce}${JSON.stringify(curBlockData)}`;
        const hash = sha256(dataAsString);

        return hash;
    }

    proofOfWork(prevHash, curBlockData) {
        let nonce = 0;
        let hash = this.hash(prevHash, curBlockData, nonce);

        ///look for the hash that starts with 4 zeroes
        while (hash.substring(0, 4) !== '0000') {
            nonce++;
            hash = this.hash(prevHash, curBlockData, nonce);
        }

        return nonce;
    }

    chainIsValid(blockchain) {  

        for (let i = 1; i < blockchain.length; i++) {
            const curBlock = blockchain[i]
            const prevBlock = blockchain[i - 1];

            const { transactions, index, nonce } = curBlock;

            const blockHash = this.hash(prevBlock.hash, { transactions, index }, nonce);

            if (blockHash.substring(0, 4) !== '0000' || curBlock.prevHash !== prevBlock.hash) {
                return false;
            }
        }
        
        //Check that genesis block has valid data
        const genesisBlock = blockchain[0];

        const { nonce, prevHash, hash, transactions } = genesisBlock;

        if (nonce !== 0 || prevHash !== '0' || hash !== '0' || transactions.length !== 0) {
            return false;
        }

        return true;
    }

    getBlock(hash) {
        const block = this.chain.find(block => block.hash === hash);

        if (block) {
            return block;
        }

        return null;
    }

    getTransaction(id) {

        for (let i = 0; i < this.chain.length; i++) {
            const block = this.chain[i];
            for (let j = 0; j < block.transactions.length; j++) {
                const transaction = block.transactions[j];
                if (transaction.id === id) {
                    return {
                        block,
                        transaction
                    };
                }
            }
        }

        return {
            block: null,
            transaction: null
        };
    }

    getAddressData(address) {
        const transactions = [];

        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                if (transaction.sender === address || transaction.recipient === address) {
                    transactions.push(transaction);
                }
            });
        });

        let balance = 0;

        transactions.forEach(transaction => {
            if (transaction.recipient === address) {
                balance += transaction.amount;
            } else if (transaction.sender === address) {
                balance -= transaction.amount;
            }
        });

        return {
            transactions,
            balance
        };
    }

}

module.exports = Blockchain;