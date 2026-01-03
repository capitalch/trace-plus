import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/products_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/products_model.dart';

class ProductsPage extends StatelessWidget {
  const ProductsPage({super.key});

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
          toolbarHeight: 54,
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
          actions: const [SizedBox(width: 16)],
          title: const Text('Products'),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(34),
            child: _buildSecondaryAppBar(context),
          ),
        ),
        body: Consumer<ProductsProvider>(
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
                              final globalProvider = Provider.of<GlobalProvider>(
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

                // Show empty state
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
                          'No products found',
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
                return RefreshIndicator(
                  onRefresh: () {
                    final globalProvider = Provider.of<GlobalProvider>(
                      context,
                      listen: false,
                    );
                    return provider.fetchProductsData(globalProvider);
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 16, left: 16, right: 16, bottom: 42),
                    itemCount: provider.products.length,
                    itemBuilder: (context, index) {
                      final product = provider.products[index];
                      return _buildProductCard(product);
                    },
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildSecondaryAppBar(BuildContext context) {
    return Consumer<GlobalProvider>(
      builder: (context, globalProvider, _) {
        return Container(
          height: 34,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Icon(Icons.inventory_2, color: Colors.grey[600], size: 16),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    globalProvider.unitName ?? '',
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildProductCard(ProductsModel product) {
    // Determine background color based on age
    final bool isOldStock = product.age > 360;
    final Color cardColor = isOldStock ? Colors.pink[50]! : Colors.white;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      elevation: 2,
      color: cardColor,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildLine1(product),
            const SizedBox(height: 8),
            _buildLine2(product),
            const SizedBox(height: 8),
            _buildLine3(product),
            const SizedBox(height: 8),
            _buildLine4(product),
          ],
        ),
      ),
    );
  }

  Widget _buildLine1(ProductsModel product) {
    return Row(
      children: [
        // Age chip
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: product.age > 360 ? Colors.red[100] : Colors.grey[200],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.calendar_today,
                size: 14,
                color: product.age > 360 ? Colors.red[700] : Colors.grey[700],
              ),
              const SizedBox(width: 4),
              Text(
                '${product.age}d',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: product.age > 360 ? Colors.red[700] : Colors.grey[700],
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
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.trending_up, size: 14, color: Colors.blue[700]),
              const SizedBox(width: 4),
              Text(
                'Sold: ${product.sale.toStringAsFixed(0)}',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue[700],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),

        // MRP chip
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.green[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.currency_rupee, size: 14, color: Colors.green[700]),
                const SizedBox(width: 2),
                Flexible(
                  child: Text(
                    'MRP: ${product.maxRetailPrice.toStringAsFixed(0)}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.green[700],
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLine2(ProductsModel product) {
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
              color: Colors.black87,
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
            product.clos.toStringAsFixed(0),
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
      style: TextStyle(
        fontSize: 12,
        color: Colors.grey[700],
        height: 1.3,
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildLine4(ProductsModel product) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Purchase Price
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Purchase Price',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.currency_rupee, size: 14, color: Colors.blue[700]),
                Text(
                  product.lastPurchasePriceGst.toStringAsFixed(2),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[700],
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
              'Sale Price',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.currency_rupee, size: 14, color: Colors.green[700]),
                Text(
                  product.salePriceGst.toStringAsFixed(2),
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.green[700],
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
