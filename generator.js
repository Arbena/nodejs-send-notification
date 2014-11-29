/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 16:55
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
require('./lib/user');
var mongoose = require('mongoose')
    , user = mongoose.model('User');
var settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json").toString());

var names = ["Саша","Миша","Юля", "Полина","Адександра", "Василий", "Инга", "Иннокентий", "Adelaida","Петр", "Степан","Анфиса","Катя","Сергей", "Анастасия","Олег", "Маша", "Мария"];
mongoose.connect(settings.db.path);
for (var i = 0; i < 1000; i++ ){
    var item = new user({vk_id: i + 100500 , first_name: names[(i % names.length)]});
    item.save(function (err) {
        if (err) console.log(err);
    });
}

