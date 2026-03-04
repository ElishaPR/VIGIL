export const validateDisplayName = (name) => {
  if (!name || name.trim().length === 0) {
    return "Display name is required.";
  }

  const trimmed = name.trim();

  if (trimmed.length > 50) {
    return "Name is too long. Maximum allowed length is 50 characters.";
  }

  // Allow Unicode letters, spaces, apostrophe, hyphen, period
  const validPattern = /^[\p{L}\s'\-.]+$/u;
  if (!validPattern.test(trimmed)) {
    return "Name can contain only letters, spaces, hyphens, apostrophes, and periods.";
  }

  return "";
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password is too short. Please enter at least 8 characters.";
  }

  if (password.length > 64) {
    return "Password is too long. Maximum allowed length is 64 characters.";
  }

  return "";
};

export const validateEmail = (email) => {
  if (!email) {
    return "Email address is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address.";
  }

  return "";
};

export const validateVerificationCode = (code) => {
  if (!code) {
    return "Verification code is required.";
  }

  if (code.length !== 6) {
    return "Verification code must be 6 digits.";
  }

  if (!/^\d{6}$/.test(code)) {
    return "Verification code must contain only numbers.";
  }

  return "";
};
