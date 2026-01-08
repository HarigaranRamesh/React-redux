import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a new post', () => {
    component.newPostContent = 'Test post content';
    const initialPostsLength = component.posts.length;

    component.createPost();

    expect(component.posts.length).toBe(initialPostsLength + 1);
    expect(component.posts[0].caption).toBe('Test post content');
    expect(component.newPostContent).toBe('');
  });

  it('should not create a post if content is empty', () => {
    component.newPostContent = '   ';
    const initialPostsLength = component.posts.length;

    component.createPost();

    expect(component.posts.length).toBe(initialPostsLength);
  });

  it('should toggle like on a post', () => {
    const post = component.posts[0];
    const initialLikes = post.likes;
    const initialLikedState = post.liked;

    component.toggleLike(post);

    expect(post.liked).toBe(!initialLikedState);
    expect(post.likes).toBe(initialLikedState ? initialLikes - 1 : initialLikes + 1);

    // Toggle back
    component.toggleLike(post);
    expect(post.liked).toBe(initialLikedState);
    expect(post.likes).toBe(initialLikes);
  });
});
