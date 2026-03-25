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