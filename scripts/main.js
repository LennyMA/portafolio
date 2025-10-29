// ====================================
// VARIABLES DEL FORMULARIO
// ====================================
const contactForm = document.getElementById("contact-form");
const messageTextArea = document.getElementById("message");
const charCountElement = document.querySelector(".char-count");

// ====================================
// NAVEGACION MOVIL
// ====================================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-link");


// ====================================
// PROTECCION ANTI-SPAM
// ====================================
let lastSubmitTime = 0;
const MIN_TIME_BETWEEN_SUBMITS = 10000;

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ====================================
// CONTADOR DE CARACTERES
// ====================================
const MIN_CHARS = 20;
const OPTIMAL_CHARS = 50;
const MAX_CHARS = 500;

function updateCharCount() {
  const currentLength = messageTextArea.value.length;
  charCountElement.textContent = `${currentLength}/${MAX_CHARS}`;

  charCountElement.classList.remove(
    "char-count-low",
    "char-count-optimal",
    "char-count-danger"
  );
  messageTextArea.classList.remove(
    "textarea-low",
    "textarea-optimal",
    "textarea-danger"
  );

  if (currentLength < MIN_CHARS) {
    charCountElement.classList.add("char-count-low");
    messageTextArea.classList.add("textarea-low");
  } else if (
    currentLength >= OPTIMAL_CHARS &&
    currentLength <= MAX_CHARS - 50
  ) {
    charCountElement.classList.add("char-count-optimal");
    messageTextArea.classList.add("textarea-optimal");
  } else if (currentLength > MAX_CHARS - 50) {
    charCountElement.classList.add("char-count-danger");
    messageTextArea.classList.add("textarea-danger");
  }

  if (currentLength > MAX_CHARS) {
    messageTextArea.value = messageTextArea.value.substring(0, MAX_CHARS);
    charCountElement.textContent = `${MAX_CHARS}/${MAX_CHARS}`;
    charCountElement.classList.add("char-count-limit");

    if (!messageTextArea.classList.contains("limit-notified")) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "warning",
        title: "Has alcanzado el límite máximo de caracteres.",
      });
      messageTextArea.classList.add("limit-notified");

      setTimeout(() => {
        messageTextArea.classList.remove("limit-notified");
      }, 3000);
    }
  }
}

if (messageTextArea && charCountElement) {
  messageTextArea.addEventListener("input", updateCharCount);
  updateCharCount();
}

// ====================================
// FORMULARIO DE CONTACTO CON EMAILJS
// ====================================

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const now = Date.now();
  if (now - lastSubmitTime < MIN_TIME_BETWEEN_SUBMITS) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: "warning",
      title: "Por favor, espera unos segundos antes de enviar otro mensaje.",
    });
    return;
  }

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  const honeypot = document.getElementById("honeypot").value;

  // Validar longitud del mensaje
  if (message.trim().length < MIN_CHARS) {
    Swal.fire({
      icon: "error",
      title: "Mensaje muy corto",
      text: `El mensaje debe tener al menos ${MIN_CHARS} caracteres. Actualmente tiene ${
        message.trim().length
      }.`,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    messageTextArea.focus();
    messageTextArea.classList.add("textarea-error");
    setTimeout(() => {
      messageTextArea.classList.remove("textarea-error");
    }, 2000);
    return;
  }

  if (honeypot !== "") {
    console.log("🤖 Bot detectado y bloqueado");
    return;
  }

  if (!isValidEmail(email)) {
    Swal.fire({
      icon: "error",
      title: "Email inválido",
      text: "Por favor, ingresa un email válido.",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    return;
  }

  if (name.trim() === "" || message.trim() === "") {
    Swal.fire({
      icon: "error",
      title: "Campos incompletos",
      text: "Por favor, completa todos los campos.",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    return;
  }

  lastSubmitTime = now;

  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  submitBtn.disabled = true;

  if (typeof grecaptcha === "undefined") {
    Swal.fire({
      icon: "error",
      title: "Error de reCAPTCHA",
      text: "No se pudo cargar reCAPTCHA. Por favor, recarga la página e intenta nuevamente.",
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    return;
  }

  grecaptcha.ready(function () {
    grecaptcha
      .execute("6LdPgPorAAAAAE9WQjx4qnCFs7yeEd3Ga7bAaPu2", { action: "submit" })
      .then(function (token) {
        return emailjs
          .send("service_nu8n2g9", "template_3pitei5", {
            from_name: name,
            from_email: email,
            message: message,
            to_name: "Lenin Moreno",
            "g-recaptcha-response": token,
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "¡Mensaje enviado!",
              text: "Te contactaré pronto",
              timer: 4000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            contactForm.reset();
            updateCharCount();
          })
          .catch((error) => {
            console.error("Error:", error);
            Swal.fire({
              icon: "error",
              title: "Error al enviar",
              text: "Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.",
              timer: 5000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          })
          .finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
          });
      });
  });
});
