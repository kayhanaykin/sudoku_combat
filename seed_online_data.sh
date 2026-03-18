#!/bin/bash

# Test data seeding script - Heavy online mode version
USER_SERVICE="http://localhost:8001"
STATS_SERVICE="http://localhost:8090"

echo "🌱 Sudoku Combat Test Data - Heavy Online Mode"
echo ""

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

echo "📊 Generating ONLINE match data (70% online, 30% offline)..."
echo ""

# All users
all_users=("testuser1" "testuser2" "testuser3" "alice" "bob" "emo1" "emo2" "emo3" "emo4")

difficulties=(1 2 3 4 5)
results=("win" "lose")

matches_per_user=25

for username in "${all_users[@]}"; do
    echo "  Generating matches for @$username..."
    
    for ((i=0; i<$matches_per_user; i++)); do
        difficulty=${difficulties[$((RANDOM % 5))]}
        
        # 70% online, 30% offline
        if [ $((RANDOM % 10)) -lt 7 ]; then
            mode="online"
        else
            mode="offline"
        fi
        
        # 65% win rate for variety
        if [ $((RANDOM % 100)) -lt 65 ]; then
            result="win"
        else
            result="lose"
        fi
        
        time_sec=""
        if [ "$mode" == "offline" ] && [ "$result" == "win" ]; then
            time_sec=$((RANDOM % 500 + 60))
        fi
        
        opponent=""
        if [ "$mode" == "online" ]; then
            opponent=${all_users[$((RANDOM % ${#all_users[@]}))]}
            while [ "$opponent" == "$username" ]; do
                opponent=${all_users[$((RANDOM % ${#all_users[@]}))]}
            done
        fi
        
        record_match "$username" "$difficulty" "$mode" "$result" "$opponent" "$time_sec"
    done
    
    echo "    ✓ Generated $matches_per_user matches"
done

echo ""
echo "✨ Heavy online data seeding complete!"
echo ""
echo "Leaderboard should now be populated with these users:"
for user in "${all_users[@]}"; do
    echo "  • @$user"
done
