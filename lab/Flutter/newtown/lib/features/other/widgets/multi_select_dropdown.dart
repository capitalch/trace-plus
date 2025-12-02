import 'package:flutter/material.dart';

import '/utils/screen_size.dart';
import '../models/form_entity.dart';

class MultiSelectDropdown extends FormField<List<FormEntity>> {
  final ValueChanged<List<FormEntity>?> onChanged;
  final List<FormEntity> items;
  final int maxSelectable;

  static final _decoration = InputDecoration(
      border: _outlineInputBorder,
      enabledBorder: _outlineInputBorder,
      focusedBorder: _outlineInputBorder,
      errorBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: Colors.red,
          ),
          borderRadius: BorderRadius.circular(8)),
      contentPadding: EdgeInsets.only(left: 12.0, right: 4.0),
      fillColor: Color(0xFFF0F0F0),
      filled: true);

  static OutlineInputBorder get _outlineInputBorder {
    return OutlineInputBorder(
        borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8));
  }

  MultiSelectDropdown({
    Key? key,
    List<FormEntity>? initialVal,
    required this.items,
    required String label,
    required BuildContext context,
    required this.onChanged,
    this.maxSelectable = 100,
    String? Function(List<FormEntity>?)? validator,
    void Function(List<FormEntity>?)? onSaved,
  }) : super(
          key: key,
          onSaved: onSaved,
          initialValue: initialVal,
          validator: validator ?? (val) => _validator(val, label),
          builder: (FormFieldState<List<FormEntity>> field) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: InputDecorator(
                decoration: _decoration.copyWith(
                  errorText: field.errorText,
                ),
                child: InkWell(
                  onTap: () async {
                    await showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (context) {
                          return BottomSheetWidget(
                            onChanged: (item) {
                              field.didChange(item);
                              Navigator.pop(context);
                              onChanged(field.value);
                            },
                            items: items,
                            label: label,
                            initialValues: field.value,
                            maxSelectable: maxSelectable,
                          );
                        });
                  },
                  child: Container(
                    height: 54,
                    width: double.maxFinite,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (field.value != null)
                                Text(
                                  label,
                                  style: _labelStyle(context),
                                ),
                              if (field.value != null) SizedBox(height: 4),
                              Text(
                                _buildCityText(field, label),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_drop_down),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );

  static String _buildCityText(
      FormFieldState<List<FormEntity>> field, String label) {
    if (field.value == null || field.value!.isEmpty) {
      return label;
    }

    return field.value!.map((e) => e.name).join(', ');
  }

  static TextStyle _labelStyle(BuildContext context) =>
      Theme.of(context).textTheme.titleMedium!.copyWith(
            fontSize: 9,
          );

  static String? _validator(List<FormEntity>? val, String labelText) {
    if (val != null && val.isNotEmpty) {
      return null;
    }
    return 'Select $labelText';
  }
}

class BottomSheetWidget extends StatefulWidget {
  final ValueChanged<List<FormEntity>?> onChanged;
  final List<FormEntity> items;
  final List<FormEntity>? initialValues;
  final int maxSelectable;

  final String label;

  const BottomSheetWidget({
    Key? key,
    required this.onChanged,
    required this.items,
    required this.label,
    this.initialValues,
    required this.maxSelectable,
  }) : super(key: key);

  @override
  _BottomSheetWidgetState createState() => _BottomSheetWidgetState();
}

class _BottomSheetWidgetState extends State<BottomSheetWidget> {
  late List<FormEntity> items;
  late TextEditingController _controller;
  List<FormEntity>? _selectedValues;

  final screenSize = ScreenSize.instance;
  bool get canAddMore => (_selectedValues?.length ?? 0) < widget.maxSelectable;

  @override
  void initState() {
    super.initState();
    items = List.of(widget.items);
    _selectedValues = widget.initialValues;
    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          height: _isItemGreaterThanTen
              ? MediaQuery.of(context).size.height * 0.75
              : null,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(16.0),
              topRight: Radius.circular(16.0),
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  IconButton(
                    padding: EdgeInsets.zero,
                    onPressed: () {
                      Navigator.pop(context);
                    },
                    icon: Icon(Icons.close),
                  ),
                  Expanded(
                    child: Text(
                      widget.label,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontWeight: FontWeight.w500,
                          fontSize: 16,
                          color: Color(0xFF1C1B1B)),
                    ),
                  ),
                  TextButton(
                    child: Text('Clear'),
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    onPressed: () {
                      setState(() {
                        _selectedValues = null;
                      });
                    },
                  ),
                ],
              ),
              if (!_isItemGreaterThanTen) Divider(height: 1),
              if (_isItemGreaterThanTen)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Container(
                    height: 58,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16.0, vertical: 4),
                    child: TextFormField(
                      controller: _controller,
                      onChanged: (val) {
                        setState(() {
                          if (val.isEmpty) {
                            items = List.of(widget.items);
                          } else {
                            items = widget.items
                                .where((element) => element.name
                                    .toLowerCase()
                                    .startsWith(val.toLowerCase()))
                                .toList();
                          }
                        });
                      },
                      decoration: InputDecoration(
                        hintStyle: TextStyle(
                            color: Color(0xE4546984),
                            fontSize: 12,
                            fontWeight: FontWeight.w300),
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                        hintText: 'Search your ${widget.label.toLowerCase()}',
                        //isCollapsed: true,
                        suffixIcon: _controller.text.isNotEmpty
                            ? IconButton(
                                icon: CircleAvatar(
                                  radius: 14,
                                  child: Icon(
                                    Icons.close,
                                    color: Color(0x50546984),
                                    size: 18,
                                  ),
                                  backgroundColor: Color(0xFFE7F1FD),
                                ),
                                onPressed: () {
                                  _controller.clear();
                                  setState(() {
                                    items = widget.items;
                                  });
                                },
                              )
                            : null,
                        prefixIcon: Icon(
                          Icons.search,
                          color: Color(0xEE546984),
                          size: 24,
                        ),
                        border: OutlineInputBorder(
                          borderSide: BorderSide(
                              color: Colors.grey.shade400, width: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                              color: Colors.grey.shade400, width: 0.5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                              color: Theme.of(context).primaryColor,
                              width: 0.5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ),
              _isItemGreaterThanTen
                  ? Expanded(
                      child: Scrollbar(
                        child: ListView.builder(
                            itemCount: items.length,
                            itemBuilder: (_, i) => _buildItemTile(items[i])),
                      ),
                    )
                  : Flexible(
                      child: Scrollbar(
                        child: SingleChildScrollView(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ..._buildItemsTile(),
                              SizedBox(height: 14),
                            ],
                          ),
                        ),
                      ),
                    ),
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: ElevatedButton(
                  onPressed: () => widget.onChanged(_selectedValues),
                  child: Text('Apply'),
                  style: ElevatedButton.styleFrom(
                    fixedSize: Size(double.maxFinite, screenSize.height(7)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  bool get _isItemGreaterThanTen => widget.items.length > 10;

  List<Widget> _buildItemsTile() {
    return items.map((e) => _buildItemTile(e)).toList();
  }

  ListTile _buildItemTile(FormEntity e) {
    final enabled = canAddMore || _isItemSelected(e);

    return ListTile(
      title: Text(
        e.name,
        style: TextStyle(
            color: Color(0xFF546984),
            fontSize: 14,
            fontWeight: FontWeight.w400),
      ),
      trailing: Icon(
        _isItemSelected(e)
            ? Icons.check_box_rounded
            : Icons.check_box_outline_blank_rounded,
        color: enabled ? Theme.of(context).primaryColor : Colors.grey.shade300,
      ),
      enabled: enabled,
      onTap: () {
        setState(() {
          if (_selectedValues != null && _selectedValues!.contains(e)) {
            _selectedValues!.remove(e);
          } else if (_selectedValues != null) {
            _selectedValues!.add(e);
          } else {
            _selectedValues = [e];
          }
        });
      },
    );
  }

  bool _isItemSelected(FormEntity e) {
    if (_selectedValues == null) {
      return false;
    }
    return _selectedValues!.contains(e);
  }
}
