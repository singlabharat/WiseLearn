from apify_client import ApifyClient
import json
import os
from datetime import datetime

def scrape_images(search_queries):
    # Initialize the ApifyClient with your API token
    client = ApifyClient("apify_api_Vw9qkh3f07Bdi0uhkYNvd2gpuADG8B0ZzFEA")

    try:
        # Prepare the Actor input
        run_input = {
            "queries": search_queries,
            "maxResultsPerQuery": 1,
            "saveImages": False,  # We'll just get the image URLs
            "customDataFunction": """async ({ input, $, request, response, html }) => {
                return {
                    url: request.url,
                    loadedUrl: response.url,
                    timestamp: new Date().toISOString(),
                };
            }""",
        }

        print(f"Starting image search for queries: {search_queries}")
        
        # Run the Google Images Scraper actor
        run = client.actor("tnudF2IxzORPhg4r8").call(run_input=run_input)

        # Create a directory for storing results if it doesn't exist
        os.makedirs("results", exist_ok=True)
        
        # Prepare results storage
        results = []
        
        # Fetch and process results
        print("Processing results...")
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            results.append(item)
            # Print both the image URL and title if available
            image_url = item.get('imageUrl', 'No image URL found')
            title = item.get('title', 'No title available')
            print(f"Found image: {image_url}")
            print(f"Title: {title}\n")

        # Save results to a JSON file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"results/image_results_{timestamp}.json"
        
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
            
        print(f"\nSearch completed! Found {len(results)} images.")
        print(f"Results saved to: {output_file}")
        
        return results

    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

if __name__ == "__main__":
    # Example usage
    search_terms = ["cute cats", "puppies"]
    words = "xxx"
    results = scrape_images(search_terms)