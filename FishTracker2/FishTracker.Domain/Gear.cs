namespace FishTracker.Domain;
public class Gear
{
    public int GearId{ get; set; }

    public int UserId{ get; set; }

    public required string FishingRod{ get; set; }

    public required string Lure{ get; set; }
}