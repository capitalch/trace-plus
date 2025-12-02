import 'package:country_code_picker/country_code_picker.dart';
import 'package:flutter/material.dart';
import 'package:jobs_in_education/utils/layout.dart';

class CountryPickerWidget extends StatelessWidget {
  final ValueChanged? onChanged;

  const CountryPickerWidget({Key? key, this.onChanged}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CountryCodePicker(
      builder: (code) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 22.scale,
              height: 22.scale,
              decoration: BoxDecoration(
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(4),
                image: DecorationImage(
                  fit: BoxFit.fill,
                  image: AssetImage(code!.flagUri!,
                      package: 'country_code_picker'),
                ),
              ),
            ),
            SizedBox(width: 6.scale),
            Text(
              code.dialCode!,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            Icon(Icons.arrow_drop_down_sharp),
          ],
        );
      },
      onChanged: onChanged,
      initialSelection: 'IN',
      favorite: ['+91', 'IN'],
      showCountryOnly: true,
    );
  }
}
