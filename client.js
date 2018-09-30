const request = require('superagent');
const fs = require('fs');
var xml2js = require('xml2js');
var doc = fs.readFileSync('test.yaml', 'utf8');

//curl -F 'data=@test.yaml' http://localhost:3000/draw


var myParse= (res, cb) => {
    res.text = '';
    res.on('data', chunk => res.text += chunk);
    res.on('end', () => xml2js.parseString(res.text, cb));
 }
 


//console.log(doc)
request.parse['application/svg+xml'] = myParse;
request.post('http://localhost:3000/draw')
.send(doc)
.type('application/text')
.set('Accept', 'application/svg+xml')
.buffer()
//.buffer(true).parse(request.parse.image)
.then(res => {
    fs.writeFileSync('./moi.svg', res.text)
 })
 .catch(err => {
    console.log(err);
 });

