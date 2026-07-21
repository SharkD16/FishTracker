namespace FishTracker.Domain;
public class Fish
{
    public int FishId{ get; set; }

    public double Weight{ get; set; }
    
    public double Length{ get; set; }

    public int SpeciesId{ get; set; }
    
    public Species Species{ get; set; }

    public int UserId{ get; set; }

    public User User{ get; set; } = null!;
}
