/*
Title: StringReverser_2025-12-17T17-37-15-521Z.java
Description: 
Date: 12/17/2025, 11:07:15 PM
*/

import java.util.Scanner;

public class StringReverser {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter a string to reverse:");
        String input = scanner.nextLine();
        System.out.println("Reversed string: " + reverseString(input));
    }

    public static String reverseString(String str) {
        StringBuilder reversed = new StringBuilder();
        for (int i = str.length() - 1; i >= 0; i--) {
            reversed.append(str.charAt(i));
        }
        return reversed.toString();
    }
}