var pdf = require('html-pdf');
var fs = require('fs');
var string = fs.readFileSync('./test.html', 'utf8');
var options = { format: 'Letter' };
pdf.create(string,options).toFile('./newTest.pdf',function(err, res){
    if(err)
    console.log(err);
    console.log("did it work?");
});