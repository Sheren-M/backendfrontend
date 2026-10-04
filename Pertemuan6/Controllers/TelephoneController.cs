using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Pertemuan6.Models;

namespace Pertemuan6.Controllers;

public class TelephoneRequest
{
    public string NamaUser { get; set; } = string.Empty;
    public string Alamat { get; set; } = string.Empty;
    public decimal NoTelp { get; set; }
    public string KodePost { get; set; } = string.Empty;
    public DateTime? DateTime { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class TelephoneController(IConfiguration configuration) : ControllerBase
{
    private readonly string _connectionString =
        configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException(
            "Connection string 'DefaultConnection' tidak ditemukan.");

    private const string SelectColumns =
        "id, nama_user, alamat, no_telp, kode_post, date_time";

    // 1. GET ALL
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Telephone>>> GetAll()
    {
        const string query =
            $"SELECT {SelectColumns} FROM tabel_telephone ORDER BY id;";
        var list = new List<Telephone>();

        await using var connection = new MySqlConnection(_connectionString);
        try { await connection.OpenAsync(); }
        catch (MySqlException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new
                {
                    message = "Database MySQL tidak dapat dihubungi. " +
                                "Pastikan MySQL aktif dan connection string benar."
                });
        }

        await using var command = new MySqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            list.Add(MapTelephone(reader));

        return Ok(list);
    }

    // 2. GET BY ID
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Telephone>> GetById(int id)
    {
        const string query =
            $"SELECT {SelectColumns} FROM tabel_telephone WHERE id = @id;";

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        await using var reader = await command.ExecuteReaderAsync();

        if (!await reader.ReadAsync())
            return NotFound(new { message = $"Data telephone dengan id {id} tidak ditemukan." });

        return Ok(MapTelephone(reader));
    }

    // 3. CREATE (POST)
    [HttpPost]
    public async Task<ActionResult<Telephone>> Create(TelephoneRequest request)
    {
        const string query = """
            INSERT INTO tabel_telephone
                (nama_user, alamat, no_telp, kode_post, date_time)
            VALUES (@nama_user, @alamat, @no_telp, @kode_post, @date_time);
            SELECT LAST_INSERT_ID();
            """;

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new MySqlCommand(query, connection);
        AddRequestParameters(command, request);

        var insertedId = Convert.ToInt32(await command.ExecuteScalarAsync());

        return CreatedAtAction(nameof(GetById), new { id = insertedId }, new
        {
            id = insertedId,
            request.NamaUser,
            request.Alamat,
            request.NoTelp,
            request.KodePost,
            DateTime = request.DateTime ?? DateTime.Now
        });
    }

    // 4. UPDATE (PUT)
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, TelephoneRequest request)
    {
        const string query = """
            UPDATE tabel_telephone
            SET nama_user=@nama_user, alamat=@alamat, no_telp=@no_telp,
                kode_post=@kode_post, date_time=@date_time
            WHERE id=@id;
            """;

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        AddRequestParameters(command, request);

        if (await command.ExecuteNonQueryAsync() == 0)
            return NotFound(new { message = $"Data telephone dengan id {id} tidak ditemukan." });

        return NoContent();
    }

    // 5. DELETE
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        const string query = "DELETE FROM tabel_telephone WHERE id = @id;";

        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);

        if (await command.ExecuteNonQueryAsync() == 0)
            return NotFound(new { message = $"Data telephone dengan id {id} tidak ditemukan." });

        return NoContent();
    }

    // ---------- Fungsi bantu ----------
    private static void AddRequestParameters(MySqlCommand command, TelephoneRequest request)
    {
        command.Parameters.AddWithValue("@nama_user", request.NamaUser);
        command.Parameters.AddWithValue("@alamat", request.Alamat);
        command.Parameters.AddWithValue("@no_telp", request.NoTelp);
        command.Parameters.AddWithValue("@kode_post", request.KodePost);
        command.Parameters.AddWithValue("@date_time", request.DateTime ?? DateTime.Now);
    }

    private static Telephone MapTelephone(MySqlDataReader reader) => new()
    {
        Id = reader.GetInt32("id"),
        NamaUser = reader.GetString("nama_user"),
        Alamat = reader.GetString("alamat"),
        NoTelp = reader.GetDecimal("no_telp"),
        KodePost = reader.GetString("kode_post"),
        DateTime = reader.GetDateTime("date_time")
    };
}