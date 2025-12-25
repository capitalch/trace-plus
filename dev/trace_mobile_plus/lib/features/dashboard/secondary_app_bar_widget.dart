import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/global_provider.dart';

class SecondaryAppBarWidget extends StatelessWidget {
  const SecondaryAppBarWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<GlobalProvider>(
      builder: (context, globalProvider, child) {
        final unitName = globalProvider.unitName ?? 'N/A';
        final finYearId = globalProvider.selectedFinYear?.finYearId.toString() ?? 'N/A';
        final branchCode = globalProvider.selectedBranch?.branchCode ?? 'N/A';

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.grey[200],
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Left: Unit Name
              Expanded(
                flex: 2,
                child: Text(
                  unitName,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              // Middle: FinYear with +/- controls
              Expanded(
                flex: 2,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove, color: Colors.black87, size: 20),
                      onPressed: () => _decrementFinYear(context, globalProvider),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Previous Financial Year',
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'FY: $finYearId',
                      style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.add, color: Colors.black87, size: 20),
                      onPressed: () => _incrementFinYear(context, globalProvider),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Next Financial Year',
                    ),
                  ],
                ),
              ),

              // Right: Branch Code (clickable)
              Expanded(
                flex: 1,
                child: InkWell(
                  onTap: () => _showBranchSelector(context, globalProvider),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          branchCode,
                          style: const TextStyle(
                            color: Colors.black87,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_drop_down, color: Colors.black87, size: 18),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _incrementFinYear(BuildContext context, GlobalProvider globalProvider) {
    if (globalProvider.selectedFinYear == null || globalProvider.allFinYears.isEmpty) {
      return;
    }

    final currentIndex = globalProvider.allFinYears.indexWhere(
      (fy) => fy.finYearId == globalProvider.selectedFinYear!.finYearId,
    );

    if (currentIndex == -1) {
      return;
    }

    if (currentIndex < globalProvider.allFinYears.length - 1) {
      globalProvider.updateSelectedFinYear(globalProvider.allFinYears[currentIndex + 1]);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Already at the latest financial year')),
      );
    }
  }

  void _decrementFinYear(BuildContext context, GlobalProvider globalProvider) {
    if (globalProvider.selectedFinYear == null || globalProvider.allFinYears.isEmpty) {
      return;
    }

    final currentIndex = globalProvider.allFinYears.indexWhere(
      (fy) => fy.finYearId == globalProvider.selectedFinYear!.finYearId,
    );

    if (currentIndex == -1) {
      return;
    }

    if (currentIndex > 0) {
      globalProvider.updateSelectedFinYear(globalProvider.allFinYears[currentIndex - 1]);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Already at the earliest financial year')),
      );
    }
  }

  Future<void> _showBranchSelector(BuildContext context, GlobalProvider globalProvider) async {
    final allBranches = globalProvider.allBranches;

    if (allBranches.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No branches available')),
      );
      return;
    }

    await showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Select Branch'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: allBranches.length,
              itemBuilder: (context, index) {
                final branch = allBranches[index];
                final isSelected = branch.branchId == globalProvider.selectedBranch?.branchId;

                return ListTile(
                  dense: true,
                  visualDensity: VisualDensity.compact,
                  leading: Icon(
                    isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                    color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
                  ),
                  title: Text(
                    '${branch.branchCode} - ${branch.branchName}',
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 16,
                    ),
                  ),
                  selected: isSelected,
                  onTap: () {
                    globalProvider.updateSelectedBranch(branch);
                    Navigator.of(dialogContext).pop();
                  },
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );
  }
}
