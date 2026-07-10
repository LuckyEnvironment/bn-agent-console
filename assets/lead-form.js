// BN Agent — shared lead-form handler. Wires every form.lead-form on the page
// to the Supabase `leads` table (insert-only via RLS). The form's data-source
// attribute is stored so leads can be segmented by page.
(function () {
  var SUPABASE_URL = "https://txozgrstheetzxeglicu.supabase.co";
  var SUPABASE_KEY = "sb_publishable_8osrkCDZb3WoM6ICizvz0A_sv0glU_E";
  var OK_MESSAGE = "Bedankt voor uw aanvraag. We nemen binnen twee werkdagen contact op.";
  var ERR_MESSAGE = "Versturen is niet gelukt. Probeer het opnieuw of mail ons direct via info@bn-agent.com.";

  document.querySelectorAll("form.lead-form").forEach(function (form) {
    var statusBox = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    function setStatus(kind, message) {
      statusBox.className = "form-status" + (kind ? " " + kind : "");
      statusBox.textContent = message;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Honeypot: silently drop bot submissions.
      if (form.website && form.website.value.trim() !== "") {
        setStatus("ok", OK_MESSAGE);
        form.reset();
        return;
      }

      if (!form.reportValidity()) return;

      var payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        organization: form.organization.value.trim() || null,
        sector: form.sector.value,
        message: form.message.value.trim() || null,
        source: form.dataset.source || "onbekend"
      };

      submitBtn.disabled = true;
      setStatus("", "");

      try {
        var res = await fetch(SUPABASE_URL + "/rest/v1/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        setStatus("ok", OK_MESSAGE);
        form.reset();
      } catch (err) {
        setStatus("err", ERR_MESSAGE);
      } finally {
        submitBtn.disabled = false;
      }
    });
  });
})();
