/*
Title: streamFilterUpperCase_2025-12-23T07-21-45-541Z.java
Date: 12/23/2025, 12:52:57 PM
Description: using stream to filter a string and make that string into capital letters
*/

import java.util.List;
import java.util.stream.Collectors;
 
public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Alice", "Bob", "Charlie");
        String result = names.stream()
                             .filter(name -> name.startsWith("A"))
                             .map(String::toUpperCase)
                             .collect(Collectors.joining(", "));
        System.out.println(result);
    }
}