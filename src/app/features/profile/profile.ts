import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/Language/language-service';
import { Tab } from '../../core/models/tab';
import { User } from '../../core/services/User/user';
import { CookieService } from 'ngx-cookie-service';
import { UpdateProfileData, UserProfile } from '../../core/models/user';
import { DatePipe } from '@angular/common';
import { Enum } from '../../core/services/Enum/enum';
import { Platform } from '../../core/models/enum';
import { Post as PostService } from '../../core/services/Post/post';
import { Post } from '../../core/models/post';
import { Friend } from '../../core/services/Friend/friend';
import { FriendData } from '../../core/models/friend';
import { ActivatedRoute, Router } from '@angular/router';
import { PostCard } from '../../shared/components/post-card/post-card';
import { Save } from '../../core/services/SaveItem/save';
import { Story as StoryService } from '../../core/services/Story/story';
import { StoryViewModal } from '../../shared/components/story-view-modal/story-view-modal';
import { UserStory } from '../../core/models/story';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, PostCard, FormsModule, StoryViewModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  readonly lang = inject(LanguageService);
  readonly userService = inject(User);
  readonly cookieService = inject(CookieService);
  readonly enumService = inject(Enum);
  readonly postService = inject(PostService);
  readonly friendService = inject(Friend);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly saveService = inject(Save);
  readonly router = inject(Router);
  readonly storyService = inject(StoryService);

  activeTab = signal<Tab>('posts');
  userId = signal<string>('');

  profileData = signal<UserProfile | null>(null);
  plateforms = signal<Platform[]>([]);
  profilePosts = signal<Post[]>([]);
  friends = signal<FriendData[]>([]);
  isEditModalOpen = signal(false);
  isUpdatingProfileInfo = signal(false);
  editDisplayName = signal('');
  editBio = signal('');
  editCity = signal('');
  editCountry = signal('');
  isLinksModalOpen = signal(false);
  isUpdatingLinks = signal(false);
  editableLinks = signal<Array<{ platform: number; name: string; url: string }>>([]);
  isUpdatingCover = signal(false);
  hasActiveStories = signal(false);
  showStoryViewer = signal(false);
  showImageViewer = signal(false);

  readonly currentUserId = this.cookieService.get('userId');
  readonly isOwnerProfile = computed(() => !!this.userId() && this.userId() === this.currentUserId);

  ngOnInit(): void {
    this.getUserId();
    this.getSocialPlateforms();
  }

  // Get User ID from route and load profile data
  getUserId() {
    this.activatedRoute.paramMap.subscribe(param => {
      const id = param.get('id');
      if (id) {
        this.userId.set(id);

        // Fetch data for the new user
        this.getProfileData();
        this.getUserPosts();
        this.getFrindsForSpecificUser();
        this.checkActiveStories();
      }
    });
  }

  // Update social link URL in the editable links state
  updateSocialLinkUrl(index: number, value: string): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    this.editableLinks.update((links) =>
      links.map((link, i) => (i === index ? { ...link, url: value } : link)),
    );
  }

  openSocialPlatformLink(url: string): void {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl) {
      return;
    }

    const finalUrl = /^https?:\/\//i.test(normalizedUrl) ? normalizedUrl : `https://${normalizedUrl}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }

  // Save updated social links to the server
  saveSocialLinks(): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    const payload = this.editableLinks()
      .filter((link) => link.url.trim())
      .map((link) => ({
        platform: link.platform,
        url: link.url.trim(),
      }));

    this.isUpdatingLinks.set(true);
    this.userService.updateLinks(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          // Refresh profile data to reflect updated links
          this.getProfileData();
          this.closeLinksModal();
        }
        this.isUpdatingLinks.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isUpdatingLinks.set(false);
      },
    });
  }

  // Save updated profile information to the server
  saveProfileInfo(): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    const currentProfile = this.profileData();
    if (!currentProfile) {
      return;
    }

    this.isUpdatingProfileInfo.set(true);
    const formData = this.buildProfileFormData({
      displayName: this.editDisplayName().trim(),
      bio: this.editBio().trim(),
      profilePicture: null,
      coverPicture: null,
      city: this.editCity().trim(),
      country: this.editCountry().trim(),
    });

    this.userService.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          // Refresh profile data to reflect updates
          this.getProfileData();
          this.closeEditModal();
        }
        this.isUpdatingProfileInfo.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isUpdatingProfileInfo.set(false);
      },
    });
  }

  // Update profile picture or cover picture based on the provided changes
  updateProfileData(changes: Partial<UpdateProfileData>): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    const currentProfile = this.profileData();
    if (!currentProfile) {
      return;
    }

    const formData = this.buildProfileFormData({
      displayName: changes.displayName ?? currentProfile.displayName,
      bio: changes.bio ?? currentProfile.bio,
      profilePicture: changes.profilePicture ?? null,
      coverPicture: changes.coverPicture ?? null,
      city: changes.city ?? currentProfile.address?.city ?? '',
      country: changes.country ?? currentProfile.address?.country ?? '',
    });

    this.userService.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          // Refresh profile data to reflect updates
          this.getProfileData();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Specifically update the cover picture
  updateCoverPicture(coverPicture: File): void {
    const currentProfile = this.profileData();
    if (!currentProfile) {
      return;
    }

    const formData = new FormData();
    formData.append('DisplayName', currentProfile.displayName ?? '');
    formData.append('Bio', currentProfile.bio ?? '');
    formData.append('Address.Country', currentProfile.address?.country ?? '');
    formData.append('Address.City', currentProfile.address?.city ?? '');
    formData.append('CoverPicture', coverPicture);

    this.isUpdatingCover.set(true);
    this.userService.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          // Refresh profile data to reflect updated cover picture
          this.getProfileData();
        }
        this.isUpdatingCover.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isUpdatingCover.set(false);
      },
    });
  }

  // Fetch user profile data from the server
  getProfileData(): void {
    this.userService.getUserProfile(this.userId()).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          console.log(res);
          this.profileData.set(res.data);

          // Update cookie and notify other components if it's the owner's profile
          if (this.isOwnerProfile() && res.data.profilePicture) {
            this.userService.updateProfilePicture(res.data.profilePicture);
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Fetch available social platforms from the server
  getSocialPlateforms(): void {
    this.enumService.GetSocialPlatforms().subscribe({
      next: (res) => {
        this.plateforms.set(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Fetch posts for the specific user
  getUserPosts(): void {
    this.postService.GetPostsForSpecificUser({ pageIndex: 1, pageSize: 10, userId: this.userId() }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.profilePosts.set(res.data.data);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Fetch friends for the specific user
  getFrindsForSpecificUser(): void {
    this.friendService.GetFriends({ userId: this.userId(), pageIndex: 1, pageSize: 5 }).subscribe({
      next: (res) => {
        console.log('Friends', res.data.data);
        this.friends.set(res.data.data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Navigate to another user's profile
  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
    console.log('Navigating to profile of user with ID:', userId);
  }

  // Check if the user has active stories and update the state accordingly
  checkActiveStories(): void {
    this.storyService.getUserStory().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.data)) {
          const hasStories = res.data.some((s: UserStory) => s.userId === this.userId());
          this.hasActiveStories.set(hasStories);
        }
      },
      error: (err) => {
        console.error('Error checking stories:', err);
      }
    });
  }

  onProfilePictureSelected(event: Event): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    // Update profile picture
    this.updateProfileData({ profilePicture: file });
    fileInput.value = '';
  }

  onCoverPictureSelected(event: Event): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    // Update cover picture
    this.updateCoverPicture(file);
    fileInput.value = '';
  }

  onEditCoverClick(fileInput: HTMLInputElement): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    if (this.isUpdatingCover()) {
      return;
    }

    fileInput.click();
  }

  openEditModal(): void {
    if (!this.isOwnerProfile()) {
      return;
    }
    const currentProfile = this.profileData();
    if (!currentProfile) {
      return;
    }

    this.editDisplayName.set(currentProfile.displayName ?? '');
    this.editBio.set(currentProfile.bio ?? '');
    this.editCity.set(currentProfile.address?.city ?? '');
    this.editCountry.set(currentProfile.address?.country ?? '');
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  openLinksModal(): void {
    const currentProfile = this.profileData();
    if (!currentProfile || !this.plateforms().length) {
      return;
    }

    const socialLinkMap = new Map(
      (currentProfile.socialLinks ?? []).map((link) => [link.platform.toLowerCase().trim(), link.url ?? '']),
    );

    this.editableLinks.set(
      this.plateforms().map((platform) => ({
        platform: platform.value,
        name: platform.name,
        url: socialLinkMap.get(platform.name.toLowerCase()) ?? '',
      })),
    );
    this.isLinksModalOpen.set(true);
  }

  closeLinksModal(): void {
    this.isLinksModalOpen.set(false);
  }


  // Handle click on profile picture to either show story viewer or image viewer
  onProfilePictureClick(): void {
    if (this.hasActiveStories()) {
      this.showStoryViewer.set(true);
    } else if (this.profileData()?.profilePicture) {
      this.showImageViewer.set(true);
    }
  }

  // Utility method to build FormData for profile updates based on provided changes
  buildProfileFormData(profileData: UpdateProfileData): FormData {
    const formData = new FormData();

    if (profileData.displayName) {
      formData.append('DisplayName', profileData.displayName);
    }

    if (profileData.bio) {
      formData.append('Bio', profileData.bio);
    }

    if (profileData.profilePicture instanceof File) {
      formData.append('ProfilePicture', profileData.profilePicture);
    }

    if (profileData.coverPicture instanceof File) {
      formData.append('CoverPicture', profileData.coverPicture);
    }

    if (profileData.country) {
      formData.append('Address.Country', profileData.country);
    }

    if (profileData.city) {
      formData.append('Address.City', profileData.city);
    }

    return formData;
  }

  readonly stats = computed(() => [
    { label: this.lang.t('profile.posts'), value: this.profileData()?.postsCount },
    { label: this.lang.t('profile.followers'), value: this.profileData()?.followersCount },
    { label: this.lang.t('profile.following'), value: this.profileData()?.followingCount },
  ]);

  readonly tabs = computed(() => [
    { id: 'posts' as Tab, label: this.lang.t('profile.posts') },
    { id: 'friends' as Tab, label: this.lang.t('profile.friends') },
  ]);
}
