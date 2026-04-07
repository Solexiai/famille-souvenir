---
name: Invitation workflow
description: Complete invitation lifecycle with edge function, acceptance page, and profile linking
type: feature
---
## Edge Function: manage-invitation
- Actions: `validate` (check token without accepting), `accept` (authenticate + join circle)
- Token validated server-side with service role key
- Checks: expiration, status, duplicate membership
- On accept: creates circle_members entry, populates profile from invitation data, logs to audit_logs
- Returns circle_name and success message in French

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

## Invitation Link
- InviteMemberForm retrieves token after insert via .select()
- Shows copyable link: {origin}/invitation/accept?token={token}
- Link can be shared manually (email sending requires domain setup)

## Login Redirect
- LoginPage supports ?redirect= parameter for post-auth navigation
- Invitation page links to /login?redirect=/invitation/accept?token=xxx

## Audit Logging
- invitation_sent, invitation_resent, invitation_cancelled (in UI components)
- invitation_accepted (in edge function)

## Email Sending
- Deferred: requires email domain configuration first
- Currently uses shareable link approach
