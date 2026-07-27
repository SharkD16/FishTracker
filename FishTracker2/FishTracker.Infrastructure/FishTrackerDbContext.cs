using Microsoft.EntityFrameworkCore;
using FishTracker.Domain;

namespace FishTracker.Infrastructure;

public class FishTrackerDbContext(DbContextOptions<FishTrackerDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Fish> Fish => Set<Fish>();

    public DbSet<Gear> Gear => Set<Gear>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.UserId);
            entity.Property(user => user.Username).IsRequired().HasMaxLength(100);
            entity.Property(user => user.Email).IsRequired().HasMaxLength(256);
            entity.HasIndex(user => user.Email).IsUnique();
        });

        modelBuilder.Entity<Fish>(entity =>
        {
            entity.HasKey(fish => fish.FishId);
            entity.Property(fish => fish.Weight).IsRequired();
            entity.Property(fish => fish.Length).IsRequired();
            entity.Property(fish => fish.Species).IsRequired();

            entity.HasOne(fish => fish.User)
                .WithMany(user => user.Fish)
                .HasForeignKey(fish => fish.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Gear>(entity =>
        {
            entity.HasKey(gear => gear.GearId);
            entity.Property(gear => gear.FishingRod).IsRequired().HasMaxLength(150);
            entity.Property(gear => gear.Lure).IsRequired().HasMaxLength(150);

        entity.HasOne(gear => gear.User)
            .WithMany(user => user.Gear)
            .HasForeignKey(gear => gear.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
