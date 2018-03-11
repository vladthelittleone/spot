const moment = require('moment');
const lodash = require('lodash');

const getIntervalHours = (interval) => interval === 'day' ? '24 часа' : '1 час';
const getDate = (date) => moment(date).format("DD.MM.YY h:mm a");

const notifyMessage = (spot, interval) => {
  let str = "";
  str += `Через *${getIntervalHours(interval)}* стартует матч\n`;
  str += spotInfo(spot);
  return str;
};

const spotInfo = (spot, withPayment = true) => {
  const {sportType, metro, spotTime, price, count, players, groupTitle, paymentInfo, locationText} = spot;
  let str = "";
  str += `Спорт: *${sportType}*\n`;
  str += groupTitle ? `Группа: *${groupTitle}*\n` : '';
  str += `Дата: *${getDate(spotTime)}*\n`;
  str += `Метро: *${metro}*\n`;
  str += `Цена: *${price}*\n`;
  str += `Необходимо: *${count}* человек\n`;
  str += `Собрано: *${players.length}* человек\n`;
  str += withPayment ? `Оплата: *${paymentInfo}*\n` : '';
  str += locationText ? `Адрес: *${locationText}*` : '';
  return str;
};

const playerInfo = (player) => {
  let str = "";
  if (player.first_name) {
    str += `${player.first_name} `;
  }
  if (player.last_name) {
    str += player.last_name;
  }
  return str;
};

const playersList = (players) => {
  let str = "";
  lodash.forEach(players, (player, index) => {
    str += `${index + 1}. `;
    str += playerInfo(player);
    str += "\n";
  });
  return str;
};

module.exports.PLAYERS_LIST = (players) => playersList(players);
module.exports.PLAYER_INFO = (player) => playerInfo(player);
module.exports.SPOT_INFO = (spot, withPayment = true) => spotInfo(spot, withPayment);
module.exports.OPEN_SPOTS = "Список доступных матчей";
module.exports.CREATE_SPOT = "Создать матч";
module.exports.USER_ERROR_MSG = "Что-то пошло не так, попробуйте еще раз!";
module.exports.NOTIFIED_ONE_HOUR_BEFORE = (spot) => notifyMessage(spot, 'hour');
module.exports.NOTIFIED_ONE_DAY_BEFORE = (spot) => notifyMessage(spot, 'day');
module.exports.NEW_SPOT_IS_CREATED = "Создан новый матч";
module.exports.INSERT_SPOT_DATE = "Введите дату проведения матча в формате: *01.01.14 14:40*";
module.exports.INSERT_SPOT_LOCATION = "Введите место проведения. Вы можете сделать это через геолокацию! Для этого нажмите: *Скрепка -> Локация*.";
module.exports.INSERT_SPOT_COST = "Введите цену за одного человека";
module.exports.INSERT_SPOT_MEMBERS = "Введите количество человек";
module.exports.INSERT_SPOT_PAYMENT_INFO = "Введите доп. информацию по оплате";
module.exports.INSERT_METRO_STATION = "Введите станцию метро";
module.exports.NEW_PLAYER_WANTS_TO_ADD = "В текущий матч хочет добавиться игрок";
module.exports.CURRENT_SPOT = "Ваш текущий матч";
module.exports.REMOVE_ACTIVE_SPOT = "Удалить ваш текущий матч";
module.exports.SPOT_ALREADY_CREATED = "Вами уже был создан матч";
module.exports.NO_ACTIVE_SPOT = "Вы еще не добавились в матч";
module.exports.CURRENT_SPOT_HAS_BEEN_REMOVED = "Текущий матч был удален";
module.exports.SPOT_ALREADY_ACTIVE = "Вы уже были добавлены в матч";
module.exports.NO_ACTIVE_SPOTS = "Нет активных матчей";
module.exports.MATCH_REMOVE_SUCCESS = "Созданный вами матч был удален";
module.exports.PLAYER_REMOVE_SUCCESS = "Вы были удалены из матча";
module.exports.CANNOT_USE_PAST_TIME = "Нельзя использовать прошлое время!";
module.exports.CANNOT_CREATE_SPOT_FOR_ONE = 'Нельзя создавать мачт для одного человека!';
module.exports.INCORRECT_DATE_FORMAT = "Неверный формат! Используйте следующий: *ДД.ММ.ГГ Ч:М*";
module.exports.SPOT_HAS_BEEN_CREATEED = "Матч успешно создан! Выберите группу для информирования о матче";
module.exports.SPOT_IS_OVER = '*Ваш матч начался! Спасибо за использования нашего сервиса!*';
module.exports.GROUP_DONT_HAVE_ACTIVE_SPOT = '*В данной группе нет активного матча!*';
module.exports.YOU_ARE_NOT_ADMIN = (name) => `Извините, ${name}, но вы не администратор этой группы`;
module.exports.CANCEL = `Отмена`;
