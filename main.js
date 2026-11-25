/* ============================================================
   جاوااسکریپت سایت صنایع اتصالات شیبا
   همه‌ی کارها داخل یک تابع بسته (IIFE) انجام می‌شود
   تا متغیرها با بقیه‌ی کدهای صفحه قاطی نشوند.
   ============================================================ */
(function () {
  'use strict'; /* حالت سخت‌گیرانه: خطاهای پنهان جاوااسکریپت را نشان می‌دهد */

  /* آیا کاربر در تنظیمات سیستم «کم کردن حرکت‌ها» را فعال کرده است؟ */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* آیا مرورگر از IntersectionObserver پشتیبانی می‌کند؟ (برای ظاهر شدن نرم و شمارنده‌ها) */
  var supportsObserver = 'IntersectionObserver' in window;

  /* تبدیل عدد انگلیسی به عدد فارسی (مثلاً 35 به ۳۵) */
  var toPersianDigits = function (value) {
    return String(value).replace(/[0-9]/g, function (digit) {
      return '۰۱۲۳۴۵۶۷۸۹'[Number(digit)];
    });
  };

  /* عنصر هدر را یک بار می‌گیریم؛ پایین‌تر در «اسکرول اسپای»
     برای حساب کردن ارتفاع هدر لازم است.
     (تغییر رنگ هدر دیگر با جاوااسکریپت انجام نمی‌شود و با CSS و سنتینل است) */
  var header = document.getElementById('header');

  /* ---------- منوی موبایل ---------- */

  /* گرفتن منو و دکمه‌ی همبرگری از صفحه */
  var nav = document.getElementById('nav');
  var menuToggle = document.querySelector('.menu-toggle');

  /* اگر هر دو وجود داشتند، رفتار منو را فعال کن */
  if (nav && menuToggle) {
    /* تابع باز و بسته کردن منو؛ open یعنی باز باشد یا نه */
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open); /* کلاس باز بودن منو */
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false'); /* وضعیت برای صفحه‌خوان‌ها */
      menuToggle.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو'); /* برچسب دکمه */
      document.body.classList.toggle('no-scroll', open); /* وقتی منو باز است صفحه اسکرول نشود */
    };

    /* کلیک روی دکمه: اگر باز است ببند، اگر بسته است باز کن */
    menuToggle.addEventListener('click', function () {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    /* کلیک روی هر لینک داخل منو: منو بسته شود */
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    /* کلیک روی لوگو هم منو را می‌بندد */
    var brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', function () {
        if (nav.classList.contains('is-open')) setMenu(false);
      });
    }

    /* زدن کلید Escape: منو بسته شود */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
    });

    /* اگر صفحه بزرگ شد (از موبایل به دسکتاپ)، منو خودکار بسته شود */
    var desktopQuery = window.matchMedia('(min-width: 981px)');
    var closeOnDesktop = function (event) {
      if (event.matches) setMenu(false);
    };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', closeOnDesktop); /* مرورگرهای جدید */
    else desktopQuery.addListener(closeOnDesktop); /* مرورگرهای قدیمی */
  }


  /* ---------- ظاهر شدن نرم عناصر (Reveal) ---------- */

  /* گرفتن همه‌ی عناصری که کلاس reveal دارند */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion || !supportsObserver) {
    /* اگر انیمیشن لازم نیست یا مرورگر پشتیبانی نمی‌کند:
       همه‌ی عناصر را همان اول نشان بده */
    revealItems.forEach(function (item) {
      item.classList.add('in');
    });
  } else {
    /* ناظر دید: وقتی عنصر وارد صفحه شد، کلاس in را اضافه می‌کند */
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return; /* اگر هنوز دیده نمی‌شود، کاری نکن */
        entry.target.classList.add('in');  /* نمایش نرم */
        revealObserver.unobserve(entry.target); /* دیگر لازم نیست رصد شود */
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    /* هر عنصر را زیر نظر بگیر */
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }


  /* ---------- شمارنده‌های متحرک (آمار) ---------- */

  /* همه‌ی عناصری که ویژگی data-count دارند (مثل ۳۵+ سال) */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  /* تابع اجرای شمارنده برای یک عنصر */
  var runCounter = function (element) {
    var target = parseInt(element.getAttribute('data-count'), 10) || 0; /* عدد نهایی */
    var suffix = element.getAttribute('data-suffix') || ''; /* پسوند مثل + */

    /* گذاشتن عدد نهایی (در حالت بدون انیمیشن) */
    var finish = function () {
      element.textContent = toPersianDigits(target) + suffix;
    };

    /* اگر انیمیشن ممنوع است یا عدد صفر است، فقط عدد نهایی را بگذار */
    if (prefersReducedMotion || target === 0) {
      finish();
      return;
    }

    var duration = 1500; /* مدت انیمیشن: ۱.۵ ثانیه */
    var startTime = null;
    var step = function (timestamp) {
      if (startTime === null) startTime = timestamp; /* زمان شروع را یک بار ذخیره کن */
      var progress = Math.min((timestamp - startTime) / duration, 1); /* درصد پیشرفت از ۰ تا ۱ */
      var eased = 1 - Math.pow(1 - progress, 3); /* نرم‌تر کردن حرکت (شروع و پایان آرام) */
      element.textContent = toPersianDigits(Math.round(target * eased)) + suffix; /* نمایش عدد فعلی */
      if (progress < 1) window.requestAnimationFrame(step); /* تا پایان ادامه بده */
    };
    window.requestAnimationFrame(step);
  };

  if (prefersReducedMotion || !supportsObserver) {
    /* بدون انیمیشن: همه‌ی شمارنده‌ها مستقیم عدد نهایی را نشان دهند */
    counters.forEach(runCounter);
  } else {
    /* ناظر: هر شمارنده وقتی به دید کاربر رسید، شروع کند */
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 }); /* وقتی ۶۰٪ عنصر دیده شد */

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  }


  /* ---------- اسکرول اسپای (فعال شدن لینک بخش فعلی در منو) ---------- */

  /* همه‌ی لینک‌های منو */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  /* برای هر لینک، بخش مقصدش را پیدا کن (لینک‌هایی مثل #products) */
  var navTargets = navLinks.map(function (link) {
    var href = link.getAttribute('href') || '';
    return {
      link: link,
      section: href.charAt(0) === '#' ? document.querySelector(href) : null /* فقط لینک‌های داخلی */
    };
  }).filter(function (item) {
    return item.section !== null; /* لینک‌های بدون بخش را حذف کن */
  });

  if (navTargets.length) {
    var spyQueued = false; /* جلوگیری از اجرای تکراری در هر فریم */

    /* پیدا کردن بخش فعلی و فعال کردن لینک آن */
    var updateSpy = function () {
      spyQueued = false;
      var offset = (header ? header.offsetHeight : 0) + 90; /* ارتفاع هدر + کمی فاصله */
      var current = navTargets[0]; /* حالت پیش‌فرض: اولین لینک */

      /* هر بخشی که بالای خط offset باشد، فعلی حساب می‌شود (آخری برنده است) */
      navTargets.forEach(function (item) {
        if (item.section.getBoundingClientRect().top - offset <= 0) current = item;
      });

      /* اگر به انتهای صفحه رسیدیم، آخرین لینک فعال شود */
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = navTargets[navTargets.length - 1];

      /* کلاس active فقط روی لینک فعلی باشد */
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link === current.link);
      });
    };

    /* اجرای updateSpy حداکثر یک بار در هر فریم (برای کارایی بهتر) */
    var queueSpy = function () {
      if (spyQueued) return;
      spyQueued = true;
      window.requestAnimationFrame(updateSpy);
    };

    window.addEventListener('scroll', queueSpy, { passive: true }); /* هنگام اسکرول */
    window.addEventListener('resize', queueSpy); /* هنگام تغییر اندازه‌ی صفحه */
    updateSpy(); /* یک بار در شروع */
  }


  /* ---------- لایت‌باکس گالری (نمایش بزرگ تصویر) ---------- */

  /* گرفتن همه‌ی تصاویر گالری و اجزای پنجره‌ی لایت‌باکس */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lb-img');
  var lightboxCaption = document.getElementById('lb-caption');

  /* اگر همه‌ی قطعات موجود باشند و مرورگر dialog را پشتیبانی کند */
  if (galleryItems.length && lightbox && lightboxImage && lightboxCaption && typeof lightbox.showModal === 'function') {
    var activeIndex = 0; /* شماره‌ی تصویر فعلی */
    var prevButton = lightbox.querySelector('.lb-prev');
    var nextButton = lightbox.querySelector('.lb-next');
    var closeButton = lightbox.querySelector('.lb-close');

    /* نمایش تصویر با شماره‌ی مشخص */
    var showSlide = function (index) {
      var total = galleryItems.length;
      activeIndex = (index + total) % total; /* اگر از آخر رد شدیم، به اول برگرد (و برعکس) */

      var item = galleryItems[activeIndex];
      var full = item.getAttribute('data-full'); /* آدرس تصویر بزرگ */
      var caption = item.getAttribute('data-caption') || ''; /* عنوان تصویر */
      var thumbnail = item.querySelector('img');

      lightboxImage.src = full; /* تصویر بزرگ را بگذار */
      lightboxImage.alt = thumbnail ? thumbnail.alt : caption; /* متن جایگزین برای صفحه‌خوان */
      lightboxCaption.textContent = caption; /* عنوان را بنویس */
    };

    /* باز کردن لایت‌باکس روی یک تصویر */
    var openLightbox = function (index) {
      showSlide(index);
      if (!lightbox.open) {
        lightbox.showModal(); /* باز کردن پنجره‌ی dialog */
        document.body.classList.add('no-scroll'); /* صفحه پشت آن اسکرول نشود */
      }
    };

    /* کلیک روی هر تصویر گالری: لایت‌باکس باز شود */
    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    /* دکمه‌ی بستن */
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        lightbox.close();
      });
    }
    /* دکمه‌ی تصویر قبلی */
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(activeIndex - 1);
      });
    }
    /* دکمه‌ی تصویر بعدی */
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(activeIndex + 1);
      });
    }

    /* کلیدهای جهت‌دار: چپ و راست برای جابه‌جایی تصویر */
    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showSlide(activeIndex + 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(activeIndex - 1);
      }
    });

    /* کلیک روی فضای خالی بیرون تصویر: لایت‌باکس بسته شود */
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) lightbox.close();
    });

    /* بعد از بسته شدن: اسکرول صفحه آزاد شود (مگر منوی موبایل باز باشد) */
    lightbox.addEventListener('close', function () {
      if (!nav || !nav.classList.contains('is-open')) {
        document.body.classList.remove('no-scroll');
      }
    });
  }
})();
