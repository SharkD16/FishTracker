namespace FishTracker.Domain;
public class FishingTrip
{
    public int FishingTripId{get; set;}
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset? EndTime { get; set; }
    public int UserId{get; set;}
    public User User{get; set;} = null!;
}