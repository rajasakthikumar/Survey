const formatResponse = (data, message = '') => {
  return {
    success: true,
    message,
    data
  };
};

module.exports = formatResponse;
  