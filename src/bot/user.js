/**
 * Здесь выполняем логику связанную с пользователем.
 */

const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const Markup = require("telegraf/markup");
const SpotAPI = require("../api");
const config = require("../config");
const logger = require("../utils/log")(module);
const session = require("telegraf/session");
const lodash = require("lodash");
const message = require('./message');

const spots = {};
const sportTypes = config.get("sportTypes");

module.exports = (bot) => {

  // Сцена создания нового матча.
  const create = createScene();

  // Create scene manager
  const stage = new Stage();

  // Scene registration
  stage.register(create);

  bot.use(session());
  bot.use(stage.middleware());

  bot.hears(message.OPEN_GROUPS, (ctx) => {
    SpotAPI.getOpenSpots().then((groups) => {
      ctx.replyWithMarkdown("*=> Список доступных матчей*")
         .then(async () => {
             for (const group of groups) {
               const {sportType, spotTime, location, price, count, fromId} = group;
               let str = "";
               str += `Матч: ${sportType}\n`;
               str += `Дата проведения: ${spotTime}\n`;
               str += `Место проведения: ${location}\n`;
               str += `Цена: ${price}\n`;
               str += `Необходимо: ${count} человек`;
               await ctx.reply(
                 str,
                 Markup.inlineKeyboard([Markup.callbackButton("Добавиться", fromId)]).extra()
               );
             }
           }
         );
    });
  });

  bot.hears(message.CREATE, (ctx) => ctx.scene.enter("create"));
};

function createScene () {
  return new WizardScene(
    "create",

    /**
     * Выбор типа матча.
     */
    (ctx) => {
      ctx.replyWithMarkdown("*=> Создать новый матч*").then(() => {
        const fromId = ctx.from.id;
        const keyboard = lodash.map(sportTypes, (s) => Markup.callbackButton(s, s));
        spots[fromId] = {fromId}; // Инициализируем spot
        ctx.reply(
          "Введите тип спортвного матча.",
          Markup.inlineKeyboard(keyboard).extra()
        );
        ctx.wizard.next();
      });
    },

    /**
     * Выбор времени проведения матча.
     */
    (ctx) => {
      try {
        const sportType = ctx.callbackQuery.data;
        if (lodash.includes(sportTypes, sportType)) {
          spots[ctx.from.id].sportType = ctx.callbackQuery.data;
          ctx.reply("Введите дату проведения матча");
          return ctx.wizard.next();
        } else {
          ctx.reply("Что-то пошло не так, попробуйте еще раз!");
          return ctx.wizard.back();
        }
      }
      catch (error) {
        // often if ctx.callbackQuery.data is undefined
        ctx.reply('Что-то пошло не так, попробуйте еще раз!');
        return ctx.wizard.back();
      }
    },

    /**
     * Выбор места проведения матча.
     */
    (ctx) => {
      spots[ctx.from.id].spotTime = ctx.message.text;
      ctx.reply("Введите место проведения матча");
      return ctx.wizard.next();
    },

    /**
     * Ввод цены за человека.
     */
    (ctx) => {
      spots[ctx.from.id].location = ctx.message.text;
      ctx.reply("Введите цену за одного человека");
      return ctx.wizard.next();
    },

    /**
     * Выбор количества человек.
     */
    (ctx) => {
      spots[ctx.from.id].price = ctx.message.text;
      ctx.reply("Введите количество человек");
      return ctx.wizard.next();
    },

    /**
     * Ввод информации по оплате.
     */
    (ctx) => {
      try {
        spots[ctx.from.id].count = Number.parseInt(ctx.message.text, 10);
        ctx.reply("Введите доп. информацию по оплате");
        return ctx.wizard.next();
      } catch (e) {
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
        return ctx.wizard.back();
      }
    },

    /**
     * Создание матча.
     */
    (ctx) => {
      spots[ctx.from.id].paymentInfo = ctx.message.text;
      try {
        SpotAPI.createSpot(spots[ctx.from.id])
               .then(() => ctx.reply("Матч успешно создан!"));
        delete spots[ctx.from.id]; // Удаляем информацию из кэша.
        return ctx.scene.leave();
      } catch (e) {
        logger.error("Can't create group, cause of:", e);
        ctx.reply("Что-то пошло не так, попробуйте еще раз!");
        return ctx.wizard.back();
      }
    }
  );
}

