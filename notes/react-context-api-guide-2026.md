# React Context API Guide (2026)

## 📚 Contents
1. [When to Use](#when-to-use)
2. [Basic Setup](#basic-setup)
3. [Modern Patterns](#modern-patterns)
4. [Real Examples](#real-examples)
5. [Performance](#performance)
6. [Best Practices](#best-practices)

---

## What is Context?

Share data across components without prop drilling.

```tsx
// ❌ Prop drilling
<App> → <Layout> → <Header> → <UserMenu user={user} />

// ✅ Context
<UserMenu> uses useUser() directly
```

---

## When to Use

**✅ Good for:**
- Theme (light/dark)
- Auth (user, login state)
- Language/i18n
- Global UI (modals, toasts)

**❌ Bad for:**
- Frequent updates → Use Zustand/Redux
- Server data → Use TanStack Query
- Simple parent-child → Use props

---

## Basic Setup

```tsx
import { createContext, useContext, useState, ReactNode } from 'react'

// 1. Create context
const ThemeContext = createContext<{ theme: string; toggle: () => void } | undefined>(undefined)

// 2. Provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light')
  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. Custom hook
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

// 4. Wrap app
<ThemeProvider>
  <App />
</ThemeProvider>

// 5. Use anywhere
function Header() {
  const { theme, toggle } = useTheme()
  return <button onClick={toggle}>{theme} mode</button>
}
```

---

## Modern Patterns

### Pattern 1: Context + useReducer

```tsx
type State = { items: Item[]; total: number }
type Action = { type: 'ADD' | 'REMOVE'; payload: any }

const CartContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined)

function cartReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':
      return { ...state, items: [...state.items, action.payload] }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })
  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart needs CartProvider')
  return ctx
}

// Usage
function ProductCard() {
  const { dispatch } = useCart()
  return <button onClick={() => dispatch({ type: 'ADD', payload: item })}>Add</button>
}
```

### Pattern 2: Split State & Dispatch (Performance)

```tsx
const StateContext = createContext<State | undefined>(undefined)
const DispatchContext = createContext<Dispatch<Action> | undefined>(undefined)

// Components only using dispatch won't re-render on state changes!
```

### Pattern 3: localStorage Persistence

```tsx
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('settings')
    return stored ? JSON.parse(stored) : { notifications: true }
  })

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings))
  }, [settings])

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>
}
```

---

## Real Examples

### Auth Context

```tsx
type User = { id: string; email: string; name: string }

const AuthContext = createContext<{
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
} | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    setUser(await res.json())
  }

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth needs AuthProvider')
  return ctx
}

// Protected Route
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}
```

---

## Performance

### Problem: Unnecessary Re-renders

```tsx
// ❌ All consumers re-render when ANY value changes
const value = { user, theme, settings, notifications }
```

### Solutions:

**1. Split Contexts**
```tsx
// ✅ Separate concerns
const UserContext = createContext(null)
const ThemeContext = createContext('light')
```

**2. useMemo**
```tsx
const value = useMemo(() => ({ user, theme }), [user, theme])
return <Context.Provider value={value}>{children}</Context.Provider>
```

**3. Selector Pattern**
```tsx
// Only re-render when selected value changes
const count = useStore(state => state.count)
const user = useStore(state => state.user.name)
```

---

## Best Practices

**1. Always create custom hooks**
```tsx
// ✅ Good
const theme = useTheme()

// ❌ Bad
const theme = useContext(ThemeContext)
```

**2. Always validate context**
```tsx
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme needs ThemeProvider')
  return ctx
}
```

**3. Organize by feature**
```
contexts/
├── AuthContext.tsx
├── ThemeContext.tsx
└── index.ts
```

**4. Use TypeScript**
```tsx
type ThemeContextType = { theme: 'light' | 'dark'; toggle: () => void }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
```

**5. Compose providers**
```tsx
function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>{children}</CartProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
```

## Common Pitfalls

**❌ Forgetting useMemo**
```tsx
// Creates new object every render!
<Provider value={{ count, setCount }}>
```

**❌ Too much in one context**
```tsx
// Split these!
const AppContext = { user, theme, cart, notifications, settings }
```

**❌ Frequent updates in context**
```tsx
// Use local state or Zustand instead!
const MouseContext = createContext({ x: 0, y: 0 })
```

---

## Summary

**Use Context for:** Theme, auth, i18n, global UI state  
**Don't use for:** Frequent updates, server state, simple parent-child

**Perfect Pattern:**
```tsx
// 1. Types
type ContextType = { /* ... */ }

// 2. Context
const Context = createContext<ContextType | undefined>(undefined)

// 3. Provider with useMemo
export function Provider({ children }) {
  const value = useMemo(() => ({ /* ... */ }), [deps])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

// 4. Custom hook with validation
export function useContext() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('needs Provider')
  return ctx
}
```

---

**Resources:**
- [React Docs - useContext](https://react.dev/reference/react/useContext)
- [Kent C. Dodds - How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

