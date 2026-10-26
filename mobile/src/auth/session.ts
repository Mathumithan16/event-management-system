import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

type TokenClaims = {
  sub?: unknown;
  role?: unknown;
  exp?: unknown;
};

const USER_ROLES = new Set(["ADMIN", "ORGANIZER", "VOLUNTEER"]);

export async function saveLoginResponse(response: Response): Promise<void> {
  const bodyText = await response.text();
  let body: unknown;

  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    throw new Error(
      `Server returned an invalid response (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    const detail =
      typeof body === "object" &&
      body !== null &&
      "detail" in body &&
      typeof body.detail === "string"
        ? body.detail
        : `Sign-in failed (HTTP ${response.status}).`;
    throw new Error(detail);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("access_token" in body) ||
    typeof body.access_token !== "string" ||
    !("token_type" in body) ||
    body.token_type !== "bearer"
  ) {
    throw new Error("The server returned an invalid sign-in response.");
  }

  const token = body.access_token;
  let claims: TokenClaims;
  try {
    claims = jwtDecode<TokenClaims>(token);
  } catch {
    throw new Error("The server returned an invalid access token.");
  }

  if (
    typeof claims.sub !== "string" ||
    !/^\d+$/.test(claims.sub) ||
    typeof claims.role !== "string" ||
    !USER_ROLES.has(claims.role) ||
    typeof claims.exp !== "number" ||
    claims.exp * 1000 <= Date.now()
  ) {
    throw new Error("The server returned an invalid or expired access token.");
  }

  await AsyncStorage.multiSet([
    ["access_token", token],
    ["user_role", claims.role],
    ["user_id", claims.sub],
  ]);
}
