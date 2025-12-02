import 'package:flutter/material.dart';

import '../models/form_entity.dart';

class FormDropdown extends FormField<FormEntity> {
  final ValueChanged<FormEntity> onChanged;
  final List<FormEntity> items;

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

  FormDropdown({
    Key? key,
    FormEntity? initialVal,
    required this.items,
    required String label,
    required BuildContext context,
    required this.onChanged,
    String? Function(FormEntity?)? validator,
    void Function(FormEntity?)? onSaved,
  }) : super(
          key: key,
          onSaved: onSaved,
          initialValue: initialVal,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          validator: validator ?? (val) => _validator(val, label),
          builder: (FormFieldState<FormEntity> field) {
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
                              onChanged(field.value!);
                            },
                            items: items,
                            label: label,
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
                                field.value?.name.toString() ?? label,
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

  static TextStyle _labelStyle(BuildContext context) =>
      Theme.of(context).textTheme.titleMedium!.copyWith(
            fontSize: 9,
          );

  static String? _validator(FormEntity? val, String labelText) {
    if (val != null) {
      return null;
    }
    return 'Select $labelText';
  }
}

class BottomSheetWidget extends StatefulWidget {
  final ValueChanged<FormEntity> onChanged;
  final List<FormEntity> items;
  final String label;

  const BottomSheetWidget({
    Key? key,
    required this.onChanged,
    required this.items,
    required this.label,
  }) : super(key: key);

  @override
  _BottomSheetWidgetState createState() => _BottomSheetWidgetState();
}

class _BottomSheetWidgetState extends State<BottomSheetWidget> {
  late List<FormEntity> items;
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    items = List.of(widget.items);
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
          height: isItemsGreaterThanTen
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
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 24,
                      height: 24,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        icon: Icon(Icons.close),
                      ),
                    ),
                    Text(
                      widget.label,
                      style: TextStyle(
                          fontWeight: FontWeight.w500,
                          fontSize: 14,
                          color: Color(0xFF1C1B1B)),
                    ),
                    SizedBox(width: 24, height: 24),
                  ],
                ),
              ),
              if (!isItemsGreaterThanTen) Divider(height: 1),
              if (isItemsGreaterThanTen)
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
                                    items = List.of(widget.items);
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
              isItemsGreaterThanTen
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
                              ...items.map((e) => _buildItemTile(e)).toList(),
                              SizedBox(height: 14),
                            ],
                          ),
                        ),
                      ),
                    ),
            ],
          ),
        ),
      ],
    );
  }

  bool get isItemsGreaterThanTen => widget.items.length > 10;

  ListTile _buildItemTile(FormEntity e) {
    return ListTile(
      title: Text(
        e.name,
        style: TextStyle(
            color: Color(0xFF546984),
            fontSize: 14,
            fontWeight: FontWeight.w400),
      ),
      onTap: () {
        widget.onChanged(e);
      },
    );
  }
}
