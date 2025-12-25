import 'package:flutter/foundation.dart';
import '../models/business_unit_model.dart';
import '../models/branch_model.dart';
import '../models/fin_year_model.dart';
import '../core/app_settings.dart';

class GlobalProvider extends ChangeNotifier {
  // Global state variables can be added here
  // Example: theme mode, user preferences, app-wide settings, etc.

  // Example: Theme mode
  bool _isDarkMode = false;
  bool get isDarkMode => _isDarkMode;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  // Available business units
  List<BusinessUnitModel> _availableBusinessUnits = [];
  List<BusinessUnitModel> get availableBusinessUnits => _availableBusinessUnits;

  void setAvailableBusinessUnits(List<BusinessUnitModel> businessUnits) {
    _availableBusinessUnits = businessUnits;
    notifyListeners();
  }

  // Selected business unit
  BusinessUnitModel? _selectedBusinessUnit;
  BusinessUnitModel? get selectedBusinessUnit => _selectedBusinessUnit;

  void setSelectedBusinessUnit(BusinessUnitModel? businessUnit) {
    _selectedBusinessUnit = businessUnit;
    notifyListeners();
  }

  void loadAvailableBusinessUnits() {
    // print('GlobalProvider: Loading business units from AppSettings');
    // print('GlobalProvider: UserType = ${AppSettings.userType}');

    if (AppSettings.userType == 'A') {
      _availableBusinessUnits = AppSettings.allBusinessUnits;
      // print('GlobalProvider: Loaded ${_availableBusinessUnits.length} business units (all)');
    } else {
      _availableBusinessUnits = AppSettings.userBusinessUnits;
      // print('GlobalProvider: Loaded ${_availableBusinessUnits.length} business units (user-specific)');
    }
    notifyListeners();
  }

  void selectBusinessUnit() {
    if (_availableBusinessUnits.isEmpty) {
      _selectedBusinessUnit = null;
    } else {
      final lastUsedBuId = AppSettings.lastUsedBuId;

      if (lastUsedBuId == null) {
        // No last used BU, select first one
        _selectedBusinessUnit = _availableBusinessUnits.first;
      } else {
        // Try to find the last used business unit
        try {
          _selectedBusinessUnit = _availableBusinessUnits.firstWhere(
            (bu) => bu.buId == lastUsedBuId,
          );
        } catch (e) {
          // Not found, select first one
          _selectedBusinessUnit = _availableBusinessUnits.first;
        }
      }
    }

    notifyListeners();
  }

  // All branches
  List<BranchModel> _allBranches = [];
  List<BranchModel> get allBranches => _allBranches;

  void setAllBranches(List<BranchModel> branches) {
    _allBranches = branches;
    notifyListeners();
  }

  // Unit name
  String? _unitName;
  String? get unitName => _unitName;

  void setUnitName(String? name) {
    _unitName = name;
    notifyListeners();
  }

  // All financial years
  List<FinYearModel> _allFinYears = [];
  List<FinYearModel> get allFinYears => _allFinYears;

  void setAllFinYears(List<FinYearModel> finYears) {
    _allFinYears = finYears;
    notifyListeners();
  }

  // Selected branch
  BranchModel? _selectedBranch;
  BranchModel? get selectedBranch => _selectedBranch;

  void setSelectedBranch(BranchModel? branch) {
    _selectedBranch = branch;
    notifyListeners();
  }

  // Selected financial year
  FinYearModel? _selectedFinYear;
  FinYearModel? get selectedFinYear => _selectedFinYear;

  void setSelectedFinYear(FinYearModel? finYear) {
    _selectedFinYear = finYear;
    notifyListeners();
  }

  // Update methods for user interactions
  void updateSelectedFinYear(FinYearModel finYear) {
    _selectedFinYear = finYear;
    notifyListeners();
  }

  void updateSelectedBranch(BranchModel branch) {
    _selectedBranch = branch;
    notifyListeners();
  }

}
