using System;
public class Program {
    public static void Main() {
        Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("admin"));
    }
}
