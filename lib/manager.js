/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 15:51
 * To change this template use File | Settings | File Templates.
 */


var pool = require('./pool');
var vkontakte_API =  require('./vkontakte-api');

function log(func, err){
    console.log("manager: "+ func + " :" + err);
}
    /**
     *  класс-итератор
     *
     * @param {Object} settings - настройки,
     * @param  {function} callback
     *
     * Настройки должны содержать следующие поля:
     * timeInterval {Number}задержка между итерациями
     * template {String} шаблон уведомления
     *
     * Другие поля итератора
     * worked{Boolean} признак работы итератора, для того, чтоб не накладывались друг на друга
     * counter{Number} подсчет количества итераций
     *
     */

var manager = function (settings, callback){
    this.timeout  = settings.timeInterval;
    this.pool = new pool(settings.db);
    this.vkAPI = new vkontakte_API(settings.vk);
    this.worked = false;
    this.text = settings.template;
    this.counter = 0;
    var self = this;


    /**
     *  функция, запускающаяся 1 раз в интервал времени
     */

    this.iterate = function (){
        if (self.worked)
            return;
        self.counter++;
        self.worked = true;
        var uniqueText = (self.text.indexOf('%name%') > -1);
        self.pool.getIDsNotification(uniqueText, function(gerr, ids, name){
            if (gerr){
                log('iterate после getIDsNotification', gerr);
                return exitError(gerr);
            }
            // если мы обошли весь список юзеров, останавливаем таймер и выходим
            if (!ids || !ids.length){
                self.stop();
                self.worked = false;
                log('iterate', 'Завершаем работу на ' + self.counter + ' итерации');
                return callback();
            }

            var currentText = uniqueText
                ? self.text.replace(/%name%/ig, name)
                : self.text;
           /// log('iterate ids' , ids);
           /// log('iterate text' , currentText);
            self.vkAPI.sendNotification(ids, currentText, function (nerr, succesIds){
                if (nerr){
                    log('iterate после sendNotification' , nerr);
                    return exitError(nerr);
                }
                self.pool.seveResultNotification(succesIds, function(serr){
                    if (serr){
                        log('iterate после saveResult' , serr);
                        return exitError(serr);
                    }
                    self.worked = false;
                    return;
                });
            });
        });
        function exitError(err){
            self.stop();
            self.worked = false;
            self.pool.close(function() {
                    callback(err);
            });
        };

    } ;
        /**
         *  Запуск итератора
         */
    this.start = function ( ){
        log('start' , 'запускаемся');
         if (!self.intervalId){
             self.intervalId = setInterval( self.iterate, self.timeout);
         }
    } ;
        /**
         *  Остановка итератора
         */
    this.stop = function (){
        log('stop' , 'останавливаем  setInterval');
        if (self.intervalId){
            clearInterval(self.intervalId);
            self.intervalId = null;
        }
    };
    return self;
};
module.exports = manager;



