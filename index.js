const express = require('express');
const Web3 = require('web3');
require('dotenv').config();


const ejs = require('ejs');


var app = express();
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'ejs');
    app.use(express.static(__dirname + '/views'));

    const fundWallet = process.env.wallet_private;
    const web3 = new Web3('https://mainnet.infura.io/v3/22828457ff1d40558c6f765567423f2a');

app.get('/', (req, res) => {
    // res.send('Hello, world!');
    res.render('/views/index.html');
  });
  

app.get('/fund-wallet', (req, res) => {
  // res.send('Hello, world!');
  const wallet = web3.eth.accounts.privateKeyToAccount(fundWallet)
  console.log(wallet.address)
  const recvWallet = req.body.recipientAd
  res.render('/views/fund.html', 1);
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



app.listen(3333, () => {
console.log('Server started on port 3000');
});
