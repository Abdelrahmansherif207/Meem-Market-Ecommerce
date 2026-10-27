# Plan: Apply button for active claimed coupons (`MyClaimsList`)

## Context
- Endpoint `GET /general/coupons/mine` is already fully integrated and validated (200 OK with token).
- Gap: active claims (e.g. `SUMMER20`, `status: "active"`) show only a code + status badge — no Apply.
- Goal: mirror `MyCouponsList`'s apply flow for `active` claims. ~30 lines, no new API calls, no store changes.

## Files to change (2)

### 1. `src/features/coupons/components/MyClaimsList.tsx`
1. Imports:
   - Add `useCallback, useState` from `react`.
   - Add `XCircle` to the `lucide-react` import.
   - Add `import { couponService } from "../services/couponService";`
2. Props (all optional, backward compatible):
   ```ts
   /** Currently applied coupon code from the server cart (drives the Applied badge). */
   appliedCouponCode?: string | null;
   /** Called after a successful apply with the applied code. */
   onApplied?: (code: string) => void | Promise<void>;
   ```
3. State + handler (copied from `MyCouponsList.tsx:39-60`):
   ```ts
   const [applyingCode, setApplyingCode] = useState<string | null>(null);
   const [applyError, setApplyError] = useState<{ code: string; message: string | null } | null>(null);

   const handleApply = useCallback(
     async (code: string) => {
       setApplyingCode(code);
       setApplyError(null);

       await couponService.removeCoupon(locale);
       const result = await couponService.applyCoupon(code, locale);

       if (result.success) {
         await onApplied?.(code);
       } else {
         setApplyError({ code, message: result.message ?? null });
       }
       setApplyingCode(null);
     },
     [locale, onApplied],
   );
   ```
4. Row rendering — inside `claims.map`, compute:
   ```ts
   const isApplied = claim.code === appliedCouponCode;
   const isApplying = applyingCode === claim.code;
   const isBusy = applyingCode !== null;
   const canApply = claim.status === "active" && !isApplied;
   ```
   Replace the single status `<span>` with a right-side group:
   ```tsx
   <div className="flex shrink-0 items-center gap-2">
     {canApply && (
       <Button
         size="sm"
         variant="outline"
         loading={isApplying}
         disabled={isBusy && !isApplying}
         onClick={() => handleApply(claim.code)}
       >
         {t("apply")}
       </Button>
     )}
     {isApplied && (
       <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
         <CheckCircle2 className="h-3.5 w-3.5" />
         {t("applied")}
       </span>
     )}
     <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", status.className)}>
       <StatusIcon className="h-3.5 w-3.5" />
       {status.label}
     </span>
   </div>
   ```
   After the row `<div>` closing tag, add the inline error (same pattern as `MyCouponsList.tsx:154-159`):
   ```tsx
   {applyError?.code === claim.code && (
     <p className="flex w-full items-center gap-1.5 text-xs text-error">
       <XCircle className="h-3.5 w-3.5 shrink-0" />
       {applyError.message || t("applyFailed")}
     </p>
   )}
   ```
   Behavior: `redeemed`/`expired` claims keep badge only (no button) — `canApply` is false.

### 2. `src/features/profile/components/ProfileCouponsSection.tsx`
Pass the existing state through (one-line change):
```tsx
<MyClaimsList
  data={coupons}
  appliedCouponCode={appliedCouponCode}
  onApplied={handleApplied}
/>
```

## No other changes
- i18n: `apply`, `applied`, `applyFailed` already exist in `messages/en.json` + `ar.json` (coupons namespace).
- `index.ts` exports unchanged; `CartPageContent` doesn't render `MyClaimsList`.

## Verification
1. `npx tsc --noEmit`
2. Manual (optional): log in → profile page → active claim shows Apply → click → "Applied" pill + "Active" badge.
