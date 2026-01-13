import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/global_provider.dart';

class DashboardSecondaryAppBarWidget extends StatelessWidget {
  final VoidCallback? onUnitNameTap;

  const DashboardSecondaryAppBarWidget({
    super.key,
    this.onUnitNameTap,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<GlobalProvider>(
      builder: (context, globalProvider, child) {
        final unitName = globalProvider.unitName ?? 'N/A';
        final finYearId = globalProvider.selectedFinYear?.finYearId.toString() ?? 'N/A';
        final branchCode = globalProvider.selectedBranch?.branchCode ?? 'N/A';

        return Container(
          padding: const EdgeInsets.only(left: 10, right: 10, top: 8, bottom: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(
              bottom: BorderSide(
                color: Colors.grey[300]!,
                width: 1.5,
              ),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Left: Unit Name (clickable)
              Flexible(
                flex: 2,
                child: InkWell(
                  onTap: onUnitNameTap,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.grey[300]!, width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            unitName,
                            style: const TextStyle(
                              color: Colors.black87,
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.arrow_drop_down, color: Colors.black87, size: 18),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 4),

              // Middle: FinYear with +/- controls
              Flexible(
                flex: 2,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove, color: Colors.black87, size: 18),
                      onPressed: () => _decrementFinYear(context, globalProvider),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      tooltip: 'Previous Financial Year',
                    ),
                    const SizedBox(width: 2),
                    Flexible(
                      child: Text(
                        finYearId,
                        style: const TextStyle(
                          color: Colors.black87,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 2),
                    IconButton(
                      icon: const Icon(Icons.add, color: Colors.black87, size: 18),
                      onPressed: () => _incrementFinYear(context, globalProvider),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                      tooltip: 'Next Financial Year',
                    ),
                  ],
                ),
              ),

              // const SizedBox(width: 2),

              // Right: Branch Code (clickable)
              Flexible(
                flex: 1,
                child: InkWell(
                  onTap: () => _showBranchSelector(context, globalProvider),
                  child: Container(
                    padding: const EdgeInsets.only(left: 4, right: 4, top: 6, bottom: 6),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.grey[300]!, width: 1),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Flexible(
                          child: Text(
                            branchCode,
                            style: const TextStyle(
                              color: Colors.black87,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
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
