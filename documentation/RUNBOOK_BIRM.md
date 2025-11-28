# BIRM (Business Identity & Role Model) Runbook

## Overview

BIRM separates User accounts from Business Profiles, enabling multi-business ownership and business-scoped plugin installations.

## Architecture Changes

### Before BIRM
- User = Merchant (single business)
- Plugins installed per merchant
- All resources scoped to `merchant_id`

### After BIRM
- User (account) is separate from Business Profile
- Users can own multiple businesses
- Plugins installed per business (`business_id`)
- Resources scoped to `business_id` (via `profile_id`)

## Database Schema Changes

### Migrations Applied

1. **001_birm_separate_user_business.sql**
   - Adds `type` column to `business_profiles` (store/service)
   - Adds `business_id` column to `installed_plugins`
   - Creates indexes for performance

2. **010_create_deprecated_api_hits.sql**
   - Creates `deprecated_api_hits` table for telemetry

### Data Migration

Run `scripts/migrations/migrate-birm-data.ts` to:
- Create default business profiles for existing merchants
- Link `installed_plugins` to `business_id`
- Migrate products/orders/gallery to business profiles

## API Changes

### New Business-Scoped APIs

All business operations now use `/api/businesses/[businessId]/...`:

- `GET/POST /api/businesses/[businessId]/plugins` - List/install plugins
- `GET/DELETE /api/businesses/[businessId]/plugins/[id]` - Plugin details/uninstall
- `POST /api/businesses/[businessId]/plugins/[id]/settings` - Update settings
- `POST /api/businesses/[businessId]/plugins/[id]/activate` - Activate plugin
- `POST /api/businesses/[businessId]/plugins/[id]/deactivate` - Deactivate plugin
- `GET/POST /api/businesses/[businessId]/catalog` - Products
- `GET /api/businesses/[businessId]/orders` - Orders
- `GET/POST /api/businesses/[businessId]/gallery` - Gallery images
- `GET/PATCH /api/businesses/[businessId]/settings` - Business settings

### Deprecated APIs

All `/api/merchant/**` routes return 410 Gone with telemetry logging.

**Migration Path:**
- Old: `GET /api/merchant/plugins`
- New: `GET /api/businesses/{businessId}/plugins`

## Frontend Changes

### Business Context

- `BusinessProvider` wraps dashboard layout
- `useBusiness()` hook provides current `businessId`
- `useSetBusiness()` updates selected business

### Dashboard Flow

1. User logs in → `/dashboard`
2. `BusinessPicker` shows user's businesses
3. User selects business → `/dashboard/business/{businessId}`
4. All operations scoped to selected business

## Migration Steps

### Pre-Migration Checklist

- [ ] Backup database
- [ ] Test migrations on staging
- [ ] Verify all business-scoped APIs work
- [ ] Run data migration script
- [ ] Verify data integrity

### Migration Execution

1. **Apply SQL migrations:**
   ```bash
   psql $DATABASE_URL -f db/migrations/001_birm_separate_user_business.sql
   psql $DATABASE_URL -f db/migrations/010_create_deprecated_api_hits.sql
   ```

2. **Run data migration:**
   ```bash
   npm run migrate:birm-data
   # or
   node scripts/migrations/migrate-birm-data.ts
   ```

3. **Verify migration:**
   ```sql
   -- Check business profiles created
   SELECT COUNT(*) FROM business_profiles;
   
   -- Check installed_plugins linked
   SELECT COUNT(*) FROM installed_plugins WHERE business_id IS NOT NULL;
   ```

4. **Make business_id NOT NULL (after verification):**
   ```sql
   ALTER TABLE installed_plugins ALTER COLUMN business_id SET NOT NULL;
   ```

### Post-Migration Verification

- [ ] All users have at least one business profile
- [ ] All installed_plugins have business_id
- [ ] Dashboard loads correctly
- [ ] Plugin installation works
- [ ] Public widgets load with businessId param

## Rollback Instructions

### Database Rollback

```bash
# Revert schema changes
psql $DATABASE_URL -f db/migrations/001_birm_separate_user_business_down.sql

# Restore from backup if needed
psql $DATABASE_URL < backup_before_birm_<timestamp>.sql
```

### Code Rollback

```bash
git revert <merge-commit-hash>
# or
git reset --hard <pre-birm-commit-hash>
```

## Testing Checklist

### Unit Tests
- [ ] Plugin manager business-scoped methods
- [ ] Business ownership middleware
- [ ] API route handlers

### Integration Tests
- [ ] Create business → install plugin
- [ ] Switch business → verify plugin isolation
- [ ] Public widget with businessId

### E2E Tests
- [ ] User registration → create business → dashboard
- [ ] Install plugin → activate → verify widget
- [ ] Multiple businesses → verify isolation

## API Mapping Reference

| Old Endpoint | New Endpoint | Notes |
|-------------|--------------|-------|
| `GET /api/merchant/plugins` | `GET /api/businesses/{id}/plugins` | Requires businessId |
| `POST /api/merchant/plugins` | `POST /api/businesses/{id}/plugins` | Body: `{pluginKey}` |
| `DELETE /api/merchant/plugins/{id}` | `DELETE /api/businesses/{id}/plugins/{id}` | Verify ownership |
| `GET /api/merchant/products` | `GET /api/businesses/{id}/catalog` | Renamed to catalog |
| `GET /api/merchant/orders` | `GET /api/businesses/{id}/orders` | Same functionality |
| `GET /api/merchant/gallery` | `GET /api/businesses/{id}/gallery` | Same functionality |

## Troubleshooting

### Issue: "Business not found"
- Verify business exists: `SELECT * FROM business_profiles WHERE id = ?`
- Check ownership: `SELECT merchant_id FROM business_profiles WHERE id = ?`

### Issue: "Plugin installation not found"
- Verify business_id is set: `SELECT business_id FROM installed_plugins WHERE id = ?`
- Check installation belongs to business: `WHERE business_id = ?`

### Issue: "Deprecated API still in use"
- Check deprecated_api_hits table for usage patterns
- Update client code to use new endpoints
- Provide migration guide to API consumers

## Performance Considerations

- Indexes created on `business_id` columns
- Consider caching business ownership checks
- Monitor query performance after migration

## Security Notes

- All business-scoped APIs require `requireBusinessOwnership` middleware
- Verify `business_id` matches authenticated user's businesses
- Public widgets require `businessId` query param validation

## Support Contacts

- Technical Lead: [Your Name]
- Database Admin: [DBA Name]
- Deployment: Vercel Dashboard

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0

