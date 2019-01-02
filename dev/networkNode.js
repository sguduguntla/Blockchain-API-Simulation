const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const axios = require('axios');
const uuid = require('uuid/v1');
const address = uuid().split('-').join('');
const port = process.argv[2];

const blockchain = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/blockchain', (req, res) => {
    res.send(blockchain);

});

app.post('/transaction', (req, res) => {
    const transaction = req.body;

    const blockIdx = blockchain.addTransactionToPendingTransactions(transaction);

    res.json({
        note: `Transaction will be added in block ${blockIdx}`
    });
});

app.post('/transaction/broadcast', async (req, res) => {
    const {
        sender,
        recipient,
        amount
    } = req.body;

    const transaction = blockchain.createTransaction(amount, sender, recipient);

    blockchain.addTransactionToPendingTransactions(transaction);

    const data = await Promise.all(
        blockchain.networkNodes.map(networkNodeURL => {
            return axios.post(`${networkNodeURL}/transaction`, transaction);
        })
    );

    res.json({
        note: "Transaction created and broadcasted successfully!"
    });
});

app.get('/mine', async (req, res) => {
    const prevBlock = blockchain.getPrevBlock();
    const prevHash = prevBlock['hash'];

    const curBlockData = {
        transactions: blockchain.pendingTransactions,
        index: prevBlock['index'] + 1
    }

    const nonce = blockchain.proofOfWork(prevHash, curBlockData);
    const blockHash = blockchain.hash(prevHash, curBlockData, nonce);
    const block = blockchain.createBlock(nonce, prevHash, blockHash);

    const data = await Promise.all(
        blockchain.networkNodes.map(networkNodeURL => {
            return axios.post(`${networkNodeURL}/receive-new-block`, {
                block
            });
        })
    );

    const response = await axios.post(`${blockchain.nodeURL}/transaction/broadcast`, {
        //Rewarding miner with 12.5 bitcoin (as an example)
        amount: 12.5,
        sender: "00",
        recipient: address
    });

    res.json({
        note: "New block mined and broadcasted successfully!",
        block
    });

});

app.post('/receive-new-block', (req, res) => {
    const {
        block
    } = req.body;

    const prevBlock = blockchain.getPrevBlock();

    if (prevBlock.hash === block.prevHash && prevBlock['index'] + 1 === block['index']) {
        blockchain.chain.push(block);
        blockchain.pendingTransactions = [];
        res.json({
            note: "New block received and accepted",
            block
        });
    } else {
        res.json({
            note: 'New block rejected',
            block
        });
    }
});

app.post('/register-and-broadcast-node', async (req, res) => {
    const {
        newNodeUrl
    } = req.body;

    if (blockchain.networkNodes.indexOf(newNodeUrl) == -1) {
        blockchain.networkNodes.push(newNodeUrl);
    }

    const data = await Promise.all(
        blockchain.networkNodes.map(networkNodeUrl => {
            return axios.post(`${networkNodeUrl}/register-node`, {
                newNodeUrl
            });
        })
    );

    const response = await axios.post(`${newNodeUrl}/register-nodes-bulk`, {
        allNetworkNodes: [...blockchain.networkNodes, blockchain.nodeURL]
    });

    res.json({
        note: "New node registered with network successfully."
    });

});

app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;

    if (blockchain.networkNodes.indexOf(newNodeUrl) == -1 && blockchain.nodeURL !== newNodeUrl) {
        blockchain.networkNodes.push(newNodeUrl);
    }

    res.json({
        note: "New node registered successfully."
    });
});

app.post('/register-nodes-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;

    allNetworkNodes.forEach(networkNodeURL => {
        if (blockchain.networkNodes.indexOf(networkNodeURL) == -1 && blockchain.nodeURL !== networkNodeURL) {
            blockchain.networkNodes.push(networkNodeURL);
        }
    });

    res.json({
        note: "Bulk registration successful"
    });
});

app.get('/consensus', async (req, res) => {
    let blockchains = await Promise.all(
        blockchain.networkNodes.map(async networkNodeURL => {
            return axios.get(`${networkNodeURL}/blockchain`);
        })
    );

    blockchains = blockchains.map(res => res.data);

    //Return longest chain
    const longestBlockchain = blockchains.find(b => b.chain.length == Math.max(...blockchains.map(b => b.chain.length), 0));

    let longestChain = longestBlockchain.chain;
    
    if (!longestChain || longestChain.length <= blockchain.chain.length || (longestChain > blockchain.chain.length && !blockchain.chainIsValid(longestChain))) {
        res.json({
            note: "Current chain has not been replaced",
            chain:  blockchain.chain
        });
    } else {
        blockchain.chain = longestChain;
        blockchain.pendingTransactions = longestBlockchain.pendingTransactions;

        res.json({
            note: 'This chain has been replaced.',
            chain: blockchain.chain
        });
    }

});

app.get('/block/:hash', (req, res) => {
    const { hash } = req.params;

    res.json({
        block: blockchain.getBlock(hash)
    });
});

app.get('/transaction/:id', (req, res) => {
    const { id } = req.params;
    const data = blockchain.getTransaction(id);

    res.json({
        transaction: data.transaction,
        block: data.block
    });
});

app.get('/address/:address', (req, res) => {
    const { address } = req.params;

    const data = blockchain.getAddressData(address);

    res.json({
        data
    });
});

app.get('/block-explorer', (req, res) => {
    res.sendFile('./block-explorer/index.html', { root: __dirname });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});