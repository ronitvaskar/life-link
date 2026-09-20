export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again."
) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.errors?.length) {
    return error.response.data.errors
      .map((item) => item.msg)
      .join(", ");
  }

  if (error.message === "Network Error") {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  return fallbackMessage;
};