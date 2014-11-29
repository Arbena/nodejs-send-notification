/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 13:57
 * To change this template use File | Settings | File Templates.
 */

function log(func, err){
    console.log("VkontakteAPI: "+ func + ":" + err);
}

/**
 * Имитация работы с API вконтакта
 *
 * @param {Object} settings должен содержать 2 параметра:
 *  timeout {Number} максимальная задержка при отправке
 *  maxErrorCount {Number} моделируемое максимальное количество возникающих ошибок
 *
 */
function  vkontakteAPI(settings){
    //this.appId = settings.app;
    //this.host = settings.host;
    // и пр настройки, которые  нам сейчас не важны
    this.timeout = settings.timeout;
    this.maxErrorCount = settings.maxErrorCount;
}

/**
 * Имитация метода sendNotification
 *
 * @param {String}  ids строка, представляющая список id юзера в Вконтакте через запятую
 * @param {String} text текст уведомления
 * @param {Function} callback возвращает два параметра; error  - возникшие ошибки и  {String} ids - список id через запятую,
 * для которых отправка прошла успешно. (По крайней мере таой параметр возвращает реальный vkAPI.sendNotification)
 *
 */
vkontakteAPI.prototype.sendNotification = function (ids, text, callback){
    if (!ids || !ids.length || !ids.trim().length){
        return  callback('ids is empty');
    }
    log('sendNotification', 'отправляем текст \"' + text  + '\" юзерам ' + ids);
    var delay = Math.round(Math.random() * this.timeout);
    var result = ids;
    // если у нас вообще заданы ошибки, убираем случайные id из списка результатов
    // , имитируем. что при отправке на них не сложилось
    if (this.maxErrorCount){
        var list  = ids.split(',');
        var errPercent =  Math.random();
        var errors =    Math.round(errPercent * this.maxErrorCount);
        if (list.length < errors)
            errors = Math.round(errPercent * list.length);
        list.length =   list.length - errors;
        log('sendNotification', 'вставляем ' + errors + ' ошибок');
        result = list.join();
    }
    // имитируем задержку при вызове API
    setTimeout(function(){
        log('sendNotification', 'отправили, выходим');
        return callback(false, result);
    }, delay);
};
module.exports = vkontakteAPI;