# Blockchain Simulation API powered by NodeJS & Express

A proof of concept simulation of a blockchain hosted on a decentralized network. 

To run the app locally:

1. Clone the repository and run ```npm install``` to install all the necessary **node_modules** for running the application.
2. Simulate the project being run on multiple devices by running ```npm run node_1```, ```npm run node_2```, ```npm run node_3```, ```npm run node_4```, and ```npm run node_5``` in separate terminal tabs. 
3. More addresses can be added by adding the following line(s) to the **package.json** file under **scripts**:

```"node_6": "nodemon --watch dev -e js dev/networkNode.js [number] http://localhost:[number]" ```


## API Root URLS:

* node_1 --> http://localhost:3001
* node_2 --> http://localhost:3002 
* node_3 --> http://localhost:3003
* node_4 --> http://localhost:3004
* node_5 --> http://localhost:3005

## Available API Endpoints:

| **Endpoints**  | **Request Type** | **Description**
| ---------- | ---- | ---------- |
| `/blockchain`  | **GET**  | Returns the complete blockchain at the root node
| `/transaction`  | **POST**  | Adds the specified **transaction** to pending transactions
| `/transaction/broadcast` | **POST** | Creates a new transaction and broadcasts the transaction to all the other nodes in the network, adding the transaction to each of the node's pending transactions
| `/mine` | **GET** | Mines a new block by producing a proof of work (Uses SHA256 encryption). Returns whether block was mined successfully. Issues a reward transaction of 12.5 to the miner and broadcasts the mining to all the other network nodes. 
| `/receive-new-block` | **POST** | Adds the received block to the current node's blockchain
| `/register-and-broadcast-node` | **POST** | Adds the specified **node address** to the network nodes of the current blockchain and broadcasts the node address to all the other existing network nodes to simulate a decentralized blockchain network. 
| `/register-node` | **POST** | Adds the specified **node address** to the network nodes of the current blockchain 
| `/register-nodes-bulk` | **POST** | Adds the specified **network nodes** to the current blockchain's network nodes 
| `/consensus` | **GET** | Uses the **Longest Chain Rule** to find a **consensus** among all the network nodes to decide whether to update the chain at the current node. Compares length of current node's chain to the other nodes' chains and sets the current node's chain to the longest chain in the network. 
| `/block/:hash` | **GET** | Returns the block with the specified **hash**
| `/transaction/:id` | **GET** | Returns the **transaction** and **block** with the specified transaction **id**
| `/address/:address` | **GET** | Returns the balance and transactions of the specified user **address**

## Blockchain Class (blockchain.js)

The Blockchain class is a prototype data abstraction for a blockchain. 

#### Default Constructor
```javascript
constructor() {
        this.chain = [] //A list of all the blocks in the blockchain
        this.pendingTransactions = [] //All the pending transactions before the block has been mined
        this.nodeURL = nodeURL; //The current address of the node
        this.networkNodes = []; //A list of all the other nodes in the decentralized network
        //Genesis Block
        this.createBlock(0, '0', '0');
}
```

### Available Functions

#### createBlock(nonce, prevHash, hash)

Creates a new block with the specified **nonce**, **prevHash**, and **hash**

* **nonce** (Number used once) - unique number to be found when mining for the block
* **prevHash** - the hash of the previous block in the chain
* **hash** - the hash of the current block

---

#### getPrevBlock()

Returns the previous block in the chain

---

#### createTransaction(amount, sender, recipient)

Creates a new transaction with the specified **sender**, **recipient**, and **amount**

* **amount** - the amount of value to be sent to the recipient
* **sender** - the address of the sender
* **recipient** - the address of the recipient

---

#### addTransactionToPendingTransactions(transaction)

Adds the specified **transaction** to the pending transactions of the blockchain

* **transaction** - a transaction object (See instance variable details)

---

#### hash(prevHash, curBlockData, nonce)

Creates a **SHA256** encryption hash for the specified **prevHash**, **curBlockData**, and **nonce**

* **prevHash** - the hash of the previous block in the chain
* **curBlockData** - 
```javascript
{
   transactions: [], //The current transactons in the block
   index: 0 //index of the block in the chain
}
```
* **nonce** (Number used once) - unique number to be found when mining for the block

---

#### proofOfWork(prevHash, curBlockData)

Finds the **nonce** associated with the specified **prevHash** and **curBlockData** that begins with "0000"

* **prevHash** - the hash of the previous block in the chain
* **curBlockData** - 
```javascript
{
   transactions: [], //The current transactons in the block
   index: 0 //index of the block in the chain
}
```

---

#### chainIsValid(blockchain)

Returns true or false based on whether the specified **blockchain** has matching hashes and previous hashes as well as a hash that starts with "0000"

* **blockchain** - a list of all blocks in the blockchain

---

#### getBlock(hash)

Returns the block with the specified **hash**

* **hash** - the hash of the current block

---

#### getTransaction(id)

Returns the **transaction** and **block** with the specified transaction **id**

* **id** - The unique id of the transaction

---

#### getAddressData(address)

Returns the balance and transactions of the specified user **address**

* **address** - A unique address of the user





