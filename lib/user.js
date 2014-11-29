/**
 * Created with JetBrains WebStorm.
 * User: Arbena
 * Date: 29.11.14
 * Time: 16:56
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require('mongoose')
    , Schema  = mongoose.Schema;

/**
 * Схема таблички юзеров
 * vk_id {Number} id юзера в базе Вконтакте
 * first_name {String} шаблон уведомления
 * sended {Boolean} принак отправки уведомления
 * send_err {Boolean} признак ошибки при отправке уведомления
 * send_date {Date} Дата последней успешной отправки уведомления
 *
 */
var userSchema = new mongoose.Schema({
    vk_id: { type: Number, index: { unique: true }}
    , first_name: { type: String, required: true }
    , sended: Boolean
    , send_err: Boolean
    , send_date: Date
});
mongoose.model('User', userSchema);