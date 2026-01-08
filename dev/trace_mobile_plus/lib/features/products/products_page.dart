import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/products_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/products_model.dart';

class ProductsPage extends StatefulWidget {
  const ProductsPage({super.key});

  @override
  State<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends State<ProductsPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSummaryExpanded = true; // Summary bar visibility state

  @override
  void initState() {
    super.initState();
    // Add listener to rebuild when text changes (for clear button visibility)
    _searchController.addListener(() {
      setState(() {});
    });

    // Load search history
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final provider = Provider.of<ProductsProvider>(context, listen: false);
      provider.loadSearchHistory();
      // Clear search state to show full product list on page entry
      provider.clearSearch();
      // Reset filters to default values on page entry
      provider.resetFilters();

      // Load summary bar state
      final prefs = await SharedPreferences.getInstance();
      final isExpanded = prefs.getBool('products_summary_expanded') ?? true;
      if (mounted) {
        setState(() {
          _isSummaryExpanded = isExpanded;
        });
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleSummary() async {
    setState(() {
      _isSummaryExpanded = !_isSummaryExpanded;
    });

    // Save state
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('products_summary_expanded', _isSummaryExpanded);
  }

  Widget _buildSummaryBoxes(BuildContext context) {
    return Consumer<ProductsProvider>(
      builder: (context, provider, _) {
        final NumberFormat priceFormat = NumberFormat('#,##0.00');
        final totalExclGst = provider.totalPurchasePrice;
        final totalInclGst = provider.totalPurchasePriceGst;

        return Container(
          height: 65,
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              // Stock Box (blue)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue[300]!, width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.shopping_cart_outlined,
                        size: 16,
                        color: Colors.blue[700],
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Stock',
                              style: TextStyle(
                                fontSize: 9,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.currency_rupee,
                                  size: 13,
                                  color: Colors.blue[800],
                                ),
                                Flexible(
                                  child: Text(
                                    priceFormat.format(totalExclGst),
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue[800],
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Stock + GST Box (green)
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green[300]!, width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.shopping_cart,
                        size: 16,
                        color: Colors.green[700],
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Stock (GST)',
                              style: TextStyle(
                                fontSize: 9,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.currency_rupee,
                                  size: 13,
                                  color: Colors.green[800],
                                ),
                                Flexible(
                                  child: Text(
                                    priceFormat.format(totalInclGst),
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green[800],
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildToggleButton() {
    return Center(
      child: InkWell(
        onTap: _toggleSummary,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: _isSummaryExpanded ? Colors.grey[300] : Colors.teal[400],
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Icon(
            _isSummaryExpanded
                ? Icons.keyboard_arrow_down
                : Icons.keyboard_arrow_up,
            size: 20,
            color: _isSummaryExpanded ? Colors.grey[700] : Colors.white,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          context.go(Routes.dashboard);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 48,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.go(Routes.dashboard),
          ),
          systemOverlayStyle: const SystemUiOverlayStyle(
            statusBarColor: Color.fromARGB(255, 90, 105, 128),
            statusBarIconBrightness: Brightness.light,
            statusBarBrightness: Brightness.dark,
          ),
          elevation: 0,
          titleSpacing: 0,
          backgroundColor: Colors.teal[500],
          actions: [
            // Active products filter toggle
            Consumer<ProductsProvider>(
              builder: (context, provider, _) {
                return InkWell(
                  onTap: () {
                    provider.toggleActiveOnlyFilter();
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.filter_alt,
                          color: provider.showActiveOnly
                              ? Colors.amber
                              : Colors.white,
                          size: 24,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          provider.showActiveOnly ? 'Active' : 'All',
                          style: TextStyle(
                            color: provider.showActiveOnly
                                ? Colors.amber
                                : Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            // Jakar products filter toggle (age > 360 days)
            Consumer<ProductsProvider>(
              builder: (context, provider, _) {
                return InkWell(
                  onTap: () {
                    provider.toggleJakarFilter();
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.hourglass_empty,
                          color: provider.showJakarOnly
                              ? Colors.red
                              : Colors.white,
                          size: 24,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Jakar',
                          style: TextStyle(
                            color: provider.showJakarOnly
                                ? Colors.red
                                : Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            // Restore hidden products button
            Consumer<ProductsProvider>(
              builder: (context, provider, _) {
                if (provider.hiddenProductsCount == 0) {
                  return const SizedBox(width: 16);
                }
                return Row(
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.restore, color: Colors.white),
                          onPressed: () {
                            provider.clearHiddenProducts();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('All products restored'),
                                duration: Duration(seconds: 2),
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          tooltip: 'Restore all hidden products',
                        ),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: GestureDetector(
                            onTap: () {
                              provider.clearHiddenProducts();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('All products restored'),
                                  duration: Duration(seconds: 2),
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 5,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.red[600],
                                borderRadius: BorderRadius.circular(10),
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 18,
                                minHeight: 18,
                              ),
                              child: Text(
                                '${provider.hiddenProductsCount}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 8),
                  ],
                );
              },
            ),
          ],
          title: Consumer<GlobalProvider>(
            builder: (context, globalProvider, _) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Products',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.inventory_2,
                        size: 11,
                        color: Colors.grey[300],
                      ),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          globalProvider.unitName ?? '',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[300],
                            fontWeight: FontWeight.normal,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(78),
            child: Column(
              children: [
                _buildSearchAndSummaryRow(context),
                _buildHistoryItemsRow(context),
              ],
            ),
          ),
        ),
        body: Stack(
          children: [
            // Existing product list
            Consumer<ProductsProvider>(
              builder: (context, provider, _) {
                // Trigger initial load if productsFuture is null
                if (provider.productsFuture == null) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    final globalProvider = Provider.of<GlobalProvider>(
                      context,
                      listen: false,
                    );
                    provider.refreshProducts(globalProvider);
                  });
                }

                return FutureBuilder<void>(
                  future: provider.productsFuture,
                  builder: (context, snapshot) {
                    // Show loading indicator
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    // Show error message
                    if (snapshot.hasError || provider.errorMessage != null) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.error_outline,
                                size: 64,
                                color: Colors.red[300],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'Error loading products data',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[700],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                snapshot.error?.toString() ??
                                    provider.errorMessage ??
                                    '',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                ),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: () {
                                  final globalProvider =
                                      Provider.of<GlobalProvider>(
                                        context,
                                        listen: false,
                                      );
                                  provider.refreshProducts(globalProvider);
                                },
                                icon: const Icon(Icons.refresh),
                                label: const Text('Retry'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.teal,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    // Show empty state when no products at all
                    if (provider.products.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.inbox_outlined,
                              size: 64,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No products available',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    // Show products list
                    final filteredProducts = provider.filteredProducts;

                    return filteredProducts.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey[400],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No products match your search',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Try a different search term',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[500],
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () {
                              final globalProvider =
                                  Provider.of<GlobalProvider>(
                                    context,
                                    listen: false,
                                  );
                              return provider.fetchProductsData(globalProvider);
                            },
                            child: ListView.builder(
                              padding: EdgeInsets.only(
                                left: 16,
                                right: 16,
                                top: 8,
                                bottom: _isSummaryExpanded ? 80 : 60,
                              ),
                              itemCount: filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = filteredProducts[index];
                                return _buildProductCard(product, index + 1);
                              },
                            ),
                          );
                  },
                );
              },
            ),

            // Summary boxes (only when expanded) - LOWER LAYER
            if (_isSummaryExpanded)
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: SafeArea(child: _buildSummaryBoxes(context)),
              ),

            // Toggle button (always visible, overlapping) - TOP LAYER
            Positioned(
              left: 0,
              right: 0,
              bottom: _isSummaryExpanded ? 11 : -8,
              child: SafeArea(
                child: Container(
                  height: 50,
                  alignment: Alignment.center,
                  child: _buildToggleButton(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _removeProduct(BuildContext context, ProductsModel product) {
    final provider = Provider.of<ProductsProvider>(context, listen: false);

    // Hide the product
    provider.hideProduct(product.id);
  }

  Widget _buildSearchAndSummaryRow(BuildContext context) {
    return Consumer<ProductsProvider>(
      builder: (context, provider, _) {
        final filteredCount = provider.filteredProducts.length;
        final totalCount = provider.products.length;
        final isFiltered = filteredCount != totalCount;
        final NumberFormat numberFormat = NumberFormat('#,##0');

        return Container(
          height: 46,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          color: Colors.grey[100],
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Search TextField
              SizedBox(
                width: 250,
                child: TextField(
                  controller: _searchController,
                  onChanged: (value) => provider.setSearchQuery(value),
                  decoration: InputDecoration(
                    hintText: 'Search products...',
                    hintStyle: TextStyle(color: Colors.grey[500], fontSize: 12),
                    prefixIcon: Icon(
                      Icons.search,
                      color: Colors.teal[700],
                      size: 16,
                    ),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 16),
                            onPressed: () {
                              _searchController.clear();
                              provider.clearSearch();
                            },
                            color: Colors.grey[600],
                            padding: EdgeInsets.zero,
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.teal[200]!),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: Colors.teal[200]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: Colors.teal[500]!,
                        width: 2,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    isDense: true,
                  ),
                  style: const TextStyle(fontSize: 13),
                ),
              ),
              const SizedBox(width: 8),
              // Inline Summary
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isFiltered ? Icons.filter_list : Icons.inventory_2,
                    color: Colors.teal[500],
                    size: 10,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isFiltered
                        ? '${numberFormat.format(filteredCount)} / ${numberFormat.format(totalCount)}'
                        : numberFormat.format(totalCount),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal[800],
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHistoryItemsRow(BuildContext context) {
    return Consumer<ProductsProvider>(
      builder: (context, provider, _) {
        if (provider.searchHistory.isEmpty) {
          return const SizedBox.shrink();
        }

        return Container(
          height: 28,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          color: Colors.grey[50],
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: provider.searchHistory.length,
            itemBuilder: (context, index) {
              final term = provider.searchHistory[index];
              return Padding(
                padding: const EdgeInsets.only(right: 4),
                child: GestureDetector(
                  onTap: () {
                    _searchController.text = term;
                    provider.setSearchQuery(term);
                  },
                  child: Chip(
                    label: Text(
                      term,
                      style: TextStyle(fontSize: 12, color: Colors.grey[900]),
                    ),
                    deleteIcon: Icon(
                      Icons.close,
                      size: 14,
                      color: Colors.grey[600],
                    ),
                    onDeleted: () {
                      provider.removeFromSearchHistory(term);
                    },
                    backgroundColor: Colors.amber[50],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                      side: BorderSide(color: Colors.amber[200]!, width: 0.5),
                    ),
                    padding: const EdgeInsets.only(
                      left: 8,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    ),
                    labelPadding: EdgeInsets.zero,
                    visualDensity: VisualDensity.compact,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildProductCard(ProductsModel product, int index) {
    // Determine background color based on age
    final bool isOldStock = product.age > 360;
    final Color cardColor = isOldStock ? Colors.pink[50]! : Colors.white;

    return Dismissible(
      key: Key('product_${product.id}'),
      direction: DismissDirection.horizontal,
      background: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: Colors.red[400],
          borderRadius: BorderRadius.circular(4),
        ),
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.only(left: 20),
        child: Row(
          children: [
            const Icon(Icons.delete, color: Colors.white, size: 24),
            const SizedBox(width: 8),
            Text(
              'Remove',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
      secondaryBackground: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: Colors.red[400],
          borderRadius: BorderRadius.circular(4),
        ),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text(
              'Remove',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.delete, color: Colors.white, size: 24),
          ],
        ),
      ),
      onDismissed: (direction) {
        _removeProduct(context, product);
      },
      child: Card(
        margin: const EdgeInsets.symmetric(vertical: 4),
        elevation: 2,
        color: cardColor,
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLine1(product),
                  const SizedBox(height: 4),
                  _buildLine2(product),
                  const SizedBox(height: 4),
                  _buildLine3(product),
                  const SizedBox(height: 4),
                  _buildLine4(product),
                ],
              ),
            ),
            // Index badge in top-left corner
            Positioned(
              top: -2,
              left: -2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.grey[600],
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8),
                    bottomRight: Radius.circular(8),
                  ),
                ),
                child: Text(
                  '# $index',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            // Remove button in top-right corner
            Positioned(
              top: -2,
              right: -2,
              child: GestureDetector(
                onTap: () {
                  _removeProduct(context, product);
                },
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.red[600],
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(8),
                      bottomLeft: Radius.circular(8),
                    ),
                  ),
                  child: const Icon(Icons.close, size: 14, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLine1(ProductsModel product) {
    final NumberFormat numberFormat = NumberFormat('#,##0');

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Left side: Age and Sale chips
        Row(
          children: [
            // Age chip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: product.age > 360 ? Colors.red[100] : Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 14,
                    color: product.age > 360
                        ? Colors.red[700]
                        : Colors.grey[700],
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${product.age} d',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: product.age > 360
                          ? Colors.red[700]
                          : Colors.grey[700],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Sale quantity chip
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.blue[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.trending_up, size: 14, color: Colors.blue[700]),
                  const SizedBox(width: 4),
                  Text(
                    'Sold: ${numberFormat.format(product.sale)}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.blue[700],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),

        // Right side: MRP chip
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.green[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.currency_rupee, size: 14, color: Colors.black),
              const SizedBox(width: 2),
              Text(
                'MRP: ${numberFormat.format(product.maxRetailPrice)}',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLine2(ProductsModel product) {
    final NumberFormat numberFormat = NumberFormat('#,##0');

    // Concatenate brandName, catName, and label with spaces
    final parts = <String>[];
    if (product.brandName.isNotEmpty) parts.add(product.brandName);
    if (product.catName.isNotEmpty) parts.add(product.catName);
    if (product.label.isNotEmpty) parts.add(product.label);
    final productInfo = parts.join(' ');

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Product info (brand + category + label)
        Expanded(
          child: Text(
            productInfo,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),

        // Closing stock in black rounded box
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.black87,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            numberFormat.format(product.clos),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLine3(ProductsModel product) {
    // Build concatenated string with info, HSN, and GST rate
    final parts = <String>[];

    if (product.info.isNotEmpty) {
      parts.add(product.info);
    }

    if (product.hsn != 0) {
      parts.add('HSN: ${product.hsn}');
    }

    if (product.gstRate > 0) {
      parts.add('GST: ${product.gstRate.toStringAsFixed(1)}%');
    }

    final infoText = parts.join(' • ');

    return Text(
      infoText,
      style: TextStyle(fontSize: 12, color: Colors.grey[800], height: 1.3),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildLine4(ProductsModel product) {
    final NumberFormat priceFormat = NumberFormat('#,##0.00');

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Purchase Price
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Purch Price (GST)',
              style: TextStyle(fontSize: 10, color: Colors.black),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.currency_rupee, size: 14, color: Colors.black),
                Text(
                  priceFormat.format(product.lastPurchasePriceGst),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ],
        ),

        // Sale Price
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Sale Price (GST)',
              style: TextStyle(fontSize: 10, color: Colors.black),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.currency_rupee, size: 14, color: Colors.black),
                Text(
                  priceFormat.format(product.salePriceGst),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
