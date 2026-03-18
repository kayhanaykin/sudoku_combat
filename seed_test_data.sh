#!/bin/bash

# Test data seeding script for Sudoku Combat
# Creates test users and generates random match history

USER_SERVICE="http://localhost:8001"
STATS_SERVICE="http://localhost:8090"

echo "🌱 Sudoku Combat Test Data Seeding"
echo ""

# Function to create a user
create_user() {
    local username=$1
    local email=$2
    local password="TestPass123!"
    
    echo -n "  Creating user: $username... "
    
    response=$(curl -s -X POST "$USER_SERVICE/api/v1/user/signup/" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"$username\",
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"password2\": \"$password\"
        }")
    
    if echo "$response" | grep -q "\"username\""; then
        echo "✓"
        return 0
    else
        echo "✗ (might already exist)"
        return 1
    fi
}

# Function to record a match
record_match() {
    local username=$1
    local difficulty=$2
    local mode=$3
    local result=$4
    local opponent=$5
    local time_sec=$6
    
    local json="{
        \"username\": \"$username\",
        \"difficulty\": $difficulty,
        \"mode\": \"$mode\",
        \"result\": \"$result\""
    
    if [ ! -z "$opponent" ] && [ "$opponent" != "null" ]; then
        json="$json,\"opponent\": \"$opponent\""
    fi
    
    if [ ! -z "$time_sec" ]; then
        json="$json,\"time_seconds\": $time_sec"
    fi
    
    json="$json}"
    
    curl -s -X POST "$STATS_SERVICE/api/stats/report" \
        -H "Content-Type: application/json" \
        -d "$json" > /dev/null
}

echo "📝 Creating test users..."
echo ""

# Create new test users
users=("testuser1" "testuser2" "testuser3" "alice" "bob")
for user in "${users[@]}"; do
    create_user "$user" "${user}@example.com"
done

echo ""
echo "📊 Generating match data..."
echo ""

# All users to populate
all_users=("testuser1" "testuser2" "testuser3" "alice" "bob" "emo1" "emo2" "emo3" "emo4")

difficulties=(1 2 3 4 5)
modes=("online" "offline")
results=("win" "lose")

matches_per_user=20

for username in "${all_users[@]}"; do
    echo "  Generating matches for @$username..."
    
    for ((i=0; i<$matches_per_user; i++)); do
        # Random difficulty
        difficulty=${difficulties[$((RANDOM % 5))]}
        
        # Random mode
        mode=${modes[$((RANDOM % 2))]}
        
        # Random result (70% win rate for fun)
        if [ $((RANDOM % 10)) -lt 7 ]; then
            result="win"
        else
            result="lose"
        fi
        
        # Time for offline wins
        time_sec=""
        if [ "$mode" == "offline" ] && [ "$result" == "win" ]; then
            time_sec=$((RANDOM % 500 + 60))
        fi
        
        # Opponent for online matches
        opponent=""
        if [ "$mode" == "online" ]; then
            opponent=${all_users[$((RANDOM % ${#all_users[@]}))]}
            # Avoid playing against yourself
            while [ "$opponent" == "$username" ]; do
                opponent=${all_users[$((RANDOM % ${#all_users[@]}))]}
            done
        fi
        
        record_match "$username" "$difficulty" "$mode" "$result" "$opponent" "$time_sec"
    done
    
    echo "    ✓ Generated $matches_per_user matches"
done

echo ""
echo "✨ Test data seeding complete!"
echo ""
echo "Test users created/used:"
for user in "${all_users[@]}"; do
    echo "  • @$user"
done
echo ""
echo "You can now test with these users in the application."
