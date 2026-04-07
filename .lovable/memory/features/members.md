---
name: Members management module
description: Full member management with contact fields, invitations, and visibility controls
type: feature
---
## Extended Profiles
- first_name, last_name, phone, secondary_phone, city, relationship_label, contact_preference, notes
- is_emergency_contact (boolean), is_visible_to_family (boolean)

## Extended Invitations
- first_name, last_name, phone, city, relationship_label, invitation_message
- resent_at, resent_count for tracking resends

## Components
- src/components/members/MemberCard.tsx — individual member display with contact info and labels
- src/components/members/MembersList.tsx — card list with role-based contact visibility
- src/components/members/InviteMemberForm.tsx — full invitation form with validation
- src/components/members/InvitationsList.tsx — pending/accepted/expired with resend/cancel

## Contact Visibility
- owner/family_manager: see all contact info
- family_member: sees contacts where is_visible_to_family = true
- heir/executor roles: limited view

## Audit Logging
- invitation_sent, invitation_resent, invitation_cancelled logged to audit_logs

## MembersPage
- Tabbed layout: Membres, Invitations, Labels familiaux, Exécuteur
- Only managers see Invitations tab
