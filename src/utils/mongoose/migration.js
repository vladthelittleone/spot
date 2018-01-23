module.exports = [
  {
    fromId:      1,
    spotTime:    new Date("2018-01-22T12:30:00Z").toISOString(),
    location:    'ул. Передовиков, д. 13, к. 1',
    sportType:   'Футбол',
    price:       2500,
    count:       10,
    paymentInfo: 'Карта сбербанка: 6572 8175 1264 8181',
    created:     Date.now()
  }, {
    fromId:      2,
    spotTime:    new Date("2018-01-23T09:15:00Z").toISOString(),
    location:    'ул. Бакалейщика, д. 111, к. 85',
    sportType:   'Баскетбол',
    price:       4000,
    count:       8,
    paymentInfo: 'Карта альфабанка: 8129 1235 6123 9172',
    created:     Date.now()
  }, {
    fromId:      3,
    spotTime:    new Date("2018-01-24T16:45:00Z").toISOString(),
    location:    'ул. MAD MAX, д. 0, к. -1',
    sportType:   'Футбол',
    price:       100,
    count:       1,
    paymentInfo: 'Карта undefined: undefined',
    created:     Date.now()
  }
];
