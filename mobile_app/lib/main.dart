import 'package:flutter/material.dart';
import 'screens/main_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Code Syncer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0D1117),
        primaryColor: const Color(0xFF58A6FF),
        cardColor: const Color(0xFF161B22),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF58A6FF),
          secondary: Color(0xFF58A6FF),
          surface: Color(0xFF161B22),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF161B22),
          elevation: 0,
          titleTextStyle: TextStyle(
            fontFamily: 'Courier New',
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFFC9D1D9),
          ),
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(
            color: Color(0xFFC9D1D9),
            fontFamily: 'Courier New',
          ),
          bodyLarge: TextStyle(
            color: Color(0xFFC9D1D9),
            fontFamily: 'Courier New',
          ),
          titleLarge: TextStyle(
            color: Color(0xFFC9D1D9),
            fontFamily: 'Courier New',
            fontWeight: FontWeight.bold,
          ),
        ),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}
