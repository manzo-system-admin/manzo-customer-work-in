(function () {
  "use strict";

  var form = document.getElementById("surveyForm");
  var formBody = document.getElementById("formBody");
  var spidWarning = document.getElementById("spidWarning");
  var followupSection = document.getElementById("followupSection");
  var commentField = document.getElementById("comment");
  var phoneField = document.getElementById("phone_number");
  var reactionFace = document.getElementById("reactionFace");
  var reactionText = document.getElementById("reactionText");
  var submitBtn = document.getElementById("submitBtn");
  var formError = document.getElementById("formError");
  var thankyouView = document.getElementById("thankyouView");
  var langButtons = document.querySelectorAll(".lang-toggle__btn");

  var STRINGS = {
    th: {
      pageTitle: "แบบสอบถามความพึงพอใจ",
      title: "คุณพึงพอใจกับบริการ<br>ของเรามากแค่ไหน?",
      assurance1: "ใช้เวลาไม่เกิน <strong>30 วินาที</strong>",
      assurance2: "ข้อมูลของคุณ <strong>เก็บเป็นความลับ</strong>",
      spidWarning:
        "ไม่พบข้อมูลจุดบริการ กรุณาสแกน QR Code ที่จุดบริการอีกครั้ง",
      moodDefault: "เลื่อนดาวเพื่อให้คะแนน",
      reactionBad: "แย่",
      reactionPoor: "ไม่พอใจ",
      reactionFair: "พอใช้",
      reactionGood: "พอใจ",
      reactionExcellent: "ประทับใจมาก",
      ratingSpeed: "ความรวดเร็วในการให้บริการ",
      ratingStaff: "ความสุภาพของพนักงาน",
      ratingCleanliness: "ความสะอาดของสถานที่",
      ratingOverall: "ความพึงพอใจโดยรวม",
      notRated: "ยังไม่ให้คะแนน",
      ratedAriaSuffix: " จาก 5 ดาว",
      followupTitle: "ต้องขออภัยในความไม่สะดวก",
      followupDesc:
        "ช่วยเล่าให้เราฟังเพิ่มเติมได้ไหม เพื่อให้เราปรับปรุงบริการให้ดีขึ้น",
      commentLabel: "รายละเอียดเพิ่มเติม",
      commentPlaceholder:
        "ช่วยเล่าให้เราฟังเพิ่มเติมได้ไหม เพื่อให้เราปรับปรุงบริการให้ดีขึ้น",
      phoneLabel: "เบอร์ติดต่อกลับ",
      phonePlaceholder: "08X-XXX-XXXX",
      errorAllRequired: "กรุณาให้คะแนนครบทุกหัวข้อ",
      errorFollowupRequired: "กรุณากรอกรายละเอียดและเบอร์ติดต่อกลับ",
      errorSubmitFailed: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      submit: "ส่งแบบประเมิน",
      thankyou: "ได้รับคำตอบของคุณแล้ว <br>ขอบคุณที่สละเวลา",
    },
    en: {
      pageTitle: "Customer Satisfaction Survey",
      title: "How satisfied are you<br>with our service?",
      assurance1: "Takes less than <strong>30 seconds</strong>",
      assurance2: "Your information is <strong>kept confidential</strong>",
      spidWarning: "Service point not found. Please scan the QR code again.",
      moodDefault: "Slide the stars to rate",
      reactionBad: "Poor",
      reactionPoor: "Unsatisfied",
      reactionFair: "Fair",
      reactionGood: "Satisfied",
      reactionExcellent: "Excellent",
      ratingSpeed: "Speed of service",
      ratingStaff: "Staff courtesy",
      ratingCleanliness: "Cleanliness",
      ratingOverall: "Overall satisfaction",
      notRated: "Not rated yet",
      ratedAriaSuffix: " out of 5 stars",
      followupTitle: "We're sorry for the inconvenience",
      followupDesc: "Please tell us more so we can improve our service",
      commentLabel: "Additional details",
      commentPlaceholder: "Please tell us more so we can improve our service",
      phoneLabel: "Contact phone number",
      phonePlaceholder: "08X-XXX-XXXX",
      errorAllRequired: "Please rate all questions",
      errorFollowupRequired: "Please fill in the details and contact number",
      errorSubmitFailed: "Something went wrong. Please try again.",
      submit: "Submit",
      thankyou: "Your response has been received <br>Thank you for your time",
    },
  };

  var storedLang = null;
  try {
    storedLang = localStorage.getItem("surveyLang");
  } catch (e) {}
  var currentLang = storedLang === "en" ? "en" : "th";

  function t(key) {
    return STRINGS[currentLang][key];
  }

  var RATING_NAMES = [
    "speed_rating",
    "staff_rating",
    "cleanliness_rating",
    "overall_rating",
  ];
  var RATING_LABEL_KEYS = {
    speed_rating: "ratingSpeed",
    staff_rating: "ratingStaff",
    cleanliness_rating: "ratingCleanliness",
    overall_rating: "ratingOverall",
  };
  var sliders = {};

  RATING_NAMES.forEach(function (name) {
    var input = form.querySelector('.star-slider__input[name="' + name + '"]');
    sliders[name] = {
      input: input,
      stars: input.closest(".star-slider").querySelectorAll(".star"),
      valueLabel: input
        .closest(".star-slider")
        .querySelector(".star-slider__value"),
    };
  });

  function getRatingValue(name) {
    return Number(sliders[name].input.value);
  }

  function getAllValues() {
    return RATING_NAMES.map(getRatingValue);
  }

  function renderSlider(name) {
    var slider = sliders[name];
    var value = getRatingValue(name);

    slider.stars.forEach(function (star, index) {
      star.classList.toggle("is-filled", index < value);
    });

    slider.input.style.setProperty("--fill", (value / 5) * 100 + "%");

    if (value === 0) {
      slider.valueLabel.textContent = t("notRated");
      slider.input.setAttribute("aria-valuetext", t("notRated"));
    } else {
      slider.valueLabel.textContent = value + "/5";
      slider.input.setAttribute("aria-valuetext", value + t("ratedAriaSuffix"));
    }
  }

  function reactionForAverage(avg) {
    if (avg < 2) return { emoji: "😞", key: "reactionBad" };
    if (avg < 3) return { emoji: "🙁", key: "reactionPoor" };
    if (avg < 4) return { emoji: "😐", key: "reactionFair" };
    if (avg < 5) return { emoji: "🙂", key: "reactionGood" };
    return { emoji: "🤩", key: "reactionExcellent" };
  }

  function updateMoodSummary() {
    var ratedValues = getAllValues().filter(function (v) {
      return v > 0;
    });

    if (ratedValues.length === 0) {
      reactionFace.textContent = "🤔";
      reactionText.textContent = t("moodDefault");
    } else {
      var avg =
        ratedValues.reduce(function (sum, v) {
          return sum + v;
        }, 0) / ratedValues.length;
      var reaction = reactionForAverage(avg);
      reactionFace.textContent = reaction.emoji;
      reactionText.textContent = t(reaction.key);
    }

    reactionFace.classList.remove("bump");
    void reactionFace.offsetWidth;
    reactionFace.classList.add("bump");
  }

  function updateFollowup() {
    var needsFollowup = getAllValues().some(function (v) {
      return v > 0 && v <= 2;
    });

    followupSection.hidden = false;
    requestAnimationFrame(function () {
      followupSection.classList.toggle("open", needsFollowup);
    });

    commentField.required = needsFollowup;
    phoneField.required = needsFollowup;

    if (!needsFollowup) {
      followupSection.addEventListener("transitionend", function hide() {
        if (!followupSection.classList.contains("open")) {
          followupSection.hidden = true;
        }
        followupSection.removeEventListener("transitionend", hide);
      });
    }
  }

  function applyStaticText() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute(
        "placeholder",
        t(el.getAttribute("data-i18n-placeholder")),
      );
    });

    document.title = t("pageTitle");
    document.documentElement.lang = currentLang;

    RATING_NAMES.forEach(function (name) {
      sliders[name].input.setAttribute(
        "aria-label",
        t(RATING_LABEL_KEYS[name]),
      );
    });
  }

  function setLanguage(lang) {
    currentLang = lang;
    try {
      localStorage.setItem("surveyLang", lang);
    } catch (e) {}

    applyStaticText();
    RATING_NAMES.forEach(renderSlider);
    updateMoodSummary();

    langButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLanguage(btn.getAttribute("data-lang"));
    });
  });

  RATING_NAMES.forEach(function (name) {
    sliders[name].input.addEventListener("input", function () {
      renderSlider(name);
      updateMoodSummary();
      updateFollowup();
      clearError();
    });
  });

  var servicePointId = new URLSearchParams(window.location.search).get(
    "service_point_id",
  );

  if (!servicePointId) {
    spidWarning.hidden = false;
    submitBtn.disabled = true;
  }

  function showError(message) {
    formError.textContent = message;
    formError.hidden = false;
  }

  function clearError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  function setLoading(isLoading) {
    submitBtn.classList.toggle("loading", isLoading);
    submitBtn.disabled = isLoading;
  }

  function showThankYou() {
    formBody.parentElement.hidden = true;
    thankyouView.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    if (!servicePointId) {
      showError(t("spidWarning"));
      return;
    }

    var firstUnrated = RATING_NAMES.find(function (name) {
      return getRatingValue(name) === 0;
    });

    if (firstUnrated) {
      showError(t("errorAllRequired"));
      var el = sliders[firstUnrated].input;
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    var overallRating = getRatingValue("overall_rating");
    var speedRating = getRatingValue("speed_rating");
    var staffRating = getRatingValue("staff_rating");
    var cleanlinessRating = getRatingValue("cleanliness_rating");

    var payload = {
      service_point_id: Number(servicePointId),
      overall_rating: overallRating,
      speed_rating: speedRating,
      staff_rating: staffRating,
      cleanliness_rating: cleanlinessRating,
    };

    var needsFollowup = [
      overallRating,
      speedRating,
      staffRating,
      cleanlinessRating,
    ].some(function (v) {
      return v <= 2;
    });

    if (needsFollowup) {
      var comment = commentField.value.trim();
      var phone = phoneField.value.trim();

      if (!comment || !phone) {
        showError(t("errorFollowupRequired"));
        return;
      }

      payload.comment = comment;
      payload.phone_number = phone;
    } else {
      if (commentField.value.trim())
        payload.comment = commentField.value.trim();
      if (phoneField.value.trim())
        payload.phone_number = phoneField.value.trim();
    }

    setLoading(true);

    fetch(
      "https://manzo-backend-prod-614613248623.asia-southeast1.run.app/v1/survey/submit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )
      .then(function (res) {
        if (!res.ok) throw new Error("submit_failed");
        return showThankYou();
      })
      .catch(function () {
        showError(t("errorSubmitFailed"));
      })
      .finally(function () {
        setLoading(false);
      });
  });

  setLanguage(currentLang);
})();
