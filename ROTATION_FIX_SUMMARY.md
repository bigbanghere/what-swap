# Rotation Fix Summary

## Problem
When a user entered a custom value (like "11") in the Send amount field and then clicked the rotation button, the system would not preserve the user's entered value. Instead, it would always use "1" as the basis value during rotation.

## Root Cause
The `originalBasisValueRef.current` was only initialized once to '1' during component initialization and never updated when the user entered custom values. The rotation logic was designed to use this stored value, but since it was never updated, it always contained '1'.

## Solution
Updated the `handleFromAmountChange` and `handleToAmountChange` functions to update `originalBasisValueRef.current` whenever the user enters a custom value in either field.

### Changes Made

1. **In `handleFromAmountChange` function** (around line 1414):
   ```typescript
   // Update the original basis value for rotation preservation
   originalBasisValueRef.current = value;
   ```

2. **In `handleToAmountChange` function** (around line 1527):
   ```typescript
   // Update the original basis value for rotation preservation
   originalBasisValueRef.current = value;
   ```

## How It Works

1. When user enters a value in either Send or Get field, `originalBasisValueRef.current` is updated with that value
2. During rotation, the logic checks if `originalBasisValueRef.current` is not null
3. If it's not null, it uses that value as the basis for rotation instead of the default '1'
4. This ensures the user's entered value is preserved through rotations

## Testing

The fix can be tested by:
1. Navigate to http://localhost:3002
2. Enter "11" in the Send amount field
3. Click the rotation button
4. Verify that "11" is preserved in the Get field after rotation
5. The Send field should show the calculated amount for the swapped tokens

## Files Modified
- `src/app/main/components/swap-form.tsx` - Added basis value tracking in both amount change handlers
