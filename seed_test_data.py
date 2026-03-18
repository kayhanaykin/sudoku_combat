#!/usr/bin/env python3
"""
Test data seeding script for Sudoku Combat
Creates test users and generates random match history
"""
import requests
import random
import string
from datetime import datetime, timedelta

# Configuration
USER_SERVICE_URL = "http://localhost:8001"
STATS_SERVICE_URL = "http://localhost:8090"

def create_user(username, email, password="TestPass123!"):
    """Create a new user"""
    url = f"{USER_SERVICE_URL}/api/v1/user/signup/"
    data = {
        "username": username,
        "email": email,
        "password": password,
        "password2": password
    }
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print(f"✓ Created user: {username}")
            return True
        else:
            print(f"✗ Failed to create user {username}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error creating user {username}: {e}")
        return False

def record_match(username, difficulty, mode, result, opponent=None, time_seconds=None):
    """Record a match result in stats service"""
    url = f"{STATS_SERVICE_URL}/api/stats/report"
    data = {
        "username": username,
        "difficulty": difficulty,
        "mode": mode,
        "result": result,
    }
    
    if opponent:
        data["opponent"] = opponent
    if time_seconds and mode == "offline":
        data["time_seconds"] = time_seconds
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            return True
        else:
            print(f"✗ Failed to record match for {username}: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error recording match for {username}: {e}")
        return False

def main():
    print("🌱 Sudoku Combat Test Data Seeding\n")
    
    # Create new test users
    test_users = [
        ("testuser1", "testuser1@example.com"),
        ("testuser2", "testuser2@example.com"),
        ("testuser3", "testuser3@example.com"),
        ("alice", "alice@example.com"),
        ("bob", "bob@example.com"),
    ]
    
    print("📝 Creating test users...")
    created_users = []
    for username, email in test_users:
        if create_user(username, email):
            created_users.append(username)
    
    # Add existing test users
    created_users.extend(["emo1", "emo2", "emo3", "emo4"])
    
    print(f"\n📊 Generating match data for {len(created_users)} users...\n")
    
    # Generate random match history for each user
    difficulties = [1, 2, 3, 4, 5]
    modes = ["online", "offline"]
    results = ["win", "lose"]
    
    matches_per_user = 15
    
    for username in created_users:
        print(f"  Generating matches for @{username}...")
        for _ in range(matches_per_user):
            difficulty = random.choice(difficulties)
            mode = random.choice(modes)
            result = random.choice(results)
            
            # Offline wins need time_seconds
            time_seconds = None
            if mode == "offline" and result == "win":
                time_seconds = random.randint(60, 600)
            
            # Sometimes pick an opponent for online matches
            opponent = None
            if mode == "online":
                opponent = random.choice([u for u in created_users if u != username])
            
            record_match(username, difficulty, mode, result, opponent, time_seconds)
        
        print(f"    ✓ Generated {matches_per_user} matches")
    
    print("\n✨ Test data seeding complete!")
    print(f"Created/Used users: {', '.join(created_users)}")
    print("\nYou can now test with these users in the application.")

if __name__ == "__main__":
    main()
