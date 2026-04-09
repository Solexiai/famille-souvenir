---
name: Invitation workflow
description: Complete invitation lifecycle with edge function, acceptance page, email sending, and profile linking
type: feature
---
## Edge Function: manage-invitation
- Actions: `validate` (check token without accepting), `accept` (authenticate + join circle)
- Token validated server-side with service role key
- Checks: expiration, status, duplicate membership
- On accept: creates circle_members entry, populates profile from invitation data, logs to audit_logs
- Returns circle_name and success message in French

## Email Sending
- Transactional email via `send-transactional-email` edge function
- Template: `circle-invitation` in `_shared/transactional-email-templates/`
- Sent automatically on invitation creation from InviteMemberForm
- Includes: invitee name, circle name, inviter name, role, personal message, accept URL
- Sender domain: notify.solexi.ai
- Idempotency key: `circle-invite-{token}`
- Shareable link still shown as fallback in UI

## Acceptance Page: /invitation/accept?token=xxx
- Public route (not behind ProtectedRoute)
- Validates token on mount
- If not authenticated: shows login/signup buttons with redirect back
- If authenticated: shows invitation details + accept button
- Success: redirects to /dashboard after 2s
- Error states: expired, already accepted, declined, invalid

## Profile Linking
- On acceptance, invitation first_name/last_name/phone/city/relationship_label populate empty profile fields
- full_name assembled from first + last name
- No duplicate members: checks existing circle_members before insert

## Unsubscribe Page: /unsubscribe?token=xxx
- Public route for email unsubscribe
- Validates token via handle-email-unsubscribe edge function
- Shows confirm button, already unsubscribed, or error states

## Audit Logging
- invitation_sent, invitation_resent, invitation_cancelled (in UI components)
- invitation_accepted (in edge function)
