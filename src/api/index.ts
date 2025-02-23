const BASE_URL = "https://flyfish-movement.weminal.xyz";

export async function sendMessage(text: string) {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('user', 'user');

    const response = await fetch(`${BASE_URL}/026c9a66-ed85-09a6-bc7a-bd19a03e211c/message`, {
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
