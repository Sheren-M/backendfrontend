namespace Pertemuan6.Models;

public class Telephone
{
    public int Id { get; set; }
    public string NamaUser { get; set; } = string.Empty;
    public string Alamat { get; set; } = string.Empty;
    public decimal NoTelp { get; set; }
    public string KodePost { get; set; } = string.Empty;
    public DateTime? DateTime { get; set; }
}