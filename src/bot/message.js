const moment = require('moment');

const getIntervalHours = (interval) => interval === 'day' ? '24 часа' : '1 час';

const notifyMessage = (spot, interval) => {
  let str = "";
  str += `Ваш матч по *${spot.sportType}*`;
  str += `стартует через *${getIntervalHours(interval)}*.`;
  str += ` Информация об оплате: *${spot.paymentInfo}* | *${spot.price}Р*.`;
  str += ` Точное время: *${moment(spot.spotTime).format('MMMM Do YYYY, h:mm:ss a')}*.`;
  str += spot.locationText ? `Адрес проведения: ${spot.locationText}` : '';
  return str;
};

const spotInfo = (spot) => {
  const {sportType, spotTime, price, count, players, locationText} = spot;
  let str = "";
  str += `Вид спорта: ${sportType}\n`;
  str += `Дата проведения: ${moment(spotTime).format("DD.MM.YY H:m")}\n`;
  str += `Цена: ${price}\n`;
  str += `Необходимо: ${count} человек\n`;
  str += `Собрано: ${players.length} человек\n`;
  str += locationText ? `Адрес проведения: ${locationText}` : '';
  return str;
};

module.exports.SPOT_INFO = (spot) => spotInfo(spot);
module.exports.OPEN_SPOTS = "Список доступных матчей";
module.exports.CREATE_SPOT = "Создать матч";
module.exports.USER_ERROR_MSG = "Что-то пошло не так, попробуйте еще раз!";
module.exports.NOTIFIED_ONE_HOUR_BEFORE = (spot) => notifyMessage(spot, 'hour');
module.exports.NOTIFIED_ONE_DAY_BEFORE = (spot) => notifyMessage(spot, 'day');
module.exports.NEW_SPOT_IS_CREATED = "Создан новый матч";
module.exports.INSERT_SPOT_DATE = "Введите дату проведения матча в формате: *01.01.14 14:40*";
module.exports.INSERT_SPOT_LOCATION = "Введите место проведения (вы можете сделать это через геолокацию (нажмите: *Скрепка -> Локация(location)*))";
module.exports.INSERT_SPOT_COST = "Введите цену за одного человека";
module.exports.INSERT_SPOT_MEMBERS = "Введите количество человек";
module.exports.INSERT_SPOT_PAYMENT_INFO = "Введите доп. информацию по оплате";
module.exports.NEW_PLAYER_WANTS_TO_ADD = "В текущий матч хочет добавиться игрок";
module.exports.CURRENT_SPOT = "Ваш текущий матч";
module.exports.REMOVE_ACTIVE_SPOT = "Удалить ваш текущий матч";
module.exports.SPOT_ALREADY_CREATED = "Вами уже был создан матч";
module.exports.NO_ACTIVE_SPOT = "Вы еще не добавились в матч";
module.exports.SPOT_ALREADY_ACTIVE = "Вы уже были добавлены в матч";
module.exports.NO_ACTIVE_SPOTS = "Нет активных матчей";
module.exports.MATCH_REMOVE_SUCCESS = "Созданный вами матч был удален";
module.exports.PLAYER_REMOVE_SUCCESS = "Вы были удалены из матча";
module.exports.CANNOT_USE_PAST_TIME = "Нельзя использовать прошлое время!";
