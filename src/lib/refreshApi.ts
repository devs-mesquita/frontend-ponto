import { createRefresh } from "react-auth-kit";

const API_URL = import.meta.env.VITE_API_URL;

type RefreshAPIResponse = {
  authorization: {
    token: string;
    type: string;
    expires_in: number;
  };
  user: {
    name: string;
    cpf: string;
    email: string;
  };
};

const refreshApi = createRefresh({
  interval: 10, // Refreshs the token in every 10 minutes
  refreshApiCallback: async ({ authToken, refreshToken }) => {
    try {
      const res = await fetch(`${API_URL}/api/refresh`, {
        method: "POST",
        body: JSON.stringify({
          refresh: refreshToken,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw err;
      }

      const data: RefreshAPIResponse = await res.json();

      return {
        isSuccess: true,
        newAuthToken: data.authorization.token,
        newAuthTokenExpireIn: data.authorization.expires_in,
        newRefreshTokenExpiresIn: data.authorization.expires_in,
        newAuthUserState: { user: data.user },
        newRefreshToken: data.authorization.token,
      };
    } catch (error) {
      console.error(error);
      return {
        isSuccess: false,
        newAuthToken: authToken || "",
      };
    }
  },
});

export default refreshApi;
