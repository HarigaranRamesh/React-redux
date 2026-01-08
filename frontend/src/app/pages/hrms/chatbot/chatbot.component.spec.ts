import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ChatbotComponent } from './chatbot.component';
import { ChatbotService } from '../services/chatbot/chatbot.service';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;

  let chatbotServiceSpy: jasmine.SpyObj<ChatbotService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const cSpy = jasmine.createSpyObj('ChatbotService', ['sendMessage']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ChatbotComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: ChatbotService, useValue: cSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    chatbotServiceSpy = TestBed.inject(ChatbotService) as jasmine.SpyObj<ChatbotService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send message and receive response', async () => {
    component.userInput = 'Hello';
    chatbotServiceSpy.sendMessage.and.returnValue(Promise.resolve('Hi there'));

    await component.send();

    expect(chatbotServiceSpy.sendMessage).toHaveBeenCalledWith('Hello');
    expect(component.messages).toContain(jasmine.objectContaining({ role: 'user', text: 'Hello' }));
    expect(component.messages).toContain(jasmine.objectContaining({ role: 'bot', text: 'Hi there' }));
  });

  it('should handle error when sending message', async () => {
    component.userInput = 'Hello';
    chatbotServiceSpy.sendMessage.and.returnValue(Promise.reject('Error'));

    await component.send();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });
});
