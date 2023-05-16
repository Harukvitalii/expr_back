const express = require('express');
const Web3 = require('web3');
const bodyParser = require('body-parser');
const fs = require('fs');

require('dotenv').config();


const ejs = require('ejs');


var app = express();
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(__dirname + '/views'));

    const fundWallet = process.env.wallet_private;
    const web3 = new Web3('https://goerli.infura.io/v3/22828457ff1d40558c6f765567423f2a');
    const scAbi = JSON.parse(fs.readFileSync('./scAbi.json'));
    const contractAddress = '0xD8ae8F8d8B053837808bCcAa5D85E1F8E981eF0d';
    const contract = new web3.eth.Contract(scAbi, contractAddress)

    app.get('/', (req, res) => {
    // res.send('Hello, world!');
    console.log(scAbi)
    res.render('/views/index.html');
  });
  

app.post('/fund-wallet', (req, res) => {
  // res.send('Hello, world!');
  const wallet = web3.eth.accounts.privateKeyToAccount(fundWallet)
  console.log('sender', wallet.address)
  const recvWallet = req.body.recipientAddress;
  console.log('recv', recvWallet)
  web3.eth.getBalance(recvWallet, (err, balance) => {
    if (err) {
      console.error(err);
      return;
    }
  
    console.log(`Balance of ${recvWallet}: ${web3.utils.fromWei(balance, 'ether')} ETH`);
  });

  const amount = web3.utils.toWei('0.0033', 'ether');
  
  web3.eth.getTransactionCount(wallet.address, 'latest', (err, txCount) => {
      if (err) {
        console.error(err);
        return;
      }
    
      const txObject = {
        nonce: web3.utils.toHex(txCount),
        to: recvWallet,
        value: web3.utils.toHex(amount),
        gasLimit: web3.utils.toHex(21000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('40', 'gwei'))
      };
      web3.eth.accounts.signTransaction(txObject, fundWallet)
      .then((signedTx) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
          .on('transactionHash', (hash) => {
            console.log(`Transaction hash: ${hash}`);
            res.send(`<script>alert('Transaction sent! Transaction hash: https://goerli.etherscan.io/tx/${hash}'); window.location.href='/index.html';</script>`);
          })
          .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error sending transaction');
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error signing transaction');
      });
  });
});

app.post('/generate-wallet', (req, res) => {

  const wallet = web3.eth.accounts.create();
  const response = {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
  const html = `
    <html>
      <head>
        <title>Wallet Information</title>
      </head>
      <body>
        <h1>Wallet Information</h1>
        <p>Address: ${response.address}</p>
        <p>Private Key: ${response.privateKey}</p>
      </body>
    </html>
  `;

// Send the HTML page as a response
  res.send(html);
});

app.post('/sc-name', (req, res) => {
 
  contract.methods.name().call()
  .then(result => {
      console.log('Res: ', result)
      const scName = result;
      res.send(`<script>alert('CONTRACT TOKEN NAME is ${scName}'); window.location.href='/index.html';</script>`);
  })
  .catch(error => {
      console.log(error)
  })

 
});

app.post('/sc-name', (req, res) => {
 
  contract.methods.name().call()
  .then(result => {
      console.log('Res: ', result)
      const scName = result;
      res.send(`<script>alert('CONTRACT TOKEN NAME is ${scName}'); window.location.href='/index.html';</script>`);
  })
  .catch(error => {
      console.log(error)
  })
});


app.post('/claim-tokens', (req, res) => {
  const scName = null;

  const clientWallet = req.body.walletAddress;
  const walletPrivate = req.body.walletPrivate;
  const amountOfTokens = req.body.amountOfTokens;
  const data = contract.methods.claimTokens(amountOfTokens).encodeABI();

  contract.methods.name().call()
  .then(result => {
      console.log('Res: ', result)
      scName = result;
  })
  .catch(error => {
      console.log(error)
  })

  web3.eth.accounts.signTransaction({
      to: contractAddress,
      data: data,
      gas: 200000,
      gasPrice: '30000000000',
  }, walletPrivate)
  .then(signedTx => {
      web3.eth.sendSignedTransaction(signedTx.rawTransaction)
      .on('transactionHash', (hash) => {
        console.log("Transaction hash: " + hash);
        res.send(`<script>alert('Tokens ${scName} ${amountOfTokens} was claimed ${hash}'); window.location.href='/claim.html';</script>`);
      })
  });
});



app.listen(3333, () => {
console.log('Server started on port http://127.0.0.1:3333/');
});

