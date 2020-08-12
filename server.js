const express = require('express');
const app = express();

app.use(express.static(__dirname));
app.listen(3000);

const arr = [];

for (let i = 0; i < 6; i++) {
    arr.push(`http://localhost:3000/imgs/${i}.jpeg`);
}
app.get('/api/img', (req, res) => {
    res.json(arr)
});


