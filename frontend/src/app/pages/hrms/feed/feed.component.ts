import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FeedService } from '../services/feed/feed.service';
import { environment } from '../../../../environments/environment';

import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextarea } from 'primeng/inputtextarea';

type UserInfo = {
  userId: string;
  user_name: string;
  position: string;
  userRole: string;
};

type Post = {
  _id?: string;
  id?: string;

  userId: string;
  user_name: string;
  position?: string;
  userRole?: string;

  caption: string;
  imageUrl?: string;
  createdAt?: string;

  likesCount?: number;
  commentsCount?: number;
};

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // PrimeNG
    CardModule,
    ButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    InputTextarea,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit {
  constructor(
    private feedService: FeedService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  private readonly apiHost = `${environment.apiUrl}`; // ex: http://localhost:8080

  newPostContent = '';
  selectedFile: File | null = null;
  previewImage: string | null = null;

  // pagination
  posts: Post[] = [];
  limit = 10;
  skip = 0;
  hasMore = true;
  loading = false;
  creating = false;

  currentUser: UserInfo = {
    userId: localStorage.getItem('userId') ?? '',
    user_name: localStorage.getItem('user_name') ?? 'current_user',
    position: localStorage.getItem('position') ?? '',
    userRole: localStorage.getItem('userRole') ?? '',
  };

  ngOnInit(): void {
    this.loadNext();
  }

  // ✅ Infinite scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.loading || !this.hasMore) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const fullHeight = document.documentElement.scrollHeight;

    if (scrollTop + viewportHeight >= fullHeight - 200) {
      this.loadNext();
    }
  }

  loadNext() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.feedService.list(this.skip, this.limit).subscribe({
      next: (res) => {
        const items = (res?.items ?? []) as Post[];
        this.posts = [...this.posts, ...items];

        this.hasMore = !!res?.meta?.hasMore;
        this.skip = res?.meta?.nextSkip ?? this.skip + items.length;

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Load Failed',
          detail: err?.error?.message ?? 'Unable to load feed',
        });
      },
    });
  }

  // File Select
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.clearAttachment();
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid File', detail: 'Please select an image' });
      input.value = '';
      this.clearAttachment();
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({ severity: 'warn', summary: 'Too Large', detail: 'Max 5MB image allowed' });
      input.value = '';
      this.clearAttachment();
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeAttachment() {
    this.clearAttachment();
  }

  private clearAttachment() {
    this.selectedFile = null;
    this.previewImage = null;
  }

  // Create Post API
  createPost() {
    const caption = this.newPostContent.trim();
    const hasImage = !!this.selectedFile;

    if (!caption && !hasImage) return;

    const fd = new FormData();
    fd.append('caption', caption);

    fd.append('userId', this.currentUser.userId);
    fd.append('user_name', this.currentUser.user_name);
    fd.append('position', this.currentUser.position || '');
    fd.append('userRole', this.currentUser.userRole || '');

    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.creating = true;
    this.feedService.create(fd).subscribe({
      next: (res) => {
        this.creating = false;
        const created: Post = res?.data;

        if (created) this.posts = [created, ...this.posts];

        this.newPostContent = '';
        this.clearAttachment();

        this.messageService.add({ severity: 'success', summary: 'Posted', detail: 'Your post was added' });
      },
      error: (err) => {
        this.creating = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Post Failed',
          detail: err?.error?.message ?? 'Unable to create post',
        });
      },
    });
  }

  // Image URL from backend
  getImageSrc(post: Post): string | null {
    if (!post.imageUrl) return null;
    return post.imageUrl.startsWith('http') ? post.imageUrl : `${this.apiHost}${post.imageUrl}`;
  }

  // Time ago
  timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    const days = Math.floor(hrs / 24);
    return `${days} days ago`;
  }

  // ✅ SuperAdmin only
  isSuperAdmin(): boolean {
    const role = (this.currentUser.userRole || '').toLowerCase().replace(/\s/g, '');
    return role === 'superadmin';
  }

  // Delete confirm
  confirmDelete(post: Post) {
    const id = (post?._id || post?.id) as string;
    if (!id) return;

    this.confirmationService.confirm({
      header: 'Delete Post',
      message: 'Are you sure you want to delete this post?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deletePost(id),
    });
  }

  // Delete API
  deletePost(postId: string) {
    this.feedService.delete(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => (p._id || p.id) !== postId);
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Post deleted successfully' });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Delete Failed',
          detail: err?.error?.message ?? 'Unable to delete post',
        });
      },
    });
  }

  // ✅ Initial avatar helpers
  getInitial(name?: string): string {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  }

  getAvatarColor(name?: string): string {
    if (!name) return '#9e9e9e';

    const colors = [
      '#1abc9c', '#3498db', '#9b59b6', '#e67e22',
      '#e74c3c', '#16a085', '#2980b9', '#8e44ad',
      '#2ecc71', '#f39c12'
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
