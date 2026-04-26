using Microsoft.Data.SqlClient;
using System;

string connectionString = "Server=(localdb)\\mssqllocaldb;Database=SoulmateStore_Dev;Trusted_Connection=True;Encrypt=False;";
string hash = "$2a$11$E30MYueLu1OCIvdq1uQx7e6T08Br8JMAhBAOMNViLG2C.LyDHSW46"; // hash for 'admin'

using (SqlConnection conn = new SqlConnection(connectionString))
{
    conn.Open();
    string sql = "UPDATE Users SET PasswordHash = @hash, FailedLoginAttempts = 0, LockoutEnd = NULL WHERE Email = 'admin@soulmate.com'";
    using (SqlCommand cmd = new SqlCommand(sql, conn))
    {
        cmd.Parameters.AddWithValue("@hash", hash);
        int rows = cmd.ExecuteNonQuery();
        Console.WriteLine($"{rows} rows updated.");
    }
}
