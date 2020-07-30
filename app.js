const express = require('express');
const cron = require('node-cron');
const axios = require('axios');

const app = express();

let previousData = [];

cron.schedule('0 10 * * *', async () => {
  await yabkoGetter();
}, {});


app.listen(3333, async () => {
  console.log('3333');

  if (!previousData.length) {
    const result = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');
    previousData = result.data

    await yabkoGetter();
  }
})

async function yabkoGetter() {
  try {
    const result = await axios.get('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');

    const [stareYabko, staraGrushka] = previousData
    const [noveYabko, novaGrushka] = result.data

    const yabkoBuyChange = smailAdd(okruglator(noveYabko.buy) - okruglator(stareYabko.buy))
    const yabkoSaleChange = smailAdd(okruglator(noveYabko.sale) - okruglator(stareYabko.sale))

    const grushkaBuyChange = smailAdd(okruglator(novaGrushka.buy) - okruglator(staraGrushka.buy ))
    const grushkaSaleChange = smailAdd(okruglator(novaGrushka.sale) - okruglator(staraGrushka.sale))


    const message = ` ${new Date().toLocaleString()} \n
:dollar: USD - UAH:  Купують по ${ okruglator(noveYabko.buy) }. Продають по ${ okruglator(noveYabko.sale) }. \n
Різниця відносно попереднього: Купівля ${ yabkoBuyChange }. Продаж ${ yabkoSaleChange } \n \n
:euro: EUR - UAH:  Купують по ${ novaGrushka.buy }. Продають по ${ novaGrushka.sale}. \n
Різниця відносно попереднього: Купівля ${ grushkaBuyChange }. Продаж ${ grushkaSaleChange} \n \n
_____________________________________________________________ \n`


    console.log(message);

    await axios.post('https://slack.com/api/chat.postMessage',
      {
        channel: '#e-market',
        text: message
      },
      {
        headers: {
          "Content-type": 'application/json',
          "Authorization": 'Bearer xoxb-12'
        }
      })

    previousData = result.data
  } catch (e) {
    console.log(e);
  }
}

function okruglator(number) {
  return (Math.round(number  * 100) / 100)
}

function smailAdd(kurs) {
  if (kurs > 0) {
    kurs = '+' + okruglator(kurs) + ' :chart_with_upwards_trend: '
  } else if (kurs < 0) {
    kurs = okruglator(kurs) + ':chart_with_downwards_trend: '
  } else {
    kurs = okruglator(kurs) + ' :heavy_minus_sign: '
  }

  return kurs;
}
