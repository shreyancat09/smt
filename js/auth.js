// Enrolled student roster: Name/Roll identifier paired with PIN
const ENROLLED_STUDENTS = {
  "adrita": { name: "Adrita", pin: "1001", batch: "Class 10 A" },
  "surottam": { name: "Surottam", pin: "1002", batch: "Class 10 A" },
  "abhiraj": { name: "Abhiraj", pin: "1003", batch: "Class 10 B" },
  "arkadeep": { name: "Arkadeep", pin: "1004", batch: "Class 10 B" },
  "rishita": { name: "Rishita", pin: "1005", batch: "Class 10 A" },
  "admin": { name: "Instructor", pin: "9988", batch: "Faculty" }
};

// Retrieve active session from localStorage
function getActiveSession() {
  const session = localStorage.getItem("tuition_session");
  return session ? JSON.parse(session) : null;
}

// Route Guard: Redirect unauthorized users back to login
function enforceAuthGuard() {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith("index.html") || path.endsWith("/") || path === "";
  const session = getActiveSession();

  if (!session && !isLoginPage) {
    window.location.replace("index.html");
  } else if (session && isLoginPage) {
    window.location.replace("home.html");
  }
}

// Bind student metadata to page badges
function populateUserUI() {
  const session = getActiveSession();
  if (!session) return;

  const displayTags = document.querySelectorAll("#studentDisplay, #securityStudentTag");
  displayTags.forEach(el => el.textContent = session.name);

  const greeting = document.getElementById("welcomeGreeting");
  if (greeting) {
    greeting.textContent = `Welcome back, ${session.name}!`;
  }
}

// Event bindings
document.addEventListener("DOMContentLoaded", () => {
  enforceAuthGuard();
  populateUserUI();

  // Handle Login submission
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("studentName").value.trim().toLowerCase();
      const passInput = document.getElementById("studentPass").value.trim();
      const errorBox = document.getElementById("authError");

      const student = ENROLLED_STUDENTS[nameInput];

      if (student && student.pin === passInput) {
        localStorage.setItem("tuition_session", JSON.stringify({
          name: student.name,
          batch: student.batch,
          loginTime: new Date().toISOString()
        }));
        window.location.href = "home.html";
      } else {
        errorBox.textContent = "Invalid name or access key. Contact the tuition instructor.";
        errorBox.style.display = "block";
      }
    });
  }

  // Handle Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("tuition_session");
      window.location.href = "index.html";
    });
  }
});
