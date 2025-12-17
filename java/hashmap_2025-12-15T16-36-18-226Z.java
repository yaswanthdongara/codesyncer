/*
Title: hashmap_2025-12-15T16-36-18-226Z.java
Description: basic hash map creation(3 types of hashmap)
Date: 12/15/2025, 10:06:18 PM
*/

// Online Java Compiler
// Use this editor to write, compile and run your Java code online
import java.util.*;
class Main {
    public static void main(String[] args) {
    //     int n = 153;
    //     int sum = 0;
    //     String y = String.valueOf(n);
    //     while(n > 0){
    //         int rem = n% 10;
    //         sum += Math.pow(rem,y.length());
    //         n = n/10;
    //     }
    // System.out.println(sum == Integer.parseInt(y));
    
    Scanner sc = new Scanner(System.in);
    String s =sc.nextLine();
    HashMap<Character,Integer> hm = new HashMap<>();
    for(char c :s.toCharArray()){
        hm.put(c,hm.getOrDefault(c,0)+1);
    }
    System.out.println(hm);
    TreeMap<Character,Integer> tm = new TreeMap<>();
    for(char c :s.toCharArray()){
        tm.put(c,tm.getOrDefault(c,0)+1);
    }
    System.out.println(tm);
    
   LinkedHashMap<Character,Integer> l = new LinkedHashMap<>();
    for(char c :s.toCharArray()){
        l.put(c,l.getOrDefault(c,0)+1);
    }
    System.out.print(l);
    }
}