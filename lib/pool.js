/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 12:10
 * To change this template use File | Settings | File Templates.
 */
// вычитание одного массива из второго
Array.prototype.diff = function (a) {
    return this.filter(function (val) {
        return (a.indexOf(val) == -1);
    });
};

require('./user');

var mongoose = require('mongoose')
    , User = mongoose.model('User');

function log(func, err) {
    console.log("userPool: " + func + ":" + err);
}
/**
 * контейнер для списка юзeров
 * @param {object} settings должен содержать поля
 *         path - строка подключения к бд
 *         limit - максимальное количество отправляемых за одну итерацию нотификаций
 *
 *
 * Поля объекта
 * schema {mongoose.model} задержка между итерациями
 * limit {Number} шаблон уведомления
 * countSend {Number} общее количество id отправленных уведомлений
 * countSuccess {Number} количество успешных отправок уведомлений
 * ids {[Number]} массив id в текущей итерации обработки
 *
 */

var userPool = function (settings) {
    // вообще-то схема выносится в отдельную папку models, но для уменьщения места размещаю тут...
    mongoose.connect(settings.path);
    mongoose.connection.on('error', log);

    this.countSend = 0;
    this.countSuccess = 0;
    this.schema = mongoose.model('User');
    this.limit = settings.limit;
    this.ids = [];
};

/**
 * метод получения id для обработки
 *
 * @param {Boolean}uniqueText Признак наличия в тексте уведомления имени юзера
 * @param {function} callback
 */

userPool.prototype.getIDsNotification = function (uniqueText, callback) {
    // в том cлучае, если при ошибке отправляем повторно,
    // в query необходимо убрать senderror, например
    //{$or :[{sended: false}, {sended: {$exists: false}}]};
    // Или просто не записывать его
    // если же отправка осуществляется раз в определенное время,
    // то добавляется еще проверка по дате последней отправке, например
    //{$or :[{sended: false}, {sended: {$exists: false}}, {send_date: {$lte: startScriptDate}}]};

    var query = {$or: [
        {sended: false, send_err: {$exists: false}},
        {sended: {$exists: false}}
    ]};

    var options = {limit: this.limit, sort: {first_name: 1, vk_id: 1}};
    var fields = {vk_id: 1};
    if (uniqueText)
        fields.first_name = 1;
    var self = this;
    this.schema.find(query, fields, options, function (err, data) {
        if (err) {
            console.log('userPool: load: ', err);
            callback(err);
        } else if (!data || !data.length) {
            // В базе не осталось юзеров с неотправленными уведомлениями,
            // Закрываем базу и выходим
            log('getIDsNotification', 'неотправленных не найдено!');
            log('getIDsNotification', "завершаем работу. Отправили " + self.countSend + " уведомлений, из них ушли без ошибок " + self.countSuccess);
            log('getIDsNotification', "закрываем коннект к базе данных");
            mongoose.connection.close(callback);
        } else {
            var ids = [data[0].vk_id];
            var name = uniqueText?  data[0].first_name : '';
            for (var i = 1; i < data.length; i++) {
                if (uniqueText && name != data[i].first_name) {
                    // если нам нужны только юзеры-тезки, а данные отсортированы по имени, то встретив другое имя выходим
                    break;
                }
                ids.push(data[i].vk_id);
            }
            log('getIDsNotification', ' в неотправленных нашлось ' + ids.length + ' Юзеров по имени ' + name);
            self.countSend += ids.length;
            self.ids = ids;
            callback(false, ids.join(), name);
        }
    });
};
/**
 * метод cохранения обработанных id
 *
 * @param {String}successtr  Список id, для которых отправка завершилась успешно
 * @param {function} callback
 *
 */

userPool.prototype.seveResultNotification = function (successtr, callback) {
    var successList = successtr && successtr.trim().length ? successtr.split(',').map(Number) : [];
    var counter = 2;
    var errorList = [];
    var self = this;
    var success = {sended: true, send_date: new Date()};
    var error = {sended: false, send_err: true};
    if (!successList || !successList.length) {
        counter--;
        updateList(this.ids, error);
        log('SeveResultNotification', 'сохраняем инфу о ' + this.ids.length + ' ошибках');
    } else if (successList.length == this.ids.length) {
        counter--;
        updateList(successList, success);
        log('SeveResultNotification', 'сохраняем инфу о ' + successList && successList.length + ' отправленных уведомлениях');

    } else {
        // Если мы сохраняем сообщение об ошибке в базу, вычисляем id для сохранения ошибок.
        errorList = this.ids.diff(successList);
        log('SeveResultNotification', 'сохраняем инфу о ' + successList.length + ' отправленных уведомлениях и о ' + errorList.length + " ошибках");

        updateList(errorList, error);
        updateList(successList, success);
    }
    this.countSuccess += successList.length;
    this.ids.length = 0;

    // Просто служебная функция для избежания дублирования кода
    function updateList(list, sets) {
        var options = { multi: true };
        var query = {vk_id: {$in: list}};
        self.schema.update(query, {$set: sets}, options, function (err) {
            if (err)
                log('SeveResultNotification: update', err);
            counter--;
            if (!counter) {
                log('SeveResultNotification: update', 'сохранили все ушедшие и все ошибки');
                callback(err);
            }
        });
    }
};
userPool.prototype.close = function(callback){
    log('getIDsNotification', "закрываем коннект к базе данных");
    mongoose.connection.close(callback);
}
module.exports = userPool;