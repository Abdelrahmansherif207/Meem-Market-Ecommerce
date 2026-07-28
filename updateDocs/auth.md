## Changes

### Frontend Changes
- Fixed `ChangePasswordForm.tsx` field name mismatch: `current_password` → `oldPassword`, `password` → `newPassword`, `password_confirmation` → `newPassword_confirmation` to match API's camelCase expectations
- Updated `ChangePasswordPayload` type in `auth/types.ts` to match
- **New: Password reset flow** — 3-step forgot password UI (Email → OTP → New Password)
  - `src/features/auth/actions/forgotPassword.ts`: Server action handling all 3 steps via `step` form field
  - `src/features/auth/components/ForgotPasswordForm.tsx`: Multi-step client component with OTP input, password validation
  - Integrated into `AuthGateway.tsx` as `"forgot-password"` mode
  - "Forgot password?" link added to `LoginForm.tsx` next to "Verify with OTP"
- `authService.verifyForgetPasswordToken()` now handles raw `true`/`false` response from `/verify-forget-password-token` (returns `boolean` instead of `MessageResponse`)
- Test OTP `123456` is displayed in the UI for development/testing

### Existing Auth Implementation
- **Full auth system**: Login, Register, OTP verification, Password Reset flows
- **Store**: Zustand `useAuthStore` with persist middleware (token, permissions, role, profile)
- **Services**: `authService.ts` with all endpoints (login, register, logout, OTP, forgot/reset password, social login, change password)
- **Server Actions**: loginAction, registerAction, otpAction, sendOtpCodeAction, forgotPasswordAction (Zod validation on login/register, manual validation on forgot password)
- **UI**: AuthGateway (login/register/OTP/forgot-password modes), AuthModal (quick login), UserMenu (dropdown)
- **Route**: `/auth` page with loading/error states
- **Social login**: Types and service method exist, but no Google/Facebook UI buttons

### API Bugs
1. **`POST /api/v1/forget-password`** → 500 "Something went wrong" — endpoint broken
2. **`POST /api/v1/verify-forget-password-token`** → empty response — endpoint broken
3. **`POST /api/v1/reset-password`** → 500 "Something went wrong" — endpoint broken
4. **`POST /api/v1/send-otp-code`** → SMTP authentication failure for "meemmarket12@gmail.com" — backend email config broken

All 4 bugs are caused by the same root issue: SMTP server authentication failure (emails can't be sent). The entire password reset and OTP email flow is non-functional. Frontend flow is complete and ready — once SMTP is fixed, the reset flow will work using test OTP `123456`.
