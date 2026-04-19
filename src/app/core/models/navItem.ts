export interface NavItem {
    path: string;
    label: string;
    icon: 'home' | 'film' | 'message';
}

export interface BottomNavItem {
    path: string;
    label: string;
    isCreate?: boolean;
}

export interface SidebarNavItem {
    path: string;
    label: string;
    icon: 'home' | 'film' | 'message' | 'user' | 'bookmark' | 'users' | 'settings';
}