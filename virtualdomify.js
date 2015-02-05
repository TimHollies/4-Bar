var Handlebars = require('handlebars');

var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";

var tokenizer = Handlebars.parse(source);

var tokenStr = "";
console.log(tokenizer.statements[0]);
for (var i in tokenizer.statements) {
    var token = tokenizer.statements[i];
    tokenStr += "<p>" + (parseInt(i)+1) + ") ";
    switch (token.type) {
        case "content":
            tokenStr += "[string] - \"" + token.string + "\"" + "\n";
            break;
        case "mustache":
            tokenStr += "[placeholder] - " + token.id.string + "\n";
            break;
        case "block":
            tokenStr += "[block] - " + token.mustache.id.string + "\n";
    }    
}

console.log(tokenStr);