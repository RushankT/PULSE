import requests
import sys
import json
from datetime import datetime

class YouTubeAnalyticsAPITester:
    def __init__(self, base_url="https://data-velocity-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('/') else f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "url": url
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "url": url
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_dashboard_endpoint(self):
        """Test dashboard data endpoint"""
        success, data = self.run_test("Dashboard Data", "GET", "dashboard", 200, timeout=45)
        
        if success and data:
            # Validate required fields
            required_fields = [
                "videos", "kpis", "insights", "categories", "demographics",
                "engagement_distribution", "growth_data", "competitive", 
                "heatmap", "last_updated", "data_source"
            ]
            
            missing_fields = []
            for field in required_fields:
                if field not in data:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"⚠️  Missing required fields: {missing_fields}")
                return False, data
            
            # Validate KPIs structure
            if "kpis" in data and data["kpis"]:
                required_kpis = ["total_activity", "engagement_quality", "growth_velocity", "opportunity_index"]
                missing_kpis = []
                for kpi in required_kpis:
                    if kpi not in data["kpis"]:
                        missing_kpis.append(kpi)
                
                if missing_kpis:
                    print(f"⚠️  Missing KPIs: {missing_kpis}")
                else:
                    print(f"✅ All required KPIs present: {required_kpis}")
            
            # Validate data source
            if "data_source" in data:
                print(f"📊 Data source: {data['data_source']}")
            
            # Validate video count
            if "videos" in data and isinstance(data["videos"], list):
                print(f"📹 Videos count: {len(data['videos'])}")
            
            print(f"✅ Dashboard data structure validated")
            
        return success, data

    def test_refresh_endpoint(self):
        """Test force refresh endpoint"""
        return self.run_test("Force Refresh", "POST", "refresh", 200, timeout=45)

    def test_history_endpoint(self):
        """Test history endpoint"""
        return self.run_test("History Data", "GET", "history", 200)

    def test_social_trends_endpoint(self):
        """Test social trends endpoint (Twitter/X - MOCKED)"""
        success, data = self.run_test("Social Trends (Twitter/X)", "GET", "trends/social", 200, timeout=30)
        
        if success and data:
            # Validate required fields for social trends
            required_fields = ["trends", "insights", "data_source"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"⚠️  Missing social trends fields: {missing_fields}")
            else:
                print(f"✅ Social trends structure validated")
                if "note" in data:
                    print(f"📝 Note: {data['note']}")
                print(f"📊 Data source: {data.get('data_source', 'unknown')}")
                if "trends" in data and isinstance(data["trends"], list):
                    print(f"📈 Trends count: {len(data['trends'])}")
        
        return success, data

    def test_entertainment_trends_endpoint(self):
        """Test entertainment trends endpoint (TMDB)"""
        success, data = self.run_test("Entertainment Trends (TMDB)", "GET", "trends/entertainment", 200, timeout=30)
        
        if success and data:
            # Validate required fields for entertainment trends
            required_fields = ["movies", "tv_shows", "genre_breakdown", "insights", "data_source"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"⚠️  Missing entertainment trends fields: {missing_fields}")
            else:
                print(f"✅ Entertainment trends structure validated")
                print(f"📊 Data source: {data.get('data_source', 'unknown')}")
                if "movies" in data and isinstance(data["movies"], list):
                    print(f"🎬 Movies count: {len(data['movies'])}")
                if "tv_shows" in data and isinstance(data["tv_shows"], list):
                    print(f"📺 TV shows count: {len(data['tv_shows'])}")
        
        return success, data

    def test_news_trends_endpoint(self):
        """Test news trends endpoint"""
        success, data = self.run_test("News Trends", "GET", "trends/news", 200, timeout=30)
        
        if success and data:
            # Validate required fields for news trends
            required_fields = ["articles", "source_breakdown", "sentiment_summary", "insights", "data_source"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"⚠️  Missing news trends fields: {missing_fields}")
            else:
                print(f"✅ News trends structure validated")
                print(f"📊 Data source: {data.get('data_source', 'unknown')}")
                if "articles" in data and isinstance(data["articles"], list):
                    print(f"📰 Articles count: {len(data['articles'])}")
        
        return success, data

    def test_music_trends_endpoint(self):
        """Test music trends endpoint (Spotify)"""
        success, data = self.run_test("Music Trends (Spotify)", "GET", "trends/music", 200, timeout=30)
        
        if success and data:
            # Validate required fields for music trends
            required_fields = ["tracks", "genre_breakdown", "insights", "data_source"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"⚠️  Missing music trends fields: {missing_fields}")
            else:
                print(f"✅ Music trends structure validated")
                print(f"📊 Data source: {data.get('data_source', 'unknown')}")
                if "tracks" in data and isinstance(data["tracks"], list):
                    print(f"🎵 Tracks count: {len(data['tracks'])}")
        
        return success, data

    def test_all_trends_endpoint(self):
        """Test combined trends endpoint"""
        success, data = self.run_test("All Trends Combined", "GET", "trends/all", 200, timeout=45)
        
        if success and data:
            # Validate required fields for combined trends
            required_fields = ["social", "entertainment", "news", "music"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                print(f"⚠️  Missing combined trends fields: {missing_fields}")
            else:
                print(f"✅ Combined trends structure validated")
                # Count total data sources
                active_sources = 0
                for source in required_fields:
                    if data.get(source) and data[source].get("data_source") != "unavailable":
                        active_sources += 1
                print(f"📊 Active data sources: {active_sources}/4")
        
        return success, data

    def validate_dashboard_data_structure(self, data):
        """Validate the structure of dashboard data"""
        validation_results = []
        
        # Check videos structure
        if "videos" in data and isinstance(data["videos"], list) and len(data["videos"]) > 0:
            video = data["videos"][0]
            required_video_fields = ["id", "title", "channel", "views", "likes", "comments", 
                                   "engagement_rate", "quality_score", "health", "thumbnail"]
            missing_video_fields = [f for f in required_video_fields if f not in video]
            if missing_video_fields:
                validation_results.append(f"Missing video fields: {missing_video_fields}")
            else:
                validation_results.append("✅ Video structure valid")
        
        # Check KPIs structure
        if "kpis" in data:
            for kpi_name in ["total_activity", "engagement_quality", "growth_velocity", "opportunity_index"]:
                if kpi_name in data["kpis"]:
                    kpi = data["kpis"][kpi_name]
                    required_kpi_fields = ["label", "value", "format", "trend", "trend_label"]
                    missing_kpi_fields = [f for f in required_kpi_fields if f not in kpi]
                    if missing_kpi_fields:
                        validation_results.append(f"Missing {kpi_name} fields: {missing_kpi_fields}")
                    else:
                        validation_results.append(f"✅ {kpi_name} structure valid")
        
        return validation_results

def main():
    print("🚀 Starting YouTube Analytics API Tests")
    print("=" * 50)
    
    tester = YouTubeAnalyticsAPITester()
    
    # Test all endpoints
    print("\n📡 Testing API Endpoints...")
    
    # Root endpoint
    tester.test_root_endpoint()
    
    # Dashboard endpoint (main test)
    dashboard_success, dashboard_data = tester.test_dashboard_endpoint()
    
    if dashboard_success and dashboard_data:
        print("\n🔍 Validating Dashboard Data Structure...")
        validation_results = tester.validate_dashboard_data_structure(dashboard_data)
        for result in validation_results:
            print(f"   {result}")
    
    # Refresh endpoint
    tester.test_refresh_endpoint()
    
    # History endpoint
    tester.test_history_endpoint()
    
    # Platform-specific endpoints
    print("\n🌐 Testing Platform-Specific Endpoints...")
    tester.test_social_trends_endpoint()
    tester.test_entertainment_trends_endpoint()
    tester.test_news_trends_endpoint()
    tester.test_music_trends_endpoint()
    
    # Combined trends endpoint
    print("\n🔄 Testing Combined Trends Endpoint...")
    tester.test_all_trends_endpoint()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failed in tester.failed_tests:
            print(f"   - {failed}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 75:
        print("✅ Backend API tests mostly successful")
        return 0
    else:
        print("❌ Backend API tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())