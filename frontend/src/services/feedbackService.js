
import api from "./api";

export const submitFeedback = async (data) => {
  const response = await api.post("/public/feedback", data);
  return response.data;
};

