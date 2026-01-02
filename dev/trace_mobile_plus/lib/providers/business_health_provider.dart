import 'package:flutter/foundation.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/business_health_model.dart';
import 'package:trace_mobile_plus/services/graphql_service.dart';
import 'package:trace_mobile_plus/core/app_settings.dart';

class BusinessHealthProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  BusinessHealthModel? _healthData;
  bool _isLoading = false;
  String? _errorMessage;
  Future<void>? _healthFuture;

  BusinessHealthModel? get healthData => _healthData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get healthFuture => _healthFuture;

  /// Fetch business health data from GraphQL
  Future<void> fetchHealthData(GlobalProvider globalProvider) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Get required parameters from GlobalProvider and AppSettings
      final branchId = globalProvider.selectedBranch?.branchId;
      final finYearId = globalProvider.selectedFinYear?.finYearId;
      final buCode = globalProvider.selectedBusinessUnit?.buCode;
      final dbParams = AppSettings.dbParams;

      if (branchId == null ||
          finYearId == null ||
          buCode == null ||
          dbParams == null) {
        throw Exception(
          'Missing required parameters. Please ensure branch, financial year, and business unit are selected.',
        );
      }

      // Execute GraphQL query
      final result = await _graphqlService.executeGenericQuery(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getBusinessHealth,
        sqlArgs: {
          'branchId': branchId,
          'finYearId': finYearId,
          'buCode': buCode,
          'dbParams': dbParams,
        },
      );

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      // Parse the result
      final data = result.data != null ? result.data!['genericQuery'][0] : null;
      if (data == null) {
        throw Exception('No data received from server');
      }
      final jsonResult = data['jsonResult'];

      // Convert to business health model
      _healthData = BusinessHealthModel.fromJson(
        jsonResult as Map<String, dynamic>,
      );

      _isLoading = false;
      _errorMessage = null;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _healthData = null;
    }

    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Refresh business health data - triggers a new fetch and updates the future
  void refreshHealth(GlobalProvider globalProvider) {
    _healthFuture = fetchHealthData(globalProvider);
    notifyListeners();
  }

  /// Initialize and fetch business health data
  void initialize(GlobalProvider globalProvider) {
    refreshHealth(globalProvider);
  }
}
