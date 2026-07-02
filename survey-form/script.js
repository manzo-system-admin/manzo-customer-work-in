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

  var REACTIONS = {
    1: { emoji: "😞", text: "แย่มาก ขออภัยในความไม่สะดวก" },
    2: { emoji: "🙁", text: "ยังไม่ประทับใจ" },
    3: { emoji: "😐", text: "พอใช้ได้" },
    4: { emoji: "🙂", text: "พอใจ" },
    5: { emoji: "🤩", text: "ประทับใจมาก!" }
  };

  var servicePointId = new URLSearchParams(window.location.search).get("service_point_id");

  if (!servicePointId) {
    spidWarning.hidden = false;
    submitBtn.disabled = true;
  }

  // Overall rating -> reaction face + conditional follow-up fields
  var overallInputs = form.querySelectorAll('input[name="overall_rating"]');
  overallInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      var value = Number(input.value);
      var reaction = REACTIONS[value];

      reactionFace.textContent = reaction.emoji;
      reactionText.textContent = reaction.text;
      reactionFace.classList.remove("bump");
      // force reflow so the animation can re-trigger on repeated selections
      void reactionFace.offsetWidth;
      reactionFace.classList.add("bump");

      var needsFollowup = value <= 2;
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

      clearError();
    });
  });

  function getRatingValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? Number(checked.value) : null;
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
      showError("ไม่พบข้อมูลจุดบริการ กรุณาสแกน QR Code อีกครั้ง");
      return;
    }

    var overallRating = getRatingValue("overall_rating");
    var speedRating = getRatingValue("speed_rating");
    var staffRating = getRatingValue("staff_rating");
    var cleanlinessRating = getRatingValue("cleanliness_rating");

    if (!overallRating || !speedRating || !staffRating || !cleanlinessRating) {
      showError("กรุณาให้คะแนนครบทุกหัวข้อ");
      return;
    }

    var payload = {
      service_point_id: Number(servicePointId),
      overall_rating: overallRating,
      speed_rating: speedRating,
      staff_rating: staffRating,
      cleanliness_rating: cleanlinessRating
    };

    if (overallRating <= 2) {
      var comment = commentField.value.trim();
      var phone = phoneField.value.trim();

      if (!comment || !phone) {
        showError("กรุณากรอกรายละเอียดและเบอร์ติดต่อกลับ");
        return;
      }

      payload.comment = comment;
      payload.phone_number = phone;
    } else {
      if (commentField.value.trim()) payload.comment = commentField.value.trim();
      if (phoneField.value.trim()) payload.phone_number = phoneField.value.trim();
    }

    setLoading(true);

    fetch("https://manzo-backend-dev-614613248623.asia-southeast1.run.app/v1/survey/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("submit_failed");
        return showThankYou();
      })
      .catch(function () {
        showError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
