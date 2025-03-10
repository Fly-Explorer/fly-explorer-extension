const BASE_URL = "https://flyfish-sonic.weminal.xyz";

export interface MessageResponse {

}

export async function sendMessage(text: string) {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('user', 'user');

    const response = await fetch(`${BASE_URL}/7129af6e-881b-01cd-b6b8-f74f5598b6f4/message`, {
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
