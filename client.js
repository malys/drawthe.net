const request = require('superagent');
const fs = require('fs');
var doc = fs.readFileSync('test.yaml', 'utf8')

//curl -F 'data=@test.yaml' http://localhost:3000/draw

//console.log(doc)
request.post('http://localhost:3000/draw')
.send(doc)
.type('application/text')
.set('Accept', 'text/html')
//.buffer(true).parse(request.parse.image)
.then(res => {
    // res.body, res.headers, res.status
    console.log(res.text);
    //console.log(res.body.explanation);

    fs.writeFileSync('./moi.html', res.text)
 })
 .catch(err => {
    console.log(err);
 });
