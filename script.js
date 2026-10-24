/* DESIGNWEB — navigation, FAQ, form validation, EmailJS sending, and UX enhancements */
"use strict";

const EMAILJS_SERVICE_ID = "service_l1mm43t";
const EMAILJS_TEMPLATE_ID = "template_rtkfnqs";
// Replace this placeholder with the Public Key shown in your EmailJS account.
const EMAILJS_PUBLIC_KEY = "UXskMLTM-md5KqIQD";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector("#main-nav");
  const navLinks = mainNav ? mainNav.querySelectorAll("a") : [];
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const toast = document.querySelector("#toast");
  const year = document.querySelector("#current-year");
  const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
  let toastTimer;

  if (year) year.textContent = String(new Date().getFullYear());

  function closeMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "باز کردن منو");
    mainNav.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  // Ensure all home/back-to-top links reliably return to the page top.
  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenu();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      if (window.location.hash && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  });

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "باز کردن منو" : "بستن منو");
      mainNav.classList.toggle("open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) closeMenu();
    });
  }

  // Clicking a service link selects that service in the contact form.
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const select = document.querySelector("#service");
      if (!select) return;
      const requested = link.getAttribute("data-service");
      const matchingOption = Array.from(select.options).find((option) => (option.dataset.fa || option.textContent).trim() === requested);
      if (matchingOption) select.value = matchingOption.value || matchingOption.textContent;
    });
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = document.documentElement.lang === "en" && typeof DESIGNWEB_TRANSLATIONS !== "undefined" ? (DESIGNWEB_TRANSLATIONS[message] || message) : message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function setFormMessage(message, type) {
    if (!formStatus) return;
    formStatus.textContent = document.documentElement.lang === "en" && typeof DESIGNWEB_TRANSLATIONS !== "undefined" ? (DESIGNWEB_TRANSLATIONS[message] || message) : message;
    formStatus.classList.remove("error", "success");
    if (type) formStatus.classList.add(type);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        setFormMessage("لطفاً فیلدهای ضروری را بررسی کنید و اطلاعات معتبر وارد کنید.", "error");
        return;
      }

      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const projectMessage = String(formData.get("message") || "").trim();

      if (name.length < 2 || projectMessage.length < 10) {
        setFormMessage("نام باید حداقل ۲ نویسه و شرح پروژه حداقل ۱۰ نویسه داشته باشد.", "error");
        return;
      }

      if (!window.emailjs) {
        setFormMessage("کتابخانه ارسال ایمیل بارگذاری نشد. اتصال اینترنت و بارگذاری صفحه را بررسی کنید.", "error");
        return;
      }

      if (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") {
        setFormMessage("برای فعال‌شدن ارسال، باید Public Key حساب EmailJS در فایل script.js وارد شود.", "error");
        return;
      }

      const time = new Date().toLocaleString("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short"
      });
      const title = `درخواست خدمات DESIGNWEB — ${service}`;
      const message = `خدمت موردنظر: ${service}\n\nشرح پروژه:\n${projectMessage}`;
      const templateParams = { name, email, time, title, message };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      setFormMessage("در حال ارسال درخواست شما…", "");

      try {
        await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
        setFormMessage("درخواست شما با موفقیت ارسال شد. از تماس شما سپاسگزاریم.", "success");
        showToast("درخواست شما برای DESIGNWEB ارسال شد.");
        contactForm.reset();
      } catch (error) {
        console.error("EmailJS send failed:", error);
        setFormMessage("ارسال انجام نشد. لطفاً اتصال سرویس EmailJS و تنظیمات قالب را بررسی کنید و دوباره تلاش کنید.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }
    });
  }

  // Update the active navigation link as the user moves through the page.
  const observedSections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window && observedSections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          // The process section is part of the About Us journey.
          const targetId = entry.target.id === "process" ? "about" : entry.target.id;
          const active = link.getAttribute("href") === `#${targetId}`;
          if (active) link.classList.add("active");
          else link.classList.remove("active");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }
});


// Persian/English language switch. Existing layout and styles are preserved.
const DESIGNWEB_TRANSLATIONS = {"رفتن به محتوای اصلی":"Skip to main content","صفحه اصلی DESIGNWEB":"DESIGNWEB home page","طراحی، فناوری، اعتماد":"Design, technology, trust","باز کردن منو":"Open menu","بستن منو":"Close menu","صفحه اصلی":"Home","خدمات ما":"Services","درباره ما":"About us","نمونه‌کارها":"Projects","سؤالات متداول":"Frequently asked questions","درخواست خدمات":"Request a service","راهکارهای دیجیتال برای کسب‌وکارهای رو به رشد":"Digital solutions for growing businesses","ایده‌تان را به یک":"Turn your idea into a","تجربه دیجیتال":"digital experience","تبدیل کنید.":".","از طراحی وب‌سایت و توسعه نرم‌افزار تا راهکارهای هوش مصنوعی و خدمات مهندسی عمران؛ برای ساختن قدم بعدی کسب‌وکارتان کنار شما هستیم.":"From website design and software development to AI solutions and civil engineering services, we help you take your business to the next step.","شروع یک گفت‌وگو":"Start a conversation","خدمات ما را ببینید":"Explore our services","شناخت دقیق نیاز":"Understand your needs","طراحی هدفمند":"purposeful design","توسعه قابل گسترش":"Scalable development","نمایی مفهومی از یک داشبورد دیجیتال":"Conceptual view of a digital dashboard","طراحی هوشمند":"Smart design","با تمرکز بر تجربه کاربر":"Focused on user experience","نمای کلی پروژه":"Project overview","سلام، خوش آمدید":"Hello, welcome","مسیر رشد شما":"Your growth journey","شاخص تجربه کاربر":"User experience score","طراحی وب":"Web design","تجربه‌ای یکپارچه":"A seamless experience","هوش مصنوعی":"AI","فرایندهای هوشمند":"Smart workflows","پیشرفت پروژه":"Project progress","ساختار قابل توسعه":"Scalable structure","آماده برای قدم‌های بعدی":"Ready for the next steps","طراحی با فکر":"Thoughtful design","توسعه با دقت":"Careful development","همکاری شفاف":"Transparent collaboration","نگاه رو به آینده":"A forward-looking approach","چه کاری انجام می‌دهیم؟":"What do we do?","چهار مسیر برای":"Four ways to","رشد شما":"help you grow","راهکارها را متناسب با نیاز واقعی پروژه انتخاب می‌کنیم؛ نه صرفاً برای پیچیده‌تر کردن کار.":"We choose solutions based on your project’s real needs—not to make things unnecessarily complicated.","طراحی وب‌سایت":"Website design","وب‌سایت شرکتی، معرفی خدمات و صفحات فرود با ظاهر حرفه‌ای، تجربه کاربری مناسب و نمایش درست در موبایل و دسکتاپ.":"Professional business websites, service pages, and landing pages with a strong user experience and responsive layouts for mobile and desktop.","طراحی واکنش‌گرا":"Responsive design","بهینه‌سازی تجربه کاربر":"User experience optimization","ساختار مناسب سئو":"SEO-friendly structure","درباره این خدمت":"About this service","برنامه‌نویسی و توسعه":"Programming & development","توسعه قابلیت‌های اختصاصی، فرم‌ها، داشبوردها و ابزارهای تحت وب با کدی خوانا و قابل نگهداری.":"Custom features, forms, dashboards, and web tools built with readable, maintainable code.","اتصال به APIها":"API integration","توسعه مرحله‌ای":"Incremental development","راهکارهای هوش مصنوعی":"AI solutions","بررسی کاربردهای عملی هوش مصنوعی برای تولید محتوا، ساده‌سازی کارهای تکراری و بهبود فرایندهای کسب‌وکار.":"Practical AI applications for content creation, automating repetitive tasks, and improving business workflows.","تحلیل نیاز و امکان‌سنجی":"Needs analysis and feasibility","طراحی گردش‌کار هوشمند":"Smart workflow design","یکپارچه‌سازی ابزارها":"Tool integration","مهندسی عمران":"Civil engineering","خدمات مهندسی عمران":"Civil engineering services","ارائه خدمات تخصصی مهندسی ساختمان و طراحی سازه، با اتکا به دانش فنی، ضوابط مربوط و بررسی دقیق پروژه.":"Specialized building engineering and structural design based on technical expertise, applicable codes, and careful project review.","طراحی سازه":"Structural design","بررسی و هماهنگی فنی":"Technical review and coordination","خدمات متناسب با محدوده پروژه":"Services tailored to project scope","محدوده، زمان و هزینه هر پروژه پس از بررسی نیازها و توافق شفاف مشخص می‌شود.":"Project scope, schedule, and cost are defined after reviewing requirements and agreeing on clear terms.","رویکرد ما":"Our approach","فناوری باید":"Technology should","یک مسئله واقعی":"solve a real","را حل کند.":"problem.","از تحلیل تا اجرا":"From analysis to delivery","درباره DESIGNWEB":"About DESIGNWEB","ترکیب نگاه فنی با":"Combining technical insight with","ما باور داریم راهکار خوب، فقط زیبا نیست؛ باید قابل استفاده، قابل نگهداری و متناسب با هدف کسب‌وکار باشد. برای همین، پیش از شروع توسعه، مسئله و نیازهای پروژه را روشن می‌کنیم.":"We believe a good solution should be more than attractive: it must be usable, maintainable, and aligned with business goals. That is why we clarify the problem and project requirements before development begins.","ارتباط شفاف":"Clear communication","مراحل، محدوده کار و انتظارات از ابتدا مشخص می‌شوند.":"Stages, scope, and expectations are clear from the start.","طراحی کاربرمحور":"User-centered design","خوانایی، دسترسی آسان و نمایش صحیح در اندازه‌های مختلف اولویت دارند.":"Readability, accessibility, and proper display across screen sizes are priorities.","توسعه‌پذیری":"Extensibility","ساختار پروژه تا جای ممکن منظم انتخاب می‌شود تا تغییرات آینده ساده‌تر باشند.":"The project is structured carefully to make future changes easier.","مراحل همکاری را ببینید":"See how we work","از گفت‌وگو تا تحویل":"From discussion to delivery","مسیر همکاری،":"Our process is","روشن و مرحله‌ای":"clear and step-by-step","با برنامه مشخص جلو می‌رویم تا در هر مرحله بدانید چه کاری انجام می‌شود و قدم بعدی چیست.":"We follow a clear plan so you know what is happening at each stage and what comes next.","شناخت نیاز":"Understand requirements","هدف، مخاطبان، امکانات لازم و محدودیت‌های پروژه را بررسی می‌کنیم.":"We review the project’s goals, audience, required features, and constraints.","طرح و توافق":"Proposal and agreement","راهکار پیشنهادی، محدوده کار، زمان‌بندی و هزینه را مشخص می‌کنیم.":"We define the proposed solution, scope, schedule, and cost.","اجرا و بازبینی":"Implementation and review","راهکار را پیاده‌سازی می‌کنیم و با بازخورد شما بهبود می‌دهیم.":"We implement the solution and improve it using your feedback.","تحویل و ادامه":"Delivery and next steps","خروجی را تحویل می‌دهیم و درباره نگهداری یا توسعه آینده تصمیم می‌گیریم.":"We deliver the work and discuss maintenance or future development.","نمونه مسیرهای کاری":"Example project directions","ایده‌هایی برای":"Ideas for your","پروژه بعدی":"next project","این کارت‌ها نمونه‌های نمایشی برای معرفی حوزه‌های کاری هستند و نمونه‌کار واقعی یا پروژه تحویل‌شده محسوب نمی‌شوند.":"These illustrative cards introduce our areas of work; they are not real portfolio pieces or completed client projects.","وب‌سایت معرفی خدمات":"Service website","گردش‌کار هوشمند":"Smart workflow","معرفی خدمات مهندسی":"Engineering services website","قبل از شروع":"Before you begin","بدانید":"What to know","اگر پاسخ سؤال شما اینجا نیست، از طریق فرم تماس با ما در میان بگذارید.":"If you don’t find your answer here, please contact us using the form.","پرسش اختصاصی دارید؟":"Have a specific question?","چه خدماتی ارائه می‌دهید؟":"What services do you offer?","خدمات ما شامل طراحی و توسعه وب‌سایت، برنامه‌نویسی، راهکارهای کاربردی هوش مصنوعی و خدمات تخصصی مهندسی عمران است. محدوده هر خدمت با توجه به نیاز و شرایط پروژه مشخص می‌شود.":"We offer website design and development, programming, practical AI solutions, and specialized civil engineering services. The scope is tailored to each project.","هزینه طراحی وب‌سایت چقدر است؟":"How much does a website cost?","هزینه به امکانات موردنیاز، پیچیدگی، محتوا و محدوده پروژه بستگی دارد. پس از بررسی درخواست شما، پیشنهاد متناسب با نیاز پروژه ارائه می‌شود.":"Cost depends on required features, complexity, content, and project scope. After reviewing your request, we will provide a suitable proposal.","طراحی وب‌سایت چقدر زمان می‌برد؟":"How long does website design take?","زمان اجرا به حجم صفحات، امکانات و آماده‌بودن محتوا بستگی دارد. پس از روشن‌شدن نیازها، زمان‌بندی واقع‌بینانه و مراحل تحویل مشخص می‌شود.":"Timing depends on the number of pages, features, and content readiness. We will agree on a realistic schedule and delivery stages after clarifying requirements.","آیا پس از تحویل وب‌سایت، پشتیبانی هم ارائه می‌دهید؟":"Do you provide support after delivery?","امکان هماهنگی برای پشتیبانی، نگهداری و توسعه‌های بعدی وجود دارد. جزئیات خدمات و هزینه پشتیبانی پیش از شروع همکاری و متناسب با پروژه مشخص می‌شود.":"Support, maintenance, and future enhancements can be arranged. Support details and costs are agreed before work begins.","چگونه می‌توانم سفارش خود را ثبت کنم؟":"How can I submit a request?","در بخش «درخواست خدمات»، نام و ایمیل خود را وارد کنید، خدمت موردنظر را انتخاب کنید و توضیح کوتاهی از پروژه بنویسید. با ارسال فرم، درخواست شما برای بررسی به ایمیل DESIGNWEB فرستاده می‌شود.":"In the “Request a service” section, enter your name and email, choose a service, and briefly describe your project. Your request will be emailed to DESIGNWEB for review.","بیایید درباره ایده شما صحبت کنیم":"Let’s talk about your idea","قدم اول، یک":"The first step is a","گفت‌وگوی ساده":"simple conversation","است.":".","چند خط درباره هدف پروژه بنویسید. بعد از بررسی نیازها می‌توانیم درباره مسیر مناسب همکاری صحبت کنیم.":"Tell us a little about your project goals. After reviewing your needs, we can discuss the right way to work together.","بدون پیشنهادهای مبهم":"No vague proposals","هدف، محدوده کار و قدم بعدی را روشن می‌کنیم.":"We clarify the goal, scope, and next step.","مهندسی":"Engineering","درباره پروژه‌تان بگویید":"Tell us about your project","فیلدهای ستاره‌دار ضروری هستند.":"Fields marked with an asterisk are required.","نام شما":"Your name","مثلاً حامد":"e.g. Alex","ایمیل":"Email","خدمت موردنظر":"Service needed","یک گزینه انتخاب کنید":"Select an option","ترکیبی یا هنوز مطمئن نیستم":"Combination / Not sure yet","شرح کوتاه پروژه":"Brief project description","چه هدفی دارید و چه امکاناتی لازم است؟":"What is your goal, and what features do you need?","ارسال درخواست":"Submit request","فرم از طریق سرویس ایمیل ارسال می‌شود؛ لطفاً اطلاعات را با دقت وارد کنید.":"The form is sent using an email service. Please check your details carefully.","اطلاعات فرم برای پاسخ‌گویی به درخواست شما از طریق EmailJS ارسال می‌شود.":"Your form information is sent via EmailJS so we can respond to your request.","تلفن:":"Phone:","تلگرام:":"Telegram:","راهکارهای دیجیتال و مهندسی، با نگاه دقیق و آینده‌نگر.":"Digital and engineering solutions with a thoughtful, forward-looking approach.","بازگشت به بالا":"Back to top","بازگشت به بالا ↑":"Back to Top ↑","©":"©","تمامی حقوق محفوظ است.":"All rights reserved.","DESIGNWEB. تمامی حقوق محفوظ است.":"DESIGNWEB. All rights reserved.","ساخته‌شده برای رشد ایده‌ها":"Built to help ideas grow","درخواست خدمات DESIGNWEB":"DESIGNWEB service request","خدمت موردنظر:":"Requested service:","شرح پروژه:":"Project description:","لطفاً فیلدهای ضروری را بررسی کنید و اطلاعات معتبر وارد کنید.":"Please check the required fields and enter valid information.","نام باید حداقل ۲ نویسه و شرح پروژه حداقل ۱۰ نویسه داشته باشد.":"Name must be at least 2 characters and the project description at least 10 characters.","کتابخانه ارسال ایمیل بارگذاری نشد. اتصال اینترنت و بارگذاری صفحه را بررسی کنید.":"The email library could not be loaded. Check your internet connection and reload the page.","برای فعال‌شدن ارسال، باید Public Key حساب EmailJS در فایل script.js وارد شود.":"To enable sending, enter your EmailJS Public Key in script.js.","در حال ارسال درخواست شما…":"Sending your request…","درخواست شما با موفقیت ارسال شد. از تماس شما سپاسگزاریم.":"Your request was sent successfully. Thank you for contacting us.","درخواست شما برای DESIGNWEB ارسال شد.":"Your request has been sent to DESIGNWEB.","ارسال انجام نشد. لطفاً اتصال سرویس EmailJS و تنظیمات قالب را بررسی کنید و دوباره تلاش کنید.":"Sending failed. Please check your EmailJS connection and template settings, then try again."};

function initDesignwebLanguageSwitch() {
  const root = document.documentElement;
  const toggle = document.getElementById("language-toggle");
  if (!toggle) return;
  const originalText = new WeakMap();
  const translatableAttrs = ["placeholder", "aria-label", "title"];
  const attrOriginal = new WeakMap();

  function applyLanguage(language) {
    const english = language === "en";
    root.lang = english ? "en" : "fa";
    root.dir = english ? "ltr" : "rtl";
    document.body.classList.toggle("language-en", english);
    document.body.classList.toggle("language-fa", !english);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue);
      const original = originalText.get(node);
      const trimmed = original.trim();
      if (!trimmed) return;
      const translated = DESIGNWEB_TRANSLATIONS[trimmed];
      if (english) {
        const englishText = translated ? original.replace(trimmed, translated) : original;
        // Use Latin digits throughout English mode (including hero metrics, cards, and process steps).
        node.nodeValue = englishText.replace(/[۰-۹٠-٩]/g, (digit) => {
          const code = digit.charCodeAt(0);
          return String(code >= 0x06F0 && code <= 0x06F9 ? code - 0x06F0 : code - 0x0660);
        });
      } else {
        node.nodeValue = original;
      }
    });

    document.querySelectorAll("input, textarea, select, button, a, [aria-label], [title]").forEach((el) => {
      translatableAttrs.forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        let saved = attrOriginal.get(el);
        if (!saved) { saved = {}; attrOriginal.set(el, saved); }
        if (!(attr in saved)) saved[attr] = el.getAttribute(attr);
        const original = saved[attr];
        if (english && DESIGNWEB_TRANSLATIONS[original]) el.setAttribute(attr, DESIGNWEB_TRANSLATIONS[original]);
        else if (!english) el.setAttribute(attr, original);
      });
    });

    // Keep contact details legible and correctly ordered in either direction.
    document.querySelectorAll(".contact-value").forEach((el) => {
      el.dir = "ltr";
      el.lang = "en";
    });
    const serviceSelect = document.getElementById("service");
    if (serviceSelect) {
      Array.from(serviceSelect.options).forEach((option) => {
        if (!option.dataset.fa) option.dataset.fa = option.textContent;
        const translated = DESIGNWEB_TRANSLATIONS[option.dataset.fa.trim()];
        option.textContent = english && translated ? translated : option.dataset.fa;
      });
    }
    toggle.textContent = english ? "فارسی" : "EN";
    toggle.lang = english ? "fa" : "en";
    toggle.setAttribute("aria-label", english ? "تغییر زبان سایت به فارسی" : "Switch website language to English");
    try { localStorage.setItem("designweb-language", language); } catch (_) {}
    document.title = english ? "DESIGNWEB | From Idea to Digital Solution" : "DESIGNWEB | از ایده تا راهکار دیجیتال";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = english
      ? "DESIGNWEB: website design and development, programming, AI solutions, and civil engineering services."
      : "DESIGNWEB؛ طراحی و توسعه وب‌سایت، برنامه‌نویسی، راهکارهای هوش مصنوعی و خدمات مهندسی عمران.";
  }

  toggle.addEventListener("click", () => applyLanguage(root.lang === "fa" ? "en" : "fa"));
  let initial = "fa";
  try { if (localStorage.getItem("designweb-language") === "en") initial = "en"; } catch (_) {}
  applyLanguage(initial);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDesignwebLanguageSwitch);
else initDesignwebLanguageSwitch();
