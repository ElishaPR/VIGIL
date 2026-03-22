# VIGIL Frontend - Setup & Development Guide

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── FormSelect.jsx
│   │   │   ├── FormTextarea.jsx
│   │   │   ├── ErrorAlert.jsx
│   │   │   ├── SuccessAlert.jsx
│   │   │   └── LoadingState.jsx
│   │   ├── forms/               # Form-specific components
│   │   │   ├── CategorySelector.jsx
│   │   │   ├── PrioritySelector.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── ConfirmModal.jsx
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ReminderCard.jsx
│   │   │   └── DocumentCard.jsx
│   │   ├── Auth/                # Authentication components
│   │   ├── Landing/             # Landing page components
│   │   └── Shared/              # Shared navigation components
│   ├── pages/
│   │   ├── DashboardPage.jsx    # Main dashboard
│   │   ├── ReminderFormPage.jsx # Create/edit reminders
│   │   ├── DocumentFormPage.jsx # Upload/edit documents
│   │   ├── LoginPage.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── VerifyPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── UserProfilePage.jsx
│   │   └── LandingPage.jsx
│   ├── hooks/
│   │   ├── useApi.js            # API state management
│   │   ├── useForm.js           # Form state management
│   │   └── useDebounce.js       # Debouncing utility
│   ├── services/
│   │   ├── api.js               # Centralized API client
│   │   └── validation.js        # Form validators
│   ├── utils/
│   │   ├── constants.js         # App constants
│   │   ├── date-utils.js        # Date utilities
│   │   ├── error-handler.js     # Error parsing
│   │   └── formatting.js        # Text formatting
│   ├── App.jsx                  # Main app with router
│   ├── main.jsx                 # Entry point
│   ├── App.css                  # App styles
│   └── index.css                # Global styles
├── public/
│   ├── vigil-logo.svg
│   ├── icon.png
│   └── firebase-messaging-sw.js
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend server running on `http://localhost:8000`
- Firebase project configured (for notifications)

### Step 1: Install Dependencies

```bash
cd Frontend
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the Frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 3: Update API URL

Edit `src/utils/constants.js`:

```javascript
export const API_BASE_URL = "http://localhost:8000";  // Change this if needed
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Architecture

### Component Hierarchy

```
App.jsx (Router)
├── LandingPage
├── LoginPage
├── SignUpPage
├── VerifyPage
├── DashboardPage
│   ├── Header
│   ├── Sidebar (filters)
│   ├── SearchBar
│   └── ReminderCard / DocumentCard
├── ReminderFormPage
│   ├── CategorySelector
│   ├── PrioritySelector
│   ├── FileUpload
│   └── Button
└── DocumentFormPage
    ├── CategorySelector
    ├── FileUpload
    └── Button
```

### State Management

**Global State**: Managed via React Router and component state
**Form State**: Managed via `useForm` hook
**API State**: Managed via `useApi` hook
**UI State**: Managed via `useState` per component

No external state management library required for current complexity.

### Data Flow

1. **User Action** (e.g., click button)
2. **Event Handler** (e.g., onClick)
3. **State Update** (e.g., setSearchQuery)
4. **API Call** (if needed)
5. **Response Handler** (update state, show message)
6. **Re-render** (components update)

## Common Development Tasks

### Adding a New Form Field

1. Add field to form initializer in `useForm`:
```javascript
const form = useForm({
  title: "",
  category: "",
  newField: "",  // Add here
})
```

2. Add validator in validators object:
```javascript
{
  title: reminderValidators.title,
  category: reminderValidators.category,
  newField: reminderValidators.newField,  // Add here
}
```

3. Add validator to `validation.js`:
```javascript
export const reminderValidators = {
  newField: (value) => {
    if (!value) return "Field is required";
    return "";
  }
}
```

4. Add form component to JSX:
```jsx
<FormInput
  label="New Field"
  value={form.values.newField}
  onChange={form.handleChange}
  error={form.touched.newField && form.errors.newField}
/>
```

### Adding a New API Endpoint

1. Add to `services/api.js`:
```javascript
export const reminderApi = {
  myNewEndpoint: async (params) => {
    const response = await apiCall("/reminders/new-endpoint", {
      method: "GET",
      body: JSON.stringify(params),
    });
    return response.json();
  },
}
```

2. Use in component:
```javascript
const { data, loading, error, execute } = useApi(reminderApi.myNewEndpoint);
```

### Creating a New Component

1. Create file in appropriate directory
2. Use export function syntax:
```javascript
/**
 * Brief description of what component does
 */
export function MyComponent({ prop1, prop2, onAction }) {
  // Component logic
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

3. Import and use in parent:
```javascript
import { MyComponent } from "./MyComponent.jsx";

export function ParentComponent() {
  return <MyComponent prop1="value" onAction={handleAction} />;
}
```

### Adding Error Handling

1. Wrap API call in try-catch:
```javascript
try {
  setLoading(true);
  const result = await reminderApi.create(data);
  setSuccess("Created successfully!");
} catch (err) {
  const parsed = parseApiError(err);
  setError(parsed.message);
  form.setFieldErrors(parsed.fieldErrors);
} finally {
  setLoading(false);
}
```

## Debugging Tips

### Using Console Logs

```javascript
// Debug state changes
console.log("[v0] Form values:", form.values);
console.log("[v0] API response:", response);

// Debug rendering
console.log("[v0] Component rendered with props:", props);
```

### Chrome DevTools

1. **React DevTools**
   - Install React DevTools extension
   - Inspect component state and props
   - Watch re-renders

2. **Network Tab**
   - Monitor API requests
   - Check response payloads
   - Verify headers

3. **Application Tab**
   - Check localStorage
   - View cookies
   - Debug session

### Common Issues

**Issue**: Component not re-rendering
**Solution**: Check dependency arrays in hooks, ensure state is updated correctly

**Issue**: API call not firing
**Solution**: Check network tab, verify URL, check error logs

**Issue**: Form validation not working
**Solution**: Verify validator function returns error string, check form touched state

**Issue**: Styling looks broken
**Solution**: Check Tailwind CSS classes, verify no CSS conflicts, check browser cache

## Performance Optimization

### Code Splitting

Current implementation loads all pages upfront. For optimization:

```javascript
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));

<Suspense fallback={<LoadingState />}>
  <DashboardPage />
</Suspense>
```

### Memoization

For expensive components:

```javascript
const MemoizedCard = memo(ReminderCard, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

### Image Optimization

- Compress images before upload
- Use WebP format when possible
- Lazy load images for better performance

## Git Workflow

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation

### Commit Messages
```
feat: Add search functionality to dashboard
fix: Correct validation error message display
refactor: Consolidate reminder form components
docs: Update setup guide
```

## Testing

### Manual Testing Checklist

- [ ] Create reminder
- [ ] Edit reminder
- [ ] Delete reminder with confirmation
- [ ] Upload document
- [ ] Edit document
- [ ] Delete document
- [ ] Search reminders
- [ ] Filter by status
- [ ] Filter by category
- [ ] Download document
- [ ] Handle API errors
- [ ] Handle network errors
- [ ] Test on mobile
- [ ] Test on tablet

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://api.vigil.app
```

### Hosting Options

1. **Vercel** (Recommended)
   - Connect GitHub repository
   - Auto-deploy on push
   - Built-in analytics

2. **Netlify**
   - Connect GitHub repository
   - Configure build settings
   - Deploy preview links

3. **Traditional Server**
   - Build locally
   - Upload `dist/` folder
   - Configure web server

## Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Vite Guide](https://vitejs.dev)

### Project Documentation
- `REFACTORING_SUMMARY.md` - Detailed refactoring overview
- `INTEGRATION_GUIDE.md` - Backend integration details

### Getting Help

1. Check existing GitHub issues
2. Search documentation
3. Review code comments
4. Check browser console for errors
5. Use React DevTools for debugging
