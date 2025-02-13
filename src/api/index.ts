const BASE_URL = "https://flyfish.weminal.xyz";

export async function sendMessage(text: string) {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('user', 'user');

    const response = await fetch(`${BASE_URL}/2cd8f9e3-d62e-0d8a-b20e-981b21e355c6/message`, {
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
