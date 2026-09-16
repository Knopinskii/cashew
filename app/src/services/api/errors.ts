import axios from "axios";

/** Turns whatever went wrong into something a person can act on.
 *
 *  Every failure used to surface as "Something went wrong. Please try again.",
 *  which is true of a dead server, an expired token and a rejected field alike
 *  — and useless in all three cases. DRF already explains itself; this reads
 *  what it said.
 */
export function describeError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  // No response at all: the server is down, restarting, or unreachable.
  if (!error.response) {
    return "Cannot reach the server. Check that it is running.";
  }

  const { status, data } = error.response;

  if (status >= 500) return "The server failed to handle this. Try again.";
  if (status === 404) return "This record no longer exists.";
  if (status === 403) return "You do not have access to this.";

  // DRF validation: {"wallet": ["Invalid wallet."], "amount": ["..."]}
  if (data && typeof data === "object") {
    const messages = Object.entries(data as Record<string, unknown>)
      .map(([field, value]) => {
        const text = Array.isArray(value) ? value.join(" ") : String(value);
        // detail and non_field_errors are not field names worth showing.
        return field === "detail" || field === "non_field_errors"
          ? text
          : `${field}: ${text}`;
      })
      .filter(Boolean);
    if (messages.length) return messages.join("\n");
  }

  return fallback;
}
