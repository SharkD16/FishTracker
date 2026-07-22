namespace FishTracker.Domain;
public class Fish
{
    public int FishId{ get; set; }

    public decimal Weight{ get; set; }
    
    public decimal Length{ get; set; }
    
    public Species Species{ get; set; }

    public int UserId{ get; set; }

    public User User{ get; set; } = null!;
}
