import sys
from app.routes.leaderboard import fetch_cp_stats_sync

def test_user(lc, cf):
    print(f"Testing LeetCode: {lc}, Codeforces: {cf}")
    stats = fetch_cp_stats_sync(lc, cf)
    print("Result stats:")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    print("-" * 40)

if __name__ == "__main__":
    # Test valid LeetCode, valid Codeforces
    test_user("alfaarghya", "tourist")
    
    # Test user with no contests
    test_user("saurabhquery", "MikeMirzayanov")
    
    # Test invalid LeetCode, valid Codeforces
    test_user("non_existent_lc_user_12345", "tourist")
    
    # Test valid LeetCode, invalid Codeforces
    test_user("alfaarghya", "non_existent_cf_user_12345")
