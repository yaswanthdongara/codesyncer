/*
Title: Java_notes_2025-12-23T15-36-54-944Z.java
Description: 
Date: 12/23/2025, 9:06:54 PM
*/

The JDK is a software development environment used for developing Java applications. It includes the Java compiler (javac), the Java Runtime Environment (JRE), and other essential tools for writing and running code.

Java was created by James Gosling at Sun Microsystems in the mid-1990s.


In Java, an array is an object. Like all other objects, an array is allocated memory in the heap space. The variable that holds the array's reference is stored in the stack.

Enum constants are implicitly public, static, and final. You cannot use explicit access modifiers like private or protected on them. This will lead to a compilation error.

The constructor of an enum is implicitly private. This design ensures that the only instances of the enum are the predefined constants, preventing external code from creating new objects.


What is a local variable in java?

In Java, a local variable is a variable that is declared within a method, constructor, or block of code and is accessible only within that specific scope.

What is the default value of an instance variable in Java?

 Here are the default values for some common data types in Java:

- `int`, `long`, `short`, `byte`: 0
- `float`, `double`: 0.0
- `boolean`: false
- `char`: '\u0000'
- Reference types (e.g. objects): null

If you do not explicitly initialize an instance variable with a value, it will be set to its default value when the object is instantiated.

In Java, an instance variable is a variable that is associated with a specific object and is separate for each instance of the class. Instance variables are declared within a class but outside of any method, constructor, or block.

What is the default value of a local variable in Java?

In Java, local variables are not given a default value like instance variables.If you try to use a local variable without initializing it first, you will get a compilation error.