# Authentication System

ระบบ Authentication สำหรับ Expense Tracker ที่ใช้ Clerk

## Components

### ProtectedRoute

ป้องกันหน้า dashboard และหน้า create ต่างๆ ไม่ให้ user ที่ไม่ได้ login เข้าถึงได้

**การใช้งาน:**

```tsx
import { ProtectedRoute } from "@/components/auth";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

### AuthProvider

จัดการ authentication state และให้ข้อมูล user แก่ components อื่นๆ

**การใช้งาน:**

```tsx
import { useAuthContext } from "@/components/auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome {user.firstName}!</div>;
}
```

### ErrorBoundary

จัดการ error ที่อาจเกิดขึ้นในหน้า dashboard

**การใช้งาน:**

```tsx
import { ErrorBoundary } from "@/components/auth";

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <div>Dashboard Content</div>
    </ErrorBoundary>
  );
}
```

## Middleware Configuration

Middleware ถูกตั้งค่าให้ป้องกันหน้า dashboard และหน้า create ต่างๆ:

```typescript
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/create(.*)"]);
```

## Flow

1. User พยายามเข้าถึงหน้า dashboard
2. Middleware ตรวจสอบ authentication
3. ถ้าไม่ได้ login จะ redirect ไปหน้า login
4. หลังจาก login สำเร็จจะ redirect กลับไปหน้า dashboard
5. ProtectedRoute ตรวจสอบ token อีกครั้ง
6. ถ้า token ถูกต้องจะแสดงหน้า dashboard

## Features

- ✅ ป้องกันหน้า dashboard และหน้า create
- ✅ Redirect ไปหน้า login เมื่อไม่ได้ login
- ✅ Loading state ขณะตรวจสอบ authentication
- ✅ Error handling
- ✅ Token validation
- ✅ Automatic redirect หลัง login
