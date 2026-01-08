import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8080/api/chatbot'; // Update for production if needed

  /**
   * Sends a message to the backend chatbot API and returns the reply.
   */
  async sendMessage(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.reply || 'No response received from chatbot.';
    } catch (error) {
      console.error('ChatbotService error:', error);
      return 'Sorry, the chatbot service is currently unavailable.';
    }
  }
}
