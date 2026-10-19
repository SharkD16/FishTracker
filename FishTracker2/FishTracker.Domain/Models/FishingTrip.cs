namespace FishTracker.Domain;

public class FishingTrip
{
    public int FishingTripId { get; set; }

    public DateTimeOffset StartTime { get; set; }

    public DateTimeOffset? EndTime { get; set; }

    // Snapshot of the gear equipped when the trip started.
    public string? GearPresetName { get; set; }

    public string? FishingRod { get; set; }

    public string? Lure { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Fish> Fish { get; set; } = new List<Fish>();
}