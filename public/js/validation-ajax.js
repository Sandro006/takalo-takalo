document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#registerForm");
  const loginForm = document.querySelector("#loginForm");

  if (registerForm) {
    initForm(registerForm, {
      map: {
        nom: { input: "#nom", err: "#nomError" },
        prenom: { input: "#prenom", err: "#prenomError" },
        email: { input: "#email", err: "#emailError" },
        password: { input: "#password", err: "#passwordError" },
        confirm_password: { input: "#confirm_password", err: "#confirmPasswordError" },
        telephone: { input: "#telephone", err: "#telephoneError" },
      },
      apiUrl: "/api/validate/register"
    });
  }

  if (loginForm) {
    initForm(loginForm, {
      map: {
        email: { input: "#email", err: "#emailError" },
        password: { input: "#password", err: "#passwordError" },
      },
      apiUrl: "/api/validate/login"
    });
  }

  function initForm(form, config) {
    const statusBox = form.querySelector("#formStatus");
    const map = config.map;
    const apiUrl = config.apiUrl;

    function setStatus(type, msg) {
      if (!statusBox) return;
      if (!msg) {
        statusBox.className = "alert d-none";
        statusBox.textContent = "";
        return;
      }
      statusBox.className = `alert alert-${type}`;
      statusBox.textContent = msg;
    }

    function clearFeedback() {
      Object.keys(map).forEach((k) => {
        const input = form.querySelector(map[k].input);
        const err = form.querySelector(map[k].err);
        input.classList.remove("is-invalid", "is-valid");
        if (err) err.textContent = "";
      });
      setStatus(null, "");
    }

    function applyServerResult(data) {
      if (data.values && data.values.telephone && form.id === "registerForm") {
        form.querySelector("#telephone").value = data.values.telephone;
      }

      Object.keys(map).forEach((k) => {
        const input = form.querySelector(map[k].input);
        const err = form.querySelector(map[k].err);
        const msg = (data.errors && data.errors[k]) ? data.errors[k] : "";

        if (msg) {
          input.classList.add("is-invalid");
          input.classList.remove("is-valid");
          if (err) err.textContent = msg;
        } else {
          input.classList.remove("is-invalid");
          input.classList.add("is-valid");
          if (err) err.textContent = "";
        }
      });

      if (data.errors && data.errors._global) {
        setStatus("warning", data.errors._global);
      }
    }

    async function callValidate() {
      const fd = new FormData(form);
      const res = await fetch(apiUrl, {
        method: "POST",
        body: fd,
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (!res.ok) throw new Error("Erreur serveur lors de la validation.");
      return res.json();
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFeedback();

      try {
        const data = await callValidate();
        applyServerResult(data);

        if (data.ok) {
          setStatus("success", "Validation OK ✅");
          form.submit();
        } else {
          setStatus("danger", "Veuillez corriger les erreurs.");
        }
      } catch (err) {
        setStatus("warning", err.message || "Une erreur est survenue.");
      }
    });

    Object.keys(map).forEach((k) => {
      form.querySelector(map[k].input).addEventListener("blur", async () => {
        try {
          const data = await callValidate();
          applyServerResult(data);
        } catch (_) {}
      });
    });
  }
});
