import 'package:flutter/material.dart';

const brandNavy = Color(0xFF0D1B2A);
const brandEmerald = Color(0xFF10B981);
const brandGray = Color(0xFFF2F4F7);

final darakTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: brandEmerald,
    primary: brandNavy,
    secondary: brandEmerald,
    surface: Colors.white,
  ),
  scaffoldBackgroundColor: const Color(0xFFF7F9FB),
  useMaterial3: true,
  appBarTheme: const AppBarTheme(
    backgroundColor: Colors.white,
    foregroundColor: brandNavy,
    elevation: 0,
    centerTitle: false,
  ),
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      backgroundColor: brandEmerald,
      foregroundColor: Colors.white,
      minimumSize: const Size.fromHeight(52),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
    ),
  ),
  cardTheme: CardTheme(
    elevation: 0,
    color: Colors.white,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
  ),
);
