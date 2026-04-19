export interface LoginData {
    emailOrUserName: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    profilePicture: File | string | null;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ForgotPasswordData {
    email: string
}

export interface ResetPasswordData {
    email: string;
    otp: string;
    newPassword: string;
}

export interface RefreshTokenRequest {
    token: string;
    refreshToken: string;
}

export interface RevokeTokenDto {
    token: string;
    refreshToken: string;
}
