import api from "./api";

export const assistantApi = {
  ask: (request) => api.post("/chat/assistant", request),
};
