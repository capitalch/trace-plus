import 'package:flutter/material.dart';
import 'package:flutter_holo_date_picker/flutter_holo_date_picker.dart';
import 'package:intl/intl.dart';

import 'primary_button.dart';

class IOSDatePicker extends FormField<DateTime> {
  final ValueChanged<DateTime?> onChanged;

  IOSDatePicker({
    Key? key,
    DateTime? initialValue,
    required String labelText,
    required BuildContext context,
    required this.onChanged,
    String? Function(DateTime?)? validator,
    void Function(DateTime?)? onSaved,
  }) : super(
          key: key,
          onSaved: onSaved,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          initialValue: initialValue,
          validator: validator,
          builder: (FormFieldState<DateTime> field) {
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
                        backgroundColor: Colors.white,
                        shape: _sheetShape,
                        builder: (context) {
                          return Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 4),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      labelText,
                                      style: TextStyle(
                                          fontWeight: FontWeight.w500,
                                          fontSize: 14,
                                          color: Color(0xFF1C1B1B)),
                                    ),
                                    TextButton(
                                      child: Text('Cancel'),
                                      onPressed: () {
                                        // field.didChange(initialValue);
                                        // onChanged(field.value);
                                        Navigator.pop(context);
                                      },
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                color: Colors.blue.shade50,
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceAround,
                                    children: [
                                      Text('Date'),
                                      Text('Month'),
                                      Text('Year'),
                                    ],
                                  ),
                                ),
                              ),
                              //SizedBox(height: 12),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12.0),
                                child: DatePickerWidget(
                                  dateFormat: 'dd-MMMM-yyyy',
                                  looping: true,
                                  initialDate: initialValue,
                                  pickerTheme: DateTimePickerTheme(
                                    itemTextStyle: TextStyle(
                                      color: Theme.of(context).primaryColor,
                                    ),
                                    dividerColor:
                                        Theme.of(context).primaryColor,
                                  ),
                                  onChange: (date, _) {
                                    field.didChange(date);
                                  },
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: PrimaryButton(
                                  onPressed: () {
                                    if (field.value == null) {
                                      field.didChange(DateTime.now());
                                    }
                                    onChanged(field.value);
                                    Navigator.pop(context);
                                  },
                                  text: 'Apply',
                                ),
                              ),
                            ],
                          );
                        });
                  },
                  child: Container(
                    height: 54,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (field.value != null)
                              Text(
                                labelText,
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium!
                                    .copyWith(
                                      fontSize: 9,
                                    ),
                              ),
                            if (field.value != null) SizedBox(height: 4),
                            Text(
                              _formattedText(field.value) ?? labelText,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ],
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

  static String? _formattedText(DateTime? value) {
    if (value == null) {
      return null;
    }
    return DateFormat.yMMMd().format(value);
  }

  static const _sheetShape = const RoundedRectangleBorder(
    borderRadius: BorderRadius.only(
      topLeft: Radius.circular(16),
      topRight: Radius.circular(16),
    ),
  );

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
}
