using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Pertemuan6.Models;
namespace Pertemuan6.Controllers;

public class MahasiswaRequest
{
    public string Nama { get; set; } = string.Empty;
    public string Alamat { get; set; } = string.Empty;
    public string Pesanpesan { get; set; } = string.Empty;
    public DateTime? DateTime { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class Pertemuan6Controller(
  IConfiguration configuration) : ControllerBase
{
    private readonly string _connectionString =
      configuration.GetConnectionString("DefaultConnection")
      ?? throw new InvalidOperationException(
        "Connection string 'DefaultConnection' tidak ditemukan.");

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Mahasiswa>>>
  GetAll()
    {
        const string query = """
      SELECT id, nama, alamat,
        pesan_pesan AS Pesanpesan,
        date_time AS DateTime
      FROM tabel_mahasiswa ORDER BY id;
      """;
        var mahasiswa = new List<Mahasiswa>();
        await using var connection =
          new MySqlConnection(_connectionString);
        try { await connection.OpenAsync(); }
        catch (MySqlException)
        {
            return StatusCode(
              StatusCodes.Status503ServiceUnavailable,
              new
              {
                  message = "Database MySQL tidak dapat dihubungi."
                + " Pastikan MySQL aktif dan connection string benar."
              });
        }
        await using var command =
          new MySqlCommand(query, connection);
        await using var reader =
          await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            mahasiswa.Add(MapMahasiswa(reader));
        return Ok(mahasiswa);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Mahasiswa>>
  GetById(int id)
    {
        const string query = """
      SELECT id, nama, alamat,
        pesan_pesan AS Pesanpesan,
        date_time AS DateTime
      FROM tabel_mahasiswa WHERE id = @id;
      """;
        await using var connection =
          new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command =
          new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        await using var reader =
          await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return NotFound(new
            {
                message =
              $"Data mahasiswa dengan id {id} tidak ditemukan."
            });
        return Ok(MapMahasiswa(reader));
    }

    [HttpPost]
    public async Task<ActionResult<Mahasiswa>>
  Create(MahasiswaRequest request)
    {
        const string query = """
      INSERT INTO tabel_mahasiswa
        (nama, alamat, pesan_pesan, date_time)
      VALUES (@nama, @alamat, @pesan_pesan, @date_time);
      SELECT LAST_INSERT_ID();
      """;
        await using var connection =
          new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command =
          new MySqlCommand(query, connection);
        AddRequestParameters(command, request);
        var insertedId = Convert.ToInt32(
          await command.ExecuteScalarAsync());
        return CreatedAtAction(nameof(GetById),
          new { id = insertedId }, new
          {
              id = insertedId,
              request.Nama,
              request.Alamat,
              request.Pesanpesan,
              DateTime = request.DateTime ?? DateTime.Now
          });
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
  int id, MahasiswaRequest request)
    {
        const string query = """
      UPDATE tabel_mahasiswa
      SET nama=@nama, alamat=@alamat,
        pesan_pesan=@pesan_pesan,
        date_time=@date_time
      WHERE id=@id;
      """;
        await using var connection =
          new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command =
          new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        AddRequestParameters(command, request);
        if (await command.ExecuteNonQueryAsync() == 0)
            return NotFound(new
            {
                message =
              $"Data mahasiswa dengan id {id} tidak ditemukan."
            });
        return NoContent();
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        const string query =
          "DELETE FROM tabel_mahasiswa WHERE id = @id;";
        await using var connection =
          new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command =
          new MySqlCommand(query, connection);
        command.Parameters.AddWithValue("@id", id);
        if (await command.ExecuteNonQueryAsync() == 0)
            return NotFound(new
            {
                message =
              $"Data mahasiswa dengan id {id} tidak ditemukan."
            });
        return NoContent();
    }


    private static void AddRequestParameters(
  MySqlCommand command, MahasiswaRequest request)
    {
        command.Parameters.AddWithValue(
          "@nama", request.Nama);
        command.Parameters.AddWithValue(
          "@alamat", request.Alamat);
        command.Parameters.AddWithValue(
          "@pesan_pesan", request.Pesanpesan);
        command.Parameters.AddWithValue(
          "@date_time", request.DateTime ?? DateTime.Now);
    }



    private static Mahasiswa MapMahasiswa(
  MySqlDataReader reader) => new()
  {
      Id = reader.GetInt32("id"),
      Nama = reader.GetString("nama"),
      Alamat = reader.GetString("alamat"),
      Pesanpesan = reader.IsDBNull(
      reader.GetOrdinal("Pesanpesan"))
      ? string.Empty
      : reader.GetString("Pesanpesan"),
      DateTime = reader.IsDBNull(
      reader.GetOrdinal("DateTime"))
      ? null
      : reader.GetDateTime("DateTime")
  };
}



