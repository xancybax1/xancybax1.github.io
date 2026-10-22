(function () {
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- 1. Шум на фоне ----------
     Делаем 5 картинок-плиток 256x256 из случайных точек.
     Каждые 80 мс показываем случайную плитку в случайном месте. */

  var noise = document.getElementById('noise');
  var TILE = 256;
  var tiles = [];

  // Одна точка шума: в основном почти чёрная с синевой,
  // иногда тёмно-синяя, редко серая крупинка.
  function randomPixel() {
    var q = Math.random();
    var r, g, b;

    if (q < 0.80) {                        // 80%: чёрно-синий фон
      r = 4 + Math.random() * 6;
      g = 6 + Math.random() * 9;
      b = 12 + Math.random() * 16;
    } else if (q < 0.95) {                 // 15%: синие точки
      r = 14 + Math.random() * 16;
      g = 28 + Math.random() * 28;
      b = 60 + Math.random() * 55;
    } else {                               // 5%: серые крупинки
      var v = 70 + Math.random() * 70;
      r = v * 0.85;
      g = v * 0.9;
      b = v;
    }
    return [r, g, b];
  }

  function makeTile() {
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = TILE;

    var ctx = canvas.getContext('2d');
    var image = ctx.createImageData(TILE, TILE);
    var data = image.data;

    for (var i = 0; i < data.length; i += 4) {
      var p = randomPixel();
      data[i] = p[0];
      data[i + 1] = p[1];
      data[i + 2] = p[2];
      data[i + 3] = 255;
    }

    ctx.putImageData(image, 0, 0);
    return 'url(' + canvas.toDataURL() + ')';
  }

  function showRandomTile() {
    noise.style.backgroundImage = tiles[Math.floor(Math.random() * tiles.length)];
    noise.style.backgroundPosition =
      Math.floor(Math.random() * TILE) + 'px ' + Math.floor(Math.random() * TILE) + 'px';
  }

  for (var t = 0; t < 5; t++) {
    tiles.push(makeTile());
  }

  // Одна точка шума = один физический пиксель экрана
  noise.style.backgroundSize = (TILE / (window.devicePixelRatio || 1)) + 'px';
  showRandomTile();

  if (!reduceMotion) {
    setInterval(showRandomTile, 80);

    // Рваные края букв: меняем seed у фильтра #rough
    var turbulence = document.getElementById('tb');
    setInterval(function () {
      turbulence.setAttribute('seed', Math.floor(Math.random() * 60));
    }, 130);
  }


  /* ---------- 2. Тряска ----------
     Каждому элементу даём случайный сдвиг по времени,
     чтобы они тряслись не одновременно. */

  document.querySelectorAll('.fx, .fxi').forEach(function (el) {
    el.style.animationDelay = (-Math.random() * 10).toFixed(2) + 's';
  });


  /* ---------- 3. Появление при прокрутке ----------
     Когда блок (.r) попадает в экран, добавляем ему класс "in",
     и CSS запускает анимацию появления. */

  var blocks = document.querySelectorAll('.r');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    blocks.forEach(function (block) {
      observer.observe(block);
    });
  } else {
    blocks.forEach(function (block) {
      block.classList.add('in');
    });
  }


  /* ---------- 4. Контакты по нажатию ---------- */

  var contacts = {
    tel:  { text: '+7 953 231-85-82',       href: 'tel:+79532318582' },
    mail: { text: 'kschvmaxim@gmail.com',   href: 'mailto:kschvmaxim@gmail.com' },
    tg:   { text: '@xancybaxi',             href: 'https://t.me/xancybaxi' }
  };

  var info = document.getElementById('info');
  var buttons = document.querySelectorAll('.ib');
  var current = null;

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-k');

      // Сбрасываем всё
      buttons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      info.classList.remove('in');
      info.textContent = '';

      // Повторное нажатие на ту же кнопку просто прячет контакт
      if (current === key) {
        current = null;
        return;
      }

      current = key;
      button.setAttribute('aria-expanded', 'true');

      var link = document.createElement('a');
      link.href = contacts[key].href;
      link.textContent = contacts[key].text;
      if (key === 'tg') {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      info.appendChild(link);

      void info.offsetWidth;        // перезапуск анимации
      info.classList.add('in');
    });
  });
})();
