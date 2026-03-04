export const validateDisplayName = (name) => {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("Name is required.");
    return errors;
  }

  if (name.length > 50) {
    errors.push("Name is too long. Maximum allowed length is 50 characters.");
  }

  const validPattern = /^[A-Za-z\s'\-.]*$/;
  if (!validPattern.test(name)) {
    errors.push("Name can contain only letters, spaces, hyphens, apostrophes, and periods.");
  }

  return errors;
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required.");
    return errors;
  }

  if (password.length < 8) {
    errors.push("Password is too short. Please enter at least 8 characters.");
  }

  if (password.length > 64) {
    errors.push("Password is too long. Maximum allowed length is 64 characters.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit.");
  }

  return errors;
};

export const validateEmail = (email) => {
  const errors = [];

  if (!email) {
    errors.push("Email is required.");
    return errors;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errors.push("Please enter a valid email address.");
  }

  return errors;
};

export const validateVerificationCode = (code) => {
  const errors = [];

  if (!code) {
    errors.push("Verification code is required.");
    return errors;
  }

  if (code.length !== 6) {
    errors.push("Verification code must be 6 digits.");
  }

  if (!/^\d{6}$/.test(code)) {
    errors.push("Verification code must contain only numbers.");
  }

  return errors;
};

export const validateConsents = (isIndiaResident, termsAccepted, privacyAccepted) => {
  const errors = {};

  if (!isIndiaResident) {
    errors.isIndiaResident = "You must confirm that you are currently residing in India to use this service.";
  }

  if (!termsAccepted) {
    errors.termsAccepted = "You must accept the Terms of Service to continue.";
  }

  if (!privacyAccepted) {
    errors.privacyAccepted = "You must accept the Privacy Policy to continue.";
  }

  return errors;
};
