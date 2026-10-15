namespace FishTracker.Domain;

public class Gear
{
    public int GearId { get; set; }

    public int UserId { get; set; }

    // Name of the saved gear preset
    public required string PresetName { get; set; }

    // Equipment included in the preset
    public required string FishingRod { get; set; }

    public required string Lure { get; set; }

    // Whether this preset is currently equipped
    public bool IsEquipped { get; set; } = false;

    public User User { get; set; } = null!;
}