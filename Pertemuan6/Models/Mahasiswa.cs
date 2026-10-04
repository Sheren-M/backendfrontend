namespace Pertemuan6.Models;

public class Mahasiswa
{
    public int Id { get; set; }
    public string Nama { get; set; } = string.Empty;
    public string Alamat { get; set; } = string.Empty;
    public string Pesanpesan { get; set; } = string.Empty;
    public DateTime? DateTime { get; set; }
}