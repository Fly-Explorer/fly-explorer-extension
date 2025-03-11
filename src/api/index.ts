const BASE_URL = import.meta.env.VITE_API_URL;

export async function sendMessage(text: string) {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('user', 'user');

    const response = await fetch(`${BASE_URL}/${import.meta.env.VITE_AGENT_ID}/message`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
