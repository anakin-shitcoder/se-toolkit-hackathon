const http = require('http');

const BASE_URL = 'http://localhost:3000';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
  }
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('\n=== Feedback Collector API Tests ===\n');

  // Test 1: Submit feedback
  console.log('Test 1: Submit valid feedback');
  try {
    const response = await makeRequest('POST', '/api/feedback', {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Great service!',
      rating: 5
    });
    
    assert(response.statusCode === 201, 'Should return 201 Created');
    assert(response.body.name === 'Test User', 'Should return correct name');
    assert(response.body.rating === 5, 'Should return correct rating');
    assert(response.body.message === 'Great service!', 'Should return correct message');
    assert(response.body.id, 'Should return an ID');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 2: Submit feedback without required fields
  console.log('\nTest 2: Submit feedback without required fields');
  try {
    const response = await makeRequest('POST', '/api/feedback', {
      name: 'Test User'
    });
    
    assert(response.statusCode === 400, 'Should return 400 Bad Request');
    assert(response.body.error, 'Should return error message');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 3: Submit feedback with invalid rating
  console.log('\nTest 3: Submit feedback with invalid rating');
  try {
    const response = await makeRequest('POST', '/api/feedback', {
      message: 'Test',
      rating: 6
    });
    
    assert(response.statusCode === 400, 'Should return 400 for invalid rating');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 4: Submit multiple feedbacks
  console.log('\nTest 4: Submit multiple feedbacks');
  try {
    for (let i = 1; i <= 5; i++) {
      await makeRequest('POST', '/api/feedback', {
        name: `User ${i}`,
        message: `Feedback ${i}`,
        rating: i
      });
    }
    assert(true, 'Successfully submitted 5 feedbacks');
  } catch (error) {
    assert(false, `Failed to submit multiple feedbacks: ${error.message}`);
  }

  // Test 5: Get all feedback
  console.log('\nTest 5: Get all feedback');
  try {
    const response = await makeRequest('GET', '/api/feedback');
    
    assert(response.statusCode === 200, 'Should return 200 OK');
    assert(Array.isArray(response.body), 'Should return an array');
    assert(response.body.length >= 6, 'Should have at least 6 feedbacks');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 6: Get feedback with rating filter
  console.log('\nTest 6: Get feedback with rating filter');
  try {
    const response = await makeRequest('GET', '/api/feedback?rating=5');
    
    assert(response.statusCode === 200, 'Should return 200 OK');
    assert(Array.isArray(response.body), 'Should return an array');
    assert(response.body.every(item => item.rating === 5), 'All items should have rating 5');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 7: Get stats
  console.log('\nTest 7: Get statistics');
  try {
    const response = await makeRequest('GET', '/api/stats');
    
    assert(response.statusCode === 200, 'Should return 200 OK');
    assert(response.body.total !== undefined, 'Should return total count');
    assert(response.body.averageRating !== undefined, 'Should return average rating');
    assert(Array.isArray(response.body.ratingDistribution), 'Should return rating distribution');
    assert(response.body.ratingDistribution.length === 5, 'Should have 5 rating categories');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 8: Get feedback by ID
  console.log('\nTest 8: Get feedback by ID');
  try {
    const response = await makeRequest('GET', '/api/feedback/1');
    
    assert(response.statusCode === 200, 'Should return 200 OK');
    assert(response.body.id === 1, 'Should return feedback with ID 1');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 9: Get non-existent feedback
  console.log('\nTest 9: Get non-existent feedback');
  try {
    const response = await makeRequest('GET', '/api/feedback/99999');
    
    assert(response.statusCode === 404, 'Should return 404 Not Found');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 10: Delete feedback
  console.log('\nTest 10: Delete feedback');
  try {
    const response = await makeRequest('DELETE', '/api/feedback/1');
    
    assert(response.statusCode === 200, 'Should return 200 OK');
    assert(response.body.success === true, 'Should return success true');
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Test 11: Verify ordering (newest first)
  console.log('\nTest 11: Verify feedback ordering (newest first)');
  try {
    const response = await makeRequest('GET', '/api/feedback?limit=2');
    
    if (response.body.length >= 2) {
      const firstDate = new Date(response.body[0].created_at);
      const secondDate = new Date(response.body[1].created_at);
      assert(firstDate >= secondDate, 'Feedback should be ordered by newest first');
    } else {
      assert(true, 'Not enough feedback to test ordering');
    }
  } catch (error) {
    assert(false, `Request failed: ${error.message}`);
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

// Wait for server to be ready
function waitForServer(retries = 10, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    
    function tryConnect() {
      attempt++;
      const req = http.get(BASE_URL, (res) => {
        resolve();
      });
      
      req.on('error', (error) => {
        if (attempt < retries) {
          setTimeout(tryConnect, delay);
        } else {
          reject(new Error('Server not available after retries'));
        }
      });
      
      req.end();
    }
    
    tryConnect();
  });
}

waitForServer()
  .then(() => {
    console.log('Server is ready, starting tests...\n');
    return runTests();
  })
  .then(() => {
    console.log('All tests completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  });
