const request = require('superagent');
const fs = require('fs');
var doc = fs.readFileSync('test.yaml', 'utf8')

//console.log(doc)
request.post('http://localhost:3000/draw')
.set('Content-Type', 'application/text')
.send(doc)
.end((err, res) => {
    if (err) { return console.log(err); }
    //console.log(res.body.url);
    //console.log(res.body.explanation);

    fs.writeFile('moi.html', res.body, function(err) {
        console.log('Error: ' + err);
        });
  });

