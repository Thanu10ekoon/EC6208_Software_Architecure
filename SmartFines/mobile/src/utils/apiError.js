export function extractApiError(err) {
  if (!err?.response) {
    return 'Cannot reach server. Check the IP in config.js and ensure the backend is running.';
  }
  return err.response.data?.message ?? 'Something went wrong. Please try again.';
}
