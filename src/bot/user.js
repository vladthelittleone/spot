/**
 * Здесь выполняем логику связанную с пользователем.
 *
 * @since 20.01.2018
 * @author Skurishin Vladislav
 */
const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Markup = require("telegraf/markup");
const SpotAPI = require("../api");

const logger = require("../utils/log")(module);

const session = require("telegraf/session");
const lodash = require("lodash");
const spots = {};

// TODO вынести в конфиги
const sports = [
  "Футбол",
  "Баскетбол"
];

module.exports = (bot) => {
  // Сцена создания нового матча.
  const create = new WizardScene(
    "create",

    /**
     * Выбор типа матча.
     */
    (ctx) => {
      const fromId = ctx.from.id;
      const keyboard = lodash.map(sports, (s) => Markup.callbackButton(s, s));
      spots[fromId] = {fromId}; // Инициализируем spot
      ctx.reply(
        "Введите тип спортвного матча.",
        Markup.inlineKeyboard(keyboard).extra()
      );
      return ctx.wizard.next();
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {
      // TODO Добавить back, в случае если неверный формат.
      spots[ctx.from.id].sportType = ctx.callbackQuery.data;
      ctx.reply("Введите время проведения матча.");
      return ctx.wizard.next();
    },

    /**
     * Выбор места проведения матча.
     */
    (ctx) => {
      spots[ctx.from.id].spotTime = ctx.message.text;
      ctx.reply("Введите место проведения матча.");
      return ctx.wizard.next();
    },

    /**
     * Ввод цены за человека.
     */
    (ctx) => {
      spots[ctx.from.id].location = ctx.message.text;
      ctx.reply("Введите цену за одного человека.");
      return ctx.wizard.next();
    },

    /**
     * Выбор количества человек.
     */
    (ctx) => {
      spots[ctx.from.id].price = ctx.message.text;
      ctx.reply("Введите количество человек.");
      return ctx.wizard.next();
    },

    /**
     * Ввод информации по оплате.
     */
    (ctx) => {
      spots[ctx.from.id].count = ctx.message.text;
      ctx.reply("Введите доп. информацию по оплате.");
      return ctx.wizard.next();
    },

    /**
     * Создание матча.
     */
    (ctx) => {
      spots[ctx.from.id].paymentInfo = ctx.message.text;
      try {
        SpotAPI.createSpot(spots[ctx.from.id]);
        ctx.reply("Матч успешно создан!");
        delete spots[ctx.from.id]; // Удаляем информацию из кэша.
      } catch (e) {
        logger.error("Can't create group, cause of:", e);
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
        return ctx.wizard.back();
      }
      return ctx.scene.leave();
    }
  );

  // Create scene manager
  const stage = new Stage();

  // Scene registration
  stage.register(create);

  bot.use(session());
  bot.use(stage.middleware());
  bot.action("create", (ctx) => ctx.scene.enter("create"));
};

