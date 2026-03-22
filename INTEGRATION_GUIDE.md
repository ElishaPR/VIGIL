# VIGIL Frontend Integration Guide

## Overview

This guide explains how the refactored frontend integrates with your backend and what to expect at each step.

## Backend Compatibility

The refactored frontend is compatible with your existing backend. All API endpoints remain the same, but the frontend now uses them more efficiently.

### API Integration Points

#### 1. **Authentication Flow**
```javascript
// POST /users/login
// POST /users/signup
// POST /users/verify
// POST /users/logout
// GET /users/me
```
**Frontend Component**: `LoginPage.jsx`, `SignUpPage.jsx`, `VerifyPage.jsx`

#### 2. **Dashboard Data**
```javascript
// GET /reminders/dashboard
// Returns: { reminders: [...] }

// GET /documents/list
// Returns: [...] or { documents: [...] }
```
**Frontend Component**: `DashboardPage.jsx` uses `reminderApi.getDashboard()` and `documentApi.list()`

#### 3. **Reminder Operations**
```javascript
// GET /reminders/{uuid}
// POST /reminders/create
// PUT /reminders/{uuid}
// DELETE /reminders/{uuid}
```
**Frontend Component**: `ReminderFormPage.jsx` uses `reminderApi.getById()`, `.create()`, `.update()`, `.delete()`

**Expected Fields from Backend:**
```json
{
  "reminder_uuid": "uuid",
  "title": "string",
  "category": "string",
  "priority": "low|medium|high",
  "expiryDate": "ISO-8601 datetime",
  "status": "expired|expiring|active",
  "notes": "string or null",
  "reminder_at": "ISO-8601 datetime"
}
```

#### 4. **Document Operations**
```javascript
// GET /documents/list
// GET /documents/{uuid}
// POST /documents/upload
// PUT /documents/{uuid}
// DELETE /documents/{uuid}
// GET /documents/{uuid}/download
```
**Frontend Component**: `DocumentFormPage.jsx` uses `documentApi.upload()`, `.update()`, `.delete()`, `.download()`

**Expected Fields from Backend:**
```json
{
  "doc_uuid": "uuid",
  "doc_title": "string",
  "doc_category": "string",
  "mime_type": "string",
  "expiry_date": "ISO-8601 datetime or null",
  "upload_date": "ISO-8601 datetime"
}
```

## Key Integration Points

### 1. **Search & Filter Integration**
The dashboard sends requests with these filters:

```javascript
// Current implementation: client-side filtering
// Frontend filters locally after fetching all reminders/documents
// This works well for small datasets (100s of items)

// For production with larger datasets, consider adding backend filtering:
// GET /reminders/dashboard?status=expired&category=medical&search=renewal
```

### 2. **Error Handling**
The frontend expects standard HTTP error responses:

```javascript
// Validation errors (422 Unprocessable Entity)
{
  "detail": [
    {
      "loc": ["body", "fieldName"],
      "msg": "Error message",
      "type": "validation_error"
    }
  ]
}

// Authorization errors (401, 403)
{
  "detail": "Unauthorized" or "Forbidden"
}

// Not found (404)
{
  "detail": "Resource not found"
}

// Server errors (500)
{
  "detail": "Internal server error"
}
```

### 3. **Custom Categories**
If a reminder's category doesn't match predefined ones (travel, medical, vehicle, bills, housing, insurance), it's treated as a custom category and displayed as-is.

```javascript
// Predefined categories
["travel", "medical", "vehicle", "bills", "housing", "insurance"]

// Custom categories
["Home Maintenance", "Pet Care", "Legal Documents"]
```

## Testing the Integration

### 1. **Complete Flow Test**
```
1. Sign up: POST /users/signup → GET /users/me
2. Create reminder: POST /reminders/create
3. View dashboard: GET /reminders/dashboard + GET /documents/list
4. Edit reminder: GET /reminders/{uuid} → PUT /reminders/{uuid}
5. Delete reminder: DELETE /reminders/{uuid}
6. Upload document: POST /documents/upload
7. Download document: GET /documents/{uuid}/download
8. Logout: POST /users/logout
```

### 2. **Search & Filter Test**
```
1. Create multiple reminders with different categories
2. Create reminders with different statuses (active, expiring, expired)
3. Test search bar: should find by title and category
4. Test status filters: should show correct count
5. Test category filters: including custom categories
6. Test combined filters: search + status + category
```

### 3. **Error Handling Test**
```
1. Try creating reminder without required fields
2. Try uploading file larger than 10MB
3. Try deleting non-existent reminder
4. Disconnect network and try operations
5. Verify error messages are shown to user
```

## Component Props & Usage

### ReminderCard
```jsx
<ReminderCard
  reminder={{
    reminder_uuid: "uuid",
    title: "string",
    category: "string",
    priority: "low|medium|high",
    expiryDate: "ISO-8601",
    status: "expired|expiring|active"
  }}
  onDelete={(uuid) => handleDelete(uuid)}
  showMenuButton={true}
/>
```

### DocumentCard
```jsx
<DocumentCard
  document={{
    doc_uuid: "uuid",
    doc_title: "string",
    doc_category: "string",
    mime_type: "string",
    expiry_date: "ISO-8601 or null",
    upload_date: "ISO-8601"
  }}
  onDelete={(uuid) => handleDelete(uuid)}
  onDownload={(uuid) => handleDownload(uuid)}
  showMenuButton={true}
/>
```

### SearchBar
```jsx
<SearchBar
  value={searchQuery}
  onChange={(query) => setSearchQuery(query)}
  placeholder="Search reminders..."
  resultCount={filteredItems.length}
/>
```

### CategorySelector
```jsx
<CategorySelector
  value={selectedCategory}
  onChange={(e) => setCategory(e.target.value)}
  customValue={customCategoryName}
  onCustomChange={setCustomCategoryName}
  error={errorMessage}
  required={true}
/>
```

## API Constants

All API calls use:
```javascript
API_BASE_URL = "http://localhost:8000"
credentials = "include"  // For session cookies
```

To change the API URL, edit `Frontend/src/utils/constants.js`:
```javascript
export const API_BASE_URL = "http://your-api-url:port";
```

## Validation Rules

### Reminder Validation
- **Title**: Required, max 200 characters
- **Category**: Required, predefined or custom
- **Priority**: Required (low, medium, high)
- **Expiry Date**: Required, must be in future
- **Notes**: Optional, max 1000 characters

### Document Validation
- **Title**: Required, max 200 characters
- **Category**: Required, predefined or custom
- **File**: Required on upload, max 10MB
- **File Types**: Images, PDF, Word, Excel documents
- **Expiry Date**: Optional, must be in future if provided

## Data Flow Diagrams

### Dashboard Data Flow
```
User opens dashboard
    ↓
DashboardPage fetches:
  - GET /users/me
  - GET /reminders/dashboard
  - GET /documents/list
    ↓
Data received, local state updated
    ↓
SearchBar + Sidebar apply client-side filters
    ↓
ReminderCard + DocumentCard display filtered results
    ↓
User clicks Edit/Delete
    ↓
API call → Update local state → User feedback
```

### Create Reminder Flow
```
User navigates to /reminder/add
    ↓
ReminderFormPage renders empty form
    ↓
User fills form (title, category, date, etc.)
    ↓
User submits
    ↓
Frontend validates all fields
    ↓
POST /reminders/create
    ↓
Backend validates and creates
    ↓
Success message
    ↓
Navigate to /dashboard
    ↓
Dashboard refetches data
```

### Edit Reminder Flow
```
User clicks edit on reminder card
    ↓
Navigate to /reminder/{uuid}
    ↓
ReminderFormPage fetches: GET /reminders/{uuid}
    ↓
Form populated with existing data
    ↓
User modifies fields
    ↓
User submits
    ↓
PUT /reminders/{uuid} with updated data
    ↓
Success message
    ↓
Navigate to /dashboard
```

## Common Issues & Solutions

### Issue: Search not finding items
**Solution**: Search is case-insensitive and matches partial strings. Make sure:
- You're searching in title or category
- The debounce delay (300ms) has passed
- Items are actually fetched from backend

### Issue: Custom category not saving
**Solution**: Check that:
- Custom category is not empty
- Category name is less than 50 characters
- Backend is accepting the category in the request

### Issue: File upload failing
**Solution**: Verify:
- File size is under 10MB
- File type is supported (images, PDF, Word, Excel)
- Network connection is stable

### Issue: Status showing as "active" for all items
**Solution**: Ensure backend is returning correct `expiryDate` format:
- Must be valid ISO-8601 datetime
- Frontend calculates status based on this date

## Performance Optimization Tips

1. **Large Datasets**
   - If you have 1000+ reminders, implement server-side pagination
   - Add `GET /reminders/dashboard?page=1&limit=50`
   - Update DashboardPage to handle pagination

2. **Search Performance**
   - For large datasets, move search to backend
   - Reduce debounce delay if needed (currently 300ms)
   - Add full-text search indexes on backend

3. **Image Performance**
   - Compress images before upload
   - Use image optimization service
   - Consider thumbnail generation on backend

## Security Considerations

1. **Session Management**
   - Use HTTP-only cookies for auth tokens
   - Implement proper CORS settings
   - Validate all user input on backend

2. **File Upload Security**
   - Validate file types on both client and server
   - Check file size limits
   - Scan uploaded files for malware
   - Store files in secure location

3. **Data Protection**
   - Implement Row-Level Security (RLS) for user data
   - Never expose sensitive information in error messages
   - Validate all permissions on backend

## Deployment Checklist

- [ ] Update `API_BASE_URL` to production server
- [ ] Enable HTTPS for all API calls
- [ ] Test all API endpoints in production
- [ ] Verify error handling works correctly
- [ ] Test search and filtering
- [ ] Test file uploads with various file types
- [ ] Verify session management
- [ ] Load test with expected user count
- [ ] Monitor error logs
- [ ] Set up analytics for user behavior
