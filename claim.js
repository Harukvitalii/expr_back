const fs = require('fs');
require('dotenv').config();

const scAbi = JSON.parse(fs.readFileSync('./scAbi.json'));



const Web3 = require('web3');
const web3 = new Web3('https://goerli.infura.io/v3/22828457ff1d40558c6f765567423f2a')


// const contractAddress = '0xC2bf7EA7Dd95865d514d0B935c4723F499cF603D';
const contractAddress = '0xD8ae8F8d8B053837808bCcAa5D85E1F8E981eF0d';


const privateKey = process.env.wallet_private;
const fromAddress = '0x6259D9d1D25EBd7DccCA724b6Ee4ED96746aE858'


const contract = new web3.eth.Contract(scAbi, contractAddress)


// contract.methods.name().call()
//     .then(result => {
//         console.log('Res: ', result)
//     })
//     .catch(error => {
//         console.log(error)
//     })

const data = contract.methods.releaseTokens().encodeABI();


web3.eth.accounts.signTransaction({
    to: contractAddress,
    data: data,
    gas: 200000,
    gasPrice: '30000000000',
}, privateKey)
.then(signedTx => {
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', console.log);
});