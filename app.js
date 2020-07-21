const express = require('express');
const cron = require('node-cron');
const axios = require('axios');

const app = express();


const privatURL = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5'
let previousData = [
  {
    ccy: "USD",
    base_ccy: "UAH",
    buy: "27.30000",
    sale: "27.90000"
  },
  {
    ccy: "EUR",
    base_ccy: "UAH",
    buy: "31.20000",
    sale: "31.80000"
  }
];

cron.schedule('0 9 * * *', async () => {
  await yabkoGetter()
}, {});

cron.schedule('0 15 * * *', async () => {
  await yabkoGetter();
}, {});

// cron.schedule('* * * * *', async () => {
//   await yabkoGetter();
// }, {});


app.listen(3333, () => {
  console.log('3333');
})

async function yabkoGetter() {
  const result = await axios.get(privatURL);
  console.log(result.data);

  const [stareYabko, staraGrushka] = previousData
  const [noveYabko, novaGrushka] = result.data

  const yabkoBuyChange = noveYabko.buy - stareYabko.buy
  const yabkoSaleChange = noveYabko.sale - stareYabko.sale

  const grushkaBuyChange = staraGrushka.buy - staraGrushka.buy
  const grushkaSaleChange = novaGrushka.sale - staraGrushka.sale

  const message = `USD - UAH:  Купують по ${noveYabko.buy}. Продають по ${noveYabko.sale}. \n
Різниця відносно попереднього: купівля ${yabkoBuyChange}. Продаж ${yabkoSaleChange} \n \n
EUR - UAH:  Купують по ${ staraGrushka.buy }. Продають по ${ novaGrushka.sale }. \\n
Різниця відносно попереднього: купівля ${ grushkaBuyChange }. Продаж ${ grushkaSaleChange } \\n \\n`


  console.log(message);

  previousData = result.data
}
