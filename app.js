/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 11:52
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');

process.on('uncaughtException', function (err){
    console.log(err);
});

// Получаем настройки
var settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json").toString());
var manager = require('./lib/manager');

var item = manager(settings, function(err){
        if (err)
            console.log(err.stack);
        else
            console.log('Закончили работу');
        process.exit(err? 1: 0);
});
item.start();
console.log("Запускаем отправку уведомлений");
