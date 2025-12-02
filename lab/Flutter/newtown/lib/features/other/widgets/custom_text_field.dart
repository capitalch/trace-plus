import 'package:flutter/material.dart';

import '/utils/validator.dart';

class CustomTextField extends StatelessWidget {
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final void Function(String)? onChanged;
  final Validator? validator;
  final void Function()? onTap;
  final void Function()? onEditingComplete;
  final TextInputType? keyboardType;
  final bool obscureText;
  final String? labelText;
  final String? hintText;
  final int? maxLength;
  final InputDecoration? decoration;
  final TextAlign? textAlign;
  final bool autoFocus;
  final bool showCursor;
  final TextStyle? style;
  final TextInputAction? textInputAction;
  final String? initialValue;
  final Iterable<String>? autofillHints;
  final bool enabled;
  final Color? fillColor;
  final int? maxLines;
  final int? minLines;
  final Widget? prefixIcon;
  final EdgeInsetsGeometry? contentPadding;

  const CustomTextField({
    Key? key,
    this.controller,
    this.focusNode,
    this.onChanged,
    this.validator,
    this.onTap,
    this.onEditingComplete,
    this.keyboardType,
    this.obscureText = false,
    this.labelText,
    this.hintText,
    this.decoration,
    this.maxLength,
    this.textAlign,
    this.autoFocus = false,
    this.showCursor = true,
    this.style,
    this.textInputAction,
    this.initialValue,
    this.autofillHints,
    this.fillColor,
    this.maxLines,
    this.minLines,
    this.enabled = true,
    this.prefixIcon,
    this.contentPadding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: TextFormField(
        initialValue: initialValue,
        controller: controller,
        focusNode: focusNode,
        maxLines: maxLines,
        minLines: minLines,
        onChanged: onChanged,
        validator: validator != null ? validator!.validate : null,
        onTap: onTap,
        onEditingComplete: onEditingComplete,
        keyboardType: keyboardType,
        obscureText: obscureText,
        autofocus: autoFocus,
        decoration: decoration ?? _decoration(context),
        maxLength: maxLength,
        textAlign: textAlign ?? TextAlign.start,
        showCursor: showCursor,
        style: style ?? Theme.of(context).textTheme.bodyLarge,
        textInputAction: textInputAction ?? TextInputAction.done,
        cursorColor: Theme.of(context).primaryColor,
        autofillHints: enabled ? this.autofillHints : null,
        enabled: enabled,
        autovalidateMode: AutovalidateMode.onUserInteraction,
      ),
    );
  }

  InputDecoration _decoration(BuildContext context) => InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixIcon: prefixIcon,
        alignLabelWithHint: true,
        contentPadding: contentPadding,
        labelStyle: Theme.of(context)
            .textTheme
            .titleMedium!
            .copyWith(height: 5, fontSize: 13),
        filled: true,
        fillColor: fillColor ?? Color(0xFFF0F0F0),
        focusColor: Color(0xFFF0F0F0),
        hoverColor: Color(0xFFF0F0F0),
        border: _outlineInputBorder,
        enabledBorder: _outlineInputBorder,
        disabledBorder: _outlineInputBorder,
        focusedBorder: _outlineInputBorder,
        errorBorder: OutlineInputBorder(
            borderSide: BorderSide(
              color: Colors.red,
            ),
            borderRadius: _borderRadius),
      );

  BorderRadius get _borderRadius => BorderRadius.circular(8);

  OutlineInputBorder get _outlineInputBorder {
    return OutlineInputBorder(
        borderSide: BorderSide.none, borderRadius: _borderRadius);
  }
}
