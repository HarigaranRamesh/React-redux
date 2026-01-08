import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChatbotService } from '../services/chatbot/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  messages: { role: string; text: string }[] = [];
  userInput = '';
  loading = false;

  constructor(private chatbot: ChatbotService, private toast: MessageService) {}

  async send() {
    const question = this.userInput.trim();
    if (!question) return;

    this.messages.push({ role: 'user', text: question });
    this.userInput = '';
    this.loading = true;

    try {
      const answer = await this.chatbot.sendMessage(question);
      this.messages.push({ role: 'bot', text: answer });
    } catch (err) {
      this.toast.add({
        severity: 'error',
        summary: 'Chatbot Error',
        detail: 'Unable to generate response.'
      });
    } finally {
      this.loading = false;
    }
  }
}
