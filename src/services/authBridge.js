// SECURITY NOTE: These functions deliberately do not pretend to register/sign in.
// Connect them to the EXISTING ConsultTime backend/auth service once its routes,
// authentication scheme, and account creation rules are known.
// Never save plaintext passwords or sensitive user records in localStorage.
export async function signInWithExistingBackend(_credentials) {
  throw new Error(
    "UI preview only: connect the login form to your existing ConsultTime authentication endpoint.",
  );
}

export async function registerWithExistingBackend(_form) {
  throw new Error(
    "UI preview only: connect registration to your existing ConsultTime backend before accepting real accounts.",
  );
}
