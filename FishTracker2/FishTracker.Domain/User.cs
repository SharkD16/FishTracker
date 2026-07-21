namespace FishTracker.Domain;
public class User
{
    public int UserId{ get; set; }

    public required string Username{ get; set; }

    public required string Email{ get; set;}

    public List<Fish> Fish { get; set; } = new();

    public List<Gear> Gear { get; set; } = new();
}