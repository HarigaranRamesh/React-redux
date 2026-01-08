import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from "../../pages/hrms/chatbot/chatbot.component";

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `
    <div class="layout-footer">
      HRMS by
      <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">
        OneAssist Technologies
      </a>
    </div>

    <div class="chatbot-container">
      <button class="chatbot-toggle" (click)="toggleChat()">
        <span *ngIf="!isOpen">💬 Chat</span>
        <span *ngIf="isOpen">✖ Close</span>
      </button>

      <div class="chatbot-box" *ngIf="isOpen">
        <app-chatbot></app-chatbot>
      </div>
    </div>
  `,
  styles: [`
    .layout-footer {
      text-align: center;
      padding: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }

    .chatbot-toggle {
      background-color: #007ad9;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 10px 16px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    .chatbot-toggle:hover {
      background-color: #005fa3;
    }

    .chatbot-box {
      position: fixed;
      bottom: 70px;
      right: 20px;
      display: flex;
      flex-direction: column;
      border: 1px solid #ccc;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

      /* ✅ scrollable + responsive */
      width: min(400px, 90vw);
      max-height: 80vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #ccc transparent;

      animation: slideUp 0.3s ease-in-out;
    }

    /* ✅ prettier scrollbars for WebKit browsers */
    .chatbot-box::-webkit-scrollbar {
      width: 6px;
    }
    .chatbot-box::-webkit-scrollbar-thumb {
      background-color: #bbb;
      border-radius: 4px;
    }

    @keyframes slideUp {
      from { transform: translateY(50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 480px) {
      .chatbot-box {
        width: 90vw;
        max-height: 70vh;
        right: 5vw;
      }
    }
  `],
  imports: [CommonModule, ChatbotComponent]
})
export class AppFooter {
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}
