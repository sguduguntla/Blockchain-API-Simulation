# Blockchain Simulation API powered by NodeJS & Express

To run the app locally:

1. Clone the repository and run ```npm install``` to install all the necessary **node_modules** for running the application.
2. Simulate the project being run on multiple devices by running ```npm run node_1```, ```npm run node_2```, ```npm run node_3```, ```npm run node_4```, and ```npm run node_5``` in separate terminal tabs. 

## API Root URLS:

node_1 --> http://localhost:3001
node_2 --> http://localhost:3002 
node_3 --> http://localhost:3003
node_4 --> http://localhost:3004
node_5 --> http://localhost:3005

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

