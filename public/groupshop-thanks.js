/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-this-alias */
// @ts-ignore
// @ts-nocheck
console.log('v2 Script Local');
console.log('v2 Script Triggered');
// console.log('from local');
// Define App Url
// window.BURL = 'https://72e7-39-50-207-107.ngrok.io';
// window.FURL = 'http://localhost:3000';
window.BURL = 'https://api-stage.groupshop.co';
window.FURL = 'http://front-stage.groupshop.co';

// window.BURL = 'https://api.groupshop.co';
// window.FURL = 'http://app.groupshop.co';
window.GSURL = window.FURL;
/* @preserve
    _____ __ _     __                _
   / ___// /(_)___/ /___  ____      (_)___
  / (_ // // // _  // -_)/ __/_    / /(_-<
  \___//_//_/ \_,_/ \__//_/  (_)__/ //___/
                              |___/

  Version: 1.7.4
  Author: Nick Piscitelli (pickykneee)
  Website: https://nickpiscitelli.com
  Documentation: http://nickpiscitelli.github.io/Glider.js
  License: MIT License
  Release Date: October 25th, 2018

*/

!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(
  window,
  document,
  'script',
  'https://connect.facebook.net/en_US/fbevents.js',
);

fbq('init', '3371804206430685');

// eslint-disable-next-line @typescript-eslint/no-this-alias
// @ts-ignore
!(function (e) {
  'function' == typeof define && define.amd
    ? define(e)
    : 'object' == typeof exports
    ? (module.exports = e())
    : e();
})(function () {
  var a = 'undefined' != typeof window ? window : this,
    e = (a.Glider = function (e, t) {
      var o = this;
      if (e._glider) return e._glider;
      if (
        ((o.ele = e),
        o.ele.classList.add('glider'),
        ((o.ele._glider = o).opt = Object.assign(
          {},
          {
            slidesToScroll: 1,
            slidesToShow: 1,
            resizeLock: !0,
            duration: 0.5,
            easing: function (e, t, o, i, r) {
              return i * (t /= r) * t + o;
            },
          },
          t,
        )),
        (o.animate_id = o.page = o.slide = 0),
        (o.arrows = {}),
        (o._opt = o.opt),
        o.opt.skipTrack)
      )
        o.track = o.ele.children[0];
      else
        for (
          o.track = document.createElement('div'), o.ele.appendChild(o.track);
          1 !== o.ele.children.length;

        )
          o.track.appendChild(o.ele.children[0]);
      o.track.classList.add('glider-track'),
        o.init(),
        (o.resize = o.init.bind(o, !0)),
        o.event(o.ele, 'add', { scroll: o.updateControls.bind(o) }),
        o.event(a, 'add', { resize: o.resize });
    }),
    t = e.prototype;
  return (
    (t.init = function (e, t) {
      var o = this,
        i = 0,
        r = 0;
      (o.slides = o.track.children),
        [].forEach.call(o.slides, function (e, t) {
          e.classList.add('glider-slide'), e.setAttribute('data-gslide', t);
        }),
        (o.containerWidth = o.ele.clientWidth);
      var s = o.settingsBreakpoint();
      if (
        (t || (t = s),
        'auto' === o.opt.slidesToShow || void 0 !== o.opt._autoSlide)
      ) {
        var l = o.containerWidth / o.opt.itemWidth;
        o.opt._autoSlide = o.opt.slidesToShow = o.opt.exactWidth
          ? l
          : Math.max(1, Math.floor(l));
      }
      'auto' === o.opt.slidesToScroll &&
        (o.opt.slidesToScroll = Math.floor(o.opt.slidesToShow)),
        (o.itemWidth = o.opt.exactWidth
          ? o.opt.itemWidth
          : o.containerWidth / o.opt.slidesToShow),
        [].forEach.call(o.slides, function (e) {
          (e.style.height = 'auto'),
            (e.style.width = o.itemWidth + 'px'),
            (i += o.itemWidth),
            (r = Math.max(e.offsetHeight, r));
        }),
        (o.track.style.width = i + 'px'),
        (o.trackWidth = i),
        (o.isDrag = !1),
        (o.preventClick = !1),
        o.opt.resizeLock && o.scrollTo(o.slide * o.itemWidth, 0),
        (s || t) && (o.bindArrows(), o.buildDots(), o.bindDrag()),
        o.updateControls(),
        o.emit(e ? 'refresh' : 'loaded');
    }),
    (t.bindDrag = function () {
      var t = this;
      t.mouse = t.mouse || t.handleMouse.bind(t);
      var e = function () {
          (t.mouseDown = void 0),
            t.ele.classList.remove('drag'),
            t.isDrag && (t.preventClick = !0),
            (t.isDrag = !1);
        },
        o = {
          mouseup: e,
          mouseleave: e,
          mousedown: function (e) {
            e.preventDefault(),
              e.stopPropagation(),
              (t.mouseDown = e.clientX),
              t.ele.classList.add('drag');
          },
          mousemove: t.mouse,
          click: function (e) {
            t.preventClick && (e.preventDefault(), e.stopPropagation()),
              (t.preventClick = !1);
          },
        };
      t.ele.classList.toggle('draggable', !0 === t.opt.draggable),
        t.event(t.ele, 'remove', o),
        t.opt.draggable && t.event(t.ele, 'add', o);
    }),
    (t.buildDots = function () {
      var e = this;
      if (e.opt.dots) {
        if (
          ('string' == typeof e.opt.dots
            ? (e.dots = document.querySelector(e.opt.dots))
            : (e.dots = e.opt.dots),
          e.dots)
        ) {
          (e.dots.innerHTML = ''), e.dots.classList.add('glider-dots');
          for (
            var t = 0;
            t < Math.ceil(e.slides.length / e.opt.slidesToShow);
            ++t
          ) {
            var o = document.createElement('button');
            (o.dataset.index = t),
              o.setAttribute('aria-label', 'Page ' + (t + 1)),
              o.setAttribute('role', 'tab'),
              (o.className = 'glider-dot ' + (t ? '' : 'active')),
              e.event(o, 'add', { click: e.scrollItem.bind(e, t, !0) }),
              e.dots.appendChild(o);
          }
        }
      } else e.dots && (e.dots.innerHTML = '');
    }),
    (t.bindArrows = function () {
      var o = this;
      o.opt.arrows
        ? ['prev', 'next'].forEach(function (e) {
            var t = o.opt.arrows[e];
            t &&
              ('string' == typeof t && (t = document.querySelector(t)),
              t &&
                ((t._func = t._func || o.scrollItem.bind(o, e)),
                o.event(t, 'remove', { click: t._func }),
                o.event(t, 'add', { click: t._func }),
                (o.arrows[e] = t)));
          })
        : Object.keys(o.arrows).forEach(function (e) {
            var t = o.arrows[e];
            o.event(t, 'remove', { click: t._func });
          });
    }),
    (t.updateControls = function (e) {
      var d = this;
      e && !d.opt.scrollPropagate && e.stopPropagation();
      var t = d.containerWidth >= d.trackWidth;
      d.opt.rewind ||
        (d.arrows.prev &&
          (d.arrows.prev.classList.toggle(
            'disabled',
            d.ele.scrollLeft <= 0 || t,
          ),
          d.arrows.prev.setAttribute(
            'aria-disabled',
            d.arrows.prev.classList.contains('disabled'),
          )),
        d.arrows.next &&
          (d.arrows.next.classList.toggle(
            'disabled',
            Math.ceil(d.ele.scrollLeft + d.containerWidth) >=
              Math.floor(d.trackWidth) || t,
          ),
          d.arrows.next.setAttribute(
            'aria-disabled',
            d.arrows.next.classList.contains('disabled'),
          ))),
        (d.slide = Math.round(d.ele.scrollLeft / d.itemWidth)),
        (d.page = Math.round(d.ele.scrollLeft / d.containerWidth));
      var c = d.slide + Math.floor(Math.floor(d.opt.slidesToShow) / 2),
        h = Math.floor(d.opt.slidesToShow) % 2 ? 0 : c + 1;
      1 === Math.floor(d.opt.slidesToShow) && (h = 0),
        d.ele.scrollLeft + d.containerWidth >= Math.floor(d.trackWidth) &&
          (d.page = d.dots ? d.dots.children.length - 1 : 0),
        [].forEach.call(d.slides, function (e, t) {
          var o = e.classList,
            i = o.contains('visible'),
            r = d.ele.scrollLeft,
            s = d.ele.scrollLeft + d.containerWidth,
            l = d.itemWidth * t,
            n = l + d.itemWidth;
          [].forEach.call(o, function (e) {
            /^left|right/.test(e) && o.remove(e);
          }),
            o.toggle('active', d.slide === t),
            c === t || (h && h === t)
              ? o.add('center')
              : (o.remove('center'),
                o.add(
                  [
                    t < c ? 'left' : 'right',
                    Math.abs(t - (t < c ? c : h || c)),
                  ].join('-'),
                ));
          var a =
            Math.ceil(l) >= Math.floor(r) && Math.floor(n) <= Math.ceil(s);
          o.toggle('visible', a),
            a !== i &&
              d.emit('slide-' + (a ? 'visible' : 'hidden'), { slide: t });
        }),
        d.dots &&
          [].forEach.call(d.dots.children, function (e, t) {
            e.classList.toggle('active', d.page === t);
          }),
        e &&
          d.opt.scrollLock &&
          (clearTimeout(d.scrollLock),
          (d.scrollLock = setTimeout(function () {
            clearTimeout(d.scrollLock),
              0.02 < Math.abs(d.ele.scrollLeft / d.itemWidth - d.slide) &&
                (d.mouseDown ||
                  (d.trackWidth > d.containerWidth + d.ele.scrollLeft &&
                    d.scrollItem(d.getCurrentSlide())));
          }, d.opt.scrollLockDelay || 250)));
    }),
    (t.getCurrentSlide = function () {
      var e = this;
      return e.round(e.ele.scrollLeft / e.itemWidth);
    }),
    (t.scrollItem = function (e, t, o) {
      o && o.preventDefault();
      var i = this,
        r = e;
      if ((++i.animate_id, !0 === t))
        (e *= i.containerWidth),
          (e = Math.round(e / i.itemWidth) * i.itemWidth);
      else {
        if ('string' == typeof e) {
          var s = 'prev' === e;
          if (
            ((e =
              i.opt.slidesToScroll % 1 || i.opt.slidesToShow % 1
                ? i.getCurrentSlide()
                : i.slide),
            s ? (e -= i.opt.slidesToScroll) : (e += i.opt.slidesToScroll),
            i.opt.rewind)
          ) {
            var l = i.ele.scrollLeft;
            e =
              s && !l
                ? i.slides.length
                : !s && l + i.containerWidth >= Math.floor(i.trackWidth)
                ? 0
                : e;
          }
        }
        (e = Math.max(Math.min(e, i.slides.length), 0)),
          (i.slide = e),
          (e = i.itemWidth * e);
      }
      return (
        i.scrollTo(
          e,
          i.opt.duration * Math.abs(i.ele.scrollLeft - e),
          function () {
            i.updateControls(),
              i.emit('animated', {
                value: r,
                type: 'string' == typeof r ? 'arrow' : t ? 'dot' : 'slide',
              });
          },
        ),
        !1
      );
    }),
    (t.settingsBreakpoint = function () {
      var e = this,
        t = e._opt.responsive;
      if (t) {
        t.sort(function (e, t) {
          return t.breakpoint - e.breakpoint;
        });
        for (var o = 0; o < t.length; ++o) {
          var i = t[o];
          if (a.innerWidth >= i.breakpoint)
            return (
              e.breakpoint !== i.breakpoint &&
              ((e.opt = Object.assign({}, e._opt, i.settings)),
              (e.breakpoint = i.breakpoint),
              !0)
            );
        }
      }
      var r = 0 !== e.breakpoint;
      return (e.opt = Object.assign({}, e._opt)), (e.breakpoint = 0), r;
    }),
    (t.scrollTo = function (t, o, i) {
      var r = this,
        s = new Date().getTime(),
        l = r.animate_id,
        n = function () {
          var e = new Date().getTime() - s;
          (r.ele.scrollLeft =
            r.ele.scrollLeft +
            (t - r.ele.scrollLeft) * r.opt.easing(0, e, 0, 1, o)),
            e < o && l === r.animate_id
              ? a.requestAnimationFrame(n)
              : ((r.ele.scrollLeft = t), i && i.call(r));
        };
      a.requestAnimationFrame(n);
    }),
    (t.removeItem = function (e) {
      var t = this;
      t.slides.length &&
        (t.track.removeChild(t.slides[e]), t.refresh(!0), t.emit('remove'));
    }),
    (t.addItem = function (e) {
      this.track.appendChild(e), this.refresh(!0), this.emit('add');
    }),
    (t.handleMouse = function (e) {
      var t = this;
      t.mouseDown &&
        ((t.isDrag = !0),
        (t.ele.scrollLeft +=
          (t.mouseDown - e.clientX) * (t.opt.dragVelocity || 3.3)),
        (t.mouseDown = e.clientX));
    }),
    (t.round = function (e) {
      var t = 1 / (this.opt.slidesToScroll % 1 || 1);
      return Math.round(e * t) / t;
    }),
    (t.refresh = function (e) {
      this.init(!0, e);
    }),
    (t.setOption = function (t, e) {
      var o = this;
      o.breakpoint && !e
        ? o._opt.responsive.forEach(function (e) {
            e.breakpoint === o.breakpoint &&
              (e.settings = Object.assign({}, e.settings, t));
          })
        : (o._opt = Object.assign({}, o._opt, t)),
        (o.breakpoint = 0),
        o.settingsBreakpoint();
    }),
    (t.destroy = function () {
      var e = this,
        t = e.ele.cloneNode(!0),
        o = function (t) {
          t.removeAttribute('style'),
            [].forEach.call(t.classList, function (e) {
              /^glider/.test(e) && t.classList.remove(e);
            });
        };
      (t.children[0].outerHTML = t.children[0].innerHTML),
        o(t),
        [].forEach.call(t.getElementsByTagName('*'), o),
        e.ele.parentNode.replaceChild(t, e.ele),
        e.event(a, 'remove', { resize: e.resize }),
        e.emit('destroy');
    }),
    (t.emit = function (e, t) {
      var o = new a.CustomEvent('glider-' + e, {
        bubbles: !this.opt.eventPropagate,
        detail: t,
      });
      this.ele.dispatchEvent(o);
    }),
    (t.event = function (e, t, o) {
      var i = e[t + 'EventListener'].bind(e);
      Object.keys(o).forEach(function (e) {
        i(e, o[e]);
      });
    }),
    e
  );
});

function getCurrencySymbol(code) {
  // length 164
  var currency_list = [
    { code: 'AFA', symbol: '؋' },
    { code: 'ALL', symbol: 'Lek' },
    { code: 'DZD', symbol: 'دج' },
    { code: 'AOA', symbol: 'Kz' },
    { code: 'ARS', symbol: '$' },
    { code: 'AMD', symbol: '֏' },
    { code: 'AWG', symbol: 'ƒ' },
    { code: 'AUD', symbol: '$' },
    { code: 'AZN', symbol: 'm' },
    { code: 'BSD', symbol: 'B$' },
    { code: 'BHD', symbol: '.د.ب' },
    { code: 'BDT', symbol: '৳' },
    { code: 'BBD', symbol: 'Bds$' },
    { code: 'BYR', symbol: 'Br' },
    { code: 'BEF', symbol: 'fr' },
    { code: 'BZD', symbol: '$' },
    { code: 'BMD', symbol: '$' },
    { code: 'BTN', symbol: 'Nu.' },
    { code: 'BTC', symbol: '฿' },
    { code: 'BOB', symbol: 'Bs.' },
    { code: 'BAM', symbol: 'KM' },
    { code: 'BWP', symbol: 'P' },
    { code: 'BRL', symbol: 'R$' },
    { code: 'GBP', symbol: '£' },
    { code: 'BND', symbol: 'B$' },
    { code: 'BGN', symbol: 'Лв.' },
    { code: 'BIF', symbol: 'FBu' },
    { code: 'KHR', symbol: 'KHR' },
    { code: 'CAD', symbol: '$' },
    { code: 'CVE', symbol: '$' },
    { code: 'KYD', symbol: '$' },
    { code: 'XOF', symbol: 'CFA' },
    { code: 'XAF', symbol: 'FCFA' },
    { code: 'XPF', symbol: '₣' },
    { code: 'CLP', symbol: '$' },
    { code: 'CNY', symbol: '¥' },
    { code: 'COP', symbol: '$' },
    { code: 'KMF', symbol: 'CF' },
    { code: 'CDF', symbol: 'FC' },
    { code: 'CRC', symbol: '₡' },
    { code: 'HRK', symbol: 'kn' },
    { code: 'CUC', symbol: '$, CUC' },
    { code: 'CZK', symbol: 'Kč' },
    { code: 'DKK', symbol: 'Kr.' },
    { code: 'DJF', symbol: 'Fdj' },
    { code: 'DOP', symbol: '$' },
    { code: 'XCD', symbol: '$' },
    { code: 'EGP', symbol: 'ج.م' },
    { code: 'ERN', symbol: 'Nfk' },
    { code: 'EEK', symbol: 'kr' },
    { code: 'ETB', symbol: 'Nkf' },
    { code: 'EUR', symbol: '€' },
    { code: 'FKP', symbol: '£' },
    { code: 'FJD', symbol: 'FJ$' },
    { code: 'GMD', symbol: 'D' },
    { code: 'GEL', symbol: 'ლ' },
    { code: 'DEM', symbol: 'DM' },
    { code: 'GHS', symbol: 'GH₵' },
    { code: 'GIP', symbol: '£' },
    { code: 'GRD', symbol: '₯, Δρχ, Δρ' },
    { code: 'GTQ', symbol: 'Q' },
    { code: 'GNF', symbol: 'FG' },
    { code: 'GYD', symbol: '$' },
    { code: 'HTG', symbol: 'G' },
    { code: 'HNL', symbol: 'L' },
    { code: 'HKD', symbol: '$' },
    { code: 'HUF', symbol: 'Ft' },
    { code: 'ISK', symbol: 'kr' },
    { code: 'INR', symbol: '₹' },
    { code: 'IDR', symbol: 'Rp' },
    { code: 'IRR', symbol: '﷼' },
    { code: 'IQD', symbol: 'د.ع' },
    { code: 'ILS', symbol: '₪' },
    { code: 'ITL', symbol: 'L,£' },
    { code: 'JMD', symbol: 'J$' },
    { code: 'JPY', symbol: '¥' },
    { code: 'JOD', symbol: 'ا.د' },
    { code: 'KZT', symbol: 'лв' },
    { code: 'KES', symbol: 'KSh' },
    { code: 'KWD', symbol: 'ك.د' },
    { code: 'KGS', symbol: 'лв' },
    { code: 'LAK', symbol: '₭' },
    { code: 'LVL', symbol: 'Ls' },
    { code: 'LBP', symbol: '£' },
    { code: 'LSL', symbol: 'L' },
    { code: 'LRD', symbol: '$' },
    { code: 'LYD', symbol: 'د.ل' },
    { code: 'LTL', symbol: 'Lt' },
    { code: 'MOP', symbol: '$' },
    { code: 'MKD', symbol: 'ден' },
    { code: 'MGA', symbol: 'Ar' },
    { code: 'MWK', symbol: 'MK' },
    { code: 'MYR', symbol: 'RM' },
    { code: 'MVR', symbol: 'Rf' },
    { code: 'MRO', symbol: 'MRU' },
    { code: 'MUR', symbol: '₨' },
    { code: 'MXN', symbol: '$' },
    { code: 'MDL', symbol: 'L' },
    { code: 'MNT', symbol: '₮' },
    { code: 'MAD', symbol: 'MAD' },
    { code: 'MZM', symbol: 'MT' },
    { code: 'MMK', symbol: 'K' },
    { code: 'NAD', symbol: '$' },
    { code: 'NPR', symbol: '₨' },
    { code: 'ANG', symbol: 'ƒ' },
    { code: 'TWD', symbol: '$' },
    { code: 'NZD', symbol: '$' },
    { code: 'NIO', symbol: 'C$' },
    { code: 'NGN', symbol: '₦' },
    { code: 'KPW', symbol: '₩' },
    { code: 'NOK', symbol: 'kr' },
    { code: 'OMR', symbol: '.ع.ر' },
    { code: 'PKR', symbol: '₨' },
    { code: 'PAB', symbol: 'B/.' },
    { code: 'PGK', symbol: 'K' },
    { code: 'PYG', symbol: '₲' },
    { code: 'PEN', symbol: 'S/.' },
    { code: 'PHP', symbol: '₱' },
    { code: 'PLN', symbol: 'zł' },
    { code: 'QAR', symbol: 'ق.ر' },
    { code: 'RON', symbol: 'lei' },
    { code: 'RUB', symbol: '₽' },
    { code: 'RWF', symbol: 'FRw' },
    { code: 'SVC', symbol: '₡' },
    { code: 'WST', symbol: 'SAT' },
    { code: 'SAR', symbol: '﷼' },
    { code: 'RSD', symbol: 'din' },
    { code: 'SCR', symbol: 'SRe' },
    { code: 'SLL', symbol: 'Le' },
    { code: 'SGD', symbol: '$' },
    { code: 'SKK', symbol: 'Sk' },
    { code: 'SBD', symbol: 'Si$' },
    { code: 'SOS', symbol: 'Sh.so.' },
    { code: 'ZAR', symbol: 'R' },
    { code: 'KRW', symbol: '₩' },
    { code: 'XDR', symbol: 'SDR' },
    { code: 'LKR', symbol: 'Rs' },
    { code: 'SHP', symbol: '£' },
    { code: 'SDG', symbol: '.س.ج' },
    { code: 'SRD', symbol: '$' },
    { code: 'SZL', symbol: 'E' },
    { code: 'SEK', symbol: 'kr' },
    { code: 'CHF', symbol: 'CHf' },
    { code: 'SYP', symbol: 'LS' },
    { code: 'STD', symbol: 'Db' },
    { code: 'TJS', symbol: 'SM' },
    { code: 'TZS', symbol: 'TSh' },
    { code: 'THB', symbol: '฿' },
    { code: 'TOP', symbol: '$' },
    { code: 'TTD', symbol: '$' },
    { code: 'TND', symbol: 'ت.د' },
    { code: 'TRY', symbol: '₺' },
    { code: 'TMT', symbol: 'T' },
    { code: 'UGX', symbol: 'USh' },
    { code: 'UAH', symbol: '₴' },
    { code: 'AED', symbol: 'إ.د' },
    { code: 'UYU', symbol: '$' },
    { code: 'USD', symbol: '$' },
    { code: 'UZS', symbol: 'лв' },
    { code: 'VUV', symbol: 'VT' },
    { code: 'VEF', symbol: 'Bs' },
    { code: 'VND', symbol: '₫' },
    { code: 'YER', symbol: '﷼' },
    { code: 'ZMK', symbol: 'ZK' },
  ];
  return currency_list.filter((cur) => cur.code === code)?.[0]?.symbol;
}
var shop = Shopify.shop;
var orderId = Shopify.checkout.order_id;
var discountCode = Shopify.checkout.discount
  ? Shopify.checkout.discount.code
  : null;
var lineItems = Shopify.checkout.line_items;

console.log('🚀 ~ checkout', Shopify);
var totalOrderAmount = lineItems.reduce((priceSum, { price, quantity }) => {
  thisPrice = priceSum + quantity * parseFloat(price);
  return thisPrice;
}, 0);
let isGroupshop = false;
let isDrops = false;
let purpleHeadName = '';
if (
  discountCode &&
  (discountCode.slice(0, 3) === 'GSP' || discountCode.slice(0, 3) === 'GSC')
) {
  isGroupshop = false;
  purpleHeadName = 'purple-head-mobile2.jpg';
} else if (
  !discountCode ||
  discountCode.slice(0, 3) === 'GSD' ||
  (discountCode && discountCode.slice(0, 2) !== 'GS')
) {
  isDrops = true;
  // purpleHeadName = 'purple-head-mobile.jpg';
} else if (discountCode && discountCode.slice(0, 2) === 'GS') {
  isGroupshop = true;
  purpleHeadName = 'purple-head-mobile2.jpg';
}
// else if (!discountCode && discountCode.slice(0, 3) !== 'GSD') {
//   isGroupshop = true;
//   purpleHeadName = 'purple-head-mobile.jpg';
// }
console.log('isDrops', isDrops);
console.log('isGroupshop', isGroupshop);
const storeName = isDrops ? 'Groupshop' : 'Microstore';
const logoName = isDrops ? 'gslogo.png' : 'gslogo2.png';
// const purpleHeadName = isDrops
//   ? 'purple-head-mobile.jpg'
//   : 'purple-head-mobile2.jpg';
console.log('🚀  groupshop-thanks isGroupshop', isGroupshop);

async function fetchStore(shop) {
  let response = await fetch(`${window.BURL}/ext/store?shop=${shop}`);

  console.log(response.status); // 200
  console.log(response.statusText); // OK

  if (response.status === 200) {
    let data = await response.json();
    return data;
  }
}

async function gsPost(path, msg) {
  const rawResponse = await fetch(`${window.BURL}/ext/${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(msg),
  });
  const content = await rawResponse.json();

  console.log(content);
  return content;
}

function injectStyleSheet(url) {
  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.crossorigin = 'anonymous';
  style.href = window.BURL + '/public/' + url;

  document.head.appendChild(style);
}
function addLeftBlock(logo) {
  const logoDiv = logo
    ? `<div style="width: 52px;z-index: 20;"><img class="logo" height="" src="${logo}"></div>`
    : '';
  leftBlock = document.createElement('div');
  leftBlock.className = 'groupshop_left-block';
  leftBlock.innerHTML = `<div class="thankyouContainer">
          <div class="top">
            <div class="logoBox">
              ${logoDiv}
                <div style="width: 52px;margin-left: -10px;z-index: 10;"><img class="logo" src="https://d1o2v5h7slksjm.cloudfront.net/${logoName}"></div>
            </div>
            <div class="cashback groupshop_left-block">
                <h3><div class="image-placeholder" style="height: 50px !important;align-self: left;width: 120px !important;">&nbsp;</div>
                </h3>
            </div>
            <div class="cashbackBtn">
            <div class="image-placeholder" style="height: 50px !important;align-self: left;width: 120px !important;">&nbsp;</div>
            </div>
        </div>
        <div class="cashback_mobile">
        <div class="image-placeholder" style="height: 50px !important;align-self: left;width: 100% !important;">&nbsp;</div>
        </div>
        <div class="slider">
        <div class="glider-contain">
              <div class="glider">
                    <div class="image-placeholder">
                      <h4>...</h4>
                  </div>
                  <div class="image-placeholder">
                      <h4>...</h4>
                  </div>
                  <div class="image-placeholder">
                      <h4>...</h4>
                  </div>                          
              </div>					
              <button aria-label="Previous" class="glider-prev">«</button>
              <button aria-label="Next" class="glider-next">»</button>
   				</div>				 
        </div>
        <div class="cashbackBtn_mobile">
            <div class="buttonThnx"><a id="gs_link" target="_blank" href="#">Get Cashback</a></div>
        </div>
        <div class="bottom">
            <div class="left">
                <span><a id="gs_link" target="_blank" href="#">Get Cashback</a></span> <img src="${
                  window.BURL
                }/public/images/arrow.svg">
            </div>
            <div class="right">
                <span>Powered by</span> ${
                  isDrops
                    ? `<img src="${window.BURL}/public/images/groupshop.svg">`
                    : `<img class="img-ms" src="https://d1o2v5h7slksjm.cloudfront.net/ms-white-crop.jpg">`
                }
            </div>
        
    </div>
</div>`;

  var target = document.querySelector('.section__header');
  target.after(leftBlock);
}

function addRightBlock(
  brandName,
  isLoaded,
  cashback,
  purpleHD = 'purple-head-mobile2.jpg',
) {
  if (isLoaded) {
    document.querySelector(
      '.groupshop_right-block',
    ).innerHTML = `<div class="cashback gs_content_right">Get up to ${cashback} cashback on your order! 🎉</div>  <div class="cashbackTxt"> Get cashback on this order and unlock exclusive discounts with ${storeName}. </div> <div class="cashbackBtn"> <div class="buttonSmry"> <a target="_blank" id="gs_link" >Get Your Cashback</a></div></div>`;
    const isImageExist = document.querySelector('#purpleHeadName');
    console.log(
      '🚀 ~ file: groupshop-thanks.js:768 ~ isImageExist:',
      isImageExist,
    );
    if (!isImageExist) {
      const rightBlock = document.createElement('div');
      rightBlock.style = 'display: flex; justify-content: center;';
      const imgrightBlock = document.createElement('img');
      imgrightBlock.id = 'purpleHeadName';
      const bannerDiv = document.getElementById('bannerDiv');
      bannerDiv.appendChild(imgrightBlock);
      document.getElementById(
        'purpleHeadName',
      ).src = `${window.BURL}/public/images/${purpleHD}`;
      // var target = document.querySelector('.order-summary__sections');
      // target.append(rightBlock);
    }
  } else {
    const rightBlock = document.createElement('div');
    rightBlock.style = 'display: flex; justify-content: center;';
    // <img id="purpleHeadName" src="${window.BURL}/public/images/${purpleHeadName}" alt="headtag" />

    rightBlock.innerHTML = `<div class="summaryContainer">
        <div class="image">
            <div id="bannerDiv" class="image-placeholder" style="height: 30px !important;align-self: center;"> </div>
            </div>
        <div class="groupshop_right-block">
        <div class="cashback gs_content_right">
        <div class="image-placeholder" style="height: 30px !important;align-self: center; width: 205px !important;">&nbsp;</div>
        </div>
        <div class="cashbackTxt">
        <div class="image-placeholder" style="height: 30px !important;align-self: center; width: 205px !important;">&nbsp;</div>
        </div>
        
        <div class="cashbackBtn">
        <div class="buttonSmry">
            <a id="gs_link" target="_blank" ><span class="image-placeholder" style="height: 20px !important; width: 70px !important;">&nbsp;</span></a>
            </div>
        </div>
        </div>
</div>`;

    var target = document.querySelector('.order-summary__sections');
    target.append(rightBlock);
  }
}

function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return 0;
}

async function init() {
  //   try {
  // fetch store detail
  const store = await fetchStore(Shopify.shop);
  console.log('🚀 ~ file: groupshop-pdp.js ~ line 124 ~ init ~ store', store);
  const bannerSummaryPage = store.settings.layout.bannerSummaryPage;
  if (
    ['Active', 'Inactive'].includes(store.status) &&
    store.dropsStatus == 'Active'
  ) {
    //create products slider
    injectStyleSheet('gsthanks.css');
    injectStyleSheet('glider.min.css');
    const csymbol = getCurrencySymbol(Shopify.checkout.currency);
    // get vault + spotlight product ids
    const { ids: SVIDs } = await gsPost('dropsSVIDs', { shop: Shopify.shop });
    console.log('🚀 ~ file: groupshop-thanks.js:828 ~ init ~ SVIDs:', SVIDs);
    if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
      addLeftBlock(isDrops ? null : store.logoImage);
    }
    if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Right') {
      addRightBlock(store.brandName, false, '');
    }
    if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
      var glider = new Glider(document.querySelector('.glider'), {
        //   slidesToScroll: 3,
        slidesToShow: 'auto',
        slidesToScroll: 1,
        itemWidth: 110,
        duration: 0.25,
        rewind: true,
        arrows: {
          prev: '.glider-prev',
          next: '.glider-next',
        },
      });
    }
    let res;
    let indx = 0;
    let indx2 = 0;
    let indx3 = 0;

    if (isDrops) {
      const pollit3 = setInterval(async () => {
        indx3++;
        res = await gsPost('dropsMember', {
          orderId,
        });
        console.log('🚀 ~ file: groupshop-thanks.js:896 ~ pollit3 ~ res', res);
        const lineitems = Shopify.checkout.line_items;
        const cartDetails = [];
        lineitems.forEach((item, index) => {
          const productId = item.id;
          const discountPrice =
            item?.discount_allocations.length > 0
              ? item?.discount_allocations[0]?.amount
              : 0;
          cartDetails.push({
            id: productId,
            title: item.title,
            price: (item.price - discountPrice).toFixed(2),
            qty: item.quantity,
            variants: item.variant_title,
          });
        });
        const totalPrice = lineitems?.reduce(
          (priceSum, { line_price, quantity }) =>
            priceSum + quantity * parseFloat(line_price),
          0,
        );
        const cookieOrderId = getCookie('fbq_loaded');
        if (
          shop == 'groupshopdrops.myshopify.com' &&
          cookieOrderId != Shopify.checkout.order_id
        ) {
          fbq('track', 'Purchase', {
            contents: cartDetails,
            currency: store?.currencyCode,
            eventref: res?.id,
            value:
              totalPrice -
              (Shopify.checkout.discount
                ? Shopify.checkout.discount.amount
                : 0),
          });
          document.cookie = 'fbq_loaded=' + Shopify.checkout.order_id;
        }
        if (res.activeMember) {
          clearInterval(pollit3);
          const { activeMember: mem, url, percentage, members } = res;

          console.log('Shopify.checkout.discount', Shopify.checkout.discount);

          var leftHeadTxt = '';
          var rightHeadTxt = '';
          let cashback = 0;
          var amountCal = 0;
          if (
            members < 3 &&
            Shopify.checkout.discount &&
            store.dropsLastMilestone != mem.availedDiscount
          ) {
            console.log(
              '🚀 ~ file: groupshop-thanks.js:808 ~ pollit3 ~ lineitems:',
              lineitems,
            );
            // spotlight and vault products total
            // to remove from total
            const SVamount = lineitems
              .filter((l) =>
                SVIDs.includes(`gid://shopify/Product/${l.product_id}`),
              )
              .reduce((acc, { line_price }) => acc + +line_price, 0);
            console.log(
              '🚀 ~ file: groupshop-thanks.js:817 ~ pollit3 ~ SVamount:',
              SVamount,
            );
            cashback =
              (parseFloat(Shopify.checkout.subtotal_price) +
                parseFloat(Shopify.checkout.discount.amount) -
                SVamount) *
              (parseFloat(`${store.dropsLastMilestone}%`) / 100 -
                mem.availedDiscount / 100);

            amountCal = `${Math.floor(cashback)
              .toFixed(2)
              .toString()
              .replace('.00', '')}`;

            leftHeadTxt = `
         Get up to     
         <strong>${csymbol}${amountCal} cashback</strong>
          on your order & unlock exclusive rewards.
       `;
            rightHeadTxt = `Get up to ${csymbol}${amountCal} cashback on your order! 🎉`;
          } else {
            leftHeadTxt = 'Get up to ' + percentage + '% off on your order.';
            rightHeadTxt = leftHeadTxt;
          }
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
            document.querySelector('.cashback_mobile').innerHTML = leftHeadTxt;
            document.querySelector('.groupshop_left-block h3').innerHTML =
              leftHeadTxt;
            document.querySelector('.groupshop_left-block h3').className =
              'active';
          }
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Right') {
            addRightBlock(
              store.brandName,
              true,
              `${csymbol}${amountCal}`,
              'purple-head-mobile.jpg',
            );
            // document.querySelector('.gs_content').innerHTML = leftHeadTxt;
            document.querySelector('.gs_content_right').innerHTML =
              rightHeadTxt;
          }

          window.GSURL = window.FURL + url;
          console.log(
            '🚀 ~ file: groupshop-thanks.js ~ line 618 ~ pollit3 ~ window.GSURL',
            window.GSURL,
          );
          [...document.querySelectorAll('.cashbackBtn')].map(
            (btn, idx) =>
              (btn.innerHTML = `<div class="buttonThnx"><a target="_blank" id="gs_link" href="${
                window.GSURL
              }">Get ${idx ? 'Your ' : ''}Cashback</a></div>`),
          );
          // document.getElementById('gs_link').setAttribute('href', window.GSURL);
          [...document.querySelectorAll('#gs_link')].map((btn) =>
            btn.setAttribute('href', window.GSURL),
          );

          const { products } = await gsPost('dropsProducts', {
            shop,
            bestsellerCollectionId: store.shopifyId,
          });
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
            // var glider = Glider(this);
            console.log(products);
            Array(3).map((v, indx) => glider.removeItem(0));
            glider.removeItem(0);
            glider.removeItem(1);
            glider.removeItem(0);
            glider.removeItem(0);
            randomIndx = Math.floor(Math.random() * (products.length - 10)) + 1;
            displayProd =
              products.length > 10
                ? products.slice(randomIndx, randomIndx + 11)
                : products;

            ([...displayProd] ?? []).map((prod) => {
              const slide = document.createElement('a');
              slide.href = window.GSURL;
              slide.target = '_blank';
              slide.className = 'gscard';
              const pp = +(prod?.compareAtPrice ?? prod?.price);
              const productPrice = +pp.toFixed(2).toString().replace('.00', '');
              console.log(
                '🚀 ~ file: groupshop-thanks.js ~ line 654 ~ displayProd.map ~ productPrice',
                productPrice,
              );
              slide.innerHTML = `<img src="${
                prod.featuredImage ??
                'https://d1o2v5h7slksjm.cloudfront.net/noImage.png'
              }"alt="img"><span class="discount">${percentage}% OFF</span><h4>${prod.title.slice(
                0,
                15,
              )}..</h4><span class="bold">${csymbol}${(
                prod.price -
                (parseFloat(percentage) / 100) * prod.price
              )
                .toFixed(2)
                .toString()
                .replace(
                  '.00',
                  '',
                )}</span> <del>${csymbol}${productPrice}</del>`;
              glider.addItem(slide);
              glider.refresh(true);
              return prod;
            });

            glider.refresh(true);
          }
        } else if (indx3 === 5) {
          clearInterval(pollit3);
          res = await gsPost('member', {
            orderId,
            wurl: window.location.href,
          });
          if (res.activeMember) {
            const { activeMember: mem, url, percentage, members } = res;
            isDrops = false;
            document.querySelector(
              '.logoBox',
            ).innerHTML = `<div style="width: 52px;z-index: 20;"><img class="logo" height="" src="${store.logoImage}"></div>
              <div style="width: 52px;margin-left: -10px;z-index: 10;"><img class="logo" src="https://d1o2v5h7slksjm.cloudfront.net/gslogo2.png"></div>`;
            document.querySelector(
              '.right',
            ).innerHTML = `<span>Powered by</span> 
                  <img class="img-ms" src="https://d1o2v5h7slksjm.cloudfront.net/ms-white-crop.jpg">`;

            let cashback = 0;
            if (mem.role === 0) {
              cashback = Shopify.checkout.subtotal_price * 0.5;
            } else {
              cashback =
                Shopify.checkout.subtotal_price *
                (parseFloat(store.discount) / 100 - mem.availedDiscount / 100);
            }

            var amountCal = `${Math.floor(cashback)
              .toFixed(2)
              .toString()
              .replace('.00', '')}`;
            var leftHeadTxt = '';
            var rightHeadTxt = '';
            if (+amountCal > 0 && members < 6) {
              leftHeadTxt = `
                Get up to     
                <strong>${csymbol}${amountCal} cashback</strong>
                  on your order & unlock exclusive rewards.
              `;
              rightHeadTxt = `Get up to ${csymbol}${amountCal} cashback on your order! 🎉`;
            } else {
              leftHeadTxt = 'Get up to ' + percentage + '% off on your order.';
              rightHeadTxt = leftHeadTxt;
            }
            if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
              document.querySelector('.groupshop_left-block h3').innerHTML =
                leftHeadTxt;
              document.querySelector('.cashback_mobile').innerHTML =
                leftHeadTxt;
              document.querySelector('.groupshop_left-block h3').className =
                'active';
            }
            if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Right') {
              addRightBlock(store.brandName, true, `${csymbol}${amountCal}`);
              // document.querySelector('.gs_content').innerHTML = leftHeadTxt;
              document.querySelector('.gs_content_right').innerHTML =
                rightHeadTxt;
            }
            document.getElementById(
              'purpleHeadName',
            ).src = `${window.BURL}/public/images/purple-head-mobile2.jpg`;

            window.GSURL = window.FURL + url;
            console.log(
              '🚀 ~ file: groupshop-thanks.js ~ line 618 ~ pollit ~ window.GSURL',
              window.GSURL,
            );
            [...document.querySelectorAll('.cashbackBtn')].map(
              (btn, idx) =>
                (btn.innerHTML = `<div class="buttonThnx"><a target="_blank" id="gs_link" href="${
                  window.GSURL
                }">Get ${idx ? 'Your ' : ''}Cashback</a></div>`),
            );
            // document.getElementById('gs_link').setAttribute('href', window.GSURL);
            [...document.querySelectorAll('#gs_link')].map((btn) =>
              btn.setAttribute('href', window.GSURL),
            );

            const products = await gsPost('products', {
              campaignId: store.campaignId,
            });
            if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
              // var glider = Glider(this);
              console.log(products);
              Array(3).map((v, indx) => glider.removeItem(0));
              glider.removeItem(0);
              glider.removeItem(1);
              glider.removeItem(0);
              glider.removeItem(0);
              randomIndx =
                Math.floor(Math.random() * (products.length - 10)) + 1;
              displayProd =
                products.length > 10
                  ? products.slice(randomIndx, randomIndx + 11)
                  : products;

              displayProd.map((prod) => {
                const slide = document.createElement('a');
                slide.href = window.GSURL;
                slide.target = '_blank';
                slide.className = 'gscard';
                const pp = +prod?.price;
                const productPrice = +pp
                  .toFixed(2)
                  .toString()
                  .replace('.00', '');
                console.log(
                  '🚀 ~ file: groupshop-thanks.js ~ line 654 ~ displayProd.map ~ productPrice',
                  productPrice,
                );
                slide.innerHTML = `<img src="${
                  prod.featuredImage
                }"alt="img"><span class="discount">${percentage}% OFF</span><h4>${prod.title.slice(
                  0,
                  15,
                )}..</h4><span class="bold">${csymbol}${(
                  prod.price -
                  (parseFloat(percentage) / 100) * prod.price
                )
                  .toFixed(2)
                  .toString()
                  .replace(
                    '.00',
                    '',
                  )}</span> <del>${csymbol}${productPrice}</del>`;
                glider.addItem(slide);
                glider.refresh(true);
                return prod;
              });

              glider.refresh(true);
            }
          }
          // document.querySelector('.groupshop_left-block').remove();
          // document.querySelector('.summaryContainer').remove();
        }
      }, 1000);
    }

    if (isGroupshop) {
      const pollit = setInterval(async () => {
        indx++;
        res = await gsPost('member', {
          orderId,
          wurl: window.location.href,
        });
        if (res.activeMember) {
          clearInterval(pollit);
          const { activeMember: mem, url, percentage, members } = res;

          let cashback = 0;
          if (mem.role === 0) {
            cashback = Shopify.checkout.subtotal_price * 0.5;
          } else {
            cashback =
              Shopify.checkout.subtotal_price *
              (parseFloat(store.discount) / 100 - mem.availedDiscount / 100);
          }

          var amountCal = `${Math.floor(cashback)
            .toFixed(2)
            .toString()
            .replace('.00', '')}`;
          var leftHeadTxt = '';
          var rightHeadTxt = '';
          if (+amountCal > 0 && members < 6) {
            leftHeadTxt = `
         Get up to     
         <strong>${csymbol}${amountCal} cashback</strong>
          on your order & unlock exclusive rewards.
       `;
            rightHeadTxt = `Get up to ${csymbol}${amountCal} cashback on your order! 🎉`;
          } else {
            leftHeadTxt = 'Get up to ' + percentage + '% off on your order.';
            rightHeadTxt = leftHeadTxt;
          }
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
            document.querySelector('.cashback_mobile').innerHTML = leftHeadTxt;
            document.querySelector('.groupshop_left-block h3').innerHTML =
              leftHeadTxt;
            document.querySelector('.groupshop_left-block h3').className =
              'active';
          }
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Right') {
            addRightBlock(store.brandName, true, `${csymbol}${amountCal}`);
            // document.querySelector('.gs_content').innerHTML = leftHeadTxt;
            document.querySelector('.gs_content_right').innerHTML =
              rightHeadTxt;
          }

          window.GSURL = window.FURL + url;
          console.log(
            '🚀 ~ file: groupshop-thanks.js ~ line 618 ~ pollit ~ window.GSURL',
            window.GSURL,
          );
          [...document.querySelectorAll('.cashbackBtn')].map(
            (btn, idx) =>
              (btn.innerHTML = `<div class="buttonThnx"><a target="_blank" id="gs_link" href="${
                window.GSURL
              }">Get ${idx ? 'Your ' : ''}Cashback</a></div>`),
          );
          // document.getElementById('gs_link').setAttribute('href', window.GSURL);
          [...document.querySelectorAll('#gs_link')].map((btn) =>
            btn.setAttribute('href', window.GSURL),
          );

          const products = await gsPost('products', {
            campaignId: store.campaignId,
          });
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Left') {
            // var glider = Glider(this);
            console.log(products);
            Array(3).map((v, indx) => glider.removeItem(0));
            glider.removeItem(0);
            glider.removeItem(1);
            glider.removeItem(0);
            glider.removeItem(0);
            randomIndx = Math.floor(Math.random() * (products.length - 10)) + 1;
            displayProd =
              products.length > 10
                ? products.slice(randomIndx, randomIndx + 11)
                : products;

            displayProd.map((prod) => {
              const slide = document.createElement('a');
              slide.href = window.GSURL;
              slide.target = '_blank';
              slide.className = 'gscard';
              const pp = +prod?.price;
              const productPrice = +pp.toFixed(2).toString().replace('.00', '');
              console.log(
                '🚀 ~ file: groupshop-thanks.js ~ line 654 ~ displayProd.map ~ productPrice',
                productPrice,
              );
              slide.innerHTML = `<img src="${
                prod.featuredImage
              }"alt="img"><span class="discount">${percentage}% OFF</span><h4>${prod.title.slice(
                0,
                15,
              )}..</h4><span class="bold">${csymbol}${(
                prod.price -
                (parseFloat(percentage) / 100) * prod.price
              )
                .toFixed(2)
                .toString()
                .replace(
                  '.00',
                  '',
                )}</span> <del>${csymbol}${productPrice}</del>`;
              glider.addItem(slide);
              glider.refresh(true);
              return prod;
            });

            glider.refresh(true);
          }
        } else if (indx === 5) {
          clearInterval(pollit);
          document.querySelector('.groupshop_left-block').remove();
          document.querySelector('.summaryContainer').remove();
        }
      }, 1000);
    } else if (
      discountCode &&
      (discountCode.slice(0, 3) === 'GSC' || discountCode.slice(0, 3) === 'GSP')
    ) {
      const pollit2 = setInterval(async () => {
        indx2++;
        res = await gsPost(
          discountCode.slice(0, 3) === 'GSC' ? 'channel' : 'partner',
          {
            discountCode,
          },
        );
        console.log(
          '🚀 ~ file: groupshop-thanks.js ~ line 657 ~ pollit2 ~ res',
          res,
        );
        // res = await gsPostGSP('partner', { orderId, wurl: window.location.href });
        // discountCode
        if (res.baseline) {
          clearInterval(pollit2);
          const { baseline, url, fname } = res;

          let discountAmt = (totalOrderAmount * parseInt(baseline)) / 100;

          var amountCal = `${Math.floor(discountAmt)
            .toFixed(2)
            .toString()
            .replace('.00', '')}`;
          console.log(
            '🚀 ~ file: groupshop-thanks.js ~ line 673 ~ pollit2 ~ amountCal',
            amountCal,
          );
          var leftHeadTxt = '';
          // Invite you friends to shop X’s Groupshop and give them 20% off
          leftHeadTxt = `
          Invite your friends to shop
         
           ${fname}'s Microstore
         
         and give them ${baseline} off
       `;
          document.querySelector('.cashback_mobile').innerHTML = leftHeadTxt;
          document.querySelector('.groupshop_left-block h3').innerHTML =
            leftHeadTxt;
          document.querySelector('.groupshop_left-block h3').className =
            'active';
          if (bannerSummaryPage === 'Both' || bannerSummaryPage === 'Right') {
            addRightBlock(store.brandName, true, `${csymbol}${amountCal}`);
            document.querySelector('.gs_content_right').innerHTML = leftHeadTxt;
          }
          window.GSURL = window.FURL + url;
          [...document.querySelectorAll('.cashbackBtn')].map(
            (btn, idx) =>
              (btn.innerHTML = `<div class="buttonThnx"><a target="_blank" id="gs_link" href="${
                window.GSURL
              }">Get ${idx ? 'Your ' : ''}Cashback</a></div>`),
          );
          // document.getElementById('gs_link').setAttribute('href', window.GSURL);
          [...document.querySelectorAll('#gs_link')].map((btn) =>
            btn.setAttribute('href', window.GSURL),
          );

          const products = await gsPost('products', {
            campaignId: store.campaignId,
          });

          // var glider = Glider(this);
          console.log(products, 'product');
          Array(3).map((v, indx) => glider.removeItem(0));
          glider.removeItem(0);
          glider.removeItem(1);
          glider.removeItem(0);
          glider.removeItem(0);
          randomIndx = Math.floor(Math.random() * (products.length - 10)) + 1;
          displayProd =
            products.length > 7
              ? products.slice(randomIndx, randomIndx + 8)
              : products;
          console.log(
            '🚀  groupshop-thanks 716 ~ pollit2 ~ displayProd',
            displayProd,
          );
          displayProd.map((prod) => {
            const slide = document.createElement('a');
            slide.href = window.GSURL;
            slide.target = '_blank';
            slide.className = 'gscard';
            slide.innerHTML = `<img src="${
              prod.featuredImage
            }"alt="img"><span class="discount">${baseline} OFF</span><h4>${prod.title.slice(
              0,
              15,
            )}..</h4><span class="bold">${csymbol}${(
              prod.price -
              (parseFloat(baseline) / 100) * prod.price
            )
              .toFixed(2)
              .toString()
              .replace('.00', '')}</span> <del>${csymbol}${prod.price}</del>`;
            glider.addItem(slide);
            glider.refresh(true);
            return prod;
          });

          glider.refresh(true);
        } else if (indx2 === 5) {
          clearInterval(pollit2);
          document.querySelector('.groupshop_left-block').remove();
          document.querySelector('.summaryContainer').remove();
        }
      }, 1000);
    }

    //   glider.destroy();
  }
  //   } catch (err) {
  //     console.log(JSON.stringify(err));
  //   }
}

init();
