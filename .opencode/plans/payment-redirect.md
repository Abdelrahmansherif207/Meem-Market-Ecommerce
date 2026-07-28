# Post-Login Redirect to Payment

## Files to edit

### 1. `src/features/auth/components/AuthGateway.tsx`

**Add import** (after line 6, `useRouter` import):
```ts
import { useSearchParams } from "next/navigation";
```

**Add after line 37** (`const router = useRouter();`):
```ts
const searchParams = useSearchParams();
const redirectTo = searchParams.get("redirect") || "/";
```

**Change line 104** — OTP success redirect:
```ts
// FROM:
router.push("/auth");
// TO:
router.push(redirectTo);
```

**Change line 112** — Login success redirect:
```ts
// FROM:
router.push("/");
// TO:
router.push(redirectTo);
```

### 2. `src/features/cart/components/CartSummary.tsx`

**Change line 71** — Pass redirect param:
```ts
// FROM:
onClick={() => router.push(isAuthenticated ? "/payment" : "/auth")}
// TO:
onClick={() => router.push(isAuthenticated ? "/payment" : "/auth?redirect=/payment")}
```

## Behavior

| Scenario | Before | After |
|---|---|---|
| Cart → not authed → login | redirects to `/` (home) | redirects to `/payment` |
| Visit `/auth` directly → login | redirects to `/` (home) | redirects to `/` (home) |
| OTP verify after register | redirects to `/auth` (bug) | redirects to redirect param or `/` |
