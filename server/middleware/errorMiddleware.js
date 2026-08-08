export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected enterprise error occurred.';

  // Handle MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    if (field === 'employeeId') {
      message = `Employee ID '${value}' is already taken. An available ID has been assigned automatically. Please try submitting again.`;
    } else if (field === 'email') {
      message = `An account with Email '${value}' already exists. Please use a different email address.`;
    } else {
      message = `Duplicate value '${value}' for ${field}. Please use a unique value.`;
    }
  }

  console.error('[API ERROR]', err);

  res.status(statusCode).json({
    status: err.status || 'error',
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
