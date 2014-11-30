/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 11:52
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var manager = require('./lib/manager');

process.on('uncaughtException', function (err){
    console.log(err);
    process.exit(1);
});

// Получаем настройки
var settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json").toString());

var item = manager(settings, function(err){
    if (err)
        console.log(err.stack);
    else
        console.log('Закончили работу');
    process.exit(err? 1: 0);
});
console.log("Запускаем отправку уведомлений");
item.start();
