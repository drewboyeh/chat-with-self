# Rewards System Guide

## Overview
The app now has a comprehensive rewards system that provides immediate incentives and recognition when users accomplish their goals and complete reminders.

## Features

### 1. Points System
- **Reminder Completion**: 15 points per completed reminder
- **Goal Completion**: 50 points per completed goal
- **Achievement Unlocks**: Bonus points (varies by achievement)
- **Journal Entries**: Points for consistent journaling (future feature)

### 2. Achievements & Badges
Users can unlock achievements in 5 categories:

#### Reminder Achievements
- 🎯 **Getting Started** - Complete 1 reminder (10 points)
- 🔥 **Building Habits** - Complete 5 reminders (25 points)
- ⭐ **Consistency Champion** - Complete 10 reminders (50 points)
- 💪 **Habit Master** - Complete 25 reminders (100 points)
- 🏆 **Unstoppable** - Complete 50 reminders (250 points)

#### Goal Achievements
- 🎯 **Goal Setter** - Complete 1 goal (20 points)
- 🌟 **Goal Achiever** - Complete 5 goals (75 points)
- 👑 **Goal Master** - Complete 10 goals (200 points)
- 💎 **Goal Legend** - Complete 20 goals (500 points)

#### Streak Achievements
- 🔥 **Getting Started** - 3 day streak (15 points)
- ⭐ **Week Warrior** - 7 day streak (50 points)
- 💪 **Two Week Champion** - 14 day streak (150 points)
- 🏆 **Monthly Master** - 30 day streak (500 points)
- 👑 **Two Month Legend** - 60 day streak (1,000 points)
- 💎 **Century Club** - 100 day streak (2,500 points)

#### Journal Achievements
- 📝 **Reflection Starter** - Write 10 entries (30 points)
- ✍️ **Thoughtful Writer** - Write 25 entries (100 points)
- 📚 **Journal Master** - Write 50 entries (300 points)
- 🌟 **Reflection Legend** - Write 100 entries (750 points)

#### Milestone Achievements
- 💰 **Point Collector** - Earn 100 points
- 💵 **Point Accumulator** - Earn 500 points
- 💸 **Point Master** - Earn 1,000 points
- 💴 **Point Legend** - Earn 5,000 points

### 3. Celebration Animations
When users complete tasks or unlock achievements, they see:
- Animated celebration dialog
- Confetti effects
- Points display
- Achievement unlock notifications

## Psychology Behind Rewards

### Immediate Rewards (Dopamine)
- Points are awarded instantly when tasks are completed
- Visual celebrations provide immediate gratification
- This triggers dopamine release, making users want to repeat the behavior

### Competence Building
- Achievements show progress and capability
- Users see they're getting better ("You completed 10 reminders!")
- Builds self-efficacy and confidence

### Autonomy Support
- Users choose which goals/reminders to complete
- Rewards recognize their choices, not force behavior
- "You chose to do this, and you succeeded"

### Progress Visibility
- Total points show overall progress
- Achievement badges show specific milestones
- Users can see how far they've come

## Setup Instructions

### For Lovable Agent:
Run the SQL from `REWARDS_SETUP.sql` in Supabase SQL Editor to create:
- `user_rewards` table
- `achievement_definitions` table
- `user_achievements` table
- `points_history` table
- All RLS policies and indexes

## How It Works

1. **User completes a reminder**:
   - Gets 15 points immediately
   - Reminder count increments
   - System checks for new achievements
   - Celebration dialog shows if achievement unlocked

2. **User completes a goal**:
   - Gets 50 points immediately
   - Goal count increments
   - System checks for new achievements
   - Celebration dialog shows

3. **Achievement unlocked**:
   - Achievement is saved to user's profile
   - Bonus points awarded (if achievement has points)
   - Special celebration dialog shown
   - User feels recognized and accomplished

## Future Enhancements

- Points leaderboard (optional, social)
- Redeemable rewards (unlock features, themes)
- Weekly/monthly challenges
- Streak multipliers (bonus points for maintaining streaks)
- Social sharing of achievements

## Motivation Principles Applied

✅ **Immediate Rewards** - Points and celebrations happen instantly
✅ **Competence** - Achievements show users they're capable
✅ **Autonomy** - Rewards recognize user choices
✅ **Progress Visibility** - Points and badges show growth
✅ **Small Wins** - Every completion is rewarded, not just big goals

