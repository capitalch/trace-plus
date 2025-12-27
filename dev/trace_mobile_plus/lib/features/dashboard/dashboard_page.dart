// import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile_plus/core/app_settings.dart';
import '../../core/routes.dart';
import '../../services/auth_service.dart';
import '../../providers/global_provider.dart';
import '../../services/graphql_service.dart';
import '../../core/sql_ids_map.dart';
import '../../models/branches_fin_years_settings_response_model.dart';
import '../../models/branch_model.dart';
import 'dashboard_secondary_app_bar_widget.dart';
import 'dashboard_content_widget.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadInitialData());
  }

  Future<void> _loadInitialData() async {
    if (!mounted) return;

    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);
    globalProvider.loadAvailableBusinessUnits();
    globalProvider.selectBusinessUnit();

    final result = await _loadAndsetSettingsFinYearsBranches();
    if (result != null && mounted) {
      _processSettingsData(result, globalProvider);
    }
  }

  void _processSettingsData(BranchesFinYearsSettingsResponseModel result, GlobalProvider globalProvider) {
    globalProvider.setAllBranches(result.allBranches);
    globalProvider.setAllFinYears(result.allFinYears);

    _extractAndSetUnitName(result, globalProvider);
    _selectBranch(result, globalProvider);
    _selectCurrentFinYear(result, globalProvider);
  }

  void _extractAndSetUnitName(BranchesFinYearsSettingsResponseModel result, GlobalProvider globalProvider) {
    final setting = result.allSettings.firstWhere(
      (s) => s['key'] == 'unitInfo',
      orElse: () => <String, dynamic>{},
    );

    final unitName = setting['jData']?['unitName'] as String? ?? 'Unit info not provided';
    globalProvider.setUnitName(unitName);
  }

  void _selectBranch(BranchesFinYearsSettingsResponseModel result, GlobalProvider globalProvider) {
    try {
      BranchModel? selectedBranch;

      if (AppSettings.lastUsedBranchId != null) {
        try {
          selectedBranch = result.allBranches.firstWhere(
            (branch) => branch.branchId == AppSettings.lastUsedBranchId,
          );
        } catch (_) {
          selectedBranch = null;
        }
      }

      selectedBranch ??= result.allBranches.firstWhere(
        (branch) => branch.branchId == 1,
        orElse: () => throw Exception('Branch with id 1 not found'),
      );

      globalProvider.setSelectedBranch(selectedBranch);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting branch: $e')),
        );
      }
    }
  }

  void _selectCurrentFinYear(BranchesFinYearsSettingsResponseModel result, GlobalProvider globalProvider) {
    try {
      final today = DateTime.now();

      final currentFinYear = result.allFinYears.firstWhere(
        (finYear) {
          try {
            final startDate = DateTime.parse(finYear.startDate);
            final endDate = DateTime.parse(finYear.endDate);

            return (today.isAfter(startDate) || today.isAtSameMomentAs(startDate)) &&
                   (today.isBefore(endDate) || today.isAtSameMomentAs(endDate));
          } catch (_) {
            return false;
          }
        },
        orElse: () => throw Exception('No financial year found for current date'),
      );

      globalProvider.setSelectedFinYear(currentFinYear);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error selecting financial year: $e')),
        );
      }
    }
  }

  Future<void> _handleLogout(BuildContext context) async {
    final authService = AuthService();

    // Clear business units from GlobalProvider
    // print('DashboardPage: Clearing business units on logout');
    if (mounted) {
      final globalProvider = Provider.of<GlobalProvider>(context, listen: false);
      globalProvider.setAvailableBusinessUnits([]);
      globalProvider.setSelectedBusinessUnit(null);
      // print('DashboardPage: Business units cleared');
    }

    await authService.logout();

    if (context.mounted) {
      context.go(Routes.login);
    }
  }

  Future<void> _showBusinessUnitSelector(BuildContext context) async {
    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);
    final availableUnits = globalProvider.availableBusinessUnits;

    if (availableUnits.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No business units available')),
      );
      return;
    }

    // Store the current business unit to detect changes
    final previousBU = globalProvider.selectedBusinessUnit;

    await showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Select Business Unit'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: availableUnits.length,
              itemBuilder: (context, index) {
                final bu = availableUnits[index];
                final isSelected = bu.buId == globalProvider.selectedBusinessUnit?.buId;

                return ListTile(
                  dense: true,
                  visualDensity: VisualDensity.compact,
                  leading: Icon(
                    isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                    color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
                  ),
                  title: Text(bu.buName,
                      style: TextStyle(
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 16,
                      )),
                  selected: isSelected,
                  onTap: () {
                    globalProvider.setSelectedBusinessUnit(bu);
                    Navigator.of(dialogContext).pop(true); // Return true to indicate selection
                  },
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false), // Return false on cancel
              child: const Text('Cancel'),
            ),
          ],
        );
      },
    );

    // Check if business unit actually changed
    final newBU = globalProvider.selectedBusinessUnit;
    if (newBU != null && previousBU?.buId != newBU.buId) {
      // Business unit changed, reload data
      await _reloadDataForBusinessUnit();
    }
  }

  Future<void> _reloadDataForBusinessUnit() async {
    if (!mounted) return;

    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);
    final selectedBU = globalProvider.selectedBusinessUnit;

    if (selectedBU == null) return;

    // Show loading indicator
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Loading data for ${selectedBU.buName}...'),
        duration: const Duration(seconds: 1),
      ),
    );

    try {
      // Fetch data for the selected business unit
      final result = await _loadAndsetSettingsFinYearsBranches();

      if (result != null && mounted) {
        // Process and update the data
        _processSettingsData(result, globalProvider);

        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Loaded data for ${selectedBU.buName}'),
              duration: const Duration(seconds: 1),
            ),
          );
        }
      }
    } catch (e) {
      // Handle errors
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading data: $e'),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<BranchesFinYearsSettingsResponseModel?> _loadAndsetSettingsFinYearsBranches() async {
    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);
    final selectedBU = globalProvider.selectedBusinessUnit;

    if (selectedBU == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a business unit first')),
      );
      return null;
    }

    if (AppSettings.dbParams == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Database parameters not available')),
      );
      return null;
    }

    try {
      final graphQLService = GraphQLService();
      final result = await graphQLService.executeGenericQuery(
        buCode: selectedBU.buCode,
        dbParams: AppSettings.dbParams!,
        sqlId: SqlIdsMap.getSettingsFinYearsBranches,
        sqlArgs: {}
      );

      if (result.hasException) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Query failed: ${result.exception.toString()}')),
          );
        }
        return null;
      } else {
        // Parse the result
        final data = result.data?['genericQuery'];
        if (data == null) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('No data received from query')),
            );
          }
          return null;
        }

        // Parse JSON string to Map
        final Map<String, dynamic> jsonData = data?[0]?['jsonResult']; //jsonDecode

        // Convert to model
        final responseModel = BranchesFinYearsSettingsResponseModel.fromJson(jsonData);

        return responseModel;
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final username = AppSettings.userName ?? 'User';

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color(0xFF1976D2),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Color.fromARGB(255, 90, 105, 128), // Darker blue for status bar
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        elevation: 4,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Consumer<GlobalProvider>(
              builder: (context, globalProvider, child) {
                final selectedBU = globalProvider.selectedBusinessUnit;
                return InkWell(
                  onTap: () => _showBusinessUnitSelector(context),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.business, color: Colors.white, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        selectedBU?.buName ?? 'Select BU',
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.arrow_drop_down, color: Colors.white, size: 18),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _handleLogout(context),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Column(
        children: [
          // Secondary AppBar
          const DashboardSecondaryAppBarWidget(),
          // Main content
          DashboardContentWidget(username: username),
        ],
      ),
    );
  }
}
