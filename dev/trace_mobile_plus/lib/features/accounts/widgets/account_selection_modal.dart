import 'package:flutter/material.dart';
import 'package:trace_mobile_plus/models/account_selection_model.dart';
import 'package:trace_mobile_plus/providers/general_ledger_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';

class AccountSelectionModal extends StatefulWidget {
  final GeneralLedgerProvider provider;
  final GlobalProvider globalProvider;

  const AccountSelectionModal({
    super.key,
    required this.provider,
    required this.globalProvider,
  });

  @override
  State<AccountSelectionModal> createState() => _AccountSelectionModalState();
}

class _AccountSelectionModalState extends State<AccountSelectionModal> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Fetch accounts if not already loaded
    if (widget.provider.accountsList.isEmpty && !widget.provider.isLoadingAccounts) {
      widget.provider.fetchLeafAccounts(widget.globalProvider);
    }

    // Set initial search query from provider
    _searchController.text = widget.provider.searchQuery;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onAccountSelected(AccountSelectionModel account) {
    print('DEBUG: Account selected in modal - id: ${account.id}, name: ${account.accName}');

    // Clear search before closing
    widget.provider.clearSearch();

    print('DEBUG: Closing modal and returning account to parent');
    // Close modal and return selected account to parent
    Navigator.of(context).pop(account);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: widget.provider,
      builder: (context, _) {
        final accountCount = widget.provider.accountsList.length;

        return AlertDialog(
          title: Text('Select Account ($accountCount)'),
          content: SizedBox(
            width: double.maxFinite,
            height: MediaQuery.of(context).size.height * 0.6,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Search TextField
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search accounts...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: widget.provider.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              widget.provider.clearSearch();
                            },
                          )
                        : null,
                    border: const OutlineInputBorder(),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16.0,
                      vertical: 12.0,
                    ),
                  ),
                  onChanged: (value) {
                    widget.provider.setSearchQuery(value);
                  },
                ),
                const SizedBox(height: 16),
                const Divider(height: 1),
                const SizedBox(height: 8),

                // Accounts List
                Expanded(
                  child: _buildAccountsList(),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                widget.provider.clearSearch();
                Navigator.of(context).pop();
              },
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildAccountsList() {
    if (widget.provider.isLoadingAccounts) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (widget.provider.errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text(
              widget.provider.errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                widget.provider.fetchLeafAccounts(widget.globalProvider);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final accounts = widget.provider.accountsList;

    if (accounts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.search_off,
              size: 48,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              widget.provider.searchQuery.isNotEmpty
                  ? 'No accounts found matching "${widget.provider.searchQuery}"'
                  : 'No accounts available',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      itemCount: accounts.length,
      itemBuilder: (context, index) {
        final account = accounts[index];
        return ListTile(
          dense: true,
          visualDensity: VisualDensity.compact,
          leading: const Icon(Icons.account_balance_wallet),
          title: Text(account.accName),
          subtitle: account.accParent.isNotEmpty
              ? Text(
                  account.accParent,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                )
              : null,
          enabled: !account.isDisabled,
          onTap: account.isDisabled
              ? null
              : () => _onAccountSelected(account),
        );
      },
    );
  }
}
