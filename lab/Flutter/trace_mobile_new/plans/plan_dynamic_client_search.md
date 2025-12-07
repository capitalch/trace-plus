# Dynamic Client Search Implementation Plan

**Date**: 2025-12-07
**Purpose**: Implement server-side client search that queries only when user types 2+ characters
**Current Behavior**: Loads all clients on page init, filters locally
**Target Behavior**: Query server with typed text as criteria when 2+ characters entered

---

## 1. Current Implementation Analysis

### Current Flow:
```
Page Init → Load ALL clients from server → Store in _clients list →
User types → Filter _clients locally → Show filtered results
```

### Issues:
- ❌ Loads all clients immediately (unnecessary API call)
- ❌ Wastes bandwidth if many clients exist
- ❌ User waits for all clients to load before typing
- ✅ Fast filtering after initial load (local)

---

## 2. Target Implementation

### New Flow:
```
Page Init → No API call → User types <2 chars → Show nothing →
User types 2+ chars → Call API with criteria → Display server results →
User types more → Call API again with new criteria → Update results
```

### Benefits:
- ✅ No unnecessary API calls on page load
- ✅ Server-side filtering (scalable for large datasets)
- ✅ Reduced bandwidth usage
- ✅ Faster initial page load
- ✅ Dynamic search as user types

---

## 3. Technical Approach

### Option A: Debounced API Calls (Recommended)
```
User types → Wait 300-500ms → If no more typing → Call API → Show results
```

**Pros:**
- Reduces API calls (waits for user to pause typing)
- Better server performance
- Better UX (no flickering from too many calls)

**Cons:**
- Requires debouncing implementation
- Slight delay before showing results

### Option B: Immediate API Calls
```
User types character → If 2+ chars → Call API immediately → Show results
```

**Pros:**
- Instant feedback
- Simpler implementation

**Cons:**
- Many API calls (one per keystroke)
- Can overwhelm server
- May cause UI flickering

**Recommendation**: Use **Option A with 500ms debounce**

---

## 4. Implementation Plan

### Step 1: Remove Initial Client Loading
**File**: `lib/features/authentication/login_page.dart`

**Current Code:**
```dart
@override
void initState() {
  super.initState();
  _loadClients();
}

Future<void> _loadClients() async {
  try {
    final clients = await _authService.getClients();
    setState(() {
      _clients = clients;
      _isLoadingClients = false;
    });
  } catch (e) {
    // error handling
  }
}
```

**New Code:**
```dart
@override
void initState() {
  super.initState();
  // Don't load clients on init anymore
  setState(() {
    _isLoadingClients = false; // No loading needed
  });
}

// Remove _loadClients() method entirely
```

---

### Step 2: Implement Debounced Search
**File**: `lib/features/authentication/login_page.dart`

#### Add Dependencies:
```dart
import 'dart:async';
```

#### Add State Variables:
```dart
class _LoginPageState extends State<LoginPage> {
  // Existing variables...
  List<Client> _clients = [];
  bool _isSearching = false;
  Timer? _debounceTimer;
  String _lastSearchQuery = '';

  // ...
}
```

#### Add Debounced Search Method:
```dart
Future<void> _searchClients(String query) async {
  // Cancel previous timer if exists
  _debounceTimer?.cancel();

  // If less than 2 characters, clear results
  if (query.length < 2) {
    setState(() {
      _clients = [];
      _isSearching = false;
    });
    return;
  }

  // Set debounce timer (500ms)
  _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
    // Only search if query has changed
    if (query == _lastSearchQuery) return;

    setState(() {
      _isSearching = true;
      _lastSearchQuery = query;
    });

    try {
      // Call API with search criteria
      final clients = await _authService.getClients(criteria: query);

      if (mounted) {
        setState(() {
          _clients = clients;
          _isSearching = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });

        // Optionally show error (can be silent for search)
        // Utils.showAlert(
        //   context: context,
        //   message: 'Search failed: ${e.toString()}',
        //   title: 'Error',
        // );
      }
    }
  });
}

@override
void dispose() {
  _debounceTimer?.cancel();
  _usernameController.dispose();
  _passwordController.dispose();
  super.dispose();
}
```

---

### Step 3: Update Autocomplete Widget
**File**: `lib/features/authentication/login_page.dart`

**Current Autocomplete:**
```dart
Autocomplete<Client>(
  optionsBuilder: (TextEditingValue textEditingValue) {
    if (textEditingValue.text.length < 2) {
      return const Iterable<Client>.empty();
    }
    return _clients.where((Client client) {
      return client.name
          .toLowerCase()
          .contains(textEditingValue.text.toLowerCase());
    });
  },
  // ...
)
```

**New Autocomplete with Server Search:**
```dart
Autocomplete<Client>(
  optionsBuilder: (TextEditingValue textEditingValue) {
    final query = textEditingValue.text.trim();

    // Trigger server search
    _searchClients(query);

    // Return current results from _clients
    // (will be updated by _searchClients when API responds)
    if (query.length < 2) {
      return const Iterable<Client>.empty();
    }

    return _clients;
  },
  displayStringForOption: (Client client) => client.name,
  onSelected: (Client client) {
    setState(() {
      _selectedClient = client;
    });
  },
  // ...
)
```

---

### Step 4: Update UI to Show Search Status
**File**: `lib/features/authentication/login_page.dart`

Update the fieldViewBuilder to show loading indicator:

```dart
fieldViewBuilder: (
  BuildContext context,
  TextEditingController textEditingController,
  FocusNode focusNode,
  VoidCallback onFieldSubmitted,
) {
  return TextField(
    controller: textEditingController,
    focusNode: focusNode,
    decoration: InputDecoration(
      border: const OutlineInputBorder(),
      labelText: 'Select Client',
      hintText: 'Type 2 characters to search...',
      helperText: _isSearching
          ? 'Searching...'
          : 'Enter at least 2 characters to search clients',
      prefixIcon: const Icon(Icons.business),
      suffixIcon: _isSearching
          ? const SizedBox(
              width: 20,
              height: 20,
              child: Padding(
                padding: EdgeInsets.all(12.0),
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          : null,
    ),
    style: const TextStyle(fontSize: 20),
  );
},
```

---

### Step 5: Remove Client Loading UI
**File**: `lib/features/authentication/login_page.dart`

**Current Code:**
```dart
// Client Selection (Autocomplete)
Container(
  alignment: Alignment.center,
  padding: const EdgeInsets.only(bottom: 20),
  child: _isLoadingClients
      ? const SizedBox(
          height: 60,
          child: Center(child: CircularProgressIndicator()),
        )
      : Autocomplete<Client>(
          // ...
        ),
),
```

**New Code:**
```dart
// Client Selection (Autocomplete) - No initial loading
Container(
  alignment: Alignment.center,
  padding: const EdgeInsets.only(bottom: 20),
  child: Autocomplete<Client>(
    // ... autocomplete widget
  ),
),
```

---

### Step 6: Update State Variables
**File**: `lib/features/authentication/login_page.dart`

**Remove:**
```dart
bool _isLoadingClients = true;
```

**Add:**
```dart
bool _isSearching = false;
Timer? _debounceTimer;
String _lastSearchQuery = '';
```

---

## 5. Alternative: Using RxDart (Optional Enhancement)

If you want more robust debouncing, add `rxdart` package:

### Add Dependency:
**File**: `pubspec.yaml`
```yaml
dependencies:
  rxdart: ^0.27.7
```

### Implementation:
```dart
import 'package:rxdart/rxdart.dart';

class _LoginPageState extends State<LoginPage> {
  final _searchController = BehaviorSubject<String>();
  StreamSubscription? _searchSubscription;

  @override
  void initState() {
    super.initState();

    // Setup debounced search stream
    _searchSubscription = _searchController.stream
        .debounceTime(const Duration(milliseconds: 500))
        .distinct()
        .listen((query) async {
      if (query.length < 2) {
        setState(() => _clients = []);
        return;
      }

      setState(() => _isSearching = true);

      try {
        final clients = await _authService.getClients(criteria: query);
        if (mounted) {
          setState(() {
            _clients = clients;
            _isSearching = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() => _isSearching = false);
        }
      }
    });
  }

  void _searchClients(String query) {
    _searchController.add(query);
  }

  @override
  void dispose() {
    _searchSubscription?.cancel();
    _searchController.close();
    super.dispose();
  }
}
```

---

## 6. Testing Plan

### Unit Tests:
- [ ] Test that no API call is made with <2 characters
- [ ] Test that API is called with 2+ characters
- [ ] Test debouncing (only last call is made)
- [ ] Test that criteria is sent in request body

### Integration Tests:
- [ ] Test search with 0 characters (no results)
- [ ] Test search with 1 character (no results)
- [ ] Test search with 2 characters (API called, results shown)
- [ ] Test search with multiple characters (results filtered)
- [ ] Test rapid typing (only final search executed)
- [ ] Test clearing search (results cleared)

### Manual Tests:
- [ ] Open login page (no API call should occur)
- [ ] Type 1 character (no results, no API call)
- [ ] Type 2 characters (API called after 500ms, results shown)
- [ ] Type quickly (only one API call after typing stops)
- [ ] Clear search (results cleared)
- [ ] Test with slow network (loading indicator shows)
- [ ] Test with no matches (empty state shown)
- [ ] Test selecting a client (form populated correctly)

---

## 7. Error Handling

### Scenarios to Handle:

1. **Network Timeout:**
```dart
try {
  final clients = await _authService.getClients(criteria: query);
} on TimeoutException {
  // Silent fail for search, or show subtle message
  if (mounted) {
    setState(() {
      _isSearching = false;
      _clients = [];
    });
  }
}
```

2. **Empty Results:**
```dart
if (clients.isEmpty) {
  // Show "No clients found" message in UI
  // Can be done in optionsViewBuilder
}
```

3. **API Error:**
```dart
catch (e) {
  // Silent fail for search queries
  // Don't interrupt user flow with error dialogs
  setState(() => _isSearching = false);
}
```

---

## 8. Performance Considerations

### Debounce Time:
- **300ms**: Very responsive, may call API too frequently
- **500ms**: Good balance (recommended)
- **1000ms**: Feels sluggish

### Caching (Optional Enhancement):
```dart
final Map<String, List<Client>> _searchCache = {};

Future<void> _searchClients(String query) async {
  // Check cache first
  if (_searchCache.containsKey(query)) {
    setState(() {
      _clients = _searchCache[query]!;
    });
    return;
  }

  // Call API
  final clients = await _authService.getClients(criteria: query);

  // Cache results
  _searchCache[query] = clients;

  setState(() {
    _clients = clients;
  });
}
```

---

## 9. UX Improvements

### Empty State Message:
```dart
optionsViewBuilder: (
  BuildContext context,
  AutocompleteOnSelected<Client> onSelected,
  Iterable<Client> options,
) {
  if (_isSearching) {
    return Material(
      child: Container(
        padding: EdgeInsets.all(16),
        child: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Text('Searching...'),
          ],
        ),
      ),
    );
  }

  if (options.isEmpty && _lastSearchQuery.length >= 2) {
    return Material(
      child: Container(
        padding: EdgeInsets.all(16),
        child: Text('No clients found for "$_lastSearchQuery"'),
      ),
    );
  }

  // Show results...
}
```

---

## 10. Implementation Checklist

### Phase 1: Basic Implementation
- [ ] Remove `_loadClients()` from initState
- [ ] Remove `_isLoadingClients` state variable
- [ ] Add `_isSearching` state variable
- [ ] Add `_debounceTimer` variable
- [ ] Implement `_searchClients(String query)` method
- [ ] Update Autocomplete `optionsBuilder`
- [ ] Update dispose method to cancel timer
- [ ] Test basic functionality

### Phase 2: UI Enhancements
- [ ] Add loading indicator in search field
- [ ] Update helper text based on search state
- [ ] Show "Searching..." message
- [ ] Show "No results" message when appropriate
- [ ] Remove initial loading spinner

### Phase 3: Polish & Optimization
- [ ] Fine-tune debounce delay (test 300ms, 500ms, 1000ms)
- [ ] Add search caching (optional)
- [ ] Improve error handling
- [ ] Add retry logic for failed searches
- [ ] Test with various network conditions

---

## 11. Code Summary

### Key Changes:
1. **Remove**: Initial client loading in `initState()`
2. **Add**: Debounced search method `_searchClients()`
3. **Update**: Autocomplete to trigger server search
4. **Add**: Search status indicators in UI
5. **Update**: AuthService already supports `criteria` parameter

### Files to Modify:
- `lib/features/authentication/login_page.dart` (main changes)
- No changes needed to `lib/services/auth_service.dart` (already has criteria support)

---

## 12. Rollback Plan

If issues arise, rollback is simple:

```dart
// Revert to loading all clients on init
@override
void initState() {
  super.initState();
  _loadClients(); // Re-enable
}

// Keep _loadClients() method
// Remove _searchClients() method
// Remove debounce timer
```

---

## 13. Success Criteria

✅ No API call when page loads
✅ API called only when user types 2+ characters
✅ Typed text sent as `criteria` in request body
✅ Results update as user types (with debounce)
✅ Loading indicator shows during search
✅ Empty state message when no results
✅ No UI flicker from rapid API calls
✅ Smooth user experience

---

**Estimated Implementation Time**: 30-45 minutes
**Risk Level**: Low (non-breaking change)
**Testing Time**: 15-20 minutes

---

*End of Plan*
