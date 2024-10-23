const validators = {
    isValidEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  
    isValidPassword: (password) => {
      // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      return passwordRegex.test(password);
    },
  
    isValidMongoId: (id) => {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      return objectIdRegex.test(id);
    },
  
    sanitizeString: (str) => {
      return str.trim().replace(/[<>]/g, '');
    }
  };
  
  module.exports = validators;