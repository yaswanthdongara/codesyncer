/*
Title: Sorting_descending_2025-12-22T02-01-19-983Z.java
Description: The custom Comparator sorts the numbers in descending order.
Date: 12/22/2025, 7:31:19 AM
*/

import java.util.*;
 
public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(Arrays.asList(15, 5, 1, 10));
        Comparator<Integer> descendingComparator = (a, b) -> b - a;
        Collections.sort(numbers, descendingComparator);
        System.out.println(numbers);
    }
}