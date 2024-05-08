const express = require('express');
const axios = require('axios').default;
const app = express();

const numberApiUrl = 'http://20.244.56.144/numbers/';
const windowSize = 10;
let numbersStore = [];

app.use(express.json());

const isQualifiedId = (numberId) => ['p', 'f', 'e', 'r'].includes(numberId);

const storeNumber = async (numberId) => {
  try {
    const response = await axios.get(`${numberApiUrl}${numberId}`);
    const number = response.data;
    if (!numbersStore.includes(number) && Date.now() - number.timestamp < 500) {
      numbersStore.push(number);
      numbersStore = numbersStore.sort((a, b) => a.timestamp - b.timestamp).slice(0, windowSize);
    }
  } catch (error) {
    console.error(error);
  }
};

const calculateAverage = () => {
  const relevantNumbers = numbersStore.filter((num) => Date.now() - num.timestamp < 500);
  return relevantNumbers.reduce((acc, num) => acc + num.number, 0) / relevantNumbers.length;
};

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;
  if (!isQualifiedId(numberId)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }
  await storeNumber(numberId);
  const average = calculateAverage();
  res.json({
    windowPrevState: numbersStore.slice(0, -10),
    windowCurrState: numbersStore.slice(-10),
    numbers: numbersStore.slice(-10),
    avg: parseFloat(average.toFixed(2)),
  });
});

app.listen(3000, () => {
  console.log('Average Calculator microservice listening on port 3000');
});