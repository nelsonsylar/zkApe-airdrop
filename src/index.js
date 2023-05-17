
import Web3 from 'web3'
import * as zksyncWeb from "zksync-web3js";
import fetch from 'node-fetch'
import * as ethers from "ethers";

const RPC = "https://mainnet.era.zksync.io"

const zkSyncProvider = new zksyncWeb.Provider(RPC);
const ethProvider = ethers.getDefaultProvider('mainnet');


export const web3 = new Web3(new Web3.providers.HttpProvider(RPC))

export const getContract = (abi, address) => {
    return new web3.eth.Contract(abi, address)
}

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}


const ABI = [{
    "inputs": [
        {
            "internalType": "address",
            "name": "owner",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "nonce",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
        },
        {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
        },
        {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
        },
        {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
        },
    ],
    "name": "claim",
    "outputs": [

    ],
    "stateMutability": "nonpayable",
    "type": "function"
}]

export const claim = async (privateKeys) => {

    for (let index = 0; index < privateKeys.length; index++) {
        const privateKey = privateKeys[index];
        try {
            const { address: from } = web3.eth.accounts.privateKeyToAccount(privateKey);

            const data = await postData('https://zksync-ape-apis.zkape.io/airdrop/index/getcertificate', { address: from })
            const { owner, value, nonce, deadline, v, r, s } = data.Data;

            const contract = getContract(ABI, '0x9aA48260Dc222Ca19bdD1E964857f6a2015f4078')
            const _data = contract.methods['claim'](
                owner,
                value,
                nonce,
                deadline,
                v,
                r,
                s
            ).encodeABI()

            const zkSyncWallet = new zksyncWeb.Wallet(
                privateKey,
                zkSyncProvider,
                ethProvider
            );

            const txs = {
                to: '0x9aA48260Dc222Ca19bdD1E964857f6a2015f4078',
                from,
                nonce: zkSyncWallet.getNonce(),
                data: _data,
                gasPrice: `250000000`,
                gas: `3385066`,
            }
            const signedTx = await web3.eth.accounts.signTransaction(txs, privateKey)
            const { transactionHash } = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            console.log(transactionHash, 'transactionHash');
        } catch (error) {
            console.log("claim failed...");
        }
    }
}


const privateKeys = ['私钥1', '私钥2', '私钥3']

claim(privateKeys)